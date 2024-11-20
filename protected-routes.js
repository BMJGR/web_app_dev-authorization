const express = require('express');
const router = express.Router();
const verifyToken = require("./verify-token"); 
const Blog = require("./blog.model");
const doesExist = require("./doesElemExist");


router.post("/authors", verifyToken, (req, res) => {
    const { slug, name, description } = req.body;

    if (req.role !== 'root' && req.user !== slug) {
        res.status(403).send({ message: "Access forbiden" });
        return;
    }

    if (!slug || !name) {
        res.status(405).send({ message: 'Content expected' });
    } else {
        doesExist.isUsernameTaken(slug).then(isTaken => {
            if (isTaken) {
                res.status(405).send({ message: 'Username already taken' });
            } else {
                Blog.Author.create({
                    slug: slug,
                    name: name,
                    description: description
                }).then(() => {
                    res.status(200).json({ message: "Author added succesfully" });
                }).catch(() => {
                    res.status(405).send({ message: "Didn't manage to create new user" });
                });
            }
        })
    }
});

function addTagsToArticle(articleId, tagsIds) {
    return new Promise((resolve, reject) => {
        if (tagsIds === null) {
            resolve(false);
        } else {
            for (const tag of tagsIds) {
                console.log(tag);
                Blog.ArticleTag.create({
                    article_id: articleId,
                    tag_id: tag
                }).catch(() => {
                    resolve(false);
                    return;
                });
            }
            resolve(true);
        }
    });
}

function addNewArticle(authorId, title, description, content, tagsIds) {
    return new Promise((resolve, reject) => {
        Blog.Article.create({
            author_id: authorId,
            title: title,
            description: description,
            content: content
        }).then((article) => {
            addTagsToArticle(article.id, tagsIds).then((success) => {
                if (success) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(() => {
                resolve(false);
            })
        }).catch(() => {
            resolve(false);
        });
    });
}

router.post("/articles", verifyToken, (req, res) => {
    const { author_slug, title, description, content, tags_ids } = req.body;

    if (!title || !content) {
        res.status(405).send({ message: 'Not enough data' });
        return;
    }

    if (req.role !== 'root' && req.user !== author_slug) {
        res.status(403).send({ message: "Access forbiden" });
        return;
    }

    doesExist.isTitleTaken(title).then(isTaken => {
        if (!isTaken) {
            Blog.Author.findOne({ where: { slug: author_slug } }).then(author => {
                if (author !== null) {
                    addNewArticle(author.id, title, description, content, tags_ids).then((success) => {
                        if (success) {
                            res.status(200).json({ message: "Article added succesfully" });
                        } else {
                            res.status(405).send({ message: "Didn't manage to add new article" });
                        }
                    }).catch(() => {
                        res.status(405).send({ message: "Didn't manage to add new article" });
                    });
                } else {
                    res.status(404).json({ message: "Such author doesn't exist" });
                }
            }).catch(err => {
                console.log(err);
            }); 
        } else {
            res.status(405).send({ message: 'Such title already exists' });
        }
    }) 
});

router.post("/tags", verifyToken, (req, res) => {
    const { slug, name } = req.body;

    if (!slug || !name) {
        res.status(405).send({ message: "Not enough data" });
        return;
    }

    if (req.role !== 'root') {
        res.status(403).send({ message: "Access forbiden" });
        return;
    }

    doesExist.isTagSlugTaken(slug).then(isTaken => {
        if (isTaken) {
            res.status(405).send({ message: "Such tag already exist" });
            return;
        } else {
            Blog.Tag.create({
                slug: slug,
                name: name
            }).then(() => {
                res.status(200).json({ message: "Tag added succesfully" });
            }).catch(() => {
                res.status(405).send({ message: "Didn't manage to create new tag" });
            });
        }
    })
});





// DELETE

function removeArticle(article_id) {
    return new Promise((resolve, reject) => {
        Blog.ArticleTag.destroy({ where: { article_id: article_id } }).then((success) => {
            if (success) {
                Blog.Article.destroy({ where: { id: article_id } }).then((success) => {
                    if (success) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            } else {
                resolve(false);
            }
        }).catch((err) => {
            resolve(false);
        });
    });
}

function removeArticlesTags(artTags) {
    return new Promise((resolve, reject) => { 
        for (const artTag of artTags) {
            if (artTag.article_id !== null) {
                Blog.ArticleTag.destroy({ where: { article_id: artTag.article_id, tag_id: artTag.tag_id } });
            }
        }
        resolve(true);

    })
}

function removeArticles(articles) {
    return new Promise((resolve, reject) => { 
        for (const article of articles) {
            Blog.Article.destroy({ where: { id: article.id } });
        }
        resolve(true);
    })
}

router.delete("/authors/:slug", verifyToken, (req, res) => {
    const { slug } = req.params;

    if (req.role !== 'root' && req.user !== slug) {
        res.status(403).send({ message: "Access forbiden" });
        return;
    }

    Blog.ArticleTag.findAll({
        raw: true,
        
        include: [{
            model: Blog.Article,
            attributes: [],
            required: true,

            include: [{
                model: Blog.Author,
                where: { slug: slug },
                attributes: [],
                required: true,
            }]
        }]
    }).then(artTags => {
        // for (const artTag of artTags) {
        //     if (artTag.article_id !== null) {
        //         Blog.ArticleTag.destroy({ where: { article_id: artTag.article_id, tag_id: artTag.tag_id } });
        //     }
        // }
        
        Blog.ArticleTag.destroy({ where: { article_id: artTags.map(a => {return a.article_id}), tag_id: artTags.map(a => {return a.tag_id}) } }).then(() => {
            Blog.Article.findAll({
                raw: true,

                include: [{
                    model: Blog.Author,
                    where: { slug: slug },
                    attributes: [],
                    required: true,
                }]
            }).then(articles => {
                // for (const article of articles) {
                //     Blog.Article.destroy({ where: { id: article.id } });
                // }
                Blog.Article.destroy({ where: { id: articles.map(a => {return a.id}) } }).then(() => {
                    Blog.Author.destroy({ where: { slug: slug } }).then(success => {
                        if (success) {
                            res.status(200).json({ message: "Author deleted succesfully" });
                        } else {
                            res.status(405).send({ message: "Didn't manage to delete author" });
                        }
                    })
                })
            })
        })

    })
});

function getAuthorSlugOfArticle(article_id) {
    return new Promise((resolve, reject) => {
        Blog.Article.findOne({ where: { id: article_id } }).then((article) => {
            if (article !== null) {
                Blog.Author.findOne({
                    where: { id: article.author_id }
                }).then(author => {
                    if (author !== null) {
                        resolve(author.slug);
                    } else {
                        resolve(null);
                    }
                }).catch(() => {
                    resolve(null);
                })
            } else {
                resolve(null);
            }
        }).catch(err => {
            resolve(null);
            console.error(err);
        })
    })
}

router.delete("/articles/:id", verifyToken, (req, res) => {
    const { id } = req.params;

    getAuthorSlugOfArticle(id).then((authorSlug) => {
        if (authorSlug === null && authorSlug !== req.user && req.role !== 'root') {
            res.status(403).json({ message: "Forbiden" });
            return;
        } else {
            removeArticle(id).then(success => {
                if (success) {
                    res.status(200).json({ message: "Article deleted succesfully" });
                } else {
                    res.status(405).send({ message: "Didn't manage to delete article2" });
                }
            }).catch(() => {
                res.status(405).send({ message: "Didn't manage to delete article" });
            });
        }
    });
});

router.delete("/tags/:tag_id", verifyToken, (req, res) => {
    const { tag_id } = req.params;

    if (req.role !== 'root') {
        res.status(403).send({ message: "Access forbiden" });
        return;
    }

    Blog.Tag.destroy({
        where: { id: tag_id }
    }).then((wasDestroyed) => {
        if (wasDestroyed) {
            res.status(200).json({ message: "Tag deleted succesfully" });
        } else {
            res.status(405).send({ message: "Didn't manage to delete tag" });
        }
    }).catch(() => {
        res.status(405).send({ message: "Didn't manage to delete tag" });
    });
});




// UPDATE

router.put("/authors", verifyToken, (req, res) => {
    const { slug, name, description } = req.body;

    if (req.role !== 'root' && req.user !== slug) {
        res.status(403).send({ message: "Access forbiden" });
        return;
    }

    updates = {};

    if (name) {
        updates.name = name;
    }

    if (description) {
        updates.description = description;
    }

    Blog.Author.update(updates, { where: { slug: slug } }).then((success) => {
        if (success) {
            res.status(200).json({ message: "Author updated succesfully" });
        } else {
            res.status(405).send({ message: "Didn't manage to update author" });
        }
    }).catch(() => {
        res.status(405).send({ message: "Didn't manage to update author" });
    });
});

router.put("/articles", verifyToken, (req, res) => {
    const { id, title, description, content, tags_ids } = req.body;

    updates = {};

    if (title) {
        updates.title = title;
    }

    if (description) {
        updates.description = description;
    }

    if (content) {
        updates.content = content;
    }

    getAuthorSlugOfArticle(id).then((slug) => {
        if (slug === req.user || req.role === 'root') {
            doesExist.isTitleTaken(title).then(isTaken => {
                if (!isTaken) {
                    Blog.Author.findOne({ where: { slug: req.user } }).then(author => {
                        if (author !== null) {
                            console.log(author.id, id);
                            Blog.Article.update(updates, { where: { author_id: author.id, id: id } }).then(() => {
                                if (tags_ids) {
                                    Blog.ArticleTag.destroy({ where: { article_id: id } }).then(() => {
                                        try {
                                            for (const tag_id of tags_ids) {
                                                Blog.ArticleTag.create({
                                                    article_id: id,
                                                    tag_id: tag_id
                                                })
                                            }
                                            res.status(201).send({ message: "Article was updated successfully" });
                                        } catch(err) {
                                            res.status(405).send({ message: "Didn't manage to update the article2" });
                                        }
 
                                    })
                                }
                            }).catch(() => {
                                res.status(405).send({ message: "Didn't manage to update the article1" });
                            });
                        } else {
                            res.status(404).json({ message: "Such author doesn't exist" });
                        }
                    }).catch(err => {
                        console.log(err);
                    }); 
                } else {
                    res.status(405).send({ message: 'Such title already exists' });
                }
            }) 
        } else {
            res.status(403).send({ message: "Access forbiden" });
        }
    })
    
});

router.put("/tags", verifyToken, (req, res) => {
    const { id, slug, name } = req.body;

    if (req.role !== 'root') {
        res.status(403).send({ message: "Access forbiden" });
        return;
    }

    updates = {};

    if (slug) {
        updates.slug = slug;
    }

    if (name) {
        updates.name = name;
    }

    Blog.Tag.update(updates, { where: { id: id } }).then((success) => {
        if (success) {
            res.status(200).json({ message: "Tag updated succesfully" });
        } else {
            res.status(405).send({ message: "Didn't manage to update tag" });
        }
    }).catch(() => {
        res.status(405).send({ message: "Didn't manage to update tag" });
    });
});

module.exports = router;