import { useEffect, useState } from "react";
import api from "../services/api";

export default function WeatherForecast() {
  const [tours, setTours] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tính ngày hôm nay và ngày tối đa (today + 5)
  const today = new Date().toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 5);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  useEffect(() => {
    api
      .get("/tours")
      .then((res) => setTours(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedTourId) {
      setError("Vui lòng chọn 1 tour");
      return;
    }
    if (!selectedDate) {
      setError("Vui lòng chọn ngày khởi hành");
      return;
    }

    setLoading(true);
    setError(null);
    setWeather(null);

    api
      .get(`/weather/${selectedTourId}`, { params: { date: selectedDate } })
      .then((res) => setWeather(res.data))
      .catch((err) => {
        setError(
          err.response?.data?.message || "Không thể lấy dữ liệu thời tiết",
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Dự báo thời tiết & Gợi ý lộ trình
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Chọn tour và ngày khởi hành để xem dự báo thời tiết và lộ trình gợi ý
          từ AI. Chỉ hỗ trợ dự báo trong vòng 5 ngày tới.
        </p>

        {/* Form chọn tour + ngày */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Chọn tour
              </label>
              <select
                value={selectedTourId}
                onChange={(e) => setSelectedTourId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Chọn tour --</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Ngày khởi hành
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                max={maxDate}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? "Đang phân tích..." : "Xem dự báo & gợi ý"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Kết quả */}
        {weather && (
          <div className="space-y-5">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <img
                src={weather.tour.thumbnail}
                alt={weather.tour.title}
                className="w-20 h-16 object-cover rounded-lg"
              />
              <h2 className="font-semibold text-gray-800">
                {weather.tour.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {weather.forecast.map((day) => {
                const d = new Date(day.datetime || day.date);
                const weekday = d.toLocaleDateString("vi-VN", {
                  weekday: "long",
                });
                const dateStr = d.toLocaleDateString("vi-VN");
                const timeStr = d.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={day.date}
                    className="bg-teal-50 rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-gray-500 capitalize">
                      {weekday}
                    </p>
                    <p className="text-xs text-gray-400">
                      {dateStr} · {timeStr}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt={day.description}
                      className="w-10 h-10 mx-auto"
                    />
                    <p className="text-lg font-bold text-gray-800">
                      {day.temp}°C
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {day.description}
                    </p>
                    <p className="text-xs text-teal-700 mt-1">
                      Mưa {day.rain}%
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-5">
              <p className="text-xs text-gray-400 mb-2">
                ✨ Gợi ý từ AI dựa trên dự báo thời tiết
              </p>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {weather.itinerary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
