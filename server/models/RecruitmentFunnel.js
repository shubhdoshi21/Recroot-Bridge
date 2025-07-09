import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const RecruitmentFunnel = sequelize.define(
  "RecruitmentFunnel",
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
    applicants: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    screened: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    interviewed: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    offered: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    accepted: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    rejected: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    byDepartment: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Department funnel data must be valid JSON.")
            }
          }
        },
      },
    },
    byJob: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Job funnel data must be valid JSON.")
            }
          }
        },
      },
    },
    bySource: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Source funnel data must be valid JSON.")
            }
          }
        },
      },
    },
    conversionRates: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value)
            } catch (e) {
              throw new Error("Conversion rates must be valid JSON.")
            }
          }
        },
      },
    },
  },
  {
    tableName: "recruitment_funnels",
    timestamps: true,
  },
)
