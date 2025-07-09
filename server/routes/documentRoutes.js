import express from "express";
import {
  getAllDocuments,
  uploadDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentContent,
  shareDocument,
  getSharedDocuments,
  removeDocumentAccess,
  // getDocumentTemplates,
  // createDocumentTemplate,
  // getDocumentTemplateById,
  // updateDocumentTemplate,
  // deleteDocumentTemplate,
  // useDocumentTemplate,
  getDocumentCategories,
  createDocumentCategory,
  getDocumentTags,
  createDocumentTag,
  getDocumentUploaders,
  getDocumentVersions,
  createDocumentVersion,
  getDocumentStats,
  searchDocuments,
  getDocumentActivity,
  bulkUploadDocuments,
  exportDocuments,
  previewDocument,
  getCandidateDocuments,
  getCandidateList,
  getCompanyDocuments,
  getCompanyList,
} from "../controllers/documentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkPermission, checkAnyPermission } from "../middlewares/permissionMiddleware.js";
import { upload } from "../services/documentService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Specific endpoints (must come before parameterized routes)
router.get("/stats", checkPermission("documents.view"), asyncHandler(getDocumentStats));
router.get("/search", checkPermission("documents.view"), asyncHandler(searchDocuments));
router.get("/shared", checkPermission("documents.view"), asyncHandler(getSharedDocuments));
router.get("/uploaders", checkPermission("documents.view"), asyncHandler(getDocumentUploaders));
router.get("/export", checkPermission("documents.view"), asyncHandler(exportDocuments));

// Document Templates (specific endpoints first)
// router.get("/templates", checkPermission("documents.view"), asyncHandler(getDocumentTemplates));
// router.post(
//   "/templates",
//   checkPermission("documents.create"),
//   upload.single("file"),
//   asyncHandler(createDocumentTemplate)
// );
// router.get("/templates/:id", checkPermission("documents.view"), asyncHandler(getDocumentTemplateById));
// router.put("/templates/:id", checkPermission("documents.edit"), asyncHandler(updateDocumentTemplate));
// router.delete("/templates/:id", checkPermission("documents.delete"), asyncHandler(deleteDocumentTemplate));
// router.post("/templates/:id/use", checkPermission("documents.create"), asyncHandler(useDocumentTemplate));

// Document Categories
router.get("/categories", checkPermission("documents.view"), asyncHandler(getDocumentCategories));
router.post("/categories", checkPermission("documents.edit"), asyncHandler(createDocumentCategory));

// Document Tags
router.get("/tags", checkPermission("documents.view"), asyncHandler(getDocumentTags));
router.post("/tags", checkPermission("documents.edit"), asyncHandler(createDocumentTag));

// Bulk Operations
router.post(
  "/bulk-upload",
  checkPermission("documents.create"),
  upload.array("files", 10),
  asyncHandler(bulkUploadDocuments)
);

// Candidate document endpoints
router.get("/candidate-documents", checkPermission("documents.view"), asyncHandler(getCandidateDocuments));
router.get("/candidate-list", checkPermission("documents.view"), asyncHandler(getCandidateList));

// Company document endpoints
router.get("/company-documents", checkPermission("documents.view"), asyncHandler(getCompanyDocuments));
router.get("/company-list", checkPermission("documents.view"), asyncHandler(getCompanyList));

// Core Document Endpoints (parameterized routes last)
router.get("/", checkPermission("documents.view"), asyncHandler(getAllDocuments));
router.post("/", checkPermission("documents.create"), upload.single("file"), asyncHandler(uploadDocument));
router.get("/:id", checkPermission("documents.view"), asyncHandler(getDocumentById));
router.put("/:id", checkPermission("documents.edit"), asyncHandler(updateDocument));
router.delete("/:id", checkPermission("documents.delete"), asyncHandler(deleteDocument));

// Document Content Management
router.get("/:id/content", checkPermission("documents.view"), asyncHandler(getDocumentContent));
router.get("/:id/download", checkPermission("documents.view"), asyncHandler(downloadDocument));

// Document Sharing
router.post("/:id/share", checkPermission("documents.share"), asyncHandler(shareDocument));
router.delete("/shared/:id/access", checkPermission("documents.share"), asyncHandler(removeDocumentAccess));

// Document Versions
router.get("/:id/versions", checkPermission("documents.view"), asyncHandler(getDocumentVersions));
router.post(
  "/:id/versions",
  checkPermission("documents.edit"),
  upload.single("file"),
  asyncHandler(createDocumentVersion)
);

// Document Analytics
router.get("/:id/activity", checkPermission("documents.view"), asyncHandler(getDocumentActivity));

// Preview Document
router.get("/:id/preview", checkPermission("documents.view"), asyncHandler(previewDocument));

export default router;
