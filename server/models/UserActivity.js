import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const UserActivity = sequelize.define(
  "UserActivity",
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
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
    },
    entityId: {
      type: DataTypes.INTEGER,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    userAgent: {
      type: DataTypes.STRING,
    },
    details: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Activity details must be valid JSON.");
            }
          }
        },
      },
    },
    status: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "user_activities",
    timestamps: false,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["entityType"],
      },
      {
        fields: ["entityId"],
      },
      {
        fields: ["timestamp"],
      },
    ],
  }
);
