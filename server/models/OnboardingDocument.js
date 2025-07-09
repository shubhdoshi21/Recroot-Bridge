import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import { Document } from "./Document.js";

export const OnboardingDocument = sequelize.define(
    "OnboardingDocument",
    {
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
        subcategory: {
            type: DataTypes.STRING,
            allowNull: true, // e.g., "Policies", "Forms", "Guides"
        },
    },
    {
        tableName: "onboarding_documents",
        timestamps: true,
    }
);
