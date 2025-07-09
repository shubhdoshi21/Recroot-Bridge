import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    },
    subject: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sentDate: {
      type: DataTypes.DATE,
      // defaultValue: DataTypes.NOW,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    isStarred: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      // defaultValue: false,
    },
    emailTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "email_templates",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "NO ACTION",
    },
  },
  {
    tableName: "messages",
    timestamps: true,
    indexes: [
      {
        fields: ["senderId"],
      },
      {
        fields: ["recipientId"],
      },
      {
        fields: ["emailTemplateId"],
      },
    ],
  }
);
