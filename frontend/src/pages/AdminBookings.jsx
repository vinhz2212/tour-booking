import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import { getImageUrl } from "../utils/image";

const statusOptions = ["pending", "confirmed", "cancelled"];
const statusLabels = {
  pending: { text: "Chờ xác nhận", color: "bg-amber-50 text-amber-700" },
  confirmed: { text: "Đã xác nhận", color: "bg-teal-50 text-teal-700" },
  cancelled: { text: "Đã hủy", color: "bg-red-50 text-red-600" },
};

const paymentOptions = ["unpaid", "paid"];
const paymentLabels = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

export default function AdminBookings() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get("/bookings/admin/all")
      .then((res) => setBookings(res.data))
      .catch(() => toast.error("Không thể tải danh sách đơn đặt tour"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdate = async (id, field, value) => {
    try {
      await api.put(`/bookings/${id}/status`, { [field]: value });
      toast.success("Cập nhật thành công!");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleDelete = async (id, tourTitle) => {
    if (!window.confirm(`Xóa đơn đặt tour "${tourTitle}"?`)) return;

    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Đã xóa đơn đặt tour");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý đơn đặt tour
      </h1>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-400">Chưa có đơn đặt tour nào.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-4">
                  <img
                    src={getImageUrl(b.Tour?.thumbnail)}
                    alt={b.Tour?.title}
                    className="w-24 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {b.Tour?.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {b.Tour?.destination}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {b.User?.full_name} · {b.User?.email}
                      {b.User?.phone && ` · ${b.User.phone}`}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Đặt lúc: {new Date(b.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-teal-700 font-bold text-xl">
                    {Number(b.total_price).toLocaleString("vi-VN")}đ
                  </p>
                  <button
                    onClick={() => handleDelete(b.id, b.Tour?.title)}
                    className="text-red-500 hover:underline text-xs mt-1"
                  >
                    Xóa đơn
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 items-center border-t border-gray-100 pt-3 text-sm">
                <p className="text-gray-500">
                  Khởi hành:{" "}
                  {new Date(b.departure_date).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-gray-500">
                  {b.adults} người lớn
                  {b.children > 0 && `, ${b.children} trẻ em`}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Trạng thái:</span>
                  <select
                    value={b.status}
                    onChange={(e) =>
                      handleUpdate(b.id, "status", e.target.value)
                    }
                    className={`text-xs px-2 py-1 rounded-md border-none outline-none ${statusLabels[b.status]?.color}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s].text}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Thanh toán:</span>
                  <select
                    value={b.payment_status}
                    onChange={(e) =>
                      handleUpdate(b.id, "payment_status", e.target.value)
                    }
                    className="text-xs px-2 py-1 rounded-md border border-gray-200 outline-none bg-gray-50"
                  >
                    {paymentOptions.map((p) => (
                      <option key={p} value={p}>
                        {paymentLabels[p]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
