import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const Report = sequelize.define(
  "Report",
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateRange: {
      type: DataTypes.STRING,
    },
    format: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Report content must be valid JSON.")
            }
          }
        },
      },
    },
    charts: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
    tables: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdBy: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "reports",
    timestamps: true,
  },
)
