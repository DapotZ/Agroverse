const express = require("express");
const router = express.Router();
const Category = require("../models/product/category"); // Pastikan model `Category` diimpor
const { authenticateUser, checkRole } = require("../middleware/auth");

// ===== CREATE =====
// Tambah Kategori (Hanya Admin)
router.post(
  "/create",
  authenticateUser,
  checkRole("admin"),
  async (req, res) => {
    const { name } = req.body;

    try {
      const category = await Category.create({ name });
      res.status(201).json({
        message: "Kategori berhasil ditambahkan",
        category,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Gagal menambahkan kategori", error: error.message });
    }
  }
);

// ===== READ =====
// Dapatkan Semua Kategori
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      message: "Daftar kategori",
      categories,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan kategori", error: error.message });
  }
});

// Dapatkan Kategori Berdasarkan ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan kategori", error: error.message });
  }
});

// ===== UPDATE =====
// Update Kategori (Hanya Admin)
router.put("/:id", authenticateUser, checkRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    await category.update({ name });

    res.status(200).json({
      message: "Kategori berhasil diperbarui",
      category,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui kategori", error: error.message });
  }
});

// ===== DELETE =====
// Hapus Kategori (Hanya Admin)
router.delete(
  "/:id",
  authenticateUser,
  checkRole("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ message: "Kategori tidak ditemukan" });
      }

      await category.destroy();

      res.status(200).json({
        message: "Kategori berhasil dihapus",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Gagal menghapus kategori", error: error.message });
    }
  }
);

module.exports = router;
