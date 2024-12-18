const { DataTypes } = require("sequelize");
const sequelize = require("../../config/config").sequelize;
const User = require("../user/user");
const Post = require("../forum/posts");

const PostLike = sequelize.define(
  "PostLike",
  {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Menambahkan atribut untuk mengatur waktu
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Menambahkan relasi many-to-many
Post.belongsToMany(User, {
  through: PostLike,
  foreignKey: "post_id",
  otherKey: "user_id", // Menambahkan relasi ke kolom user_id di PostLike
});
User.belongsToMany(Post, {
  through: PostLike,
  foreignKey: "user_id",
  otherKey: "post_id", // Menambahkan relasi ke kolom post_id di PostLike
});

// Menambahkan composite primary key untuk PostLike
PostLike.belongsTo(Post, { foreignKey: "post_id" });
PostLike.belongsTo(User, { foreignKey: "user_id" });

module.exports = PostLike;
