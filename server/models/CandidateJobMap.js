import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const CandidateJobMap = sequelize.define(
  "CandidateJobMap",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "candidates",
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
    // ATS Scoring fields
    atsScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    skillsMatch: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    experienceMatch: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    educationMatch: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    atsAnalysis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['candidate', 'applicant', 'rejected']],
          msg: 'Status must be one of: candidate, applicant, rejected'
        }
      }
    },
    lastScoredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    tableName: "candidate_job_maps",
    timestamps: false,
    indexes: [
      {
        fields: ["candidateId"],
      },
      {
        fields: ["jobId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["atsScore"],
      }
    ],
  }
);