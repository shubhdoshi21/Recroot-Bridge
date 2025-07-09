import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const TeamMemberSkill = sequelize.define(
  "TeamMemberSkill",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamMemberId: {
      type: DataTypes.INTEGER,
      allowNull: true, // must be nullable for ON DELETE SET NULL
      references: {
        model: "team_members",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "NO ACTION",
    },
    skill: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    proficiencyLevel: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
  },
  {
    tableName: "team_member_skills",
    timestamps: false,
    indexes: [
      {
        fields: ["teamMemberId"],
      },
      {
        fields: ["skill"],
      },
    ],
  }
);
