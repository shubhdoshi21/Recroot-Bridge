import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const NewHireNote = sequelize.define(
    "NewHireNote",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        noteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "notes", key: "id" }
        },
        newHireId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "new_hires", key: "id" },
            onDelete: "CASCADE",
            onUpdate: "NO ACTION",
        },
        createdBy: { type: DataTypes.INTEGER, allowNull: false },
        createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    },
    {
        tableName: "new_hire_notes",
        timestamps: false
    }
); 