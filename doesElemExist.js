const Blog = require("./blog.model");

function isUsernameTaken(username) {
    return new Promise((resolve, reject) => {
        Blog.Author.findOne({ where: { slug: username } }).then((user) => {
            if (user === null) {
                resolve(false);
            } else {
                resolve(true);
            }
        }).catch(err => {
            resolve(false);
            console.error(err);
        })
    })
}

function isTitleTaken(article_title) {
    return new Promise((resolve, reject) => {
        Blog.Article.findOne({ where: { title: article_title } }).then((article) => {
            if (article === null) {
                resolve(false);
            } else {
                resolve(true);
            }
        }).catch(err => {
            resolve(false);
            console.error(err);
        })
    })
}

function isTagSlugTaken(tag_slug) {
    return new Promise((resolve, reject) => {
        Blog.Tag.findOne({ where: { slug: tag_slug } }).then((tag) => {
            if (tag === null) {
                resolve(false);
            } else {
                resolve(true);
            }
        }).catch(err => {
            resolve(false);
            console.error(err);
        })
    })
}

module.exports = { isUsernameTaken, isTitleTaken, isTagSlugTaken };