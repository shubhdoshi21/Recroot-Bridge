import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const CandidateEducation = sequelize.define(
  "CandidateEducation",
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
    degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fieldOfStudy: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.STRING,
    },
    endDate: {
      type: DataTypes.STRING,
    },
    documentUrl: {
      type: DataTypes.STRING,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "documents",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "candidate_educations",
    timestamps: true,
    indexes: [
      {
        fields: ["candidateId"],
      },
    ],
  }
);
