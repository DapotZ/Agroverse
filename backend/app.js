const express = require("express");
const cors = require("cors");
const { authenticateDB } = require("./config/config");
const dotenv = require("dotenv");

// Setup environment variables
dotenv.config();

// Inisialisasi Express
const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // Ganti dengan URL frontend Anda
  methods: "GET,POST,PUT,DELETE", // Metode HTTP yang diizinkan
  allowedHeaders: ["Content-Type", "Authorization"], // Header yang diizinkan
};
app.use(cors(corsOptions));

app.use(express.json());

authenticateDB();
// Import routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const ForumRoutes = require("./routes/forum");
app.use("/api/forum", ForumRoutes);

const ProductRoutes = require("./routes/product");
app.use("/api/product", ProductRoutes);

const CategoryRoutes = require("./routes/category");
app.use("/api/category", CategoryRoutes);

const SuggestionRoutes = require("./routes/suggestion");
app.use("/api/suggestion", SuggestionRoutes);

const WebinarRoutes = require("./routes/webinar");
app.use("/api/webinar", WebinarRoutes);

const UserRoutes = require("./routes/user");
app.use("/api/user", UserRoutes);

// Menjalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
