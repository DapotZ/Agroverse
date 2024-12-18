const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Mengambil token dari header

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    // Verifikasi token menggunakan secret yang sama dengan saat pembuatan token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Menyimpan userId dari token ke dalam request untuk digunakan di route berikutnya
    req.userId = decoded.userId;

    // Melanjutkan ke middleware berikutnya atau route handler
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

const checkRole = (role) => {
  return (req, res, next) => {
    // Pastikan ada token dan sudah terverifikasi
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token tidak valid" });
      }

      // Memeriksa role
      if (decoded.role !== role) {
        return res.status(403).json({ message: "Anda tidak memiliki akses" });
      }

      // Lanjutkan ke rute berikutnya
      next();
    });
  };
};

module.exports = { authenticateUser, checkRole };
