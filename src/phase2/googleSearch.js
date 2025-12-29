const axios = require('axios');

function cleanTitle(title) {
  return title
    .replace(/[-|–]\s*beyondchats/i, '')
    .replace(/beyondchats/i, '')
    .trim();
}

module.exports = async function googleSearch(title) {
  const cleanedTitle = cleanTitle(title);

  const res = await axios.get('https://serpapi.com/search', {
    params: {
      q: `${cleanedTitle} -site:beyondchats.com`, // ⭐ KEY FIX
      api_key: process.env.SERP_API_KEY,
      engine: 'google',
      num: 10
    }
  });

  const organicResults = res.data.organic_results || [];

  const filteredResults = organicResults.filter(result => {
    const link = result.link?.toLowerCase() || '';

    // Extra safety
    if (link.includes('beyondchats.com')) return false;
    if (result.is_ad) return false;

    return true;
  });

  return filteredResults.slice(0, 2);
};
