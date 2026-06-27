import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPinned,
  CalendarCheck,
  Users,
  Menu,
  LogOut,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { getImageUrl } from "../utils/image";

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tours", label: "Quản lý Tours", icon: MapPinned },
  { to: "/admin/bookings", label: "Quản lý Booking", icon: CalendarCheck },
  { to: "/admin/users", label: "Quản lý tài khoản", icon: Users },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof logout === "function") logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-[#1a2236] text-gray-300 flex flex-col transition-all duration-200`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">
            A
          </div>
          {!collapsed && (
            <span className="text-white font-semibold text-lg">Admin</span>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400">Xin chào,</p>
              <p className="text-sm font-medium text-white">
                {user?.full_name || "Admin"}
              </p>
            </div>
          </div>
        )}

        <nav className="flex-1 py-4">
          {!collapsed && (
            <p className="px-5 text-xs text-gray-500 font-semibold mb-2">
              TỔNG QUAN
            </p>
          )}
          {menuItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "hover:bg-white/5 text-gray-300"
                }`
              }
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-4 text-sm text-gray-400 hover:bg-white/5 border-t border-white/10"
        >
          <LogOut size={18} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </aside>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm text-gray-500">
            {user?.full_name || "admin"}
          </span>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
