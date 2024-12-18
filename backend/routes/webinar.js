const express = require("express");
const router = express.Router();
const Webinar = require("../models/webinar/webinar");
const { authenticateUser, checkRole } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const webinar = await Webinar.findAll();
    res.status(200).json({ webinar });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data webinar",
      error: error.message,
    });
  }
});

router.post("/", authenticateUser, checkRole("admin"), async (req, res) => {
  try {
    const { title, speaker, description, images, schedule, link } = req.body;
    const webinar = await Webinar.create({
      title,
      speaker,
      description,
      images,
      schedule,
      link,
    });
    res.status(201).json({ message: "Webinar berhasil ditambahkan", webinar });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan webinar", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const webinar = await Webinar.findByPk(id);
    if (!webinar) {
      return res.status(404).json({ message: "Webinar tidak ditemukan" });
    }
    res.status(200).json({ webinar });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan webinar", error: error.message });
  }
});

router.put("/:id", authenticateUser, checkRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, speaker, description, images, schedule, link } = req.body;
    const webinar = await Webinar.findByPk(id);
    if (!webinar) {
      return res.status(404).json({ message: "Webinar tidak ditemukan" });
    }
    await webinar.update({
      title,
      speaker,
      description,
      images,
      schedule,
      link,
    });
    res.status(200).json({ message: "Webinar berhasil diperbarui", webinar });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui webinar", error: error.message });
  }
});

router.delete(
  "/:id",
  authenticateUser,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const webinar = await Webinar.findByPk(id);
      if (!webinar) {
        return res.status(404).json({ message: "Webinar tidak ditemukan" });
      }
      await webinar.destroy();
      res.status(200).json({ message: "Webinar berhasil dihapus" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Gagal menghapus webinar", error: error.message });
    }
  }
);

module.exports = router;
