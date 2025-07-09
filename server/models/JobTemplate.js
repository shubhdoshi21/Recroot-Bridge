import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const JobTemplate = sequelize.define(
  "JobTemplate",
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
    title: {
      type: DataTypes.STRING,
    },
    department: {
      type: DataTypes.STRING,
    },
    jobType: {
      type: DataTypes.STRING,
    },
    openings: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
    salaryMin: {
      type: DataTypes.FLOAT,
    },
    salaryMax: {
      type: DataTypes.FLOAT,
    },
    requiredSkills: {
      type: DataTypes.STRING,
    },
    experienceLevel: {
      type: DataTypes.STRING,
    },
    jobDescription: {
      type: DataTypes.STRING,
    },
    requirements: {
      type: DataTypes.TEXT,
    },
    responsibilities: {
      type: DataTypes.STRING,
    },
    benefits: {
      type: DataTypes.STRING,
    },
    workType: {
      type: DataTypes.STRING,
    },
    isUserCreated: {
      type: DataTypes.BOOLEAN,
      // defaultValue: true,
    },
  },
  {
    tableName: "job_templates",
    timestamps: true,
  }
);
