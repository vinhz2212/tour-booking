import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getImageUrl } from "../utils/image";

export default function Home() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/tours")
      .then((res) => setTours(res.data.slice(0, 3)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO full-width ===== */}
      <section className="relative h-[460px] flex items-center justify-center text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1528127269322-539801943592"
          alt="Vịnh Hạ Long"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/45" />

        <div className="relative z-10 px-6 text-white">
          <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-md mb-4">
            Đặt tour Việt Nam
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Khám phá Việt Nam
          </h1>
          <p className="text-gray-100 text-lg mb-8">
            Chào mừng bạn đến với hệ thống đặt tour du lịch
          </p>
          <Link
            to="/tours"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-7 py-3 rounded-lg transition"
          >
            Khám phá ngay →
          </Link>
        </div>
      </section>

      {/* ===== VÙNG MIỀN ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Chọn theo vùng miền
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <RegionCard
            to="/tours?region=north"
            title="Miền Bắc"
            desc="Hạ Long, Sapa, Hà Nội"
            img="https://images.unsplash.com/photo-1528181304800-259b08848526"
          />
          <RegionCard
            to="/tours?region=central"
            title="Miền Trung"
            desc="Hội An, Huế, Đà Nẵng"
            img="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b"
          />
          <RegionCard
            to="/tours?region=south"
            title="Miền Nam"
            desc="Phú Quốc, Nha Trang"
            img="https://images.unsplash.com/photo-1573790387438-4da905039392"
          />
        </div>
      </section>

      {/* ===== TOUR NỔI BẬT ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tour nổi bật</h2>
          <Link
            to="/tours"
            className="text-teal-700 hover:text-teal-800 font-medium text-sm"
          >
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tours.map((tour) => (
              <Link
                to={`/tours/${tour.id}`}
                key={tour.id}
                className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="overflow-hidden h-40">
                  <img
                    src={getImageUrl(tour.thumbnail)}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{tour.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {tour.destination} · {tour.duration_days} ngày
                  </p>
                  <p className="text-teal-700 font-bold mt-2">
                    {Number(tour.price_per_person).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== THÔNG TIN LIÊN HỆ ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-800">
            Công ty Cổ phần Du lịch Tour VN
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Đồng hành cùng bạn trên mọi hành trình
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Feature
            icon="📞"
            title="Hotline"
            desc="0399 163 791"
            href="tel:0399163791"
          />
          <Feature
            icon="✉️"
            title="Email"
            desc="nguyencongvinh221205@gmail.com"
            href="mailto:nguyencongvinh221205@gmail.com"
          />
          <Feature
            icon="🕒"
            title="Giờ làm việc"
            desc="8:00 - 21:00 hằng ngày"
          />
        </div>
      </section>
    </div>
  );
}

function RegionCard({ to, title, desc, img }) {
  return (
    <Link
      to={to}
      className="group relative h-40 rounded-lg overflow-hidden block border border-gray-100"
    >
      <img
        src={img}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      />
      <div className="absolute inset-0 bg-gray-900/35 flex flex-col items-start justify-end p-4 text-white">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-100">{desc}</p>
      </div>
    </Link>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center text-lg font-bold mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}
