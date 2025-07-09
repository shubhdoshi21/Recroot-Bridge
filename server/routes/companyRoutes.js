import express from "express";
import {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    addCompanyContact,
    updateCompanyContact,
    deleteCompanyContact,
    getCompanyContacts,
    addCompanyDocument,
    getCompanyDocuments,
    getCompanyDocumentById,
    deleteCompanyDocument,
    updateCompanyDocument,
    shareCompanyDocument,
    addCompanyNote,
    getCompanyNotes,
    updateCompanyNote,
    deleteCompanyNote,
    getCompanyJobs,
    addCompanyJob,
    deleteCompanyJob,
    getCompanyCandidates,
    getCompanyCandidateById,
    getCompanyActivity,
    getCompanyHiringAnalytics,
    getCompanyPipelineAnalytics,
    getIndustries,
    addIndustry,
    getLocations,
    addLocation,
    getCompanySizes,
    getCompanyStats,
    validateGSTIN,
    validatePAN
} from "../controllers/companyController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkPermission, checkAnyPermission } from "../middlewares/permissionMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Reference data routes
router.route("/industries")
    .get(protect, checkPermission("companies.view"), getIndustries)
    .post(protect, checkPermission("companies.edit"), addIndustry);

router.route("/locations")
    .get(protect, checkPermission("companies.view"), getLocations)
    .post(protect, checkPermission("companies.edit"), addLocation);

router.route("/sizes")
    .get(protect, checkPermission("companies.view"), getCompanySizes);

router.route("/stats")
    .get(protect, checkPermission("companies.view"), getCompanyStats);

// Validation routes
router.route("/validate/gstin")
    .post(protect, checkPermission("companies.view"), validateGSTIN);

router.route("/validate/pan")
    .post(protect, checkPermission("companies.view"), validatePAN);

// Company routes
router.route("/")
    .get(protect, checkPermission("companies.view"), getAllCompanies)
    .post(protect, checkPermission("companies.create"), createCompany);

router.route("/:id")
    .get(protect, checkPermission("companies.view"), getCompanyById)
    .put(protect, checkPermission("companies.edit"), updateCompany)
    .delete(protect, checkPermission("companies.delete"), deleteCompany);

// Company contacts routes
router.route("/:id/contacts")
    .get(protect, checkPermission("companies.view"), getCompanyContacts)
    .post(protect, checkPermission("companies.edit"), addCompanyContact);

router.route("/:id/contacts/:contactId")
    .put(protect, checkPermission("companies.edit"), updateCompanyContact)
    .delete(protect, checkPermission("companies.edit"), deleteCompanyContact);

// Company documents routes
router.route("/:id/documents")
    .get(protect, checkPermission("companies.view"), getCompanyDocuments)
    .post(protect, checkPermission("companies.edit"), upload.single("document"), addCompanyDocument);

router.route("/:id/documents/:documentId")
    .get(protect, checkPermission("companies.view"), getCompanyDocumentById)
    .put(protect, checkPermission("companies.edit"), updateCompanyDocument)
    .delete(protect, checkPermission("companies.edit"), deleteCompanyDocument);

router.route("/:id/documents/:documentId/share")
    .post(protect, checkPermission("companies.edit"), shareCompanyDocument);

// Company notes routes
router.route("/:id/notes")
    .get(protect, checkPermission("companies.view"), getCompanyNotes)
    .post(protect, checkPermission("companies.edit"), addCompanyNote);

router.route("/:id/notes/:noteId")
    .put(protect, checkPermission("companies.edit"), updateCompanyNote)
    .delete(protect, checkPermission("companies.edit"), deleteCompanyNote);

// Company jobs routes
router.route("/:id/jobs")
    .get(protect, checkPermission("companies.view"), getCompanyJobs)
    .post(protect, checkPermission("companies.edit"), addCompanyJob);

router.route("/:id/jobs/:jobId")
    .delete(protect, checkPermission("companies.edit"), deleteCompanyJob);

// Company candidates routes
router.route("/:id/candidates")
    .get(protect, checkPermission("companies.view"), getCompanyCandidates);

router.route("/:id/candidates/:candidateId")
    .get(protect, checkPermission("companies.view"), getCompanyCandidateById);

// Company activity and analytics routes
router.route("/:id/activity")
    .get(protect, checkPermission("companies.view"), getCompanyActivity);

router.route("/:id/analytics/hiring")
    .get(protect, checkAnyPermission(["companies.view", "analytics.view"]), getCompanyHiringAnalytics);

router.route("/:id/analytics/pipeline")
    .get(protect, checkAnyPermission(["companies.view", "analytics.view"]), getCompanyPipelineAnalytics);

export default router; 