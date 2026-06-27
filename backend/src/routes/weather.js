const router = require("express").Router();
const Tour = require("../models/Tour");

// Hàm bỏ dấu tiếng Việt để gọi OpenWeatherMap chính xác hơn
function removeVietnameseTones(str) {
  str = str.toLowerCase();
  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  str = str.replace(/[ìíịỉĩ]/g, "i");
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
  str = str.replace(/[ỳýỵỷỹ]/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/[^a-z0-9\s]/g, "");
  return str.trim();
}

// Đổi tên địa danh thành tọa độ (lat/lon) – chính xác hơn tra theo tên
async function geocodeCity(cityName) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)},VN&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: data[0].lat, lon: data[0].lon };
}

// GET /api/weather/:tourId?date=YYYY-MM-DD - lấy thời tiết + gợi ý lộ trình AI
router.get("/:tourId", async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.tourId);
    if (!tour) return res.status(404).json({ message: "Không tìm thấy tour" });

    const { date } = req.query; // ngày khởi hành do user chọn

    // Kiểm tra ngày có trong khoảng cho phép (hôm nay -> +5 ngày) không
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 5);
      const selectedDate = new Date(date);

      if (selectedDate < today || selectedDate > maxDate) {
        return res.status(400).json({
          message:
            "Chỉ hỗ trợ dự báo thời tiết trong vòng 5 ngày tới (giới hạn của gói miễn phí).",
        });
      }
    }

    const cityName = removeVietnameseTones(tour.destination.split(",")[0]);

    // 1. Đổi tên địa danh thành tọa độ
    const coords = await geocodeCity(cityName);
    if (!coords) {
      return res.status(400).json({
        message: "Không tìm thấy dữ liệu thời tiết cho địa điểm này",
        detail: `Không xác định được tọa độ cho "${cityName}"`,
      });
    }

    // 2. Gọi OpenWeatherMap lấy dự báo 5 ngày theo tọa độ (mốc 3 giờ/lần)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&lang=vi&appid=${process.env.OPENWEATHER_API_KEY}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== "200") {
      return res.status(400).json({
        message: "Không tìm thấy dữ liệu thời tiết cho địa điểm này",
        detail: weatherData.message,
      });
    }

    // Lấy mốc 12:00 trưa mỗi ngày
    let dailyForecast = weatherData.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .map((item) => ({
        date: item.dt_txt.split(" ")[0],
        datetime: item.dt_txt.replace(" ", "T"), // dùng để format đầy đủ Thứ/Ngày/Giờ ở frontend
        temp: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        rain: item.pop ? Math.round(item.pop * 100) : 0,
      }));

    if (date) {
      const startIndex = dailyForecast.findIndex((d) => d.date === date);
      if (startIndex === -1) {
        return res.status(400).json({
          message:
            "Chưa có dữ liệu dự báo cho ngày này, vui lòng thử ngày khác trong vòng 5 ngày tới.",
        });
      }
      dailyForecast = dailyForecast.slice(
        startIndex,
        startIndex + tour.duration_days,
      );
    } else {
      dailyForecast = dailyForecast.slice(0, tour.duration_days);
    }

    // 3. Gọi Google Gemini sinh gợi ý lộ trình dựa trên thời tiết
    const weatherSummary = dailyForecast
      .map(
        (d, i) =>
          `Ngày ${i + 1} (${d.date}): ${d.description}, ${d.temp}°C, khả năng mưa ${d.rain}%`,
      )
      .join("\n");

    const prompt = `Bạn là hướng dẫn viên du lịch chuyên nghiệp. Dựa trên thông tin tour và dự báo thời tiết dưới đây, hãy đưa ra gợi ý lộ trình chi tiết theo từng ngày, điều chỉnh hoạt động phù hợp với thời tiết (nếu mưa thì ưu tiên hoạt động trong nhà, nếu nắng đẹp thì ưu tiên hoạt động ngoài trời, tham quan, biển...).

Tên tour: ${tour.title}
Điểm đến: ${tour.destination}
Số ngày: ${tour.duration_days}
Mô tả: ${tour.description}

Dự báo thời tiết từng ngày:
${weatherSummary}

Trả lời ngắn gọn, chia theo "Ngày 1:", "Ngày 2:"... mỗi ngày 2-3 câu gợi ý hoạt động cụ thể, giọng văn thân thiện. Không cần lời chào hay kết luận dài dòng.`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const aiData = await aiRes.json();

    if (aiData.error) {
      return res.status(500).json({
        message: "Lỗi khi gọi AI sinh lộ trình",
        detail: aiData.error.message,
      });
    }

    const itinerary = aiData.candidates[0].content.parts[0].text;

    res.json({
      tour: { id: tour.id, title: tour.title, thumbnail: tour.thumbnail },
      city: cityName,
      forecast: dailyForecast,
      itinerary,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
