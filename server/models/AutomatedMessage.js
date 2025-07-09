import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const AutomatedMessage = sequelize.define(
  "AutomatedMessage",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    trigger: { type: DataTypes.STRING, allowNull: false },
    channel: { type: DataTypes.STRING, allowNull: false },
    template: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.TEXT, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      //   defaultValue: "Active",
    },
    lastRun: { type: DataTypes.STRING, allowNull: true },
    sentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // defaultValue: 0,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "automated_messages",
    timestamps: true,
  }
);

export default AutomatedMessage;
