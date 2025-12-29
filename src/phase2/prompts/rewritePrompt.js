module.exports = function buildPrompt(original, ref1, ref2, refsMeta) {
  return `
Rewrite the article below to improve formatting, SEO, and clarity.
Use ideas and structure inspired by the reference articles.

ORIGINAL ARTICLE:
${original.content}

REFERENCE ARTICLE 1:
${ref1}

REFERENCE ARTICLE 2:
${ref2}

Rules:
- Return HTML
- Improve headings and readability
- Do NOT copy text
- Add a "References" section at the end citing:

${refsMeta.map(r => `- ${r.title}: ${r.link}`).join('\n')}
`;
};
