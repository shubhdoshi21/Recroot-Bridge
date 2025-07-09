import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const InterviewFeedback = sequelize.define(
  "InterviewFeedback",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    interviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "interviews",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
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
    rating: {
      type: DataTypes.INTEGER,
    },
    strengths: {
      type: DataTypes.STRING,
    },
    weaknesses: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.STRING,
    },
    recommendHire: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    skillAssessments: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Skill assessments must be valid JSON.");
            }
          }
        },
      },
    },
    cultureFit: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Culture fit assessment must be valid JSON.");
            }
          }
        },
      },
    },
    overallScore: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "interview_feedbacks",
    timestamps: false,
    indexes: [
      {
        fields: ["interviewId"],
      },
      {
        fields: ["recruiterId"],
      },
    ],
  }
);
