import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const UserPermission = sequelize.define(
  "UserPermission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "permissions",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    grantedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    grantedBy: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "user_permissions",
    timestamps: false,
    indexes: [
      {
        fields: ["role"],
      },
      {
        fields: ["permissionId"],
      },
    ],
  }
);
