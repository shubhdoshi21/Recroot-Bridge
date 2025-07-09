import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js"

export const CandidateNoteTag = sequelize.define(
  "CandidateNoteTag",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    candidateNoteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "candidate_notes",
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
    tableName: "candidate_note_tags",
    timestamps: false,
    indexes: [
      {
        fields: ["candidateNoteId"],
      },
      {
        fields: ["tag"],
      },
    ],
  }
);
