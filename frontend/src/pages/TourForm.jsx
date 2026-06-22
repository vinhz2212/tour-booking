import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  destination: "",
  region: "north",
  duration_days: 1,
  price_per_person: 0,
  max_people: 10,
  thumbnail: "",
  status: "active",
};

export default function TourForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    api
      .get(`/tours/${id}`)
      .then((res) => setForm(res.data))
      .catch(() => toast.error("Không tải được dữ liệu tour"))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Xử lý khi chọn file ảnh
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await api.post("/tours/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Lưu đường dẫn ảnh (backend trả về dạng /uploads/xxx.jpg)
      setForm({ ...form, thumbnail: res.data.url });
      toast.success("Tải ảnh lên thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/tours/${id}`, form);
        toast.success("Cập nhật tour thành công!");
      } else {
        await api.post("/tours", form);
        toast.success("Tạo tour thành công!");
      }
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-center mt-10 text-gray-400">Đang tải...</p>;
  }

  // Tính đường dẫn ảnh đầy đủ để preview (ảnh upload là đường dẫn tương đối /uploads/...)
  const previewSrc = form.thumbnail
    ? form.thumbnail.startsWith("http")
      ? form.thumbnail
      : `${import.meta.env.VITE_API_URL.replace("/api", "")}${form.thumbnail}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          {isEdit ? "Sửa tour" : "Thêm tour mới"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Tên tour</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Điểm đến
              </label>
              <input
                type="text"
                name="destination"
                value={form.destination || ""}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Vùng miền
              </label>
              <select
                name="region"
                value={form.region}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="north">Miền Bắc</option>
                <option value="central">Miền Trung</option>
                <option value="south">Miền Nam</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Số ngày
              </label>
              <input
                type="number"
                name="duration_days"
                value={form.duration_days}
                onChange={handleChange}
                min={1}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Giá / người
              </label>
              <input
                type="number"
                name="price_per_person"
                value={form.price_per_person}
                onChange={handleChange}
                min={0}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Số người tối đa
              </label>
              <input
                type="number"
                name="max_people"
                value={form.max_people}
                onChange={handleChange}
                min={1}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Upload ảnh thay cho dán link */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Ảnh đại diện tour
            </label>

            {previewSrc && (
              <img
                src={previewSrc}
                alt="Xem trước"
                className="w-48 h-32 object-cover rounded-lg mb-3 border border-gray-200"
              />
            )}

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={uploading}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {uploading && (
              <p className="text-teal-600 text-sm mt-1">Đang tải ảnh lên...</p>
            )}
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo tour"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
