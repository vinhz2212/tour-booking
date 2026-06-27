const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Mã hóa mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = await User.create({
      full_name,
      email,
      password: hashed,
      phone,
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      userId: user.id,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// POST /api/auth/avatar – Upload/đổi ảnh đại diện (user đang đăng nhập)
router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn 1 ảnh để upload" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    await User.update({ avatar: avatarUrl }, { where: { id: req.user.id } });

    res.json({
      message: "Cập nhật ảnh đại diện thành công",
      avatar: avatarUrl,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
