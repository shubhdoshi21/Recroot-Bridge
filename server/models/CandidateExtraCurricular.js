import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const CandidateExtraCurricular = sequelize.define(
  "CandidateExtraCurricular",
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
    organization: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: "candidate_extra_curriculars",
    timestamps: true,
    indexes: [
      {
        fields: ["candidateId"],
      },
    ],
  }
);
