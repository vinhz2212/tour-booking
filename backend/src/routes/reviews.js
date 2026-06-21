const router = require("express").Router();
const Review = require("../models/Review");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { protect } = require("../middlewares/auth");

// GET /api/reviews/tour/:tourId - lấy tất cả đánh giá của 1 tour
router.get("/tour/:tourId", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { TourId: req.params.tourId },
      include: [{ model: User, attributes: ["full_name"] }],
      order: [["createdAt", "DESC"]],
    });

    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : 0;

    res.json({ reviews, avgRating, total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// POST /api/reviews - tạo đánh giá mới (cần đăng nhập + đã đặt tour này)
router.post("/", protect, async (req, res) => {
  try {
    const { tour_id, rating, comment } = req.body;

    const hasBooked = await Booking.findOne({
      where: { UserId: req.user.id, TourId: tour_id },
    });

    if (!hasBooked) {
      return res.status(403).json({
        message: "Bạn cần đặt tour này trước khi đánh giá",
      });
    }

    const existing = await Review.findOne({
      where: { UserId: req.user.id, TourId: tour_id },
    });

    if (existing) {
      return res.status(400).json({
        message: "Bạn đã đánh giá tour này rồi",
      });
    }

    const review = await Review.create({
      UserId: req.user.id,
      TourId: tour_id,
      rating,
      comment,
    });

    res.status(201).json({ message: "Đánh giá thành công!", review });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
