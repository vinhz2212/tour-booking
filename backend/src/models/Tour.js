const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Tour = sequelize.define("Tour", {
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  destination: {
    type: DataTypes.STRING(100),
  },
  region: {
    type: DataTypes.ENUM("north", "central", "south"),
  },
  duration_days: {
    type: DataTypes.INTEGER,
  },
  price_per_person: {
    type: DataTypes.DECIMAL(12, 2),
  },
  max_people: {
    type: DataTypes.INTEGER,
  },
  thumbnail: {
    type: DataTypes.STRING(255),
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
});

module.exports = Tour;
