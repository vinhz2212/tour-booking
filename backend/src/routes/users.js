const router = require("express").Router();
const User = require("../models/User");
const { protect, adminOnly } = require("../middlewares/auth");

// GET /api/users – Lấy danh sách tất cả user (chỉ admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "full_name",
        "email",
        "phone",
        "role",
        "avatar",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// DELETE /api/users/:id – Xóa user (chỉ admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res
        .status(400)
        .json({ message: "Không thể tự xóa tài khoản của chính mình" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    await user.destroy();
    res.json({ message: "Xóa tài khoản thành công" });
  } catch (err) {
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Không thể xóa: tài khoản này vẫn còn đơn đặt tour liên quan",
      });
    }
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
