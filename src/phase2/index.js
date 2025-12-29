require('dotenv').config();

const fetchArticles = require('./fetchArticles');
const googleSearch = require('./googleSearch');
const scrapeArticle = require('./scrapeExternal');
const rewriteWithLLM = require('./llmRewrite');
const publishArticle = require('./publishArticle');

(async () => {
    console.log("Phase 2 started!");

    const articles = await fetchArticles();

    for(const article of articles){
        console.log(`Processing article with title: ${article.title}`);

        const googleResults = await googleSearch(article.title);
        if(googleResults.length < 2){
            console.log('Not enough articles found. Existing...');
            return;
        }

        const ref1 = await scrapeArticle(googleResults[0].link);
        const ref2 = await scrapeArticle(googleResults[0].link);

        const updatedContent = await rewriteWithLLM(
            article,
            ref1,
            ref2,
            googleResults
        );

        await publishArticle({
            ...article,
            content: updatedContent,
            is_updated: true,
        });
        console.log(`Published updated article with title: ${article.title}`);
    }
    console.log("Phase 2 finished!");
});