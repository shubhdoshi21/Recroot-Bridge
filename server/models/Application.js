import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // candidateId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "candidates",
    //     key: "id",
    //   },
    // },
    // jobId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "jobs",
    //     key: "id",
    //   },
    // },
    status: {
      type: DataTypes.STRING,
      // defaultValue: "Applied",
    },
    appliedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    source: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.STRING,
    },
    currentStage: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
    stageHistory: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Stage history must be valid JSON.");
            }
          }
        },
      },
    },
    scores: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Scores must be valid JSON.");
            }
          }
        },
      },
    },
    isShortlisted: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    rejectionReason: {
      type: DataTypes.STRING,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "applications",
    timestamps: true,
  }
);
