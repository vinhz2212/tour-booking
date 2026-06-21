const jwt = require("jsonwebtoken");

// Kiểm tra đã đăng nhập chưa
const protect = (req, res, next) => {
  // Lấy token từ header: "Authorization: Bearer <token>"
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // lưu thông tin user vào request
    next(); // tiếp tục xử lý
  } catch {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// Kiểm tra có phải admin không
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
  }
  next();
};

module.exports = { protect, adminOnly };
