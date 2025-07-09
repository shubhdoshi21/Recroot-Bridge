import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const ApplicationAttachment = sequelize.define(
  "ApplicationAttachment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // applicationId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "applications",
    //     key: "id",
    //   },
    // },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attachmentType: {
      type: DataTypes.STRING,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "application_attachments",
    timestamps: false,
    indexes: [
      {
        fields: ["applicationId"],
      },
      {
        fields: ["attachmentType"],
      },
    ],
  }
);
