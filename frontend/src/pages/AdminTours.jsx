import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const regionLabels = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
};

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTours = () => {
    setLoading(true);
    api
      .get("/tours/admin/all")
      .then((res) => setTours(res.data))
      .catch((err) => {
        toast.error("Không thể tải danh sách tour");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa tour "${title}"?`)) return;
    try {
      await api.delete(`/tours/${id}`);
      toast.success("Đã xóa tour");
      fetchTours();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Tour</h1>
        <Link
          to="/admin/tours/new"
          className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition"
        >
          + Thêm tour mới
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Tên tour
                </th>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Vùng miền
                </th>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Số ngày
                </th>
                <th className="text-left p-4 text-gray-500 font-medium">Giá</th>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Trạng thái
                </th>
                <th className="text-left p-4 text-gray-500 font-medium">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr
                  key={tour.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="p-4 font-medium text-gray-800">
                    {tour.title}
                  </td>
                  <td className="p-4 text-gray-500">
                    {regionLabels[tour.region]}
                  </td>
                  <td className="p-4 text-gray-500">
                    {tour.duration_days} ngày
                  </td>
                  <td className="p-4 text-teal-700 font-semibold">
                    {Number(tour.price_per_person).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-md ${
                        tour.status === "active"
                          ? "bg-teal-50 text-teal-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tour.status === "active" ? "Hoạt động" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link
                        to={`/admin/tours/${tour.id}/edit`}
                        className="text-teal-700 hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(tour.id, tour.title)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
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
