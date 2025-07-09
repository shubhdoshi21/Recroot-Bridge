import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const PipelineStage = sequelize.define(
    "PipelineStage",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        pipelineId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "pipelines", key: "id" },
        },
        name: { type: DataTypes.STRING, allowNull: false },
        order: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.STRING },
    },
    {
        tableName: "pipeline_stages",
        timestamps: true,
    }
); 