const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: String, // Store the username of the comment's author
    text: String,
    date: { type: Date, default: Date.now }
});

const articleSchema = new mongoose.Schema({
    author: String,
    title: String,
    text: String,
    date: { type: Date, default: Date.now },
    comments: [commentSchema]
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;