import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const DocumentTagMap = sequelize.define("DocumentTagMap", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "documents",
            key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
    tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "document_tags",
            key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
}, {
    tableName: "document_tag_maps",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["documentId", "tagId"],
        },
        {
            fields: ["documentId"],
        },
        {
            fields: ["tagId"],
        },
    ],
}); 