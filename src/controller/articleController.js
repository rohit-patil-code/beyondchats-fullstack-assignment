const articleModel = require('../models/articleModel');

const createArticle = async(req, res) => {
    try{
        const article = await articleModel.createArticle(req.body);

        res.status(201).json({
            success: true,
            data: article
        });
    }catch(err){
        console.log(`Error while creating article with error message: ${err.message}`);
    }
}

const getArticles = async(req, res) => {
    try{
        const article = await articleModel.getArticles();

        res.status(201).json({
            success: true,
            data: article
        });
    }catch(err){
        console.log(`Error while fetching article with error message: ${err.message}`);
    }
}

const getArticlesById = async(req, res) => {
    try{
        const article = await articleModel.getArticlesById(req.params.id);

        res.status(201).json({
            success: true,
            data: article
        });
    }catch(err){
        console.log(`Error while fetching articles with id with error message: ${err.message}`);
    }
}

const updateArticle = async(req, res) => {
    try{
        const article = await articleModel.updateArticle(req.params.id, req.body);

        res.status(201).json({
            success: true,
            data: article
        });
    }catch(err){
        console.log(`Error while updating article with error message: ${err.message}`);
    }
}

const deleteArticle = async(req, res) => {
    try{
        const article = await articleModel.deleteArticle(req.params.id);

        res.status(201).json({
            success: true,
            data: article
        });
    }catch(err){
        console.log(`Error while deleting article with error message: ${err.message}`);
    }
}

module.exports = {
  createArticle,
  getArticles,
  getArticlesById,
  updateArticle,
  deleteArticle,
};