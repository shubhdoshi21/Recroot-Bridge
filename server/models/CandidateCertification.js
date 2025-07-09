import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const CandidateCertification = sequelize.define(
  "CandidateCertification",
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
    certificationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issuingOrganization: {
      type: DataTypes.STRING,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "documents",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    documentUrl: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "candidate_certifications",
    timestamps: true,
    indexes: [
      {
        fields: ["candidateId"],
      },
      {
        fields: ["id", "candidateId"], // Composite index for faster lookups
      },
      {
        fields: ["documentId"], // Index for document lookups
      },
    ],
  }
);
