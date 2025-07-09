import { pipelineService } from "../services/pipelineService.js";

export const pipelineController = {
    async createPipeline(req, res) {
        try {
            const pipeline = await pipelineService.createPipeline(req.body);
            res.status(201).json(pipeline);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getPipeline(req, res) {
        try {
            const pipeline = await pipelineService.getPipeline(req.params.id);
            if (!pipeline) return res.status(404).json({ error: "Pipeline not found" });
            res.json(pipeline);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async updatePipeline(req, res) {
        try {
            const pipeline = await pipelineService.updatePipeline(req.params.id, req.body);
            res.json(pipeline);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async deletePipeline(req, res) {
        try {
            await pipelineService.deletePipeline(req.params.id);
            res.json({ message: "Pipeline deleted" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async listPipelines(req, res) {
        try {
            const pipelines = await pipelineService.listPipelines();
            res.json(pipelines);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
}; 