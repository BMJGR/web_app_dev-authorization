const express = require('express');
const router = express.Router();
const verifyToken = require("./verify-token"); 
const Blog = require("./blog.model");
const { where } = require('sequelize');


router.get("/verify3", verifyToken, (req, res) => {
    res.status(200).json({ message: `Protected route accessed3: ${req.user}, ${req.role}` });
});

router.get("/authors", (req, res) => {
    Blog.Author.findAll().then(results => {
        res.status(200).json({ results });
    }).catch(err => {
        console.log(err);
    });    
});

router.get("/authors/:slug", (req, res) => {
    const { slug } = req.params;

    Blog.Author.findOne({ where: { slug: slug } }).then(results => {
        if (results !== null) {
            res.status(200).json({ results });
        } else {
            res.status(404).json({ message: "Such author doesn't exist" });
        }
    }).catch(err => {
        console.log(err);
    });    
});

router.get("/authors/:author_slug/articles", (req, res) => {
    const { author_slug } = req.params;

    Blog.Article.findAll({
        include: [{
            model: Blog.Author,
            where: { slug: author_slug },
            attributes: []
        }]
    }).then(results => {
        if (results !== null) {
            res.status(200).json({ results });
        } else {
            res.status(404).json({ message: "Such author doesn't exist" });
        }
    }).catch(err => {
        console.log(err);
    });    
});

router.get("/articles", (req, res) => {
    Blog.Article.findAll().then(results => {
        res.status(200).json({ results });
    }).catch(err => {
        console.log(err);
    });    
});

router.get('/articles/:id', (req, res) => {
    const { id } = req.params;

    Blog.Article.findOne({ where: {id: id} }).then(results => {
        if (results !== null) {
            res.status(200).json({ results });
        } else {
            res.status(404).json({ message: "Such article doesn't exist" });
        }
    }).catch(err => {
        console.log(err);
    });

});

router.get('/articles/:article_id/tags', (req, res) => {
    const { article_id } = req.params;

    Blog.Tag.findAll({
        attributes: ['id', 'slug', 'name'],
        include: [{
            model: Blog.ArticleTag,
            where: { article_id: article_id },
            attributes: []
        }]
    }).then(results => {
        if (results !== null) {
            res.status(200).json({ results });
        } else {
            res.status(404).json({ message: "Such article doesn't exist" });
        }
    }).catch(err => {
        console.log(err);
    }); 
    
    // Blog.ArticleTag.findAll({
    //     // where: { article_id: article_id }
    // }).then(results => {
    //     if (results !== null) {
    //         res.status(200).json({ results });
    //     } else {
    //         res.status(404).json({ message: "Such article doesn't exist" });
    //     }
    // }).catch(err => {
    //     console.log(err);
    // }); 

    // Blog.Tag.findAll({
    //     include: [{
    //         model: Blog.Article,
    //         where: { id: article_id },
    //         required: true
    //     }]
    // }).then(results => {
    //     if (results !== null) {
    //         res.status(200).json({ results });
    //     } else {
    //         res.status(404).json({ message: "Such author doesn't exist" });
    //     }
    // }).catch(err => {
    //     console.log(err);
    // });    
});

router.get("/tags", (req, res) => {
    Blog.Tag.findAll().then(results => {
        res.status(200).json({ results });
    }).catch(err => {
        console.log(err);
    });    
});

router.get('/tags/:tag_id', (req, res) => {
    const { tag_id } = req.params;

    // if (tag_id === null || tag_id === undefined) {
    //     res.status(400).json({ message: "Wrong tag id" });
    // }

    Blog.Tag.findOne({ where: {id: tag_id} }).then(results => {
        if (results !== null) {
            res.status(200).json({ results });
        } else {
            res.status(404).json({ message: "Such tag doesn't exist" });
        }
    }).catch(err => {
        console.log(err);
    }); 
});

// router.get("/at", (req, res) => {
//     Blog.ArticleTag.findAll().then(results => {
//         res.status(200).json({ results });
//     }).catch(err => {
//         console.log(err);
//     });    
// });

module.exports = router;