import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const NotificationChannel = sequelize.define(
  "NotificationChannel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
  },
  {
    tableName: "notification_channels",
    timestamps: false,
  }
);
