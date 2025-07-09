import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const DocumentCategory = sequelize.define("DocumentCategory", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,
        // defaultValue: "#3B82F6",
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        // defaultValue: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        // defaultValue: true,
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: "document_categories",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["name"], // Unique constraint at the table level (recommended)
        },
    ],
    createdAt: "createdAt",
    updatedAt: "updatedAt",
}); 