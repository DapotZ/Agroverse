const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/config").sequelize;
const Product = require("./product");

const ProductImage = sequelize.define("ProductImage", {
  image_id: {
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
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

ProductImage.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });

module.exports = ProductImage;
