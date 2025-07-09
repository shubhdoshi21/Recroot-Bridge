import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const OnboardingTemplate = sequelize.define(
  "OnboardingTemplate",
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
    description: {
      type: DataTypes.STRING,
    },
    department: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      // defaultValue: 'checklist',
    },
    itemCount: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdBy: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "onboarding_templates",
    timestamps: true,
  }
);
