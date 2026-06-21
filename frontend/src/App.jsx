import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TourList from "./pages/TourList";
import TourDetail from "./pages/TourDetail";
import AdminDashboard from "./pages/AdminDashboard";
import TourForm from "./pages/TourForm";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import AdminBookings from "./pages/AdminBookings";
import WeatherForecast from "./pages/WeatherForecast";
import Chatbot from "./components/Chatbot";
import Payment from "./pages/Payment";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tours" element={<TourList />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/weather" element={<WeatherForecast />} />
        <Route path="/payment/:id" element={<Payment />} />

        {/* Các route admin được bảo vệ */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tours/new"
          element={
            <AdminRoute>
              <TourForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tours/:id/edit"
          element={
            <AdminRoute>
              <TourForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />
      </Routes>
      <Chatbot />
    </>
  );
}
