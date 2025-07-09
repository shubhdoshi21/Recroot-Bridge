import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const HiringMetrics = sequelize.define(
  "HiringMetrics",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    period: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timeToHire: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    costPerHire: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    offerAcceptanceRate: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    byRecruiter: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Recruiter metrics must be valid JSON.")
            }
          }
        },
      },
    },
    byTeam: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Team metrics must be valid JSON.")
            }
          }
        },
      },
    },
    byDepartment: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Department metrics must be valid JSON.")
            }
          }
        },
      },
    },
    byPosition: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Position metrics must be valid JSON.")
            }
          }
        },
      },
    },
    trends: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Trends data must be valid JSON.")
            }
          }
        },
      },
    },
  },
  {
    tableName: "hiring_metrics",
    timestamps: true,
  },
)
