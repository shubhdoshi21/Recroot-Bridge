import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const NoteTag = sequelize.define(
  "NoteTag",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "notes",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "note_tags",
    timestamps: false,
    indexes: [
      {
        fields: ["noteId"],
      },
      {
        fields: ["tag"],
      },
    ],
  }
);
