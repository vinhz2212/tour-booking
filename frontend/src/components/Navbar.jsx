import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-gray-800">
        🗺️ <span className="text-teal-700">Tour</span>VN
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/" className="text-gray-600 hover:text-teal-700 transition">
          Trang chủ
        </Link>
        <Link
          to="/tours"
          className="text-gray-600 hover:text-teal-700 transition"
        >
          Tours
        </Link>
        <Link
          to="/weather"
          className="text-gray-600 hover:text-teal-700 transition"
        >
          Dự báo thời tiết
        </Link>

        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="text-gray-600 hover:text-teal-700 transition font-medium"
          >
            Admin
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
            <Link
              to="/profile"
              className="text-gray-700 hover:text-teal-700 transition"
            >
              <strong>{user.full_name}</strong>
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <Link
              to="/login"
              className="text-gray-600 hover:text-teal-700 transition"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
