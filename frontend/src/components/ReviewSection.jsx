import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import useAuthStore from "../store/authStore";

export default function ReviewSection({ tourId }) {
  const { user } = useAuthStore();
  const [data, setData] = useState({ reviews: [], avgRating: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = () => {
    setLoading(true);
    api
      .get(`/reviews/tour/${tourId}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [tourId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.info("Vui lòng đăng nhập để đánh giá");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/reviews", { tour_id: tourId, rating, comment });
      toast.success("Cảm ơn bạn đã đánh giá!");
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm hiển thị sao (dùng để vẽ sao trung bình và sao trong từng review)
  const renderStars = (value, interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={interactive ? () => setRating(star) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        className={`text-lg ${interactive ? "cursor-pointer" : ""} ${
          star <= (interactive ? hoverRating || rating : value)
            ? "text-amber-400"
            : "text-gray-200"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Đánh giá từ khách hàng
        </h2>
        {data.total > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex">
              {renderStars(Math.round(data.avgRating))}
            </span>
            <span className="text-gray-600 text-sm">
              {data.avgRating} ({data.total} đánh giá)
            </span>
          </div>
        )}
      </div>

      {/* Form gửi đánh giá */}
      {user ? (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-6"
        >
          <p className="text-sm text-gray-600 mb-2">Đánh giá của bạn:</p>
          <div className="flex gap-1 mb-3">{renderStars(rating, true)}</div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về tour này..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      ) : (
        <p className="text-gray-400 text-sm mb-6">
          Vui lòng đăng nhập để gửi đánh giá.
        </p>
      )}

      {/* Danh sách đánh giá */}
      {loading ? (
        <p className="text-gray-400 text-sm">Đang tải đánh giá...</p>
      ) : data.reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">
          Chưa có đánh giá nào cho tour này.
        </p>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">
                  {r.User?.full_name}
                </span>
                <span className="flex">{renderStars(r.rating)}</span>
              </div>
              {r.comment && (
                <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                {new Date(r.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
