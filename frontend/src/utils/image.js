const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

// Chuyển đường dẫn ảnh (có thể là link đầy đủ hoặc đường dẫn upload) thành URL hiển thị được
export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path; // ảnh link cũ (Unsplash...)
  return `${API_BASE}${path}`; // ảnh upload mới (/uploads/xxx.jpg)
}
