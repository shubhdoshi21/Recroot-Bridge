import { Pipeline } from "../models/Pipeline.js";
import { PipelineStage } from "../models/PipelineStage.js";
import { sequelize } from "../config/sequelize.js";

export const pipelineRepository = {
    async createPipeline({ name, description, stages }) {
        return await sequelize.transaction(async (t) => {
            const pipeline = await Pipeline.create({ name, description }, { transaction: t });
            if (stages && Array.isArray(stages)) {
                for (const stage of stages) {
                    await PipelineStage.create({
                        pipelineId: pipeline.id,
                        name: stage.name,
                        order: stage.order,
                        description: stage.description || null,
                    }, { transaction: t });
                }
            }
            return pipeline;
        });
    },

    async getPipeline(id) {
        return await Pipeline.findByPk(id, {
            include: [{ model: PipelineStage, as: "stages", order: [["order", "ASC"]] }],
        });
    },

    async updatePipeline(id, { name, description, stages }) {
        return await sequelize.transaction(async (t) => {
            const pipeline = await Pipeline.findByPk(id, { transaction: t });
            if (!pipeline) throw new Error("Pipeline not found");
            await pipeline.update({ name, description }, { transaction: t });
            if (stages && Array.isArray(stages)) {
                // Remove old stages
                await PipelineStage.destroy({ where: { pipelineId: id }, transaction: t });
                // Add new stages
                for (const stage of stages) {
                    await PipelineStage.create({
                        pipelineId: id,
                        name: stage.name,
                        order: stage.order,
                        description: stage.description || null,
                    }, { transaction: t });
                }
            }
            return pipeline;
        });
    },

    async deletePipeline(id) {
        return await sequelize.transaction(async (t) => {
            await PipelineStage.destroy({ where: { pipelineId: id }, transaction: t });
            return await Pipeline.destroy({ where: { id }, transaction: t });
        });
    },

    async listPipelines() {
        return await Pipeline.findAll({
            include: [{ model: PipelineStage, as: "stages", order: [["order", "ASC"]] }],
            order: [["id", "ASC"]],
        });
    },
}; 