// sync.js
const { sequelize } = require("./config/config");
const { User } = require("./models/user/user"); // Jalur relatif harus benar
const { Post } = require("./models/forum/posts"); // Jalur relatif harus benar
const { Comment } = require("./models/forum/comment"); // Jalur relatif harus benar
const { PostLike } = require("./models/forum/liked");
const { Product } = require("./models/product/product");
const { ProductImage } = require("./models/product/gambarProduct");
const { ProductRating } = require("./models/product/rating");
const { Category } = require("./models/product/category");
const { Suggestion } = require("./models/saran/suggestion");
const { Webinar } = require("./models/webinar/webinar");

(async () => {
  try {
    // Gunakan { force: false } untuk memastikan tabel akan dibuat atau diperbarui
    await sequelize.sync({ force: true });
    console.log("Tabel berhasil dibuat atau diperbarui!");
  } catch (error) {
    console.error("Gagal membuat tabel:", error);
  } finally {
    // Tutup koneksi setelah sinkronisasi selesai
    await sequelize.close();
  }
})();
