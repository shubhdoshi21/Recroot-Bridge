import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const Note = sequelize.define(
  "Note",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      // defaultValue: "",
    },
  },
  {
    tableName: "notes",
    timestamps: true,
    indexes: [
      {
        fields: ["companyId"],
      },
      {
        fields: ["author"],
      },
      {
        fields: ["category"],
      },
    ],
  }
);
