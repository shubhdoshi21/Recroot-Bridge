import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const DocumentShare = sequelize.define(
  "DocumentShare",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sharedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sharedWith: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["view", "comment", "edit"]],
      },
      // defaultValue: "view",
    },
    shareType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["user", "team", "link"]],
      },
      // defaultValue: "user",
    },
    shareLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      // defaultValue: true,
    },
  },
  {
    tableName: "document_shares",
    timestamps: true,
    createdAt: "sharedAt",
    updatedAt: "updatedAt",
  }
);
