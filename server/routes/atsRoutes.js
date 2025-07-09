import express from "express";
import { ATSScoringController } from "../controllers/ats.scoring.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Calculate ATS scores for a candidate across all jobs
router.get("/candidate/:candidateId", ATSScoringController.calculateCandidateScore);

// Calculate ATS scores for a job across all candidates
router.get("/job/:jobId", ATSScoringController.calculateJobScore);

// Get all ATS scores for a candidate
router.get("/candidate/:candidateId/scores", ATSScoringController.getCandidateScores);

// Get all ATS scores for a job
router.get("/job/:jobId/scores", ATSScoringController.getJobScores);

// Get single ATS score for a candidate-job combination
router.get("/score/:candidateId/:jobId", ATSScoringController.getSingleATSScore);

// Ensure ATS scores exist for a candidate-job combination
router.get("/ensure/:candidateId/:jobId", ATSScoringController.ensureATSScores);

export default router; 