import express from "express";
import { jobController } from "../controllers/jobController.js";
import { getUnassignedJobs } from "../controllers/recruiterController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkPermission, checkAnyPermission } from "../middlewares/permissionMiddleware.js";
import multer from "multer";
import path from "path";
import { applicationController } from "../controllers/applicationController.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Job Templates
router.get("/templates", verifyToken, checkPermission("jobs.view"), jobController.getJobTemplates);
router.post("/templates", verifyToken, checkPermission("jobs.create"), jobController.createJobTemplate);
router.put("/templates/:id", verifyToken, checkPermission("jobs.edit"), jobController.updateJobTemplate);
router.delete("/templates/:id", verifyToken, checkPermission("jobs.delete"), jobController.deleteJobTemplate);

// Core Job Endpoints
// router.get("/simple", verifyToken, jobController.getJobs); // Removed simple jobs API
router.get(
  "/with-applicants-count",
  verifyToken,
  checkPermission("jobs.view"),
  jobController.getAllJobsWithApplicantsCount
);
router.get("/", verifyToken, checkPermission("jobs.view"), jobController.getAllJobs);
router.post("/", verifyToken, checkPermission("jobs.create"), jobController.createJob);
router.get("/unassigned", verifyToken, checkPermission("jobs.view"), getUnassignedJobs);
router.get("/:id", verifyToken, checkPermission("jobs.view"), jobController.getJobById);
router.put("/:id", verifyToken, checkPermission("jobs.edit"), jobController.updateJob);
router.delete("/:id", verifyToken, checkPermission("jobs.delete"), jobController.deleteJob);

// Job Status Management
router.put("/:id/status", verifyToken, checkPermission("jobs.edit"), jobController.updateJobStatus);

// Job Applicants
router.get("/:id/applicants", verifyToken, checkPermission("jobs.view"), jobController.getJobApplicants);

// The routes for updating/rejecting applications have been moved to applicationRoutes.js
// The routes for updating sourced candidates have been consolidated below.

// Route for updating the status of a sourced candidate (assignment)
// This acts on the CandidateJobMap table
router.put(
  "/:jobId/sourced-candidates/:candidateId/status",
  verifyToken,
  checkPermission("jobs.edit"),
  applicationController.updateAssignmentStatus
);

// Job Templates
router.get("/templates", verifyToken, jobController.getJobTemplates);
router.post("/templates", verifyToken, jobController.createJobTemplate);
router.put("/templates/:id", verifyToken, jobController.updateJobTemplate);
router.delete("/templates/:id", verifyToken, jobController.deleteJobTemplate);

// Statistics and Analytics
router.get("/stats", verifyToken, checkPermission("jobs.view"), jobController.getJobStats);
router.get("/analytics", verifyToken, checkAnyPermission(["jobs.view", "analytics.view"]), jobController.getJobAnalytics);

// Document Management
router.get("/:id/documents", verifyToken, checkPermission("jobs.view"), jobController.getJobDocuments);
router.post(
  "/:id/documents",
  verifyToken,
  checkPermission("jobs.edit"),
  upload.single("file"),
  jobController.addJobDocument
);

// Bulk Operations
router.post(
  "/bulk-upload",
  verifyToken,
  checkPermission("jobs.create"),
  upload.single("file"),
  jobController.bulkUploadJobs
);
router.get(
  "/bulk-upload/template",
  verifyToken,
  checkPermission("jobs.create"),
  jobController.generateBulkUploadTemplate
);

// Reference Data
router.get("/departments", verifyToken, checkPermission("jobs.view"), jobController.getDepartments);
router.post("/departments", verifyToken, checkPermission("jobs.edit"), jobController.addDepartment);

router.get("/locations", verifyToken, checkPermission("jobs.view"), jobController.getLocations);
router.post("/locations", verifyToken, checkPermission("jobs.edit"), jobController.addLocation);

router.get("/types", verifyToken, checkPermission("jobs.view"), jobController.getJobTypes);
router.post("/types", verifyToken, checkPermission("jobs.edit"), jobController.addJobType);

// AI Job Generation
router.post("/ai-generate", verifyToken, checkPermission("jobs.create"), jobController.generateJobDescription);

// Company Integration
router.get("/companies", verifyToken, checkPermission("companies.view"), jobController.getCompanies);
router.get("/companies/:id/jobs", verifyToken, checkPermission("companies.view"), jobController.getCompanyJobs);

// Interview Scheduling
router.post("/interviews", verifyToken, checkPermission("interviews.create"), jobController.scheduleInterview);

// Job Application
router.post("/:jobId/apply/:candidateId", verifyToken, checkPermission("jobs.view"), jobController.applyToJob);

export default router;
