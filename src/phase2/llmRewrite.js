const axios = require('axios');
const buildPrompt = require('./prompts/rewritePrompt');

module.exports = async function rewriteWithLLM(
  originalArticle,
  ref1,
  ref2,
  refsMeta
) {
  const MAX_ORIGINAL_CHARS = 2000;
  const MAX_REF_CHARS = 1200;

  const trimmedOriginal = {
    ...originalArticle,
    content: originalArticle.content.slice(0, MAX_ORIGINAL_CHARS)
  };

  const trimmedRef1 = ref1.slice(0, MAX_REF_CHARS);
  const trimmedRef2 = ref2.slice(0, MAX_REF_CHARS);

  const prompt = buildPrompt(
    trimmedOriginal,
    trimmedRef1,
    trimmedRef2,
    refsMeta
  );

  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data.choices[0].message.content;
  } catch (err) {
    console.error('❌ Groq LLM failed:', err.response?.data || err.message);
    throw err;
  }
};
