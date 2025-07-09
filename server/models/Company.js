import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Company = sequelize.define(
  "Company",
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
    industry: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    website: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      // defaultValue: "active",
    },
    gstin: {
      type: DataTypes.STRING,
      field: "GSTIN",
    },
    panNumber: {
      type: DataTypes.STRING,
      field: "PAN",
    },
    taxId: {
      type: DataTypes.STRING,
      field: "taxID",
    },
    registrationNumber: {
      type: DataTypes.STRING,
    },
    addressLine1: {
      type: DataTypes.STRING,
    },
    addressLine2: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    stateProvince: {
      type: DataTypes.STRING,
    },
    postalCode: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    linkedIn: {
      type: DataTypes.STRING,
    },
    twitter: {
      type: DataTypes.STRING,
    },
    facebook: {
      type: DataTypes.STRING,
    },
    instagram: {
      type: DataTypes.STRING,
    },
    yearFounded: {
      type: DataTypes.INTEGER,
    },
    companyType: {
      type: DataTypes.STRING,
    },
    stockSymbol: {
      type: DataTypes.STRING,
    },
    parentCompany: {
      type: DataTypes.STRING,
    },
    revenue: {
      type: DataTypes.STRING,
    },
    employeeCount: {
      type: DataTypes.INTEGER,
    },
    phone: {
      type: DataTypes.STRING,
      field: "companyPhone",
    },
    email: {
      type: DataTypes.STRING,
      field: "companyEmail",
    },
    jobs: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    candidates: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    openJobs: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "companies",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name", "clientId"],
      },
    ],
  }
);
