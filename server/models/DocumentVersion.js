import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const DocumentVersion = sequelize.define("DocumentVersion", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    versionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    changes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        // defaultValue: true,
    },
}, {
    tableName: "document_versions",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
}); 