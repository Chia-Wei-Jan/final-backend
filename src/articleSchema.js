const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    author: String,
    title: String,
    text: String,
    date: { type: Date, default: Date.now },
    comments: [{
        text: String,
        date: { type: Date, default: Date.now}
    }]
})

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;