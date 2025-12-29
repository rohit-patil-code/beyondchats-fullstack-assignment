const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function scrapeExternal(url) {
  try {
    const html = (await axios.get(url)).data;
    const $ = cheerio.load(html);

    return (
      $('article').text().trim() ||
      $('main').text().trim() ||
      $('body').text().trim().slice(0, 4000)
    );
  } catch (err) {
    console.error(`Failed scraping ${url}`);
    return '';
  }
};
