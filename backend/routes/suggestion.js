const express = require("express");
const router = express.Router();
const User = require("../models/user/user");
const Suggestion = require("../models/saran/suggestion");
const { authenticateUser, checkRole } = require("../middleware/auth");

router.post("/", authenticateUser, checkRole("user"), async (req, res) => {
  const { user_id, message } = req.body;
  const userID = req.userId;
  console.log(userID);

  try {
    const suggestion = await Suggestion.create({ user_id: userID, message });
    res.status(201).json({ message: "Saran berhasil ditambahkan", suggestion });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan saran", error: error.message });
  }
});

router.get("/", authenticateUser, checkRole("admin"), async (req, res) => {
  try {
    const suggestions = await Suggestion.findAll({
      include: [
        {
          model: User, // Model yang ingin di-include (User)
          attributes: ["username"], // Hanya ambil atribut username dari User
        },
      ],
    });
    res.status(200).json(suggestions);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data saran", error: error.message });
  }
});

router.delete(
  "/:id",
  authenticateUser,
  checkRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const suggestion = await Suggestion.findByPk(id);
      if (!suggestion) {
        return res.status(404).json({ message: "Saran tidak ditemukan" });
      }
      await suggestion.destroy();
      res.status(200).json({ message: "Saran berhasil dihapus" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Gagal menghapus saran", error: error.message });
    }
  }
);

module.exports = router;
