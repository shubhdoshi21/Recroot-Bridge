import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const Skills = sequelize.define(
  "Skills",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
  },
  {
    tableName: "Skills",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["title"], // Unique constraint at the table level (recommended)
      },
    ],
  }
);
