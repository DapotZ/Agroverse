const { Sequelize } = require("sequelize");
require("dotenv").config(); // Memuat variabel lingkungan dari file .env

// Setup koneksi Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

// Fungsi untuk menghubungkan dan mengautentikasi koneksi ke database
const authenticateDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Koneksi ke database berhasil.");
  } catch (err) {
    console.error("Tidak dapat terhubung ke database:", err);
  }
};

module.exports = {
  sequelize,
  authenticateDB,
};
