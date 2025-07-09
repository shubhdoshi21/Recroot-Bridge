import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const OnboardingTask = sequelize.define(
  "OnboardingTask",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    newHireId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "new_hires",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      references: {
        model: "team_members",
        key: "id",
      },
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      // defaultValue: "Pending",
    },
    priority: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
    category: {
      type: DataTypes.STRING,
    },
    completedDate: {
      type: DataTypes.DATE,
    },
    completedBy: {
      type: DataTypes.STRING,
    },
    taskTemplateId: {
      type: DataTypes.INTEGER,
      references: {
        model: "onboarding_task_templates",
        key: "id",
      },
    },
  },
  {
    tableName: "onboarding_tasks",
    timestamps: true,
    indexes: [
      {
        fields: ["newHireId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["priority"],
      },
      {
        fields: ["dueDate"],
      },
    ],
  }
);
