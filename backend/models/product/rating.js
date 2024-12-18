const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/config").sequelize;
const Product = require("./product");
const User = require("../user/user");

const ProductRating = sequelize.define("ProductRating", {
  rating_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: "product_id",
    },
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

ProductRating.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(ProductRating, { foreignKey: "product_id", as: "ratings" });

ProductRating.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(ProductRating, { foreignKey: "user_id", as: "ratings" });

module.exports = ProductRating;
