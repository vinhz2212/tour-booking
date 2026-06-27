import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";

const regionLabels = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
};

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

const REGION_COLORS = ["#f97362", "#14b8a6", "#a78bfa"];
const STATUS_COLORS = ["#facc15", "#22c55e", "#ef4444"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stats/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => {
        toast.error("Không thể tải dữ liệu thống kê");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Đang tải...</p>;
  if (!stats) return <p className="text-red-500">Không có dữ liệu</p>;

  const regionData = stats.regionCounts.map((r) => ({
    name: regionLabels[r.region] || r.region,
    value: Number(r.count),
  }));

  const statusData = stats.statusCounts.map((s) => ({
    name: statusLabels[s.status] || s.status,
    value: Number(s.count),
  }));

  return (
    <div className="space-y-6">
      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng số tours đang hoạt động"
          value={stats.totalActiveTours}
        />
        <StatCard label="Tổng số lượt booking" value={stats.totalBookings} />
        <StatCard label="Số người dùng đăng ký" value={stats.totalUsers} />
        <StatCard
          label="Tổng doanh thu"
          value={`${Number(stats.totalRevenue).toLocaleString("vi-VN")}đ`}
          highlight
        />
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Điểm đến">
          <DonutWithTable data={regionData} colors={REGION_COLORS} />
        </ChartCard>
        <ChartCard title="Trạng thái Booking">
          <DonutWithTable data={statusData} colors={STATUS_COLORS} />
        </ChartCard>
      </div>

      {/* Bảng dữ liệu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tours được đặt nhiều nhất">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2">Tên tour</th>
                <th className="py-2">Số lượt đặt</th>
              </tr>
            </thead>
            <tbody>
              {stats.topTours.map((t) => (
                <tr key={t.TourId} className="border-b border-gray-50">
                  <td className="py-2">{t.Tour?.title}</td>
                  <td className="py-2">{t.bookingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>

        <ChartCard title="Đơn đặt mới">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2">Khách hàng</th>
                <th className="py-2">Tour</th>
                <th className="py-2">Tổng tiền</th>
                <th className="py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50">
                  <td className="py-2">{b.User?.full_name}</td>
                  <td className="py-2">{b.Tour?.title}</td>
                  <td className="py-2">
                    {Number(b.total_price).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="py-2">{statusLabels[b.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p
        className={`text-2xl font-bold ${highlight ? "text-orange-500" : "text-teal-600"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <h3 className="text-gray-700 font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function DonutWithTable({ data, colors }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <table className="flex-1 text-sm w-full">
        <tbody>
          {data.map((d, i) => (
            <tr key={d.name}>
              <td className="py-1">
                <span
                  className="inline-block w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                {d.name}
              </td>
              <td className="py-1 text-right font-medium">
                {total ? Math.round((d.value / total) * 100) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
