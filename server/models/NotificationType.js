import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const NotificationType = sequelize.define(
  "NotificationType",
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
    category: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
  },
  {
    tableName: "notification_types",
    timestamps: false,
    indexes: [
      {
        fields: ["name"],
      },
      {
        fields: ["category"],
      },
    ],
  }
);
