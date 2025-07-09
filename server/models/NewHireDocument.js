import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const NewHireDocument = sequelize.define(
    "NewHireDocument",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        newHireId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "new_hires",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
        },
        documentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "documents",
                key: "id",
            },
        },
        addedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        tableName: "new_hire_documents",
        timestamps: true,
        indexes: [
            { fields: ["newHireId"] },
            { fields: ["documentId"] },
            { fields: ["addedBy"] },
        ],
    }
); 