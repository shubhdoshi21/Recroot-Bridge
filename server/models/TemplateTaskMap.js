import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const TemplateTaskMap = sequelize.define(
  "TemplateTaskMap",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // templateId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "onboarding_templates",
    //     key: "id",
    //   },
    // },
    // taskTemplateId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "onboarding_task_templates",
    //     key: "id",
    //   },
    // },
    sequence: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
  },
  {
    tableName: "template_task_maps",
    timestamps: false,
  }
);
