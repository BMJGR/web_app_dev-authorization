const { Sequelize, DataTypes } = require("sequelize");

const sequelizeInstance = new Sequelize(
    'blog',
    'root',
    'password',
    {
        host: 'localhost',
        dialect: 'mysql',
        define: {
            timestamps: false,
            primaryKey: false
        },
    },
);

const Author = sequelizeInstance.define("author", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    slug: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    }
});

const Article = sequelizeInstance.define("article", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    author_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        // references: 'authors',
        // key: 'id'
    },
    title: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

Author.hasMany(Article, { foreignKey: 'author_id', constraints: false });
Article.belongsTo(Author, { foreignKey: 'author_id', constraints: false });

const Tag = sequelizeInstance.define("tag", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    slug: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
    }
});

const ArticleTag = sequelizeInstance.define("articles_tag", {
    article_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        // model: 'articles',
        // key: 'id'
    },
    tag_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        // model: 'tags',
        // key: 'id'
    }
});

ArticleTag.removeAttribute('id');

// Tag.belongsToMany(Article, { through: { model: ArticleTag, foreignKey: 'tag_id', otherKey: 'article_id' }, foreignKey: 'article_id' });
// Article.belongsToMany(Tag, { through: { model: ArticleTag, foreignKey: 'article_id', otherKey: 'tag_id' }, foreignKey: 'tag_id' });

Tag.hasMany(ArticleTag, { foreignKey: 'tag_id', constraints: false });
ArticleTag.belongsTo(Tag, { foreignKey: 'tag_id', constraints: false });
Article.hasMany(ArticleTag, { foreignKey: 'article_id', constraints: false });
ArticleTag.belongsTo(Article, { foreignKey: 'article_id', constraints: false });

// Tag.hasMany(ArticleTag, { foreignKey: 'tag_id' });
// ArticleTag.belongsTo(Tag, { foreignKey: 'tag_id' });
// Article.hasMany(ArticleTag, { foreignKey: 'article_id' });
// ArticleTag.belongsTo(Article, { foreignKey: 'article_id' });

// Article.addTag


// Article.hasMany(Tag);
// Tag.belongsToMany(Article, { through: { model: ArticleTag, foreignKey: 'tag_id', foreignKey: 'article_id' } })

// Tag.hasMany(ArticleTag, { through: { model: ArticleTag, foreignKey: 'tag_id', foreignKey: 'article_id' } });


module.exports = { Author, Article, Tag, ArticleTag };