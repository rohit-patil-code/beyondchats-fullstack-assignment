const axios = require('axios');

module.exports = async function fetchArticles(){
    const res = await axios.get('https://localhost:3000/api/articles');
    return res.data;
}