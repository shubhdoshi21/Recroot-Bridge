import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const UserNotificationType = sequelize.define(
  "UserNotificationType",
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
    notificationTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "notification_types",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
  },
  {
    tableName: "user_notification_types",
    timestamps: false,
    indexes: [
      {
        fields: ["userNotificationSettingsId"],
      },
      {
        fields: ["notificationTypeId"],
      },
    ],
  }
);
