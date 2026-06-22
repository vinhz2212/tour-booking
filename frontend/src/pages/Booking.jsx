import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import { getImageUrl } from "../utils/image";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    adults: 1,
    children: 0,
    departure_date: "",
  });

  useEffect(() => {
    api
      .get(`/tours/${id}`)
      .then((res) => setTour(res.data))
      .catch(() => toast.error("Không tìm thấy tour"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const calculateTotal = () => {
    if (!tour) return 0;
    const price = Number(tour.price_per_person);
    const adults = Number(form.adults) || 0;
    const children = Number(form.children) || 0;
    return adults * price + children * price * 0.5;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.info("Vui lòng đăng nhập để đặt tour");
      navigate("/login");
      return;
    }

    const totalPeople = Number(form.adults) + Number(form.children);
    if (totalPeople > tour.max_people) {
      toast.error(`Tour này chỉ nhận tối đa ${tour.max_people} người`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        tour_id: tour.id,
        adults: form.adults,
        children: form.children,
        departure_date: form.departure_date,
      });
      toast.success("Đặt tour thành công!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đặt tour thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-400">Đang tải...</p>;
  }

  if (!tour) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">Không tìm thấy tour</p>
        <Link to="/tours" className="text-teal-700 hover:underline">
          ← Quay lại danh sách tour
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Đặt tour</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Thông tin tour + form */}
          <div className="md:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-6">
            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
              <img
                src={getImageUrl(tour.thumbnail)}
                alt={tour.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div>
                <h2 className="font-semibold text-lg text-gray-800">
                  {tour.title}
                </h2>
                <p className="text-gray-500 text-sm">
                  {tour.destination} · {tour.duration_days} ngày
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">
                  Ngày khởi hành
                </label>
                <input
                  type="date"
                  name="departure_date"
                  value={form.departure_date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Số người lớn
                  </label>
                  <input
                    type="number"
                    name="adults"
                    value={form.adults}
                    onChange={handleChange}
                    min={1}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Số trẻ em{" "}
                    <span className="text-xs text-gray-400">(giảm 50%)</span>
                  </label>
                  <input
                    type="number"
                    name="children"
                    value={form.children}
                    onChange={handleChange}
                    min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Tour này nhận tối đa {tour.max_people} người
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận đặt tour"}
              </button>
            </form>
          </div>

          {/* Box tính tiền */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 h-fit">
            <h3 className="font-semibold text-gray-800 mb-4">Chi tiết giá</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Người lớn x {form.adults || 0}
                </span>
                <span className="text-gray-700">
                  {(
                    Number(form.adults || 0) * Number(tour.price_per_person)
                  ).toLocaleString("vi-VN")}
                  đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Trẻ em x {form.children || 0}
                </span>
                <span className="text-gray-700">
                  {(
                    Number(form.children || 0) *
                    Number(tour.price_per_person) *
                    0.5
                  ).toLocaleString("vi-VN")}
                  đ
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Tổng tiền</span>
              <span className="text-2xl font-bold text-teal-700">
                {calculateTotal().toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
