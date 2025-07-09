import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Candidate = sequelize.define(
  "Candidate",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true, // Add this
      validate: {
        isEmail: true,
      },
    },
    position: {
      type: DataTypes.STRING,
    },
    // status: {
    //   type: DataTypes.STRING,
    //   // defaultValue: "Active",
    // },
    phone: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    resumeUrl: {
      type: DataTypes.STRING,
    },
    dateAdded: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    source: {
      type: DataTypes.STRING,
    },
    linkedInProfile: {
      type: DataTypes.STRING,
    },
    githubProfile: {
      type: DataTypes.STRING,
    },
    twitterProfile: {
      type: DataTypes.STRING,
    },
    portfolioUrl: {
      type: DataTypes.STRING,
    },
    currentCompany: {
      type: DataTypes.STRING,
    },
    noticePeriod: {
      type: DataTypes.STRING,
    },
    expectedSalary: {
      type: DataTypes.FLOAT,
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "candidates",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email", "clientId"], // Unique per client
      },
    ],
  }
);
