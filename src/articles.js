const express = require('express');
const mongoose = require('mongoose');
const Article = require('./articleSchema');
const { isLoggedIn } = require('./auth');


// GET /articles (return articles of logged in user)
// GET /articles/:id  (where id is a valid or invalid article id)
async function getArticlesOrArticle(req, res) {
    const { id } = req.params;

    // Check if 'id' is a valid ObjectId
    if (id && mongoose.isValidObjectId(id)) {
        try {
            const article = await Article.findById(id);
            if (article) {
                return res.status(200).json(article);
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({ error: 'Internal server error' });
        }
    }

    // If 'id' is not a valid ObjectId, or no article was found, try fetching by username
    if (id) {
        try {
            const articlesByUsername = await Article.find({ author: id });
            if (articlesByUsername.length > 0) {
                return res.status(200).json(articlesByUsername);
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({ error: 'Internal server error' });
        }
    }

    // If no 'id' is provided, fetch all articles for the logged-in user
    try {
        console.log(req.username);
        const articles = await Article.find({ author: req.username });
        console.log(articles);
        res.status(200).json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error' });
    }
}

async function updateArticle(req, res) {
    const { id } = req.params;
    const { text, commentId } = req.body;

    try {
        const article = await Article.findById(id);

        if(!article) {
            return res.status(404).send({ error: 'Article not found' });
        }

        if(article.author !== req.username) {
            return res.status(403).send({ error: 'Forbidden' });
        }

        if(commentId === undefined) {
            article.text = text;
        }
        else {
            const comment = article.comments.id(commentId);

            if(comment) {
                comment.text = text;
            }
            else if(commentId === '-1') {
                article.comments.push({ text });
            }
            else {
                return res.status(404).send({ error: 'Comment not found' });
            }
        }
        await article.save();
        res.status(200).json({ articles: [article] });
    }
    catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}


async function createArticle(req, res) {
    try {
        if(!req.username) {
            return res.status(400).send({error: 'Invalid user information'});
        }
        const article = new Article({
            author: req.username,
            title: req.body.title,
            text: req.body.text,
            ...(req.body.image && { image: req.body.image }),
        });
        await article.save();

        const articles = await Article.find({author: req.username});
        res.status(201).json({ articles });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal server error'});
    }
}

module.exports = (app) => {
    app.get('/articles/:id?', isLoggedIn, getArticlesOrArticle);
    app.put('/articles/:id', isLoggedIn, updateArticle);
    app.post('/article', isLoggedIn, createArticle);
};