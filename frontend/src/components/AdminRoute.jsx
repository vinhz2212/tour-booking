import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function AdminRoute({ children }) {
  const { user } = useAuthStore();

  // Chưa đăng nhập → chuyển về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng không phải admin → chuyển về trang chủ
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Là admin → cho phép xem trang
  return children;
}
