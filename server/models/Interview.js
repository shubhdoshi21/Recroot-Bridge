import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Interview = sequelize.define(
  "Interview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // candidateId: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   references: {
    //     model: "candidates",
    //     key: "id",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "NO ACTION",
    // },
    // applicationId: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   references: {
    //     model: "applications",
    //     key: "id",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "NO ACTION",
    // },
    position: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.STRING,
    },
    time: {
      type: DataTypes.STRING,
    },
    duration: {
      type: DataTypes.STRING,
    },
    interviewType: {
      type: DataTypes.STRING,
    },
    interviewStatus: {
      type: DataTypes.STRING,
      // defaultValue: "Scheduled",
    },
    interviewer: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    meetingLink: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "interviews",
    timestamps: true,
    indexes: [
      {
        fields: ["candidateId"],
      },
      {
        fields: ["applicationId"],
      },
    ],
  }
);
