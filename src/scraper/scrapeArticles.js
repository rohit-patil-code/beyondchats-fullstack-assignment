const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
require('dotenv').config();

const BASE_URL = 'https://beyondchats.com/blogs/page/';

const PG_POOL = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
});

function extractListArticle($, element) {
  const title = $(element).find('h2.entry-title a').text().trim();
  const link = $(element).find('h2.entry-title a').attr('href');
  const excerpt = $(element).find('.entry-excerpt').text().trim();
  const slug = link ? link.split('/blogs/')[1]?.replace('/', '') : null;

  return { title, slug, link, excerpt, source: 'beyondchats' };
}

async function extractFullArticle(url) {
  try {
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);

    // Fixed title extraction
    const title =
        $('h1.wp-block-post-title').first().text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        null;

    
    const content = $('.entry-content').html() || $('.post-content').html() || '';
    const excerpt = $('.entry-excerpt').text().trim() || content.substring(0, 200) + '...';
    
    // Fixed author extraction
    const author = $('.author.vcard .fn').first().text().trim() ||
                   $('.author.vcard').first().contents().filter(function() { return this.type === 'text'; }).text().trim() ||
                   $('.entry-author').text().trim() || 
                   $('.author-name').text().trim() ||
                   'Unknown';

    let publishedAt = null;
    const dateMeta = $('time.published').attr('datetime') || 
                     $('meta[property="article:published_time"]').attr('content') ||
                     $('.published').attr('datetime');
    if (dateMeta) {
      publishedAt = new Date(dateMeta).toISOString();
    }

    const imageUrl = $('.featured-image img').first().attr('src') || 
                     $('meta[property="og:image"]').attr('content') ||
                     $('.wp-post-image').attr('src');

    const fullArticle = {
      title,
      slug: url.split('/blogs/')[1]?.replace('/', ''),
      content,
      excerpt,
      author,
      publishedAt,
      imageUrl,
      url,
      source: 'beyondchats'
    };

    return fullArticle;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error.message);
    return null;
  }
}

async function saveArticleToDB(article) {
  const client = await PG_POOL.connect();
  try {
    const query = `
      INSERT INTO articles (title, slug, content, excerpt, author, published_at, image_url, url, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (slug) DO UPDATE SET
        content = EXCLUDED.content,
        excerpt = EXCLUDED.excerpt,
        author = EXCLUDED.author,
        published_at = EXCLUDED.published_at,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
      RETURNING id
    `;
    
    const result = await client.query(query, [
      article.title,
      article.slug,
      article.content,
      article.excerpt,
      article.author,
      article.publishedAt,
      article.imageUrl,
      article.url,
      article.source
    ]);
    
    client.release();
    return result.rows[0].id;
  } catch (error) {
    client.release();
    console.error(`DB Error for ${article.title}:`, error.message);
    return null;
  }
}

async function scrapeOldestFiveArticles() {
  const collected = [];
  let page = 15;

  while (collected.length < 5 && page > 0) {
    const url = `${BASE_URL}${page}/`;
    
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const articles = $('.entry-card').toArray();

      for (let i = articles.length - 1; i >= 0; i--) {
        if (collected.length >= 5) break;
        
        const articleMeta = extractListArticle($, articles[i]);
        if (articleMeta.title && articleMeta.link) {
          collected.push(articleMeta);
        }
      }
    } catch (error) {
      // Silent fail
    }
    
    page--;
  }

  let savedCount = 0;
  for (const meta of collected) {
    const fullArticle = await extractFullArticle(meta.link);
    if (fullArticle && fullArticle.title && fullArticle.slug) {
      const articleId = await saveArticleToDB(fullArticle);
      if (articleId) savedCount++;
    }
  }

  console.log(`✅ Scraping complete! ${savedCount}/5 articles saved to database`);
  await PG_POOL.end();
  return savedCount;
}

(async () => {
  try {
    const saved = await scrapeOldestFiveArticles();
    process.exit(saved > 0 ? 0 : 1);
  } catch (err) {
    console.error('Scraping failed:', err.message);
    process.exit(1);
  }
})();
