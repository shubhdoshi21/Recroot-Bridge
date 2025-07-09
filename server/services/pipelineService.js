import { pipelineRepository } from "../repositories/pipelineRepository.js";

export const pipelineService = {
    async createPipeline(data) {
        if (!data.name) throw new Error("Pipeline name is required");
        if (!Array.isArray(data.stages) || data.stages.length === 0) throw new Error("At least one stage is required");
        return pipelineRepository.createPipeline(data);
    },
    async getPipeline(id) {
        if (!id) throw new Error("Pipeline ID is required");
        return pipelineRepository.getPipeline(id);
    },
    async updatePipeline(id, data) {
        if (!id) throw new Error("Pipeline ID is required");
        if (!data.name) throw new Error("Pipeline name is required");
        if (!Array.isArray(data.stages) || data.stages.length === 0) throw new Error("At least one stage is required");
        return pipelineRepository.updatePipeline(id, data);
    },
    async deletePipeline(id) {
        if (!id) throw new Error("Pipeline ID is required");
        return pipelineRepository.deletePipeline(id);
    },
    async listPipelines() {
        return pipelineRepository.listPipelines();
    },
}; 