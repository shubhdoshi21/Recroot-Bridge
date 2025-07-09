import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Pipeline = sequelize.define(
    "Pipeline",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING },
    },
    {
        tableName: "pipelines",
        timestamps: true,
    }
); 