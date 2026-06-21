import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const methods = [
  {
    id: "vnpay",
    name: "VNPay",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "momo",
    name: "MoMo",
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    id: "bank",
    name: "Chuyển khoản ngân hàng",
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
];

export default function Payment() {
  const { id } = useParams(); // id của booking
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("vnpay");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState("select"); // select -> processing -> success

  useEffect(() => {
    api
      .get("/bookings/my")
      .then((res) => {
        const found = res.data.find((b) => b.id === Number(id));
        setBooking(found || null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    setProcessing(true);
    setStep("processing");

    // Mô phỏng thời gian xử lý thanh toán (giả lập gọi cổng thanh toán)
    setTimeout(async () => {
      try {
        await api.put(`/bookings/${id}/pay`);
        setStep("success");
        toast.success("Thanh toán thành công!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Thanh toán thất bại");
        setStep("select");
      } finally {
        setProcessing(false);
      }
    }, 1800);
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-400">Đang tải...</p>;
  }

  if (!booking) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">Không tìm thấy đơn đặt tour</p>
        <Link to="/profile" className="text-teal-700 hover:underline">
          ← Quay lại trang cá nhân
        </Link>
      </div>
    );
  }

  if (booking.payment_status === "paid") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center max-w-md">
          <p className="text-teal-600 text-5xl mb-4">✓</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Đơn này đã được thanh toán
          </h2>
          <Link to="/profile" className="text-teal-700 hover:underline">
            Xem lịch sử đặt tour →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Thanh toán đơn đặt tour
        </h1>

        {/* Thông tin đơn */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mb-6 flex items-center gap-4">
          <img
            src={booking.Tour?.thumbnail}
            alt={booking.Tour?.title}
            className="w-24 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              {booking.Tour?.title}
            </h3>
            <p className="text-gray-500 text-sm">
              {booking.adults} người lớn
              {booking.children > 0 && `, ${booking.children} trẻ em`}
            </p>
          </div>
          <p className="text-teal-700 font-bold text-xl">
            {Number(booking.total_price).toLocaleString("vi-VN")}đ
          </p>
        </div>

        {/* Bước chọn phương thức */}
        {step === "select" && (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
            <p className="text-gray-700 font-medium mb-4">
              Chọn phương thức thanh toán
            </p>

            <div className="space-y-3 mb-6">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition ${
                    method === m.id
                      ? `border-teal-500 ${m.color}`
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="accent-teal-600"
                  />
                  <span className="font-medium">{m.name}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handlePay}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Thanh toán {Number(booking.total_price).toLocaleString("vi-VN")}đ
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              * Đây là môi trường demo, không phát sinh giao dịch tiền thật.
            </p>
          </div>
        )}

        {/* Bước đang xử lý */}
        {step === "processing" && (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">
              Đang xử lý thanh toán qua{" "}
              {methods.find((m) => m.id === method)?.name}...
            </p>
          </div>
        )}

        {/* Bước thành công */}
        {step === "success" && (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-teal-600 text-5xl mb-4">✓</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Cảm ơn bạn đã thanh toán đơn đặt tour.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition"
            >
              Xem lịch sử đặt tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
