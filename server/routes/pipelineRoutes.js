import express from "express";
import { pipelineController } from "../controllers/pipelineController.js";

const router = express.Router();

router.post("/", pipelineController.createPipeline);
router.get("/", pipelineController.listPipelines);
router.get("/:id", pipelineController.getPipeline);
router.put("/:id", pipelineController.updatePipeline);
router.delete("/:id", pipelineController.deletePipeline);

export default router; 