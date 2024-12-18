const express = require("express");
const router = express.Router();
const User = require("../models/user/user");
const Comment = require("../models/forum/comment");
const Post = require("../models/forum/posts");
const PostLike = require("../models/forum/liked");
const ProductRating = require("../models/product/rating");
const { authenticateUser, checkRole } = require("../middleware/auth");

router.get("/", authenticateUser, checkRole("admin"), async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }
});

router.post("/", authenticateUser, checkRole("admin"), async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const user = await User.create({ username, email, password, role });
    res.status(201).json({ message: "Pengguna berhasil ditambahkan", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menambahkan pengguna" });
  }
});

router.get("/:id", authenticateUser, checkRole("admin"), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }
});

router.put("/:id", authenticateUser, checkRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    await user.update({ username, email, role });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui pengguna" });
  }
});

router.delete(
  "/:id",
  authenticateUser,
  checkRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      // Delete related records first
      await Comment.destroy({ where: { user_id: id } });
      await Post.destroy({ where: { user_id: id } });
      await PostLike.destroy({ where: { user_id: id } });
      await ProductRating.destroy({ where: { user_id: id } });

      // Now delete the user
      await user.destroy();

      res.json({
        message: "Pengguna berhasil dihapus beserta data terkaitnya",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal menghapus pengguna" });
    }
  }
);

module.exports = router;
