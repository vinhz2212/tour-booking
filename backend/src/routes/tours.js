const router = require("express").Router();
const Tour = require("../models/Tour");
const { protect, adminOnly } = require("../middlewares/auth");
const { Op } = require("sequelize");

// GET /api/tours – Lấy danh sách tour (có filter)
router.get("/", async (req, res) => {
  try {
    const { region, min_price, max_price, duration, keyword } = req.query;
    const where = { status: "active" };

    if (region) where.region = region;
    if (duration) where.duration_days = duration;
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    if (min_price || max_price) {
      where.price_per_person = {};
      if (min_price) where.price_per_person[Op.gte] = min_price;
      if (max_price) where.price_per_person[Op.lte] = max_price;
    }

    const tours = await Tour.findAll({ where });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// GET /api/tours/admin/all – Lấy TẤT CẢ tour (cho admin, kể cả inactive)
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const tours = await Tour.findAll({ order: [["id", "DESC"]] });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// GET /api/tours/:id – Lấy chi tiết 1 tour
router.get("/:id", async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) return res.status(404).json({ message: "Không tìm thấy tour" });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// POST /api/tours – Tạo tour (chỉ admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json(tour);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// PUT /api/tours/:id – Sửa tour (chỉ admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Tour.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// DELETE /api/tours/:id – Xóa tour (chỉ admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Tour.destroy({ where: { id: req.params.id } });
    res.json({ message: "Xóa tour thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
