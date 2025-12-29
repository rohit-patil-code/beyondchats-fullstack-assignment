require('dotenv').config();

const fetchArticles = require('./fetchArticles');
const googleSearch = require('./googleSearch');
const scrapeArticle = require('./scrapeExternal');
const rewriteWithLLM = require('./llmRewrite');
const publishArticle = require('./publishArticle');

(async () => {
  console.log('🚀 Phase 2 started');

  const articles = await fetchArticles();
  console.log(`📦 Articles fetched from API: ${articles.length}`);

  if (!articles.length) {
    console.log('⚠️ No articles found. Exiting Phase 2.');
    return;
  }

  for (const article of articles) {
    console.log(`\n🔍 Processing article: ${article.title}`);

    const googleResults = await googleSearch(article.title);

    if (googleResults.length < 2) {
      console.log('⚠️ Not enough Google results found. Skipping...');
      continue;
    }

    const ref1 = await scrapeArticle(googleResults[0].link);
    const ref2 = await scrapeArticle(googleResults[1].link);

    const updatedContent = await rewriteWithLLM(
      article,
      ref1,
      ref2,
      googleResults
    );

    // ✅ OPTION B: CREATE NEW ARTICLE WITH NEW SLUG
    const newArticle = {
  title: `${article.title} (Updated)`,
  slug: `${article.slug}-updated`,
  content: updatedContent,
  excerpt: article.excerpt,
  author: article.author,
  published_at: article.published_at,
  image_url: article.image_url,
  url: article.url + '?updated=true', // ⭐ FIX
  source: article.source,
  is_updated: true
};


    console.log('🚨 Publishing article with slug:', newArticle.slug);

    await publishArticle(newArticle);

    console.log(`✅ Published updated article: ${newArticle.title}`);
  }

  console.log('\n🎉 Phase 2 finished!');
})();
