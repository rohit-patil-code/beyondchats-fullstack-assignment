const pool = require('../config/db');

const createArticle = async({
    title,
    content,
    author,
    published_date,
    source_url,
}) => {
    const query = `INSERT INTO articles (title, content, author, published_date, source_url) VALUES($1, $2, $3, $4, $5)`;
    const values = [title, content, author, published_date, source_url];

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
                content = $2,
                author = $3
            WHERE id = $4`;
    const values = [title, content, author, id];
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