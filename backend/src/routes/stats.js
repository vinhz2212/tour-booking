const router = require("express").Router();
const { fn, col } = require("sequelize");
const Tour = require("../models/Tour");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { protect, adminOnly } = require("../middlewares/auth");

// GET /api/stats/dashboard – Thống kê tổng quan cho Admin Dashboard
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const totalActiveTours = await Tour.count({ where: { status: "active" } });
    const totalBookings = await Booking.count();
    const totalUsers = await User.count({ where: { role: "user" } });
    const totalRevenue =
      (await Booking.sum("total_price", {
        where: { payment_status: "paid" },
      })) || 0;

    // Phân bố tour theo vùng miền
    const regionCounts = await Tour.findAll({
      attributes: ["region", [fn("COUNT", col("id")), "count"]],
      group: ["region"],
      raw: true,
    });

    // Phân bố booking theo trạng thái
    const statusCounts = await Booking.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // Top 5 tour được đặt nhiều nhất
    const topTours = await Booking.findAll({
      attributes: ["TourId", [fn("COUNT", col("Booking.id")), "bookingCount"]],
      include: [{ model: Tour, attributes: ["title"] }],
      group: ["TourId", "Tour.id", "Tour.title"],
      order: [[fn("COUNT", col("Booking.id")), "DESC"]],
      limit: 5,
    });

    // 5 đơn đặt tour mới nhất
    const recentBookings = await Booking.findAll({
      include: [
        { model: Tour, attributes: ["title"] },
        { model: User, attributes: ["full_name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json({
      totalActiveTours,
      totalBookings,
      totalUsers,
      totalRevenue,
      regionCounts,
      statusCounts,
      topTours,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
