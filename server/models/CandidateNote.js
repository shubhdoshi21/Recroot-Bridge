import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const CandidateNote = sequelize.define(
  "CandidateNote",
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
    date: {
      type: DataTypes.STRING,
    },
    author: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    interviewId: {
      type: DataTypes.INTEGER,
      allowNull: true, // must be NOT NULL for CASCADE
      references: {
        model: "interviews",
        key: "id",
      },
      onDelete: "NO ACTION", // Use NO ACTION to prevent deletion of notes when interview is deleted
      onUpdate: "NO ACTION",
    },
  },
  {
    tableName: "candidate_notes",
    timestamps: true,
    indexes: [
      {
        fields: ["candidateId"],
      },
      {
        fields: ["interviewId"],
      },
    ],
  }
);
