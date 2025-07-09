import { DataTypes, Op } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const TeamMember = sequelize.define(
  "TeamMember",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "teams",
        key: "id",
      },
    },
    recruiterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "recruiters",
        key: "id",
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            "Team Lead",
            "Member",
            "Senior Recruiter",
            "Recruiter",
            "Junior Recruiter",
            "Recruitment Coordinator",
            "Sourcing Specialist",
            "Talent Researcher",
            "Intern",
          ],
        ],
      },
    },
    joinDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    hires: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    timeToHire: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    offerAcceptanceRate: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
  },
  {
    tableName: "team_members",
    timestamps: true,
    indexes: [
      {
        fields: ["teamId"],
      },
      {
        fields: ["recruiterId"],
      },
      {
        fields: ["teamId", "recruiterId"],
        unique: true,
        name: "unique_team_member",
      },
      {
        fields: ["teamId", "role"],
        name: "idx_team_role",
      },
    ],
    hooks: {
      beforeValidate: async (instance) => {
        // Removed the duplicate team lead check from the hook.
        // This logic is now handled transactionally in the repository functions
        // (createTeamRepo and updateTeamLeadRepo) to avoid issues with
        // instance data availability during bulk updates with transactions.
      },
    },
  }
);
