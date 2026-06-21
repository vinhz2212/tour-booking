import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

const regionLabels = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
};

export default function TourList() {
  const [searchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(searchParams.get("region") || "");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (region) params.region = region;
    if (keyword) params.keyword = keyword;

    api
      .get("/tours", { params })
      .then((res) => setTours(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [region, keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Danh sách Tour Du Lịch
        </h1>

        {/* Ô tìm kiếm */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên tour, ví dụ: Hạ Long, Phú Quốc..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            type="submit"
            className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition"
          >
            Tìm kiếm
          </button>
          {keyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              Xóa
            </button>
          )}
        </form>

        {keyword && (
          <p className="text-sm text-gray-500 mb-4">
            Kết quả tìm kiếm cho: <strong>"{keyword}"</strong>
          </p>
        )}

        {/* Filter theo vùng miền */}
        <div className="flex gap-2 mb-8">
          {["", "north", "central", "south"].map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                region === r
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
              }`}
            >
              {r === "" ? "Tất cả" : regionLabels[r]}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400">Đang tải...</p>}

        {!loading && tours.length === 0 && (
          <p className="text-gray-400">Không tìm thấy tour phù hợp.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tours.map((tour) => (
            <Link
              to={`/tours/${tour.id}`}
              key={tour.id}
              className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <img
                src={tour.thumbnail}
                alt={tour.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-1 rounded-md">
                  {regionLabels[tour.region]}
                </span>
                <h3 className="text-lg font-semibold mt-2 text-gray-800">
                  {tour.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {tour.destination} · {tour.duration_days} ngày
                </p>
                <p className="text-teal-700 font-bold text-xl mt-3">
                  {Number(tour.price_per_person).toLocaleString("vi-VN")}đ
                  <span className="text-sm text-gray-400 font-normal">
                    {" "}
                    / người
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
