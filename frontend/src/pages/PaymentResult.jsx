import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

export default function PaymentResult() {
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking -> success -> failed
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/payment/vnpay-return${location.search}`)
      .then((res) => {
        if (res.data.success) {
          setStatus("success");
        } else {
          setStatus("failed");
          setMessage(res.data.message || "Giao dịch không thành công");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Có lỗi xảy ra khi xác thực giao dịch");
      });
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
        {status === "checking" && (
          <>
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang xác thực giao dịch...</p>
          </>
        )}

        {status === "success" && (
          <>
            <p className="text-teal-600 text-5xl mb-4">✓</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Đơn đặt tour của bạn đã được thanh toán qua VNPay.
            </p>
            <Link
              to="/profile"
              className="inline-block bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition"
            >
              Xem lịch sử đặt tour
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <p className="text-red-500 text-5xl mb-4">✕</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Thanh toán không thành công
            </h2>
            <p className="text-gray-500 text-sm mb-5">{message}</p>
            <Link
              to="/profile"
              className="inline-block bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition"
            >
              Quay lại trang cá nhân
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
