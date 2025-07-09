import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const CandidateExperience = sequelize.define(
  "CandidateExperience",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
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
    description: {
      type: DataTypes.TEXT,
    },
    experienceUrl: {
      type: DataTypes.STRING,
    },
    isCurrentRole: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
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
    documentUrl: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "candidate_experiences",
    timestamps: true,
    indexes: [
      {
        fields: ["candidateId"],
      },
    ],
  }
);
