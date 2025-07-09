import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const DocumentActivity = sequelize.define("DocumentActivity", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    activityType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [["view", "download", "edit", "share", "delete", "upload"]],
        },
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "document_activities",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
}); 