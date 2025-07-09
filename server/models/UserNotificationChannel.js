import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const UserNotificationChannel = sequelize.define(
  "UserNotificationChannel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userNotificationSettingsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user_notification_settings",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    notificationChannelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "notification_channels",
        key: "id",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
      },
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
  },
  {
    tableName: "user_notification_channels",
    timestamps: false,
    indexes: [
      {
        fields: ["userNotificationSettingsId"],
      },
      {
        fields: ["notificationChannelId"],
      },
    ],
  }
);
