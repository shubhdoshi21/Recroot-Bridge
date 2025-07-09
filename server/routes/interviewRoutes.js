import express from "express";
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getCandidateInterviews,
  getApplicationInterviews,
  getCandidatesWithApplications,
  getApplicationsWithCandidates,
  getPipelineStages,
  getCandidateWithDetails,
  getApplicationWithDetails,
  getCandidateInterviewsWithDetails,
  getApplicationInterviewsWithDetails,
} from "../controllers/interviewController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Special endpoints
router.get("/candidates-with-applications", getCandidatesWithApplications);
router.get("/applications-with-candidates", getApplicationsWithCandidates);
router.get("/pipeline-stages", getPipelineStages);

// Regular CRUD endpoints
router.post("/", createInterview);
router.get("/", getInterviews);
router.get("/:id", getInterviewById);
router.put("/:id", updateInterview);
router.delete("/:id", deleteInterview);

// Additional endpoints
router.get("/candidate/:candidateId", getCandidateInterviews);
router.get("/application/:applicationId", getApplicationInterviews);

// Additional data routes
router.get("/candidate-details/:candidateId", getCandidateWithDetails);
router.get("/application-details/:applicationId", getApplicationWithDetails);
router.get(
  "/candidate-interviews/:candidateId",
  getCandidateInterviewsWithDetails
);
router.get(
  "/application-interviews/:applicationId",
  getApplicationInterviewsWithDetails
);

export default router;
