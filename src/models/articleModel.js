const pool = require('../config/db');

const createArticle = async({
    title,
    slug,
    content,
    excerpt,
    author,
    published_at,
    image_url,
    url,
    source
}) => {
    const query = `INSERT INTO articles (title, content, author, published_date, source_url) VALUES($1, $2, $3, $4, $5)`;
    const values = [title, slug, content, excerpt, author, published_at, image_url, url, 'beyondchats'];

    const result = await pool.query(query, result);
    return result.rows[0];
}

const getArticles = async() => {
    query = `SELECT * FROM articles ORDER BY created_at DESC`;
    result = await pool.query(query);
    return result.rows;
}

const getArticlesById = async(id) => {
    query = `SELECT * FROM articles WHERE id = $1`;
    values = [id];
    const result = await pool.query(query, id);
}

const updateArticle = async(id, data) => {
    const {title, content, author} = data;

    const query = `UPDATE articles
            SET title = $1,
                slug = $2,
                content = $3,
                excerpt = $4,
                author = $5,
                published_at = $6,
                image_url = $7,
                url = $8,
                source = $9
            WHERE id = $10`;
    const values = [title, slug, content, excerpt, author, published_at, image_url, url, 'beyondchats', id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

const deleteArticle = async(id) => {
    const query = `DELETE from articles WHERE id = $1`;
    const values = [id];
    const result = await pool.query(query, values);
}

module.exports = {
    getArticles,
    getArticlesById,
    updateArticle,
    deleteArticle
};