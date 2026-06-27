import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Camera } from "lucide-react";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import { getImageUrl } from "../utils/image";

const statusLabels = {
  pending: { text: "Chờ xác nhận", color: "bg-amber-50 text-amber-700" },
  confirmed: { text: "Đã xác nhận", color: "bg-teal-50 text-teal-700" },
  cancelled: { text: "Đã hủy", color: "bg-red-50 text-red-600" },
};

const paymentLabels = {
  unpaid: { text: "Chưa thanh toán", color: "bg-gray-100 text-gray-600" },
  paid: { text: "Đã thanh toán", color: "bg-teal-50 text-teal-700" },
};

export default function Profile() {
  const { user, updateAvatar } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get("/bookings/my")
      .then((res) => setBookings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id, tourTitle) => {
    if (!window.confirm(`Hủy đơn đặt tour "${tourTitle}"?`)) return;

    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success("Đã hủy đơn đặt tour");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Hủy đơn thất bại");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await api.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateAvatar(res.data.avatar);
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-teal-700">
                  {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition disabled:opacity-50"
              title="Đổi ảnh đại diện"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              {user?.full_name}
            </h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {uploading && (
              <p className="text-teal-600 text-xs mt-1">Đang tải ảnh lên...</p>
            )}
          </div>
        </div>

        {/* Lịch sử đặt tour */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Lịch sử đặt tour
        </h2>

        {loading && <p className="text-gray-400">Đang tải...</p>}

        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 mb-3">Bạn chưa đặt tour nào.</p>
            <Link
              to="/tours"
              className="text-teal-700 font-medium hover:underline"
            >
              Khám phá tour ngay →
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex gap-4"
            >
              <img
                src={getImageUrl(booking.Tour?.thumbnail)}
                alt={booking.Tour?.title}
                className="w-28 h-20 object-cover rounded-lg"
              />

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">
                    {booking.Tour?.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${statusLabels[booking.status]?.color}`}
                  >
                    {statusLabels[booking.status]?.text}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mt-1">
                  {booking.Tour?.destination}
                </p>

                <p className="text-gray-400 text-xs mt-1">
                  Đặt lúc: {new Date(booking.createdAt).toLocaleString("vi-VN")}
                </p>

                <div className="flex justify-between items-end mt-3">
                  <div className="text-sm text-gray-500">
                    <p>
                      Khởi hành:{" "}
                      {new Date(booking.departure_date).toLocaleDateString(
                        "vi-VN",
                      )}
                    </p>
                    <p>
                      {booking.adults} người lớn
                      {booking.children > 0 && `, ${booking.children} trẻ em`}
                    </p>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-md ${paymentLabels[booking.payment_status]?.color}`}
                    >
                      {paymentLabels[booking.payment_status]?.text}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-teal-700 font-bold text-lg">
                      {Number(booking.total_price).toLocaleString("vi-VN")}đ
                    </p>
                    <div className="flex gap-2 justify-end mt-1">
                      {booking.payment_status === "unpaid" && (
                        <Link
                          to={`/payment/${booking.id}`}
                          className="text-teal-700 hover:underline text-xs"
                        >
                          Thanh toán
                        </Link>
                      )}
                      {booking.status === "pending" && (
                        <button
                          onClick={() =>
                            handleCancel(booking.id, booking.Tour?.title)
                          }
                          className="text-red-500 hover:underline text-xs"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
