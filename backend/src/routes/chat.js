const router = require("express").Router();
const Tour = require("../models/Tour");

// POST /api/chat - gửi tin nhắn, nhận phản hồi từ AI
router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập câu hỏi" });
    }

    // Lấy danh sách tour hiện có để AI tư vấn chính xác
    const tours = await Tour.findAll({
      where: { status: "active" },
      attributes: [
        "title",
        "destination",
        "region",
        "duration_days",
        "price_per_person",
      ],
    });

    const tourList = tours
      .map(
        (t) =>
          `- ${t.title} (${t.destination}, ${t.duration_days} ngày, ${Number(t.price_per_person).toLocaleString("vi-VN")}đ/người)`,
      )
      .join("\n");

    const systemContext = `Bạn là trợ lý tư vấn du lịch thân thiện của website TourVN (Công ty Cổ phần Du lịch Tour VN). Nhiệm vụ của bạn là tư vấn cho khách về du lịch Việt Nam và các tour hiện có trên website.

Danh sách tour hiện có:
${tourList}

Quy tắc trả lời:
- Trả lời ngắn gọn, thân thiện, dùng tiếng Việt
- Nếu khách hỏi về tour cụ thể, ưu tiên gợi ý từ danh sách trên
- Nếu khách hỏi điều ngoài phạm vi du lịch, lịch sự hướng họ quay lại chủ đề du lịch
- Không bịa thông tin giá/lịch trình ngoài danh sách đã cho`;

    // Xây dựng lịch sử hội thoại cho Gemini (định dạng contents)
    const contents = [];

    if (Array.isArray(history)) {
      history.slice(-10).forEach((h) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      });
    }

    contents.push({ role: "user", parts: [{ text: message }] });

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemContext }] },
          contents,
        }),
      },
    );

    const aiData = await aiRes.json();

    if (aiData.error) {
      return res.status(500).json({
        message: "Lỗi khi gọi AI",
        detail: aiData.error.message,
      });
    }

    const reply = aiData.candidates[0].content.parts[0].text;

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
