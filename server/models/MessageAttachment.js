import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const MessageAttachment = sequelize.define(
  "MessageAttachment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "messages",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attachmentType: {
      type: DataTypes.STRING,
    },
    attachmentName: {
      type: DataTypes.STRING,
    },
    fileSize: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "message_attachments",
    timestamps: false,
    indexes: [
      {
        fields: ["messageId"],
      },
      {
        fields: ["attachmentType"],
      },
    ],
  }
);
