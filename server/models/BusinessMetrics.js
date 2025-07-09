import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const BusinessMetrics = sequelize.define(
  "BusinessMetrics",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    metricName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentValue: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    previousValue: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    changePercentage: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    trend: {
      type: DataTypes.STRING,
    },
    period: {
      type: DataTypes.STRING,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    historicalData: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Historical data must be valid JSON.")
            }
          }
        },
      },
    },
  },
  {
    tableName: "business_metrics",
    timestamps: true,
  },
)
