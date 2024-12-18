const { DataTypes } = require("sequelize");
const sequelize = require("../../config/config").sequelize;
const User = require("../user/user");

const Suggestion = sequelize.define(
  "Suggestion",
  {
    suggestion_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

// Relasi: 1 User bisa memberikan banyak Saran
User.hasMany(Suggestion, { foreignKey: "user_id" });
Suggestion.belongsTo(User, { foreignKey: "user_id" });

module.exports = Suggestion;
