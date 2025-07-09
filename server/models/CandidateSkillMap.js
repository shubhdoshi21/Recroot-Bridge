import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const CandidateSkillMap = sequelize.define(
  "CandidateSkillMap",
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
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Skills",
        key: "id",
        onDelete: "CASCADE",
        onUpdate: "NO ACTION",
      },
    },
    proficiencyLevel: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
  },
  {
    tableName: "candidate_skill_maps",
    timestamps: false,
    indexes: [
      {
        fields: ["candidateId"],
      },
      {
        fields: ["skillId"],
      },
    ],
  }
);
