import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const ApplicationTag = sequelize.define(
  "ApplicationTag",
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
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "application_tags",
    timestamps: false,
    indexes: [
      {
        fields: ["applicationId"],
      },
      {
        fields: ["tag"],
      },
    ],
  }
);
