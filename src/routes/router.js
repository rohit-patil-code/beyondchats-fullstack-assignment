const express = require('express');
const router = express.Router();

const {
    createArticle,
    getArticles,
    getArticlesById,
    updateArticle,
    deleteArticle
} = require('../controller/articleController');

router.post('/', createArticle);
router.get('/', getArticles);
router.get('/:id', getArticlesById);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

module.exports = router;
