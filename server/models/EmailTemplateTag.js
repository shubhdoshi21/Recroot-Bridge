import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const EmailTemplateTag = sequelize.define(
  "EmailTemplateTag",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    emailTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "email_templates",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "email_template_tags",
    timestamps: false,
    indexes: [
      {
        fields: ["emailTemplateId"],
      },
      {
        fields: ["tag"],
      },
    ],
  }
);
