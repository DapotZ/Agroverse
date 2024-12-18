const express = require("express");
const { Sequelize } = require("sequelize");
const router = express.Router();
const Post = require("../models/forum/posts");
const PostLike = require("../models/forum/liked");
const Comment = require("../models/forum/comment");
const User = require("../models/user/user");
const { authenticateUser } = require("../middleware/auth");

// Route untuk menambahkan postingan baru
router.post("/posts/create", authenticateUser, async (req, res) => {
  console.log("UserId from token: ", req.userId); // Tambahkan log untuk debugging

  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Judul dan konten harus diisi" });
  }

  try {
    // Cek apakah user dengan userId yang ada di token benar-benar ada di tabel User
    const user = await User.findOne({ where: { user_id: req.userId } });
    console.log("Pengguna ditemukan:", user);
    if (!user) {
      console.error("User not found with ID: ", req.userId); // Tambahkan log error
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    // Buat postingan yang berhubungan dengan user_id yang valid
    const post = await Post.create({
      title,
      content,
      user_id: req.userId, // Gunakan user_id yang valid dari token
    });

    res.status(201).json({
      message: "Post berhasil dibuat",
      post: {
        post_id: post.post_id,
        title: post.title,
        content: post.content,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat postingan" });
  }
});

// Route untuk mendapatkan semua postingan dengan komentar terkait dan informasi user
router.get("/posts", async (req, res) => {
  try {
    // Mengambil semua postingan dengan menyertakan data User yang terkait
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: "user",
          required: true,
          attributes: ["user_id", "username"], // Pilih hanya kolom yang dibutuhkan
        },
      ],
    });

    // Mengirim respons jika data ditemukan
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data." });
  }
});

// Route untuk mendapatkan postingan berdasarkan ID dengan komentar terkait dan informasi user
router.get("/posts/:post_id", authenticateUser, async (req, res) => {
  const { post_id } = req.params;

  try {
    const post = await Post.findOne({
      where: { post_id },
      include: [
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "username"], // Hanya menampilkan kolom tertentu
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username"], // Hanya menampilkan kolom tertentu
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: "Postingan tidak ditemukan" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil postingan",
      error: error.message,
    });
  }
});

// Route untuk mengedit postingan berdasarkan ID
router.put("/posts/:post_id", authenticateUser, async (req, res) => {
  const { post_id } = req.params;
  const { title, content } = req.body; // Ambil data baru yang akan diupdate
  const user_id = req.userId; // Pastikan Anda sudah mengautentikasi pengguna dan mengambil id pengguna yang sedang login
  console.log("UserId from token: ", user_id); // Tambahkan log untuk debugging
  try {
    // Cari postingan berdasarkan post_id
    const post = await Post.findOne({ where: { post_id } });
    console.log("Post ID: ", post.user_id); // Tambahkan log untuk debugging

    // Jika postingan tidak ditemukan
    if (!post) {
      return res.status(404).json({ message: "Postingan tidak ditemukan" });
    }

    // Cek apakah user yang mengedit adalah pemilik postingan
    if (post.user_id !== user_id) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengedit postingan ini",
      });
    }

    // Update postingan
    post.title = title || post.title; // Update hanya jika ada nilai baru
    post.content = content || post.content;

    await post.save();

    // Kirim respons jika update berhasil
    res.status(200).json({ message: "Postingan berhasil diperbarui", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui postingan",
      error: error.message,
    });
  }
});

// Route untuk menghapus postingan berdasarkan ID
router.delete("/posts/:post_id/delete", authenticateUser, async (req, res) => {
  const { post_id } = req.params;
  const user_id = req.userId; // Pastikan user yang menghapus adalah yang membuat postingan

  try {
    // Cari postingan berdasarkan post_id
    const post = await Post.findOne({ where: { post_id } });

    // Jika postingan tidak ditemukan
    if (!post) {
      return res.status(404).json({ message: "Postingan tidak ditemukan" });
    }

    // Cek apakah user yang menghapus adalah pemilik postingan
    if (post.user_id !== user_id) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk menghapus postingan ini",
      });
    }

    // Hapus postingan
    await post.destroy();

    // Kirim respons jika penghapusan berhasil
    res.status(200).json({ message: "Postingan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus postingan",
      error: error.message,
    });
  }
});

router.get("/posts/:post_id/comments", async (req, res) => {
  const { post_id } = req.params;

  try {
    // Cek apakah post ada
    const post = await Post.findOne({ where: { post_id } });
    if (!post) {
      return res.status(404).json({ message: "Postingan tidak ditemukan" });
    }

    // Ambil komentar terkait postingan
    const comments = await Comment.findAll({
      where: { post_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username"], // Ambil nama pengguna
        },
      ],
    });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil komentar",
      error: error.message,
    });
  }
});

// Route untuk menambahkan komentar pada postingan
router.post("/posts/:post_id/comments", authenticateUser, async (req, res) => {
  const { post_id } = req.params;
  const { content } = req.body;
  const user_id = req.userId;

  try {
    // Cek apakah post ada
    const post = await Post.findOne({ where: { post_id } });
    if (!post) {
      return res.status(404).json({ message: "Postingan tidak ditemukan" });
    }

    // Membuat komentar baru
    const comment = await Comment.create({
      user_id,
      post_id,
      content,
    });

    return res.status(201).json({
      message: "Komentar berhasil ditambahkan",
      comment: {
        id: comment.id,
        user_id: comment.user_id,
        post_id: comment.post_id,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan komentar",
      error: error.message,
    });
  }
});

// Route untuk mengedit komentar berdasarkan ID
router.put("/comments/:comment_id", authenticateUser, async (req, res) => {
  const { comment_id } = req.params;
  const { content } = req.body;
  const user_id = req.userId;

  try {
    const comment = await Comment.findOne({ where: { comment_id, user_id } });

    if (!comment) {
      return res.status(404).json({
        message:
          "Komentar tidak ditemukan atau Anda tidak memiliki izin untuk mengedit komentar ini",
      });
    }

    comment.content = content;
    await comment.save();

    return res
      .status(200)
      .json({ message: "Komentar berhasil diperbarui", comment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat mengedit komentar",
      error: error.message,
    });
  }
});
// Route untuk menghapus komentar berdasarkan ID
router.delete("/comments/:comment_id", authenticateUser, async (req, res) => {
  const { comment_id } = req.params;
  const user_id = req.userId;

  try {
    // Cari komentar berdasarkan comment_id
    const comment = await Comment.findOne({ where: { comment_id } });

    // Jika komentar tidak ditemukan
    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    // Cari postingan yang terkait dengan komentar
    const post = await Post.findOne({ where: { post_id: comment.post_id } });

    // Jika postingan tidak ditemukan
    if (!post) {
      return res
        .status(404)
        .json({ message: "Postingan terkait tidak ditemukan" });
    }

    // Cek apakah pengguna yang menghapus adalah:
    // - Pembuat komentar
    // - Pemilik postingan
    if (comment.user_id !== user_id || post.user_id !== user_id) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk menghapus komentar ini",
      });
    }

    // Hapus komentar jika validasi berhasil
    await comment.destroy();

    return res.status(200).json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat menghapus komentar",
      error: error.message,
    });
  }
});

// Route untuk menambahkan dan mengurangi like pada postingan
router.post("/posts/:post_id/like", authenticateUser, async (req, res) => {
  const { post_id } = req.params;
  const user_id = req.userId;

  try {
    // Cek apakah post ada
    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ message: "Postingan tidak ditemukan" });
    }

    // Cek apakah user sudah memberi like
    const existingLike = await PostLike.findOne({
      where: { user_id, post_id },
    });

    if (existingLike) {
      // Jika user sudah memberi like, hapus like
      await existingLike.destroy();

      // Kurangi jumlah like pada post
      post.likes -= 1; // Decrement likes manually

      // Perbarui post dengan likes yang terbaru
      await post.save();

      return res.status(200).json({
        message: "Like dihapus",
        likes: post.likes, // Kirimkan jumlah like yang baru
      });
    } else {
      // Jika user belum memberi like, tambahkan like
      await PostLike.create({ user_id, post_id });

      // Tambahkan jumlah like pada post
      post.likes += 1; // Increment likes manually

      // Perbarui post dengan likes yang terbaru
      await post.save();

      return res.status(200).json({
        message: "Post disukai",
        likes: post.likes, // Kirimkan jumlah like yang baru
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat memberi like pada postingan",
      error: error.message,
    });
  }
});

module.exports = router;
