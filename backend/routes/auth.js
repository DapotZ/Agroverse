const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user/user");
const { authenticateUser } = require("../middleware/auth");
const router = express.Router();

// Registrasi Pengguna Baru
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Cek apakah email atau username sudah terdaftar
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "Email sudah terdaftar" });
  }

  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    return res.status(400).json({ message: "Username sudah terdaftar" });
  }

  // Enkripsi password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat pengguna baru
  try {
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ message: "Pengguna berhasil dibuat", userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat pengguna" });
  }
});

// Login Pengguna
// Login Pengguna
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: "Email atau Password salah" });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ message: "Email atau Password salah" });
  }

  // Generate token JWT
  const token = jwt.sign(
    { userId: user.user_id, role: user.role }, // Sertakan role dalam payload token
    process.env.JWT_SECRET, // Gunakan secret yang sesuai
    { expiresIn: "1h" } // Token berlaku selama 1 jam
  );

  // Kirim token dan informasi pengguna
  return res.status(200).json({
    message: "Login berhasil",
    token,
    user: {
      id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role, // Kirim role ke client
    },
  });
});

router.post("/logout", authenticateUser, async (req, res) => {
  try {
    // Logika logout (misalnya, blacklist token atau hapus sesi)
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Logout failed" });
  }
});

module.exports = router;
