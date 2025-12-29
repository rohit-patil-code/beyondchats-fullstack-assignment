const axios = require('axios');

module.exports = async function googleSearch(title){
    const res = await axios.get('https://serpapi.com/search', {
        params:{
            q: title,
            api_key: process.env.serpapi,
            num: 5,
        }
    });

    return res.data.organic_results.filter(r => r.link).slice(0, 2);
}