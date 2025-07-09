import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const CandidateDocument = sequelize.define(
  "CandidateDocument",
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
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "documents",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    addedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    documentType: {
      type: DataTypes.STRING,
    },
    isConfidential: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    notes: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "candidate_documents",
    timestamps: false,
    indexes: [
      {
        fields: ["candidateId"],
      },
      {
        fields: ["documentId"],
      },
    ],
  }
);
