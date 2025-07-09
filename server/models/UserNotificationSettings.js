import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const UserNotificationSettings = sequelize.define(
  "UserNotificationSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    frequency: {
      type: DataTypes.STRING,
    },
    quietHoursStart: {
      type: DataTypes.TIME,
    },
    quietHoursEnd: {
      type: DataTypes.TIME,
    },
    quietHoursEnabled: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_notification_settings",
    timestamps: false,
    indexes: [
      {
        fields: ["userId"],
      },
    ],
  }
);
