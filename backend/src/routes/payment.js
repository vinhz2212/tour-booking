const router = require("express").Router();
const { VNPay, ProductCode, VnpLocale } = require("vnpay");
const Booking = require("../models/Booking");
const { protect } = require("../middlewares/auth");

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE,
  secureSecret: process.env.VNP_HASH_SECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  enableLog: true,
});

// POST /api/payment/create-url – Tạo URL thanh toán VNPay cho 1 booking
router.post("/create-url", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId, UserId: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt tour" });
    }

    if (booking.payment_status === "paid") {
      return res
        .status(400)
        .json({ message: "Đơn này đã được thanh toán rồi" });
    }

    // Mã giao dịch phải là duy nhất – ghép id booking + thời gian
    const txnRef = `${booking.id}-${Date.now()}`;
    const ipAddr = req.ip === "::1" ? "127.0.0.1" : req.ip;

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: Math.round(Number(booking.total_price)),
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don dat tour so ${booking.id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
    });

    res.json({ paymentUrl });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// GET /api/payment/vnpay-return – Xác thực kết quả trả về từ VNPay
router.get("/vnpay-return", async (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query);

    if (!verify.isSuccess) {
      return res.json({
        success: false,
        message: verify.message || "Xác thực giao dịch thất bại",
      });
    }

    const txnRef = req.query.vnp_TxnRef;
    const bookingId = txnRef?.split("-")[0];

    await Booking.update(
      { payment_status: "paid" },
      { where: { id: bookingId } },
    );

    res.json({
      success: true,
      message: "Thanh toán thành công",
      bookingId: Number(bookingId),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
