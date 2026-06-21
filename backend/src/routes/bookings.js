const router = require("express").Router();
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const User = require("../models/User");
const { protect, adminOnly } = require("../middlewares/auth");

// POST /api/bookings – Tạo booking mới (cần đăng nhập)
router.post("/", protect, async (req, res) => {
  try {
    const { tour_id, adults, children, departure_date } = req.body;

    const tour = await Tour.findByPk(tour_id);
    if (!tour) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    const totalPeople = Number(adults) + Number(children || 0);
    if (totalPeople > tour.max_people) {
      return res.status(400).json({
        message: `Tour này chỉ nhận tối đa ${tour.max_people} người`,
      });
    }

    const total_price =
      Number(adults) * Number(tour.price_per_person) +
      Number(children || 0) * Number(tour.price_per_person) * 0.5;

    const booking = await Booking.create({
      UserId: req.user.id,
      TourId: tour_id,
      adults,
      children: children || 0,
      departure_date,
      total_price,
      status: "pending",
      payment_status: "unpaid",
    });

    res.status(201).json({
      message: "Đặt tour thành công!",
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// GET /api/bookings/my – Lấy danh sách booking của user đang đăng nhập
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { UserId: req.user.id },
      include: [
        { model: Tour, attributes: ["title", "thumbnail", "destination"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// PUT /api/bookings/:id/cancel – User tự hủy đơn của mình (chỉ khi đang chờ xác nhận)
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, UserId: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt tour" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn khi đang ở trạng thái chờ xác nhận",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Đã hủy đơn đặt tour thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// PUT /api/bookings/:id/pay – User xác nhận đã thanh toán (mô phỏng)
router.put("/:id/pay", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, UserId: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt tour" });
    }

    if (booking.payment_status === "paid") {
      return res
        .status(400)
        .json({ message: "Đơn này đã được thanh toán rồi" });
    }

    booking.payment_status = "paid";
    await booking.save();

    res.json({ message: "Thanh toán thành công!", booking });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// GET /api/bookings/admin/all – Lấy TẤT CẢ booking (cho admin)
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Tour, attributes: ["title", "thumbnail", "destination"] },
        { model: User, attributes: ["full_name", "email", "phone"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// PUT /api/bookings/:id/status – Cập nhật trạng thái booking (cho admin)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;

    await Booking.update(updateData, { where: { id: req.params.id } });
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// DELETE /api/bookings/:id – Xóa đơn đặt tour (chỉ admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Booking.destroy({ where: { id: req.params.id } });
    res.json({ message: "Xóa đơn đặt tour thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
