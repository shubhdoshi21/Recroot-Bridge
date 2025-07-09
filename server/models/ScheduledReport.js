import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const ScheduledReport = sequelize.define(
  "ScheduledReport",
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
    schedule: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    day: {
      type: DataTypes.STRING,
    },
    time: {
      type: DataTypes.STRING,
    },
    format: {
      type: DataTypes.STRING,
    },
    reportType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
    lastRun: {
      type: DataTypes.DATE,
    },
    recipients: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Recipients list must be valid JSON.");
            }
          }
        },
      },
    },
    parameters: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Report parameters must be valid JSON.");
            }
          }
        },
      },
    },
    reportId: {
      type: DataTypes.INTEGER,
      references: {
        model: "reports",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
  },
  {
    tableName: "scheduled_reports",
    timestamps: true,
    indexes: [
      {
        fields: ["reportId"],
      },
    ]
  }
);
