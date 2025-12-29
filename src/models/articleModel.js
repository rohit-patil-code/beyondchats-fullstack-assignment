const pool = require('../config/db');

/* =======================
   CREATE ARTICLE
======================= */
const createArticle = async (data) => {
  const query = `
    INSERT INTO articles
    (title, slug, content, excerpt, author, published_at, image_url, url, source, is_updated)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

  const values = [
    data.title,
    data.slug,
    data.content,
    data.excerpt,
    data.author,
    data.published_at || null,
    data.image_url || null,
    data.url,
    data.source || 'beyondchats',
    data.is_updated || false
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/* =======================
   GET ALL ARTICLES
======================= */
const getArticles = async () => {
  const query = `SELECT * FROM articles ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

/* =======================
   GET ARTICLE BY ID
======================= */
const getArticlesById = async (id) => {
  const query = `SELECT * FROM articles WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/* =======================
   UPDATE ARTICLE
======================= */
const updateArticle = async (id, data) => {
  const query = `
    UPDATE articles
    SET title = $1,
        content = $2,
        author = $3,
        is_updated = $4
    WHERE id = $5
    RETURNING *
  `;

  const values = [
    data.title,
    data.content,
    data.author,
    data.is_updated || false,
    id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/* =======================
   DELETE ARTICLE
======================= */
const deleteArticle = async (id) => {
  const query = `DELETE FROM articles WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createArticle,
  getArticles,
  getArticlesById,
  updateArticle,
  deleteArticle 
};
