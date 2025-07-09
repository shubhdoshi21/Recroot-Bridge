import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const OnboardingTaskTemplate = sequelize.define(
  "OnboardingTaskTemplate",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "onboarding_task_templates",
    timestamps: true,
  },
)
