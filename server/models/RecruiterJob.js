import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const RecruiterJob = sequelize.define(
  "RecruiterJob",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    recruiterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "recruiters",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
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
    assignedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    assignedBy: {
      type: DataTypes.STRING,
    },
    targetCandidates: {
      type: DataTypes.INTEGER,
      // defaultValue: 5,
    },
    candidatesReviewed: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    interviewsScheduled: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
  },
  {
    tableName: "recruiter_jobs",
    timestamps: true,
    indexes: [
      {
        fields: ["recruiterId"],
      },
      {
        fields: ["jobId"],
      },
    ],
  }
);
