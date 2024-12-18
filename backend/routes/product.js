const express = require("express");
const router = express.Router();
const Product = require("../models/product/product"); // Pastikan model terimport
const ProductImage = require("../models/product/gambarProduct");
const Rating = require("../models/product/rating");
const Category = require("../models/product/category");
const ProductRating = require("../models/product/rating");
const User = require("../models/user/user"); // Import User model

const { authenticateUser, checkRole } = require("../middleware/auth");

// ===== CREATE =====
// Tambah Produk
router.post("/", authenticateUser, checkRole("admin"), async (req, res) => {
  const { name, description, quantity, price, category_id, images } = req.body;

  try {
    // Cek apakah kategori ada
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    // Membuat produk baru
    const product = await Product.create({
      name,
      description,
      quantity,
      price,
      category_id,
    });

    // Jika ada gambar yang dikirimkan, simpan gambar ke tabel ProductImage
    if (images && images.length > 0) {
      // Menyiapkan data gambar untuk dimasukkan ke dalam ProductImage
      const productImages = images.map((image) => ({
        product_id: product.product_id,
        image_url: image, // Gambar yang diterima dari request
      }));

      // Menyimpan gambar ke tabel ProductImage
      await ProductImage.bulkCreate(productImages);
    }

    // Mengembalikan respons dengan informasi produk
    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      product,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan produk", error: error.message });
  }
});

// ===== READ =====
// Dapatkan Semua Produk
router.get("/", async (req, res) => {
  const { category_id, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const where = {};

    if (category_id) {
      where.category_id = category_id;
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // Mengambil total produk tanpa pagination
    const totalProducts = await Product.count({ where });

    // Mengambil produk berdasarkan pagination
    const products = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: "category", attributes: ["name"] },
        { model: ProductImage, as: "images", attributes: ["image_url"] },
        {
          model: Rating,
          as: "ratings",
          attributes: ["rating"],
        },
      ],
      limit: parseInt(limit),
      offset,
    });

    res.status(200).json({
      message: "Daftar produk",
      data: products.rows,
      total: totalProducts, // Menggunakan total produk dari count
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan produk", error: error.message });
  }
});

// Dapatkan Produk Berdasarkan ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { model: ProductImage, as: "images" },
        {
          model: Rating,
          as: "ratings",
          attributes: ["rating"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan produk", error: error.message });
  }
});

// ===== UPDATE =====
// Update Produk
router.put("/:id", authenticateUser, checkRole("admin"), async (req, res) => {
  const { id } = req.params; // Ambil 'id' dari parameter URL
  const { name, description, price, quantity, category_id, images } = req.body;

  try {
    // Debug input request
    console.log("Request body:", req.body);

    // Cari produk berdasarkan ID
    const product = await Product.findOne({
      where: { product_id: id },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    // Jika produk tidak ditemukan
    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    // Perbarui data produk
    await product.update({ name, description, price, quantity, category_id });

    // Debug produk yang berhasil diperbarui
    console.log("Produk berhasil diperbarui:", product);

    // Perbarui gambar produk jika ada
    if (images && Array.isArray(images)) {
      // Ambil gambar lama
      const existingImages = await ProductImage.findAll({
        where: { product_id: id },
      });
      const existingUrls = existingImages.map((img) => img.image_url); // Ubah 'url' menjadi 'image_url'

      // Tentukan gambar yang perlu dihapus
      const urlsToDelete = existingUrls.filter((url) => !images.includes(url));
      if (urlsToDelete.length > 0) {
        console.log("Menghapus gambar lama:", urlsToDelete);
        await ProductImage.destroy({ where: { image_url: urlsToDelete } }); // Ubah 'url' menjadi 'image_url'
      }

      // Tentukan gambar yang perlu ditambahkan
      const urlsToAdd = images.filter((url) => !existingUrls.includes(url));
      const productImagesToAdd = urlsToAdd.map((url) => ({
        product_id: id,
        image_url: url, // Ubah 'url' menjadi 'image_url'
      }));
      if (productImagesToAdd.length > 0) {
        console.log("Menambahkan gambar baru:", productImagesToAdd);
        await ProductImage.bulkCreate(productImagesToAdd);
      }
    } else {
      console.log("Tidak ada gambar baru yang ditambahkan.");
    }

    // Respon sukses
    res.status(200).json({ message: "Produk berhasil diperbarui", product });
  } catch (error) {
    console.error("Error saat memperbarui produk:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui produk", error: error.message });
  }
});

// ===== DELETE =====
// Hapus Produk
router.delete(
  "/:id",
  authenticateUser,
  checkRole("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Cari produk berdasarkan id dan ambil data kategori terkait
      const product = await Product.findOne({
        where: { product_id: id },
        include: [
          {
            model: Category,
            as: "category", // Alias yang sesuai dengan relasi yang ada
            attributes: ["name"], // Ambil hanya nama kategori
          },
        ],
      });

      if (!product) {
        return res.status(404).json({
          message: "Produk tidak ditemukan atau Anda tidak memiliki akses",
        });
      }

      // Hapus rating terkait produk
      await Rating.destroy({ where: { product_id: id } });

      // Hapus gambar produk terkait
      await ProductImage.destroy({ where: { product_id: id } });

      // Hapus produk
      await product.destroy();

      // Kirimkan response dengan informasi kategori produk yang dihapus
      res.status(200).json({
        message: "Produk berhasil dihapus",
        product: {
          id: product.product_id,
          name: product.name,
          category: product.category.name, // Nama kategori dari relasi
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Gagal menghapus produk", error: error.message });
    }
  }
);

// ===== RATING =====
// Tambahkan Rating
router.post("/:id/rating", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  const user_id = req.userId;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const existingRating = await Rating.findOne({
      where: { product_id: id, user_id },
    });

    if (existingRating) {
      await existingRating.update({ rating });
    } else {
      await Rating.create({ product_id: id, user_id, rating });
    }

    res.status(200).json({ message: "Rating berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan rating", error: error.message });
  }
});

// Mengambil rating produk
router.get("/:id/rating", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const ratings = await Rating.findAll({
      where: { product_id: id },
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) /
          ratings.length
        : 0;

    res.status(200).json({ averageRating, ratingsCount: ratings.length });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan rating", error: error.message });
  }
});

// Menambahkan Review pada produk
router.post("/:id/review", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body; // Ambil rating dan review dari request body
  const user_id = req.userId;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Cek apakah pengguna sudah memberikan review untuk produk ini
    const existingReview = await ProductRating.findOne({
      where: { product_id: id, user_id },
    });

    if (existingReview) {
      // Jika sudah ada review, perbarui rating dan review
      await existingReview.update({ rating, review });
      return res.status(200).json({ message: "Review berhasil diperbarui" });
    } else {
      // Jika belum ada review, buat review baru
      await ProductRating.create({ product_id: id, user_id, rating, review });
      return res.status(201).json({ message: "Review berhasil ditambahkan" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan review", error: error.message });
  }
});

// Mengambil Review untuk produk
// Mengambil Review untuk produk
router.get("/:id/review", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Ambil semua review terkait produk ini
    const reviews = await ProductRating.findAll({
      where: { product_id: id },
      include: [
        {
          model: User,
          as: "user", // Alias untuk relasi user
          attributes: ["username", "email"], // Ambil informasi pengguna terkait review
        },
      ],
    });

    // Mengembalikan data reviews dengan informasi pengguna
    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan review", error: error.message });
  }
});

router.post("/:id/rating-review", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body; // Ambil rating dan review dari request body
  const user_id = req.userId;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Cek apakah pengguna sudah memberikan rating dan review untuk produk ini
    const existingReview = await ProductRating.findOne({
      where: { product_id: id, user_id },
    });

    if (existingReview) {
      // Jika sudah ada rating dan review, perbarui data tersebut
      await existingReview.update({ rating, review });
      return res
        .status(200)
        .json({ message: "Rating dan review berhasil diperbarui" });
    } else {
      // Jika belum ada rating dan review, buat entri baru
      await ProductRating.create({ product_id: id, user_id, rating, review });
      return res
        .status(201)
        .json({ message: "Rating dan review berhasil ditambahkan" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menambahkan rating dan review",
      error: error.message,
    });
  }
});

module.exports = router;
