import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import ReviewSection from "../components/ReviewSection";

const regionLabels = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
};

export default function TourDetail() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/tours/${id}`)
      .then((res) => setTour(res.data))
      .catch(() => setError("Không tìm thấy tour"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGetWeather = () => {
    setWeatherLoading(true);
    setWeatherError(null);
    api
      .get(`/weather/${id}`)
      .then((res) => setWeather(res.data))
      .catch((err) => {
        setWeatherError(
          err.response?.data?.message || "Không thể lấy dữ liệu thời tiết",
        );
      })
      .finally(() => setWeatherLoading(false));
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-400">Đang tải...</p>;
  }

  if (error || !tour) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{error || "Không tìm thấy tour"}</p>
        <Link to="/tours" className="text-teal-700 hover:underline">
          ← Quay lại danh sách tour
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="w-full h-80 overflow-hidden">
        <img
          src={tour.thumbnail}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-md">
            {regionLabels[tour.region]}
          </span>

          <h1 className="text-3xl font-bold text-gray-800 mt-3">
            {tour.title}
          </h1>

          <p className="text-gray-500 mt-2">
            {tour.destination} · {tour.duration_days} ngày · Tối đa{" "}
            {tour.max_people} người
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Giới thiệu tour
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {tour.description}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-100 p-5 h-fit">
              <p className="text-gray-500 text-sm">Giá mỗi người</p>
              <p className="text-3xl font-bold text-teal-700">
                {Number(tour.price_per_person).toLocaleString("vi-VN")}đ
              </p>

              <Link
                to={`/booking/${tour.id}`}
                className="block text-center bg-teal-600 text-white py-3 rounded-lg mt-4 font-semibold hover:bg-teal-700 transition"
              >
                Đặt tour ngay
              </Link>
            </div>
          </div>

          {/* ===== KHU VỰC THỜI TIẾT + AI LỘ TRÌNH ===== */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Thời tiết & gợi ý lộ trình
              </h2>
              {!weather && (
                <button
                  onClick={handleGetWeather}
                  disabled={weatherLoading}
                  className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {weatherLoading ? "Đang phân tích..." : "Xem dự báo & gợi ý"}
                </button>
              )}
            </div>

            {weatherLoading && (
              <p className="text-gray-400 text-sm">
                Đang lấy dữ liệu thời tiết và AI đang soạn lộ trình cho bạn...
              </p>
            )}

            {weatherError && (
              <p className="text-red-500 text-sm">{weatherError}</p>
            )}

            {weather && (
              <div className="space-y-5">
                {/* Thẻ thời tiết từng ngày */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {weather.forecast.map((day, i) => {
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

                {/* Lộ trình gợi ý từ AI */}
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

          {/* ===== ĐÁNH GIÁ & BÌNH LUẬN ===== */}
          <ReviewSection tourId={tour.id} />
        </div>
      </div>
    </div>
  );
}
