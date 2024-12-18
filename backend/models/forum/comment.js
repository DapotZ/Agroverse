const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/config").sequelize;
const User = require("../user/user");
const Post = require("../forum/posts");

const Comment = sequelize.define("Comment", {
  comment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "user_id",
    },
    allowNull: false,
  },
  post_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Post, // Pastikan nama model Post sesuai
      key: "post_id",
    },
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Comment, { foreignKey: "user_id" });

// Relasi dengan Post (Many-to-One)
Comment.belongsTo(Post, { foreignKey: "post_id", as: "post" });
Post.hasMany(Comment, { foreignKey: "post_id", as: "comments" });
module.exports = Comment;
