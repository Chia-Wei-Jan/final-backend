const express = require('express');
const mongoose = require('mongoose');
const Article = require('./articleSchema');
const User = require('./userSchema');
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
        // First, get the username array from the following ObjectIds
        const followingUsernames = await User.find({
            '_id': { $in: req.following }
        }).select('username -_id'); // Select only the 'username' field, exclude '_id'

        // Map the returned documents to an array of usernames
        const followingUsernameArray = followingUsernames.map(user => user.username);

        // Combine the logged-in user's username with their following's usernames
        const authorsToQuery = [req.username, ...followingUsernameArray];

        // Fetch articles written by any of these authors
        const articles = await Article.find({ author: { $in: authorsToQuery } })
                                      .sort({ date: -1 });
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
        if (!article) {
            return res.status(404).send({ error: 'Article not found' });
        }

        // Update article text if no commentId is provided (and the user is the author)
        if (commentId === undefined) {
            article.text = text;
            if (article.author !== req.username) {
                return res.status(403).send({ error: 'Forbidden' });
            }
        } else {
            // Handle comment addition or update
            if (commentId === '-1') {
                // Add a new comment
                article.comments.push({ 
                    author: req.username, 
                    text: text 
                });
            } else {
                // Update an existing comment
                const comment = article.comments.id(commentId);
                if (comment) {
                    if (comment.author !== req.username) {
                        return res.status(403).send({ error: 'Forbidden' });
                    }
                    comment.text = text;
                } else {
                    return res.status(404).send({ error: 'Comment not found' });
                }
            }
        }
        await article.save();
        res.status(200).json({ articles: [article] });
    } catch (error) {
        console.error(error);
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