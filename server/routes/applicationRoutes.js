import express from "express";
import { applicationController } from "../controllers/applicationController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all application routes
router.use(verifyToken);

// Apply to a job (creates an application)
// This would likely be POST /api/jobs/:jobId/apply to have job context
// But for a dedicated router, we can imagine a POST /api/applications
// router.post("/", applicationController.applyToJob);

// Update the status of a specific application
// PUT /api/applications/:applicationId/status
router.put("/:applicationId/status", applicationController.updateApplicationStatus);

// Reject a specific application
// PUT /api/applications/:applicationId/reject
router.put("/:applicationId/reject", applicationController.rejectApplication);

export default router; 