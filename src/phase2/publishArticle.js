const axios = require('axios');

module.exports = async function publishArticle(article) {

  await axios.post('http://localhost:3000/api/articles', article);
};
