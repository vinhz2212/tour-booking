const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/db");
const User = require("./models/User");
const Tour = require("./models/Tour");
const Booking = require("./models/Booking");
const Review = require("./models/Review");

// Thiết lập quan hệ
User.hasMany(Booking);
Booking.belongsTo(User);

Tour.hasMany(Booking);
Booking.belongsTo(Tour);

User.hasMany(Review);
Review.belongsTo(User);

Tour.hasMany(Review);
Review.belongsTo(Tour);

const app = express();

// ── Middleware ──────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Serve ảnh upload tĩnh
app.use("/uploads", express.static("uploads"));

// ── Routes ─────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/weather", require("./routes/weather"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/users", require("./routes/users"));

// ── Khởi động ──────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true }) // tự tạo/cập nhật bảng theo model
  .then(() => {
    console.log("✅ Kết nối Database thành công!");
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ Lỗi kết nối DB:", err));
