import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const TeamJob = sequelize.define(
  "TeamJob",
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
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
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
    assignedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    assignedBy: {
      type: DataTypes.STRING,
    },
    targetHires: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
    targetDate: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "team_jobs",
    timestamps: true,
    indexes: [
      {
        fields: ["teamId"],
      },
      {
        fields: ["jobId"],
      },
    ],
  }
);
