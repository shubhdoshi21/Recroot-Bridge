import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as documentService from "../services/documentService.js";
import fs from "fs";
import path from "path";
import { candidateService } from "../services/candidateService.js";
import * as documentRepository from "../repositories/documentRepository.js";

// @desc    Get all documents with filtering and pagination
// @route   GET /api/documents
// @access  Private
export const getAllDocuments = async (req, res) => {
  try {
    // Only admin/manager can see all docs. Others can only see their own.
    const isPrivileged =
      req.user && (req.user.role === "admin" || req.user.role === "manager");
    const options = {
      ...req.query,
      clientId: req.user.clientId,
      ...(isPrivileged ? {} : { uploadedBy: req.user.id }),
    };
    const result = await documentService.getAllDocuments(options);

    // Ensure consistent formatting of documents
    const formattedDocuments = result.documents.map((doc) => ({
      ...doc,
      // Ensure category is properly formatted
      category: doc.category || null,
      // Ensure tags are properly formatted as an array of strings
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      // Ensure tagIds is properly formatted as an array of numbers
      tagIds: Array.isArray(doc.tagIds) ? doc.tagIds : [],
    }));

    res.json({
      documents: formattedDocuments,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    });
  } catch (error) {
    console.log("Error in getAllDocuments:", error);
    res.status(500).json({
      message: error.message || "Error fetching documents",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const document = await documentService.uploadDocument(
      req.file,
      req.body,
      req.user.id,
      req.user.clientId
    );

    // Format the document for frontend consumption
    const formattedDocument = {
      ...document.toJSON(),
      // Ensure category is properly formatted
      category: document.category
        ? {
          id: document.category.id,
          name: document.category.name,
          color: document.category.color || "#6B7280",
          icon: document.category.icon || "file",
        }
        : null,
      // Ensure tags are properly formatted
      tags: document.tags ? document.tags.map((tag) => tag.name) : [],
      tagIds: document.tags ? document.tags.map((tag) => tag.id) : [],
    };

    res.status(201).json({
      message: "Document uploaded successfully",
      document: formattedDocument,
    });
  } catch (error) {
    console.log("Error in uploadDocument:", error);
    res.status(500).json({
      message: error.message || "Error uploading document",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(
      req.params.id,
      req.user.id,
      req.user.clientId
    );
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Format the document to ensure consistent structure
    const formattedDocument = {
      ...document,
      // Ensure category is properly formatted if it exists
      category: document.category || null,
      // Ensure tags are properly formatted
      tags: Array.isArray(document.tags) ? document.tags : [],
      tagIds: Array.isArray(document.tagIds) ? document.tagIds : [],
    };

    res.json({
      document: formattedDocument,
    });
  } catch (error) {
    console.log("Error in getDocumentById:", error);
    res.status(500).json({
      message: error.message || "Error fetching document",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Update document metadata
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res) => {
  try {
    // Validate document ID
    const documentId = parseInt(req.params.id, 10);
    if (isNaN(documentId)) {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Update data is required",
      });
    }

    const document = await documentService.updateDocument(
      documentId,
      req.body,
      req.user.id,
      req.user.clientId
    );

    // Format the document for frontend consumption
    const formattedDocument = {
      ...document.toJSON(),
      // Ensure category is properly formatted
      category: document.category
        ? {
          id: document.category.id,
          name: document.category.name,
          color: document.category.color || "#6B7280",
          icon: document.category.icon || "file",
        }
        : null,
      // Ensure tags are properly formatted
      tags: document.tags ? document.tags.map((tag) => tag.name) : [],
      tagIds: document.tags ? document.tags.map((tag) => tag.id) : [],
    };

    res.json({
      message: "Document updated successfully",
      document: formattedDocument,
    });
  } catch (error) {
    console.log("Error in updateDocument:", error);

    // Handle specific error types
    if (error.message === "Document not found") {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    if (error.message.includes("permission")) {
      return res.status(403).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || "Error updating document",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    await documentService.deleteDocument(
      req.params.id,
      req.user.id,
      req.user.clientId
    );
    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteDocument:", error);
    res.status(500).json({
      message: error.message || "Error deleting document",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = async (req, res) => {
  try {
    console.log(
      `[downloadDocument] Request received for document ID: ${req.params.id}`
    );

    const { filePath, fileName, mimeType } =
      await documentService.downloadDocument(
        req.params.id,
        req.user.id,
        req.user.clientId
      );

    console.log(
      `[downloadDocument] Service returned: path=${filePath}, name=${fileName}, type=${mimeType}`
    );

    // Check if file exists before attempting to download
    if (!fs.existsSync(filePath)) {
      console.log(`[downloadDocument] File not found at path: ${filePath}`);

      // Try alternative paths
      const baseName = path.basename(filePath);
      const alternativePaths = [
        path.join("uploads", "documents", baseName),
        path.join("server", "uploads", "documents", baseName),
        path.join(process.cwd(), "uploads", "documents", baseName),
        path.join(process.cwd(), "server", "uploads", "documents", baseName),
      ];

      let foundPath = null;
      for (const altPath of alternativePaths) {
        console.log(`[downloadDocument] Trying alternative path: ${altPath}`);
        if (fs.existsSync(altPath)) {
          console.log(
            `[downloadDocument] File found at alternative path: ${altPath}`
          );
          foundPath = altPath;
          break;
        }
      }

      if (!foundPath) {
        console.log(
          `[downloadDocument] File not found in any location for document ID ${req.params.id}`
        );
        return res.status(404).json({
          message: "Document file not found on server",
          error: `The file for document ID ${req.params.id} could not be located`,
        });
      }

      filePath = foundPath;
    }

    // Set appropriate content type based on file extension
    let contentType = mimeType || "application/octet-stream";
    const fileExtension = path.extname(filePath).toLowerCase();

    // Map common extensions to proper MIME types
    const mimeTypeMap = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
    };

    if (mimeTypeMap[fileExtension]) {
      contentType = mimeTypeMap[fileExtension];
    }

    console.log(
      `[downloadDocument] Using content type: ${contentType} for extension ${fileExtension}`
    );

    // Set appropriate headers for download
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );

    // Get file stats for Content-Length header
    const stats = fs.statSync(filePath);
    res.setHeader("Content-Length", stats.size);
    console.log(`[downloadDocument] File size: ${stats.size} bytes`);

    // Add cache control headers to prevent caching issues
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Add a custom header to indicate the download count was updated
    // This will help the frontend know when to refresh the document stats
    res.setHeader("X-Document-Download-Count-Updated", "true");
    res.setHeader("X-Document-Stats-Version", Date.now().toString());

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);

    // Handle file stream errors
    fileStream.on("error", (err) => {
      console.log(
        `[downloadDocument] Error streaming file for download: ${err.message}`
      );
      if (!res.headersSent) {
        res.status(500).json({
          message: "Error streaming document file",
          error: err.message,
        });
      }
    });

    // Log when streaming is complete
    fileStream.on("end", () => {
      console.log(
        `[downloadDocument] Successfully streamed document ID ${req.params.id} to client`
      );
    });

    fileStream.pipe(res);
  } catch (error) {
    console.log(`[downloadDocument] Error: ${error.message}`, error);
    res
      .status(
        error.message === "Document not found" ||
          error.message === "Access denied"
          ? 404
          : 500
      )
      .json({
        message: error.message || "Error downloading document",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
  }
};

// @desc    Get document content for preview
// @route   GET /api/documents/:id/content
// @access  Private
export const getDocumentContent = async (req, res) => {
  try {
    console.log(
      `[getDocumentContent] Request received for document ID: ${req.params.id}`
    );

    const { filePath, fileName, mimeType } =
      await documentService.downloadDocument(
        req.params.id,
        req.user.id,
        req.user.clientId
      );

    console.log(
      `[getDocumentContent] Service returned: path=${filePath}, name=${fileName}, type=${mimeType}`
    );

    // Check if file exists before attempting to stream
    if (!fs.existsSync(filePath)) {
      console.log(`[getDocumentContent] File not found at path: ${filePath}`);

      // Try alternative paths
      const baseName = path.basename(filePath);
      const alternativePaths = [
        path.join("uploads", "documents", baseName),
        path.join("server", "uploads", "documents", baseName),
        path.join(process.cwd(), "uploads", "documents", baseName),
        path.join(process.cwd(), "server", "uploads", "documents", baseName),
      ];

      let foundPath = null;
      for (const altPath of alternativePaths) {
        console.log(`[getDocumentContent] Trying alternative path: ${altPath}`);
        if (fs.existsSync(altPath)) {
          console.log(
            `[getDocumentContent] File found at alternative path: ${altPath}`
          );
          foundPath = altPath;
          break;
        }
      }

      if (!foundPath) {
        console.log(
          `[getDocumentContent] File not found in any location for document ID ${req.params.id}`
        );
        return res.status(404).json({
          message: "Document file not found on server",
          error: `The file for document ID ${req.params.id} could not be located`,
        });
      }

      filePath = foundPath;
    }

    // Set appropriate content type based on file extension
    let contentType = mimeType || "application/octet-stream";
    const fileExtension = path.extname(filePath).toLowerCase();

    // Map common extensions to proper MIME types
    const mimeTypeMap = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
    };

    if (mimeTypeMap[fileExtension]) {
      contentType = mimeTypeMap[fileExtension];
    }

    console.log(
      `[getDocumentContent] Using content type: ${contentType} for extension ${fileExtension}`
    );

    // Set appropriate headers for inline display
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(fileName)}"`
    );

    // Add cache headers to improve performance
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.setHeader("Expires", new Date(Date.now() + 86400000).toUTCString());

    // Get file stats for Content-Length header
    const stats = fs.statSync(filePath);
    res.setHeader("Content-Length", stats.size);
    console.log(`[getDocumentContent] File size: ${stats.size} bytes`);

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);

    // Handle file stream errors
    fileStream.on("error", (err) => {
      console.log(
        `[getDocumentContent] Error streaming file for preview: ${err.message}`
      );
      if (!res.headersSent) {
        res.status(500).json({
          message: "Error streaming document file",
          error: err.message,
        });
      }
    });

    // Log when streaming is complete
    fileStream.on("end", () => {
      console.log(
        `[getDocumentContent] Successfully streamed document ID ${req.params.id} to client`
      );
    });

    fileStream.pipe(res);
  } catch (error) {
    console.log(`[getDocumentContent] Error: ${error.message}`, error);
    res
      .status(
        error.message === "Document not found" ||
          error.message === "Access denied"
          ? 404
          : 500
      )
      .json({
        message: error.message || "Error fetching document content",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
  }
};

// @desc    Share document
// @route   POST /api/documents/:id/share
// @access  Private
export const shareDocument = async (req, res) => {
  try {
    const result = await documentService.shareDocument(
      req.params.id,
      req.body,
      req.user.id,
      req.user.clientId
    );
    res.json({
      message: "Document shared successfully",
      shares: result,
    });
  } catch (error) {
    console.log("Error in shareDocument:", error);
    res.status(500).json({
      message: error.message || "Error sharing document",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get shared documents
// @route   GET /api/documents/shared
// @access  Private
export const getSharedDocuments = async (req, res) => {
  try {
    const result = await documentService.getSharedDocuments(
      req.user.id,
      req.user.clientId,
      req.query
    );
    res.json(result);
  } catch (error) {
    console.log("Error in getSharedDocuments:", error);
    res.status(500).json({
      message: error.message || "Error fetching shared documents",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Remove document share access
// @route   DELETE /api/documents/shared/:id/access
// @access  Private
export const removeDocumentAccess = async (req, res) => {
  try {
    await documentService.removeDocumentAccess(
      req.params.id,
      req.user.id,
      req.user.clientId
    );
    res.status(204).send();
  } catch (error) {
    console.log("Error in removeDocumentAccess:", error);
    res.status(500).json({
      message: error.message || "Error removing document access",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get document templates
// @route   GET /api/documents/templates
// @access  Private
// export const getDocumentTemplates = async (req, res) => {
//   try {
//     const templates = await documentService.getDocumentTemplates(req.query);
//     res.json(templates);
//   } catch (error) {
//     console.log("Error in getDocumentTemplates:", error);
//     res.status(500).json({
//       message: error.message || "Error fetching document templates",
//       error: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// };

// // @desc    Create document template
// // @route   POST /api/documents/templates
// // @access  Private
// export const createDocumentTemplate = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const template = await documentService.createDocumentTemplate(
//       req.file,
//       req.body,
//       req.user.id,
//       req.user.clientId
//     );
//     res.status(201).json(template);
//   } catch (error) {
//     console.log("Error in createDocumentTemplate:", error);
//     res.status(500).json({
//       message: error.message || "Error creating document template",
//       error: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// };

// // @desc    Get document template by ID
// // @route   GET /api/documents/templates/:id
// // @access  Private
// export const getDocumentTemplateById = asyncHandler(async (req, res) => {
//   const template = await documentService.getDocumentById(
//     req.params.id,
//     req.user.id,
//     req.user.clientId
//   );

//   if (!template.isTemplate) {
//     res.status(400);
//     throw new Error("Document is not a template");
//   }

//   res.status(200).json(template);
// });

// // @desc    Update document template
// // @route   PUT /api/documents/templates/:id
// // @access  Private
// export const updateDocumentTemplate = asyncHandler(async (req, res) => {
//   const updateData = {
//     name: req.body.name,
//     description: req.body.description,
//     category: req.body.category,
//     tags: req.body.tags
//       ? Array.isArray(req.body.tags)
//         ? req.body.tags
//         : typeof req.body.tags === "string"
//           ? JSON.parse(req.body.tags)
//           : []
//       : [],
//     templateCategory: req.body.templateCategory,
//   };

//   const template = await documentService.updateDocument(
//     req.params.id,
//     updateData,
//     req.user.id,
//     req.user.clientId
//   );

//   res.status(200).json({
//     message: "Document template updated successfully",
//     template,
//   });
// });

// // @desc    Delete document template
// // @route   DELETE /api/documents/templates/:id
// // @access  Private
// export const deleteDocumentTemplate = asyncHandler(async (req, res) => {
//   const result = await documentService.deleteDocument(
//     req.params.id,
//     req.user.id,
//     req.user.clientId
//   );

//   res.status(200).json(result);
// });

// // @desc    Use document template
// // @route   POST /api/documents/templates/:id/use
// // @access  Private
// export const useDocumentTemplate = asyncHandler(async (req, res) => {
//   // This would create a new document based on the template
//   // For now, we'll return a placeholder response
//   res.status(200).json({
//     message: "Document template used successfully",
//   });
// });

// @desc    Get document categories
// @route   GET /api/documents/categories
// @access  Private
export const getDocumentCategories = async (req, res) => {
  try {
    const categories = await documentService.getDocumentCategories(
      req.user.clientId
    );
    res.json(categories);
  } catch (error) {
    console.log("Error in getDocumentCategories:", error);
    res.status(500).json({
      message: error.message || "Error fetching document categories",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Create document category
// @route   POST /api/documents/categories
// @access  Private
export const createDocumentCategory = async (req, res) => {
  try {
    const category = await documentService.createDocumentCategory(
      req.body,
      req.user.clientId
    );
    res.status(201).json(category);
  } catch (error) {
    console.log("Error in createDocumentCategory:", error);
    res.status(500).json({
      message: error.message || "Error creating document category",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get document tags
// @route   GET /api/documents/tags
// @access  Private
export const getDocumentTags = async (req, res) => {
  try {
    const tags = await documentService.getDocumentTags(req.user.clientId);
    res.json(tags);
  } catch (error) {
    console.log("Error in getDocumentTags:", error);
    res.status(500).json({
      message: error.message || "Error fetching document tags",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get document uploaders
// @route   GET /api/documents/uploaders
// @access  Private
export const getDocumentUploaders = asyncHandler(async (req, res) => {
  const uploaders = await documentService.getDocumentUploaders(
    req.user.clientId
  );
  res.status(200).json({
    uploaders: Array.isArray(uploaders) ? uploaders : [],
  });
});

// @desc    Create document tag
// @route   POST /api/documents/tags
// @access  Private
export const createDocumentTag = async (req, res) => {
  try {
    const tag = await documentService.createDocumentTag(
      req.body,
      req.user.clientId
    );
    res.status(201).json(tag);
  } catch (error) {
    console.log("Error in createDocumentTag:", error);
    res.status(500).json({
      message: error.message || "Error creating document tag",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get document versions
// @route   GET /api/documents/:id/versions
// @access  Private
export const getDocumentVersions = asyncHandler(async (req, res) => {
  const versions = await documentService.getDocumentVersions(
    req.params.id,
    req.user.id,
    req.user.clientId
  );
  res.status(200).json({
    versions: Array.isArray(versions) ? versions : [],
  });
});

// @desc    Create new document version
// @route   POST /api/documents/:id/versions
// @access  Private
export const createDocumentVersion = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const version = await documentService.createDocumentVersion(
    req.params.id,
    req.file,
    req.user.id,
    req.user.clientId
  );

  res.status(201).json({
    message: "Document version created successfully",
    version,
  });
});

// @desc    Get document statistics
// @route   GET /api/documents/stats
// @access  Private
export const getDocumentStats = async (req, res) => {
  try {
    const stats = await documentService.getDocumentStats(req.user.clientId);
    res.json(stats);
  } catch (error) {
    console.log("Error in getDocumentStats:", error);
    res.status(500).json({
      message: error.message || "Error fetching document statistics",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Search documents
// @route   GET /api/documents/search
// @access  Private
export const searchDocuments = async (req, res) => {
  try {
    const documents = await documentService.searchDocuments(
      req.query.q,
      req.query.filters,
      req.user.clientId,
      req.query
    );
    res.json(documents);
  } catch (error) {
    console.log("Error in searchDocuments:", error);
    res.status(500).json({
      message: error.message || "Error searching documents",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get document activity
// @route   GET /api/documents/:id/activity
// @access  Private
export const getDocumentActivity = async (req, res) => {
  try {
    const activity = await documentService.getDocumentActivity(
      req.params.id,
      req.user.id,
      req.user.clientId
    );
    res.json(activity);
  } catch (error) {
    console.log("Error in getDocumentActivity:", error);
    res.status(500).json({
      message: error.message || "Error fetching document activity",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Bulk upload documents
// @route   POST /api/documents/bulk-upload
// @access  Private
export const bulkUploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const documents = await documentService.bulkUploadDocuments(
      req.files,
      req.body,
      req.user.id,
      req.user.clientId
    );
    res.status(201).json(documents);
  } catch (error) {
    console.log("Error in bulkUploadDocuments:", error);
    res.status(500).json({
      message: error.message || "Error uploading documents",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Export documents
// @route   GET /api/documents/export
// @access  Private
export const exportDocuments = async (req, res) => {
  try {
    const result = await documentService.exportDocuments(
      req.query.format,
      req.query.filters,
      req.user.clientId
    );
    res.json(result);
  } catch (error) {
    console.log("Error in exportDocuments:", error);
    res.status(500).json({
      message: error.message || "Error exporting documents",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Preview document
// @route   GET /api/documents/:id/preview
// @access  Private
export const previewDocument = async (req, res) => {
  try {
    const { filePath, fileName, mimeType } =
      await documentService.downloadDocument(
        req.params.id,
        req.user.id,
        req.user.clientId
      );
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    return res.sendFile(filePath, { root: "." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Get documents for a candidate with optional category/tags
// @route   GET /api/documents/candidate-documents
// @access  Private
export const getCandidateDocuments = async (req, res) => {
  try {
    const { candidateId, categoryId, tags } = req.query;
    if (!candidateId) {
      return res.status(400).json({ message: "candidateId is required" });
    }
    // tags can be comma-separated string or array
    let tagArr = [];
    if (tags) {
      if (Array.isArray(tags)) tagArr = tags;
      else if (typeof tags === "string")
        tagArr = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
    }
    const filters = {
      candidateId: Number(candidateId),
      categoryId: categoryId ? Number(categoryId) : undefined,
      tags: tagArr.length > 0 ? tagArr : undefined,
    };
    const documents = await candidateService.getCandidateDocuments(filters);
    res.json({ documents });
  } catch (error) {
    console.log("Error in getCandidateDocuments:", error);
    res.status(500).json({
      message: error.message || "Error fetching candidate documents",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get all candidates for document filter dropdown
// @route   GET /api/documents/candidate-list
// @access  Private
export const getCandidateList = async (req, res) => {
  try {
    const candidates = await candidateService.getAllCandidates();
    res.json({ candidates });
  } catch (error) {
    console.log("Error in getCandidateList:", error);
    res.status(500).json({
      message: error.message || "Error fetching candidate list",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get all companies for document filter dropdown
// @route   GET /api/documents/company-list
// @access  Private
export const getCompanyList = async (req, res) => {
  try {
    const companies = await documentRepository.getCompanyList();
    res.json({ companies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get documents for a company with optional category/tags
// @route   GET /api/documents/company-documents
// @access  Private
export const getCompanyDocuments = async (req, res) => {
  try {
    const { companyId, categoryId, tags } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }
    let tagArr = [];
    if (tags) {
      if (Array.isArray(tags)) tagArr = tags;
      else if (typeof tags === "string")
        tagArr = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
    }
    const docs = await documentRepository.getCompanyDocuments({
      companyId,
      categoryId,
      tags: tagArr,
    });
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
