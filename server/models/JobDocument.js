import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const JobDocument = sequelize.define(
  "JobDocument",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    category: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "job_documents",
    timestamps: false,
    indexes: [
      {
        fields: ["jobId"],
      },
      {
        fields: ["documentId"],
      },
    ],
  }
);
