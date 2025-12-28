const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://beyondchats.com/blogs/page/';

function extractListArticle($, element) {
  const title = $(element).find('h2.entry-title a').text().trim();
  const link = $(element).find('h2.entry-title a').attr('href');
  const excerpt = $(element).find('.entry-excerpt').text().trim();
  const slug = link ? link.split('/blogs/')[1]?.replace('/', '') : null;

  return { title, slug, link, excerpt, source: 'beyondchats' };
}

async function extractFullArticle(url) {
  try {
    console.log(`🔍 Fetching full content: ${url}`);
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);


    const title = $('h1.entry-title').text().trim() || $('.entry-title').text().trim();
    const content = $('.entry-content').html() || $('.post-content').html() || '';
    const excerpt = $('.entry-excerpt').text().trim() || content.substring(0, 200) + '...';
    
    // Author extraction
    const author = $('.author.vcard').text().trim() || 
                   $('.entry-author').text().trim() || 
                   $('.author-name').text().trim();

    // Date extraction
    let publishedAt = null;
    const dateMeta = $('time.published').attr('datetime') || 
                    $('meta[property="article:published_time"]').attr('content') ||
                    $('.published').attr('datetime');
    if (dateMeta) {
      publishedAt = new Date(dateMeta).toISOString();
    }

    // Image extraction
    const imageUrl = $('.featured-image img').first().attr('src') || 
                    $('meta[property="og:image"]').attr('content') ||
                    $('.wp-post-image').attr('src');

    const fullArticle = {
      title,
      slug: url.split('/blogs/')[1]?.replace('/', ''),
      content: content ? content.substring(0, 1000) + '...' : null, // Truncate for console
      excerpt,
      author,
      publishedAt,
      imageUrl,
      url,
      source: 'beyondchats'
    };

    console.log('📄 Full Article Data:', JSON.stringify(fullArticle, null, 2));
    return fullArticle;
  } catch (error) {
    console.error(`❌ Failed to scrape ${url}:`, error.message);
    return null;
  }
}

async function scrapeOldestFiveArticles() {
  const collected = [];
  let page = 15;

  //Find 5 oldest articles from list pages
  console.log('Searching for oldest 5 articles\n');
  
  while (collected.length < 5 && page > 0) {
    const url = `${BASE_URL}${page}/`;
    console.log(`Scraping list page ${page}`);

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const articles = $('.entry-card').toArray();

      // Reverse order
      for (let i = articles.length - 1; i >= 0; i--) {
        if (collected.length >= 5) break;
        
        const articleMeta = extractListArticle($, articles[i]);
        if (articleMeta.title && articleMeta.link) {
          collected.push(articleMeta);
          console.log(`Collected: ${articleMeta.title}`);
        }
      }
    } catch (error) {
      console.log(`Page ${page} failed, trying next..`);
    }
    
    page--;
  }

  console.log('\nFound 5 oldest articles, now fetching full content...\n');

  //Fetch full content for each article
  const fullArticles = [];
  for (let i = 0; i < collected.length; i++) {
    const meta = collected[i];
    console.log(`\n--- Article ${i + 1}/5 ---\n`);
    const fullArticle = await extractFullArticle(meta.link);
    if (fullArticle) {
      fullArticles.push(fullArticle);
    }
  }

  console.log('\n🎉 SCRAPING COMPLETE! 5 Full Articles Ready for Database:');
  console.log(JSON.stringify(fullArticles, null, 2));
  
  return fullArticles;
}

// Run scraper
(async () => {
  try {
    const articles = await scrapeOldestFiveArticles();
    console.log(`\nSuccessfully scraped ${articles.length} full articles!`);
  } catch (err) {
    console.error('Scraping failed:', err.message);
  }
})();
