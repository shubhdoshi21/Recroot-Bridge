import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const Permission = sequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true, // Unique constraint at the column level
    },
  },
  {
    tableName: "permissions",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["name"], // Unique constraint at the table level (recommended)
      },
    ],
  }
);
