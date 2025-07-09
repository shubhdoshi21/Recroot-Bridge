import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const CompanyContact = sequelize.define(
  "CompanyContact",
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
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPosition: {
      type: DataTypes.STRING,
    },
    contactPhone: {
      type: DataTypes.STRING,
    },
    contactEmail: {
      type: DataTypes.STRING,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
  },
  {
    tableName: "company_contacts",
    timestamps: true,
    indexes: [
      {
        fields: ["companyId"],
      },
      {
        unique: true,
        fields: ["companyId", "isPrimary"],
      }
    ],
  }
);
