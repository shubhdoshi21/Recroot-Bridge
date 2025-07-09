import express from "express";
import multer from "multer";
import {
  validateCandidate,
  validateEducation,
  validateExperience,
} from "../middlewares/validation.js";
import {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateJobs,
  assignJobsToCandidate,
  removeJobAssignment,
  getCandidateResume,
  uploadCandidateResume,
  deleteCandidateResume,
  getCandidateEducation,
  addCandidateEducation,
  updateCandidateEducation,
  deleteCandidateEducation,
  getCandidateExperience,
  addCandidateExperience,
  updateCandidateExperience,
  deleteCandidateExperience,
  getCandidateActivities,
  addCandidateActivity,
  updateCandidateActivity,
  deleteCandidateActivity,
  uploadCandidateDocuments,
  updateCandidateDocument,
  getCandidateDocuments,
  deleteCandidateDocument,
  getPositions,
  addPosition,
  getSkills,
  addSkill,
  bulkUploadCandidates,
  getCandidateStats,
  getCandidatesWithSkills,
  getCandidatesWithRelations,
  getCandidateCertifications,
  createCandidateCertification,
  updateCandidateCertification,
  deleteCandidateCertification,
  generateBulkUploadTemplate,
  cleanupOrphanedDocuments,
  triggerJobMatching,
  bulkUploadResumes,
  storeResumeAfterCreation,
  cleanupTempResumeFiles,
  getCandidateProfileOptimized,
  getCandidateEducationOptimized,
  getCandidateExperienceOptimized,
  getCandidateActivitiesOptimized,
  getCandidateCertificationsOptimized,
  getFinalStageCandidates,

} from "../controllers/candidateController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkPermission, checkAnyPermission } from "../middlewares/permissionMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { candidateService } from "../services/candidateService.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Basic CRUD operations

router.get("", verifyToken, checkPermission("candidates.view"), getCandidates);

router.post(
  "",
  verifyToken,
  checkPermission("candidates.create"),
  upload.fields([
    { name: "educationDocuments" },
    { name: "experienceDocuments" },
    { name: "activityDocuments" },
    { name: "certificationDocuments" },
  ]),
  validateCandidate,
  createCandidate
);

// Place special routes here
router.get("/final-stage-candidates", getFinalStageCandidates);

// Special routes that need to come before /:id
router.get("/with-skills", verifyToken, checkPermission("candidates.view"), getCandidatesWithSkills);
router.get("/with-relations", verifyToken, checkPermission("candidates.view"), getCandidatesWithRelations);
router.get("/positions", verifyToken, checkPermission("candidates.view"), getPositions);
router.get("/skills", verifyToken, checkPermission("candidates.view"), getSkills);
router.get("/stats", verifyToken, checkPermission("candidates.view"), getCandidateStats);

// Routes with ID parameter
router.get("/:id", verifyToken, checkPermission("candidates.view"), getCandidate);
router.put(
  "/:id",
  verifyToken,
  checkPermission("candidates.edit"),
  upload.fields([
    { name: "resume" },
    { name: "educationDocuments" },
    { name: "experienceDocuments" },
    { name: "activityDocuments" },
    { name: "certificationDocuments" },
  ]),
  validateCandidate,
  updateCandidate
);
router.delete("/:id", verifyToken, checkPermission("candidates.delete"), deleteCandidate);

// Job Assignments
router.get("/:id/jobs", verifyToken, checkPermission("candidates.view"), getCandidateJobs);
router.post("/:id/jobs", verifyToken, checkPermission("candidates.edit"), assignJobsToCandidate);
router.delete("/:id/jobs/:jobId", verifyToken, checkPermission("candidates.edit"), removeJobAssignment);

// Resume/Documents
router.get("/:id/resume", verifyToken, checkPermission("candidates.view"), getCandidateResume);
router.post(
  "/:id/resume",
  verifyToken,
  checkPermission("candidates.edit"),
  upload.single("resume"),
  uploadCandidateResume
);
router.delete("/:id/resume", verifyToken, checkPermission("candidates.edit"), deleteCandidateResume);

// Store resume after candidate creation (for bulk upload flow)
router.post(
  "/store-resume-after-creation",
  verifyToken,
  checkPermission("candidates.edit"),
  storeResumeAfterCreation
);

// Cleanup temporary resume files
router.post(
  "/cleanup-temporary-files",
  verifyToken,
  checkPermission("candidates.edit"),
  cleanupTempResumeFiles
);

// Education History
router.get("/:id/education", verifyToken, checkPermission("candidates.view"), getCandidateEducation);
router.post(
  "/:id/education",
  verifyToken,
  checkPermission("candidates.edit"),
  validateEducation,
  addCandidateEducation
);
router.put(
  "/:id/education/:educationId",
  verifyToken,
  checkPermission("candidates.edit"),
  validateEducation,
  updateCandidateEducation
);
router.delete(
  "/:id/education/:educationId",
  verifyToken,
  checkPermission("candidates.edit"),
  deleteCandidateEducation
);

// Work Experience
router.get("/:id/experience", verifyToken, checkPermission("candidates.view"), getCandidateExperience);
router.post(
  "/:id/experience",
  verifyToken,
  checkPermission("candidates.edit"),
  validateExperience,
  addCandidateExperience
);
router.put(
  "/:id/experience/:experienceId",
  verifyToken,
  checkPermission("candidates.edit"),
  validateExperience,
  updateCandidateExperience
);
router.delete(
  "/:id/experience/:experienceId",
  verifyToken,
  checkPermission("candidates.edit"),
  deleteCandidateExperience
);

// Extracurricular Activities
router.get("/:id/activities", verifyToken, checkPermission("candidates.view"), getCandidateActivities);
router.post("/:id/activities", verifyToken, checkPermission("candidates.edit"), addCandidateActivity);
router.put("/:id/activities/:activityId", verifyToken, checkPermission("candidates.edit"), updateCandidateActivity);
router.delete(
  "/:id/activities/:activityId",
  verifyToken,
  checkPermission("candidates.edit"),
  deleteCandidateActivity
);

// Documents
router.post(
  "/:id/documents",
  verifyToken,
  checkPermission("candidates.edit"),
  upload.array("files"),
  uploadCandidateDocuments
);
router.put(
  "/:id/documents/:documentId",
  verifyToken,
  checkPermission("candidates.edit"),
  upload.single("file"),
  updateCandidateDocument
);
router.get("/:id/documents", verifyToken, checkPermission("candidates.view"), getCandidateDocuments);
router.delete(
  "/:id/documents/:documentId",
  verifyToken,
  checkPermission("candidates.edit"),
  deleteCandidateDocument
);

// Filtering and Reference Data
router.get("/positions", verifyToken, checkPermission("candidates.view"), getPositions);
router.post("/positions", verifyToken, checkPermission("candidates.edit"), addPosition);
router.get("/skills", verifyToken, checkPermission("candidates.view"), getSkills);
router.post("/skills", verifyToken, checkPermission("candidates.edit"), addSkill);

// Bulk Operations
router.get("/bulk-upload/template", verifyToken, checkPermission("candidates.bulk_upload"), generateBulkUploadTemplate);

router.post(
  "/bulk-upload",
  verifyToken,
  checkPermission("candidates.create"),
  upload.single("file"),
  bulkUploadCandidates
);
router.post(
  "/bulk-upload-resumes",
  verifyToken,
  checkPermission("candidates.create"),
  upload.array("resumes", 10), // Allow up to 10 files
  bulkUploadResumes
);

// Certifications
router.get("/:id/certifications", verifyToken, checkPermission("candidates.view"), getCandidateCertifications);
router.post(
  "/:id/certifications",
  verifyToken,
  checkPermission("candidates.edit"),
  upload.single("certificationDocument"),
  createCandidateCertification
);
router.put(
  "/:id/certifications/:certificationId",
  verifyToken,
  checkPermission("candidates.edit"),
  upload.single("certificationDocument"),
  updateCandidateCertification
);
router.delete(
  "/:id/certifications/:certificationId",
  verifyToken,
  checkPermission("candidates.edit"),
  deleteCandidateCertification
);

// Cleanup operations (admin only)
router.delete("/cleanup/orphaned-documents", verifyToken, checkPermission("candidates.delete"), cleanupOrphanedDocuments);

// Trigger job matching for a candidate
router.post(
  "/:candidateId/trigger-job-matching",
  verifyToken,
  triggerJobMatching
);

// Optimized routes for better performance
router.get("/:id/profile-optimized", verifyToken, checkPermission("candidates.view"), getCandidateProfileOptimized);
router.get("/:id/education-optimized", verifyToken, checkPermission("candidates.view"), getCandidateEducationOptimized);
router.get("/:id/experience-optimized", verifyToken, checkPermission("candidates.view"), getCandidateExperienceOptimized);
router.get("/:id/activities-optimized", verifyToken, checkPermission("candidates.view"), getCandidateActivitiesOptimized);
router.get("/:id/certifications-optimized", verifyToken, checkPermission("candidates.view"), getCandidateCertificationsOptimized);

export default router;
