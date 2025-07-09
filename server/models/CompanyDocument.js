import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const CompanyDocument = sequelize.define(
  "CompanyDocument",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "companies",
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
    addedBy: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "company_documents",
    timestamps: false,
    indexes: [
      {
        fields: ["companyId"],
      },
      {
        fields: ["documentId"],
      },
    ],
  }
);
