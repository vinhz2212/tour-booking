import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { getImageUrl } from "../utils/image";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        toast.error("Không thể tải danh sách tài khoản");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa tài khoản "${name}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success("Đã xóa tài khoản");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý tài khoản
      </h1>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Tài khoản
                </th>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Email
                </th>
                <th className="text-left p-4 text-gray-500 font-medium">SĐT</th>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Vai trò
                </th>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {u.avatar ? (
                          <img
                            src={getImageUrl(u.avatar)}
                            alt={u.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-teal-700 font-semibold text-xs">
                            {u.full_name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">
                        {u.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4 text-gray-500">{u.phone || "—"}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-md ${
                        u.role === "admin"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleDelete(u.id, u.full_name)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
