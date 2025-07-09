import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const Recruiter = sequelize.define(
  "Recruiter",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    department: {
      type: DataTypes.STRING,
    },
    specialization: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    activeJobs: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    candidates: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    hires: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    hireRate: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    averageTimeToHire: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    CandidateSatisfactionRate: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
  },
  {
    tableName: "recruiters",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["department"],
      },
      {
        fields: ["specialization"],
      },
    ],
  }
);
