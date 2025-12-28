const express = ('express');
const router = express.Router();

const {
    createArticle,
    getArticles,
    getArticlesById,
    updateArticle,
    deleteArticle
} = require('../models/articleModel');

router.post('/', createArticle);
router.get('/', getArticles);
router.get('/:id', getArticlesById);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

module.exports = router;