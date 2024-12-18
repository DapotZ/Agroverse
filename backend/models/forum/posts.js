const { DataTypes } = require("sequelize");
const sequelize = require("../../config/config").sequelize;
const User = require("../user/user"); // Pastikan model User sudah benar diimpor

// Definisi model Post
const Post = sequelize.define(
  "Post",
  {
    post_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Default value untuk likes, dimulai dengan 0
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User, // Relasi ke model User
        key: "user_id",
      },
      allowNull: false,
    },
  },
  {
    timestamps: true, // Mengaktifkan timestamp secara otomatis
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

// Relasi Post ke User (one-to-many)
Post.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Post, { foreignKey: "user_id" });

module.exports = Post;
