const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("Booking", {
  adults: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  children: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  departure_date: {
    type: DataTypes.DATEONLY,
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
    defaultValue: "pending",
  },
  payment_status: {
    type: DataTypes.ENUM("unpaid", "paid"),
    defaultValue: "unpaid",
  },
});

module.exports = Booking;
