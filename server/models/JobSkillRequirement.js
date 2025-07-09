import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const JobSkillRequirement = sequelize.define(
  "JobSkillRequirement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "jobs",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Skills",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
    minimumProficiency: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
  },
  {
    tableName: "job_skill_requirements",
    timestamps: false,
    indexes: [
      {
        fields: ["jobId"],
      },
      {
        fields: ["skillId"],
      },
    ],
  }
);
