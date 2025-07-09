import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const DocumentTag = sequelize.define(
  "DocumentTag",
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
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      // defaultValue: "#6B7280",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      // defaultValue: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "document_tags",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name"], // Unique constraint at the table level (recommended)
      },
    ],
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);
