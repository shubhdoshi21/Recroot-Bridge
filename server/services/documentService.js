import {
  Document,
  User,
  DocumentCategory,
  DocumentTag,
  DocumentTagMap,
  DocumentShare,
  DocumentVersion,
  DocumentActivity,
  CompanyDocument,
} from "../models/index.js";
import { Client } from "../models/Client.js";
import { Op } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { incrementDownloadCount } from "../repositories/documentRepository.js";
import {
  sendDocumentShareEmail,
  sendTeamDocumentShareEmail,
  sendUserDocumentShareEmail,
} from "./emailService.js";
import { TeamMember } from "../models/TeamMember.js";
import { Recruiter } from "../models/Recruiter.js";
import { Team } from "../models/Team.js";
import { sendMail as sendGmailMail } from "../repositories/gmailRepository.js";
import { transporter } from "./emailService.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/documents";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// Helper function to get user name by ID
const getUserNameById = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ["fullName"],
      raw: true,
    });
    return user ? user.fullName : null;
  } catch (error) {
    console.log(`Error fetching user ${userId}:`, error);
    return null;
  }
};

// Helper function to get file type from MIME type
export const getFileType = (mimeType) => {
  const typeMap = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "text/plain": "txt",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/webp": "webp",
    // Add more as needed
  };
  if (typeMap[mimeType]) return typeMap[mimeType];
  if (mimeType && mimeType.startsWith("image/")) return "image";
  return "other";
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  // Handle null, undefined, or invalid inputs
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return "Unknown size";
  }

  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to get or create category
const getOrCreateCategory = async (categoryName, clientId) => {
  if (!categoryName) return null;

  // Handle if categoryName is an object
  if (typeof categoryName === "object") {
    if (categoryName.id) {
      // If we have an ID, try to find the category directly
      const existingCategory = await DocumentCategory.findOne({
        where: {
          id: categoryName.id,
          isActive: true,
          [Op.or]: [
            { clientId },
            { clientId: null }, // Global categories
          ],
        },
      });

      if (existingCategory) {
        return {
          id: existingCategory.id,
          name: existingCategory.name,
          color: existingCategory.color || "#6B7280",
          icon: existingCategory.icon || "file",
          isDefault: existingCategory.isDefault || false,
          isActive: existingCategory.isActive,
        };
      }
    }

    // If we have a name property, use it
    if (categoryName.name) {
      categoryName = categoryName.name;
    } else {
      // If we can't extract a usable name, return null
      return null;
    }
  }

  // First try to find an existing category
  let category = await DocumentCategory.findOne({
    where: {
      name: categoryName,
      isActive: true,
      [Op.or]: [
        { clientId },
        { clientId: null }, // Global categories
      ],
    },
    order: [
      ["clientId", "DESC"], // Prefer client-specific categories over global ones
    ],
  });

  if (!category) {
    // If no category exists, create a new one
    category = await DocumentCategory.create({
      name: categoryName,
      description: `Category for ${categoryName}`,
      color: "#6B7280", // Default color
      icon: "file", // Default icon
      clientId, // Create as client-specific category
      isDefault: false,
      isActive: true,
    });
  }

  // Always return the full category object with all required fields
  return {
    id: category.id,
    name: category.name,
    color: category.color || "#6B7280",
    icon: category.icon || "file",
    isDefault: category.isDefault || false,
    isActive: category.isActive,
  };
};

// Helper function to get or create tags
const getOrCreateTags = async (tagNames = [], clientId) => {
  try {
    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      return [];
    }

    // Normalize tag names to array of strings
    const normalizedTagNames = tagNames
      .map((tag) => {
        // Handle string tags
        if (typeof tag === "string") return tag.trim();
        // Handle object tags with name property (from frontend selects)
        if (tag && typeof tag === "object" && tag.name) return tag.name.trim();
        // Handle object tags that are full tag objects
        if (tag && typeof tag === "object" && tag.id)
          return tag.name ? tag.name.trim() : null;
        return null;
      })
      .filter(Boolean) // Remove null/undefined/empty strings
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    if (normalizedTagNames.length === 0) {
      return [];
    }

    // Find existing tags
    const existingTags = await DocumentTag.findAll({
      where: {
        name: {
          [Op.in]: normalizedTagNames,
        },
        clientId,
        isActive: true,
      },
    });

    // Get names of tags that need to be created
    const existingTagNames = existingTags.map((tag) => tag.name);
    const tagsToCreate = normalizedTagNames.filter(
      (name) => !existingTagNames.includes(name)
    );

    const createdTags = [];
    for (const name of tagsToCreate) {
      try {
        const tag = await DocumentTag.create({
          name,
          clientId,
          isActive: true,
          color: "#6B7280",
        });
        createdTags.push(tag);
      } catch (err) {
        // If unique constraint error, fetch the tag instead
        if (err.name === "SequelizeUniqueConstraintError") {
          const tag = await DocumentTag.findOne({
            where: { name, clientId, isActive: true },
          });
          if (tag) createdTags.push(tag);
        } else {
          throw err;
        }
      }
    }

    return [...existingTags, ...createdTags];
  } catch (error) {
    console.log("Error in getOrCreateTags:", error);
    // Return empty array instead of throwing to prevent cascade failures
    return [];
  }
};

// Get all documents with filtering and pagination
export const getAllDocuments = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "uploadedAt",
    order = "DESC",
    documentType,
    category,
    tags,
    uploadedBy,
    dateFrom,
    dateTo,
    searchQuery,
    clientId,
    isTemplate = false,
  } = options;

  const offset = (page - 1) * limit;
  const whereClause = {
    isActive: true,
    clientId,
    isTemplate,
  };

  // Add filters
  if (documentType && documentType !== "all") {
    whereClause.fileType = documentType;
  }

  if (category) {
    // Find category by name
    const categoryRecord = await DocumentCategory.findOne({
      where: {
        name: category,
        [Op.or]: [{ clientId }, { clientId: null }],
      },
    });
    if (categoryRecord) {
      whereClause.categoryId = categoryRecord.id;
    }
  }

  if (uploadedBy) {
    // Check if uploadedBy is a user ID (number) or user name (string)
    const userId = parseInt(uploadedBy, 10);
    if (!isNaN(userId)) {
      // It's a valid user ID
      whereClause.uploadedBy = userId;
    } else {
      // It's a user name, find the user ID
      const user = await User.findOne({
        where: {
          fullName: uploadedBy,
          clientId,
        },
        attributes: ["id"],
      });
      if (user) {
        whereClause.uploadedBy = user.id;
      } else {
        // If user not found, return empty results
        whereClause.uploadedBy = -1; // This will return no results
      }
    }
  }

  if (dateFrom || dateTo) {
    whereClause.uploadedAt = {};
    if (dateFrom) whereClause.uploadedAt[Op.gte] = new Date(dateFrom);
    if (dateTo) whereClause.uploadedAt[Op.lte] = new Date(dateTo);
  }

  if (searchQuery) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
      { description: { [Op.like]: `%${searchQuery}%` } },
    ];
  }

  // Add tag filter using subquery if specified
  if (tags && tags.length > 0) {
    const tagRecords = await DocumentTag.findAll({
      where: {
        name: { [Op.in]: tags },
        [Op.or]: [{ clientId }, { clientId: null }],
      },
    });

    if (tagRecords.length > 0) {
      const tagIds = tagRecords.map((tag) => tag.id);
      whereClause.id = {
        [Op.in]: sequelize.literal(`(
                    SELECT DISTINCT dtm.documentId 
                    FROM document_tag_maps dtm 
                    WHERE dtm.tagId IN (${tagIds.join(",")})
                )`),
      };
    }
  }

  const includeOptions = [
    {
      model: User,
      as: "uploader",
      attributes: ["id", "fullName", "email"],
      required: false,
    },
    {
      model: DocumentCategory,
      as: "category",
      attributes: ["id", "name", "color", "icon", "isDefault", "isActive"],
      required: false,
    },
    {
      model: DocumentTag,
      as: "tags",
      attributes: ["id", "name", "color"],
      through: { attributes: [] }, // Don't include join table attributes
      required: false,
    },
    {
      model: CompanyDocument,
      as: "CompanyDocuments",
      attributes: ["companyId"],
      required: false,
    },
  ];

  const { count, rows } = await Document.findAndCountAll({
    where: whereClause,
    include: includeOptions,
    order: [[sortBy, order]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    distinct: true, // Important for correct count with associations
  });

  // Format the response
  const documents = await Promise.all(
    rows.map(async (doc) => {
      // Handle cases where uploader might be null or undefined
      let uploadedByValue = "Unknown";
      if (doc.uploader && doc.uploader.fullName) {
        uploadedByValue = doc.uploader.fullName;
      } else if (doc.uploadedBy) {
        const userName = await getUserNameById(doc.uploadedBy);
        uploadedByValue = userName || `User ID: ${doc.uploadedBy}`;
      }

      // Prepare category fields for frontend mapping
      let categoryObj = null;
      let categoryName = "Uncategorized";
      if (doc.category) {
        categoryObj = {
          id: doc.category.id,
          name: doc.category.name,
          color: doc.category.color || "#6B7280",
          icon: doc.category.icon || "file",
          isDefault: doc.category.isDefault || false,
          isActive: doc.category.isActive,
        };
        categoryName = doc.category.name;
      }

      // Handle tags - ensure we get all tags, not just filtered ones
      let documentTags = [];
      let documentTagIds = [];

      // If we have tags from the association, use them
      if (doc.tags && Array.isArray(doc.tags)) {
        documentTags = doc.tags.map((tag) => tag.name);
        documentTagIds = doc.tags.map((tag) => tag.id);
      }

      return {
        id: doc.id,
        name: doc.name,
        description: doc.description,
        fileName: doc.fileName,
        originalName: doc.originalName,
        filePath: doc.filePath,
        fileSize: formatFileSize(doc.fileSize),
        mimeType: doc.mimeType,
        fileType: doc.fileType,
        category: categoryObj, // full object for selects that expect object
        categoryId: doc.categoryId, // for selects that expect id
        categoryName, // for selects that expect name
        tags: documentTags,
        tagIds: documentTagIds,
        visibility: doc.visibility,
        version: doc.version,
        isTemplate: doc.isTemplate,
        templateCategory: doc.templateCategory,
        uploadedBy: uploadedByValue,
        uploadedAt: doc.uploadedAt,
        updatedAt: doc.updatedAt,
        downloadCount: doc.downloadCount,
        viewCount: doc.viewCount,
        isCompanyDocument:
          doc.CompanyDocuments && doc.CompanyDocuments.length > 0,
      };
    })
  );

  return {
    documents,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
  };
};

// Get document by ID
export const getDocumentById = async (id, userId, clientId) => {
  const document = await Document.findOne({
    where: {
      id,
      clientId,
      isActive: true,
    },
    include: [
      {
        model: User,
        as: "uploader",
        attributes: ["id", "fullName", "email"],
        required: false,
      },
      {
        model: DocumentCategory,
        as: "category",
        attributes: ["id", "name", "color", "icon", "isDefault", "isActive"],
        required: false,
      },
      {
        model: DocumentTag,
        as: "tags",
        attributes: ["id", "name", "color"],
        through: { attributes: [] },
        required: false,
      },
    ],
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Check if user has access
  const hasAccess = await checkDocumentAccess(document, userId);
  if (!hasAccess) {
    throw new Error("Access denied");
  }

  // Record view activity
  await recordDocumentActivity(document.id, userId, "view");
  await document.increment("viewCount");

  // Always get the uploader's name, either from the included relation or by fetching it
  let uploadedByValue = "Unknown User";
  if (document.uploader && document.uploader.fullName) {
    uploadedByValue = document.uploader.fullName;
  } else if (document.uploadedBy) {
    const userName = await getUserNameById(document.uploadedBy);
    uploadedByValue = userName || "Unknown User";
  }

  // Prepare category fields for frontend mapping
  let categoryObj = null;
  let categoryName = "Uncategorized";
  if (document.category) {
    categoryObj = {
      id: document.category.id,
      name: document.category.name,
      color: document.category.color || "#6B7280",
      icon: document.category.icon || "file",
      isDefault: document.category.isDefault || false,
      isActive: document.category.isActive,
    };
    categoryName = document.category.name;
  }

  // Handle tags - ensure we get all tags
  let documentTags = [];
  let documentTagIds = [];

  // If we have tags from the association, use them
  if (document.tags && Array.isArray(document.tags)) {
    documentTags = document.tags.map((tag) => tag.name);
    documentTagIds = document.tags.map((tag) => tag.id);
  }

  return {
    id: document.id,
    name: document.name,
    description: document.description,
    fileName: document.fileName,
    originalName: document.originalName,
    filePath: document.filePath,
    fileSize: formatFileSize(document.fileSize), // Format file size consistently
    mimeType: document.mimeType,
    fileType: document.fileType,
    category: categoryObj, // full object for selects that expect object
    categoryId: document.categoryId, // for selects that expect id
    categoryName, // for selects that expect name
    tags: documentTags,
    tagIds: documentTagIds,
    visibility: document.visibility,
    version: document.version,
    isTemplate: document.isTemplate,
    templateCategory: document.templateCategory,
    uploadedBy: uploadedByValue, // Always use the name, not the ID
    uploadedAt: document.uploadedAt,
    updatedAt: document.updatedAt,
    downloadCount: document.downloadCount,
    viewCount: document.viewCount,
  };
};

// Upload new document
export const uploadDocument = async (file, documentData, userId, clientId) => {
  const {
    name,
    description,
    category,
    categoryId: providedCategoryId,
    tags,
    visibility,
    isTemplate = false,
    templateCategory,
  } = documentData;

  const fileType = getFileType(file.mimetype);
  console.log(
    "Uploading file:",
    file.originalname,
    "| MIME type:",
    file.mimetype,
    "| Normalized fileType:",
    fileType
  );
  const fileName = file.filename;
  const filePath = file.path;
  const fileSize =
    file.size && !isNaN(file.size) && file.size >= 0 ? file.size : 0;
  const mimeType = file.mimetype;

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Handle category - prioritize categoryId if provided, otherwise use category name/object
    let categoryId = null;
    if (providedCategoryId) {
      // Use categoryId directly if provided (like company documents)
      categoryId = parseInt(providedCategoryId, 10);
      if (isNaN(categoryId)) {
        categoryId = null;
      }
    } else if (category) {
      // Fallback to get or create by name/object (existing logic)
      let categoryToUse = category;
      if (typeof category === "string" && category.startsWith("{")) {
        try {
          categoryToUse = JSON.parse(category);
        } catch (e) {
          console.log("Failed to parse category JSON:", e);
        }
      }

      const categoryRecord = await getOrCreateCategory(categoryToUse, clientId);
      categoryId = categoryRecord ? categoryRecord.id : null;
    }

    // Create document
    const document = await Document.create(
      {
        name: name || file.originalname,
        description: description || "",
        fileName,
        originalName: file.originalname,
        filePath,
        fileSize,
        mimeType,
        fileType,
        categoryId,
        visibility: visibility || "private",
        version: 1,
        isTemplate,
        templateCategory,
        uploadedBy: userId,
        clientId,
        downloadCount: 0,
        viewCount: 0,
        isActive: true,
      },
      { transaction }
    );

    // Process tags - handle different formats
    let tagsToUse = tags;
    if (typeof tags === "string") {
      try {
        tagsToUse = JSON.parse(tags);
      } catch (e) {
        // If it's not valid JSON, treat it as a comma-separated string
        tagsToUse = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    }

    // Get or create tags and associate them
    if (
      tagsToUse &&
      (Array.isArray(tagsToUse) || typeof tagsToUse === "string") &&
      tagsToUse.length > 0
    ) {
      const tagRecords = await getOrCreateTags(
        Array.isArray(tagsToUse) ? tagsToUse : [tagsToUse],
        clientId
      );

      // Create tag associations
      for (const tag of tagRecords) {
        await DocumentTagMap.create(
          {
            documentId: document.id,
            tagId: tag.id,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    // Record upload activity
    await recordDocumentActivity(document.id, userId, "upload");

    // Return the document with its associations
    return await Document.findByPk(document.id, {
      include: [
        {
          model: DocumentCategory,
          as: "category",
          attributes: ["id", "name", "color", "icon"],
        },
        {
          model: DocumentTag,
          as: "tags",
          attributes: ["id", "name", "color"],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "uploader",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Update document metadata
export const updateDocument = async (id, updateData, userId, clientId) => {
  // Validate and parse document ID
  const documentId = parseInt(id, 10);
  if (isNaN(documentId)) {
    throw new Error("Invalid document ID");
  }

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Find the document
    const document = await Document.findOne({
      where: {
        id: documentId,
        clientId,
        isActive: true,
      },
      transaction,
    });

    if (!document) {
      await transaction.rollback();
      throw new Error("Document not found");
    }

    // Check edit permission
    const hasEditPermission = await checkDocumentEditPermission(
      document,
      userId
    );
    if (!hasEditPermission) {
      await transaction.rollback();
      throw new Error("You don't have permission to edit this document");
    }

    // Map frontend fields to backend fields for DocumentShare
    if ("accessLevel" in updateData) {
      updateData.permission = updateData.accessLevel;
      delete updateData.accessLevel;
    }
    if ("visibility" in updateData) {
      updateData.shareType = mapVisibilityToShareType(updateData.visibility);
      delete updateData.visibility;
    }

    // Debug log for updateData
    console.log("Updating document", documentId, "with:", updateData);

    // Remove uploadedBy from updateData if present (should only be set to a user ID, not a name)
    if ("uploadedBy" in updateData) {
      delete updateData.uploadedBy;
    }

    // Process tags if provided
    if (updateData.tags) {
      const tags = await getOrCreateTags(updateData.tags, clientId);
      await DocumentTagMap.destroy({
        where: { documentId: document.id },
        transaction,
      });

      if (tags.length > 0) {
        await DocumentTagMap.bulkCreate(
          tags.map((tag) => ({
            documentId: document.id,
            tagId: tag.id,
          })),
          { transaction }
        );
      }
    }

    // Process category if provided
    if (updateData.categoryId) {
      // Use categoryId directly if provided (like company documents)
      const categoryId = parseInt(updateData.categoryId, 10);
      if (!isNaN(categoryId)) {
        updateData.categoryId = categoryId;
      } else {
        delete updateData.categoryId;
      }
    } else if (updateData.category) {
      // Fallback to get or create by name/object (existing logic)
      let categoryName = updateData.category;

      // Handle if category is an object with name property
      if (typeof updateData.category === "object" && updateData.category.name) {
        categoryName = updateData.category.name;
      }

      const category = await getOrCreateCategory(categoryName, clientId);
      if (category) {
        updateData.categoryId = category.id;
      }
      delete updateData.category;
    }

    // Update document
    await document.update(updateData, { transaction });

    // Determine which sharedWith value to use for the update
    const whereClause = { documentId: documentId };

    if (updateData.shareType === "team") {
      // For team shares, we need to update all shares associated with that team
      whereClause.teamId = updateData.teamId || document.teamId;
    } else {
      // For user shares, update the specific user's share record
      let sharedWithToUpdate = userId;
      if (updateData.sharedWithId) {
        sharedWithToUpdate = updateData.sharedWithId;
      } else if (updateData.sharedWith) {
        if (Array.isArray(updateData.sharedWith)) {
          sharedWithToUpdate = updateData.sharedWith[0];
        } else {
          sharedWithToUpdate = updateData.sharedWith;
        }
      }
      whereClause.sharedWith = sharedWithToUpdate;
    }

    // Update DocumentShare for this document and user (sharedBy or sharedWith)
    const shareUpdateFields = {};
    if (updateData.permission)
      shareUpdateFields.permission = updateData.permission;
    if (updateData.shareType)
      shareUpdateFields.shareType = updateData.shareType;
    if (updateData.notes !== undefined)
      shareUpdateFields.notes = updateData.notes;
    // Add other DocumentShare fields as needed

    if (Object.keys(shareUpdateFields).length > 0) {
      await DocumentShare.update(shareUpdateFields, {
        where: whereClause,
        transaction,
      });
    }

    // Record activity
    await recordDocumentActivity(
      document.id,
      userId,
      "edit",
      "Document updated",
      { transaction }
    );

    await transaction.commit();

    // Return updated document with associations
    return await Document.findByPk(document.id, {
      include: [
        {
          model: DocumentCategory,
          as: "category",
          attributes: ["id", "name", "color", "icon"],
        },
        {
          model: DocumentTag,
          as: "tags",
          attributes: ["id", "name", "color"],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "uploader",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.log("Rollback failed:", rollbackError);
    }
    console.log("Error in updateDocument:", error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (id, userId, clientId) => {
  const document = await Document.findOne({
    where: {
      id,
      clientId,
      isActive: true,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Check if user has delete permission
  const hasDeletePermission = await checkDocumentDeletePermission(
    document,
    userId
  );
  if (!hasDeletePermission) {
    throw new Error("Delete permission denied");
  }

  // Start a transaction to ensure data consistency
  const transaction = await sequelize.transaction();

  try {
    // Helper function to safely delete file
    const safeDeleteFile = (filePath) => {
      if (!filePath) return;

      try {
        // Try the stored path as-is
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted file: ${filePath}`);
          return;
        }

        // Try with uploads/documents prefix
        const uploadsPath = path.join(
          "uploads",
          "documents",
          path.basename(filePath)
        );
        if (fs.existsSync(uploadsPath)) {
          fs.unlinkSync(uploadsPath);
          console.log(`✅ Deleted file: ${uploadsPath}`);
          return;
        }

        // Try with server/uploads/documents prefix
        const serverPath = path.join(
          "server",
          "uploads",
          "documents",
          path.basename(filePath)
        );
        if (fs.existsSync(serverPath)) {
          fs.unlinkSync(serverPath);
          console.log(`✅ Deleted file: ${serverPath}`);
          return;
        }

        // Try with absolute path resolution
        const absolutePath = path.resolve(filePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log(`✅ Deleted file: ${absolutePath}`);
          return;
        }

        console.log(`⚠️ File not found for deletion: ${filePath}`);
      } catch (error) {
        console.log(`❌ Error deleting file ${filePath}:`, error.message);
      }
    };

    // Delete physical file if it exists
    safeDeleteFile(document.filePath);

    // Delete document versions and their physical files
    const versions = await DocumentVersion.findAll({
      where: { documentId: document.id },
      transaction,
    });

    for (const version of versions) {
      safeDeleteFile(version.filePath);
    }

    // Delete related records
    await DocumentShare.destroy({
      where: { documentId: document.id },
      transaction,
    });

    await DocumentVersion.destroy({
      where: { documentId: document.id },
      transaction,
    });

    await DocumentActivity.destroy({
      where: { documentId: document.id },
      transaction,
    });

    // Delete tag associations
    await DocumentTagMap.destroy({
      where: { documentId: document.id },
      transaction,
    });

    // Finally, delete the document record
    await document.destroy({ transaction });

    // Commit the transaction
    await transaction.commit();

    console.log(`✅ Document ${document.id} deleted successfully`);
    return { message: "Document deleted successfully" };
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    console.log(`❌ Failed to delete document ${document.id}:`, error.message);
    throw new Error(`Failed to delete document: ${error.message}`);
  }
};

// Download document
export const downloadDocument = async (id, userId, clientId) => {
  const document = await Document.findOne({
    where: {
      id,
      clientId,
      isActive: true,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Check if user has access
  const hasAccess = await checkDocumentAccess(document, userId);
  if (!hasAccess) {
    throw new Error("Access denied");
  }

  // Increment download count using repository function which preserves fields
  await incrementDownloadCount(document.id);

  // Record download activity
  await recordDocumentActivity(document.id, userId, "download");

  // Check if the file exists and resolve the correct path
  let filePath = document.filePath;
  let fileExists = false;

  // Try different path variations to find the file
  const pathsToTry = [
    document.filePath, // Original path
    path.join("uploads", "documents", path.basename(filePath)), // uploads/documents/filename
    path.join("server", "uploads", "documents", path.basename(filePath)), // server/uploads/documents/filename
    path.resolve(path.basename(filePath)), // Absolute path resolution
    path.join(process.cwd(), document.filePath), // Current working directory + path
    path.join(process.cwd(), "uploads", "documents", path.basename(filePath)), // CWD + uploads/documents/filename
    path.join(
      process.cwd(),
      "server",
      "uploads",
      "documents",
      path.basename(filePath)
    ), // CWD + server/uploads/documents/filename
  ];

  console.log("Trying to find file at these paths:");
  for (const pathToTry of pathsToTry) {
    console.log(`- Checking: ${pathToTry}`);
    if (fs.existsSync(pathToTry)) {
      console.log(`✅ File found at: ${pathToTry}`);
      filePath = pathToTry;
      fileExists = true;
      break;
    }
  }

  if (!fileExists) {
    console.log(
      `❌ File not found for document ID ${id} with filename ${document.fileName}`
    );
    throw new Error(
      `File not found for document: ${document.name}. Please contact support.`
    );
  }

  return {
    filePath,
    fileName: document.originalName || document.fileName,
    mimeType: document.mimeType,
  };
};

// Share document
export const shareDocument = async (
  documentId,
  shareData,
  userId,
  clientId
) => {
  const { recipients = [], teamIds = [], permission, notes } = shareData;

  const document = await Document.findOne({
    where: {
      id: documentId,
      clientId,
      isActive: true,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Check if user has share permission
  const hasSharePermission = await checkDocumentSharePermission(
    document,
    userId
  );
  if (!hasSharePermission) {
    throw new Error("Share permission denied");
  }

  // Get sender's name and email
  const sender = await User.findByPk(userId);
  const senderName = sender ? sender.fullName || sender.email : "A user";
  const senderEmail = sender ? sender.email : undefined;
  const documentName = document.name;
  const shareLink = `${process.env.CLIENT_URL || "https://app.recrootbridge.com"}/documents/${documentId}`;

  const shares = [];

  // --- TEAM SHARING ---
  for (const teamId of teamIds) {
    const teamMembers = await TeamMember.findAll({
      where: { teamId },
      include: [
        {
          model: Recruiter,
          include: [{ model: User, attributes: ["id", "email", "fullName"] }],
        },
      ],
    });
    const { Team } = await import("../models/Team.js");
    const team = await Team.findByPk(teamId);
    const teamName = team ? team.name : `Team #${teamId}`;
    for (const member of teamMembers) {
      const memberUserId = member.Recruiter?.User?.id;
      const memberUserEmail = member.Recruiter?.User?.email;
      const memberUserFullName = member.Recruiter?.User?.fullName;
      if (!memberUserId || !memberUserEmail) continue;
      const alreadyShared = await DocumentShare.findOne({
        where: { documentId, sharedWith: memberUserId, isActive: true },
      });
      if (!alreadyShared) {
        const share = await DocumentShare.create({
          documentId,
          sharedBy: userId,
          sharedWith: memberUserId,
          teamId: teamId,
          permission,
          shareType: "team",
          notes,
          isActive: true,
        });
        shares.push(share);
        try {
          await sendTeamDocumentShareEmail({
            recipientEmail: memberUserEmail,
            recipientName: memberUserFullName,
            teamName,
            documentName,
            documentDescription: document.description || "",
            documentTags: document.tags || [],
            senderName,
            shareLink,
            message: notes || "",
          });
        } catch (err) {
          console.log(
            "Failed to send team share email to",
            memberUserEmail,
            err
          );
        }
      }
    }
  }

  // --- USER/EMAIL SHARING ---
  for (const recipient of recipients) {
    if (typeof recipient === "string" && recipient.includes("@")) {
      // Email: send notification only
      try {
        await sendDocumentShareEmail(
          recipient,
          documentName,
          senderName,
          shareLink,
          notes || ""
        );
      } catch (err) {
        console.log("Failed to send document share email to", recipient, err);
      }
    } else {
      // User ID
      const user = await User.findByPk(recipient);
      if (user && user.email) {
        const alreadyShared = await DocumentShare.findOne({
          where: { documentId, sharedWith: recipient, isActive: true },
        });
        if (!alreadyShared) {
          const share = await DocumentShare.create({
            documentId,
            sharedBy: userId,
            sharedWith: recipient,
            teamId: null,
            permission,
            shareType: "user",
            notes,
            isActive: true,
          });
          shares.push(share);
          try {
            await sendUserDocumentShareEmail({
              recipientEmail: user.email,
              recipientName: user.fullName,
              documentName,
              documentDescription: document.description || "",
              documentTags: document.tags || [],
              senderName,
              shareLink,
              message: notes || "",
            });
          } catch (err) {
            console.log("Failed to send user document share email to", user.email, err);
          }
        }
      }
    }
  }

  // Record share activity
  await recordDocumentActivity(documentId, userId, "share", {
    recipients: recipients.length + teamIds.length,
    permission,
  });

  return shares;
};

// Get shared documents
export const getSharedDocuments = async (userId, clientId, options = {}) => {
  clientId = Number(clientId);
  const { type = "shared-with-me", page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  let whereClause = {
    isActive: true,
  };

  if (type === "shared-with-me") {
    whereClause.sharedWith = userId;
  } else if (type === "shared-by-me") {
    whereClause.sharedBy = userId;
  }

  // Add debug log
  // console.log('getSharedDocuments:', { userId, clientId, whereClause });

  const { count, rows } = await DocumentShare.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Document,
        as: "Document",
        required: true,
        where: { clientId, isActive: true },
        include: [
          {
            model: User,
            as: "uploader",
            attributes: ["id", "fullName", "email"],
            required: false,
          },
          {
            model: DocumentCategory,
            as: "category",
            attributes: ["id", "name", "color", "icon"],
            required: false,
          },
          {
            model: DocumentTag,
            as: "tags",
            attributes: ["id", "name", "color"],
            through: { attributes: [] },
            required: false,
          },
        ],
      },
      {
        model: User,
        as: "sharer",
        attributes: ["id", "fullName", "email"],
      },
      {
        model: User,
        as: "recipient",
        attributes: ["id", "fullName", "email"],
      },
      {
        model: Team,
        as: "team",
        required: false,
        include: [
          {
            model: TeamMember,
            as: "TeamMembers",
            required: false,
            include: [
              {
                model: Recruiter,
                as: "Recruiter",
                required: false,
                include: [
                  {
                    model: User,
                    as: "User",
                    required: false,
                    attributes: ["id", "fullName", "email"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [["sharedAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Add detailed log for debugging
  // console.log('rows:', rows.map(r => ({
  //     documentId: r.documentId,
  //     document: r.Document,
  //     clientId: r.Document ? r.Document.clientId : null,
  //     isActive: r.Document ? r.Document.isActive : null,
  // })));

  // Add debug log for results
  console.log(
    "Found shares:",
    rows.length,
    rows.map((r) => r.documentId)
  );

  const sharedDocuments = await Promise.all(
    rows.map(async (share) => {
      if (!share.Document) {
        // Optionally log or skip
        console.warn("Skipping share with missing document:", share.documentId);
        return null;
      }
      // Handle cases where associations might fail
      let uploadedByValue = "Unknown User";
      if (share.Document.uploader && share.Document.uploader.fullName) {
        uploadedByValue = share.Document.uploader.fullName;
      } else if (share.Document.uploadedBy) {
        const userName = await getUserNameById(share.Document.uploadedBy);
        uploadedByValue = userName || "Unknown User";
      }

      let sharedByValue = "Unknown User";
      if (share.sharer && share.sharer.fullName) {
        sharedByValue = share.sharer.fullName;
      } else if (share.sharedBy) {
        const userName = await getUserNameById(share.sharedBy);
        sharedByValue = userName || "Unknown User";
      }

      let sharedWithValue = "Unknown User";
      if (share.recipient && share.recipient.fullName) {
        sharedWithValue = share.recipient.fullName;
      } else if (share.sharedWith) {
        const userName = await getUserNameById(share.sharedWith);
        sharedWithValue = userName || "Unknown User";
      }

      // Prepare category fields for frontend mapping
      let categoryObj = null;
      let categoryName = "Uncategorized";
      if (share.Document.category) {
        categoryObj = {
          id: share.Document.category.id,
          name: share.Document.category.name,
          color: share.Document.category.color,
          icon: share.Document.category.icon,
        };
        categoryName = share.Document.category.name;
      }

      // Handle tags - ensure we get all tags
      let documentTags = [];
      let documentTagIds = [];

      // If we have tags from the association, use them
      if (share.Document.tags && Array.isArray(share.Document.tags)) {
        documentTags = share.Document.tags.map((tag) => tag.name);
        documentTagIds = share.Document.tags.map((tag) => tag.id);
      }

      // Add team info for team shares
      let teamId = null;
      let teamName = null;
      let teamMemberIds = [];
      let teamMemberNames = [];
      if (share.team) {
        teamId = share.team.id;
        teamName = share.team.name;
        if (share.team.teamMembers) {
          teamMemberIds = share.team.teamMembers
            .map((tm) =>
              tm.Recruiter && tm.Recruiter.user ? tm.Recruiter.user.id : null
            )
            .filter(Boolean);
          teamMemberNames = share.team.teamMembers
            .map((tm) =>
              tm.Recruiter && tm.Recruiter.user
                ? tm.Recruiter.user.fullName
                : null
            )
            .filter(Boolean);
        }
      }

      return {
        id: share.Document.id,
        name: share.Document.name,
        description: share.Document.description,
        fileType: share.Document.fileType,
        category: categoryObj, // full object for selects that expect object
        categoryId: share.Document.categoryId, // for selects that expect id
        categoryName, // for selects that expect name
        tags: documentTags,
        tagIds: documentTagIds,
        permission: share.permission,
        shareType: share.shareType,
        message: share.notes,
        sharedAt: share.sharedAt,
        sharedBy: sharedByValue,
        sharedWith: sharedWithValue,
        sharedWithId: share.sharedWith,
        uploadedBy: uploadedByValue,
        uploadedAt: share.Document.uploadedAt,
        // Team share info
        teamId,
        teamName,
        teamMemberIds,
        teamMemberNames,
      };
    })
  );

  // Debug logs to check mapping output
  // console.log('sharedDocuments:', sharedDocuments);
  // console.log('filtered:', sharedDocuments.filter(Boolean));

  // TEMP: Return raw rows for debugging
  // return rows;

  return {
    documents: sharedDocuments.filter(Boolean),
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
  };
};

// Get document categories
export const getDocumentCategories = async (clientId) => {
  // Ensure default data exists
  await ensureDefaultData(clientId);

  const categories = await DocumentCategory.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { clientId },
        { clientId: null }, // Global categories
      ],
    },
    order: [["name", "ASC"]],
  });

  return categories;
};

// Create document category
export const createDocumentCategory = async (categoryData, clientId) => {
  const { name, description, color, icon } = categoryData;

  const category = await DocumentCategory.create({
    name,
    description,
    color,
    icon,
    clientId,
  });

  return category;
};

// Get document tags
export const getDocumentTags = async (clientId) => {
  // Ensure default data exists
  await ensureDefaultData(clientId);

  const tags = await DocumentTag.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { clientId },
        { clientId: null }, // Global tags
      ],
    },
    order: [["name", "ASC"]],
  });

  return tags;
};

// Get document uploaders (users who have uploaded documents)
export const getDocumentUploaders = async (clientId) => {
  console.log("Document associations:", Object.keys(Document.associations));
  const uploaders = await Document.findAll({
    where: {
      clientId,
      isActive: true,
    },
    attributes: [
      "id",
      [sequelize.col("uploader.id"), "uploaderId"],
      [sequelize.col("uploader.fullName"), "fullName"],
      [sequelize.col("uploader.email"), "email"],
    ],
    include: [
      {
        model: User,
        as: "uploader",
        attributes: [],
        required: false,
      },
    ],
    group: [
      "Document.id",
      "uploader.id",
      "uploader.fullName",
      "uploader.email",
    ],
  });

  // Filter out null uploaders and format the response, then sort by fullName
  const formattedUploaders = uploaders
    .filter(
      (uploader) =>
        uploader.dataValues.uploaderId && uploader.dataValues.fullName
    )
    .map((uploader) => ({
      id: uploader.dataValues.uploaderId,
      fullName: uploader.dataValues.fullName,
      email: uploader.dataValues.email,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return formattedUploaders;
};

// Ensure default categories and tags exist
export const ensureDefaultData = async (clientId) => {
  // Default categories
  const defaultCategories = [
    {
      name: "Uncategorized",
      description: "Default category for documents",
      color: "#6B7280",
      icon: "file",
    },
    {
      name: "Contracts",
      description: "Legal contracts and agreements",
      color: "#EF4444",
      icon: "file-text",
    },
    {
      name: "Reports",
      description: "Business reports and analytics",
      color: "#3B82F6",
      icon: "bar-chart",
    },
    {
      name: "Policies",
      description: "Company policies and procedures",
      color: "#10B981",
      icon: "shield",
    },
    {
      name: "Templates",
      description: "Document templates",
      color: "#F59E0B",
      icon: "copy",
    },
  ];

  // Default tags
  const defaultTags = [
    { name: "Important", color: "#EF4444" },
    { name: "Draft", color: "#6B7280" },
    { name: "Final", color: "#10B981" },
    { name: "Review", color: "#F59E0B" },
    { name: "Archived", color: "#8B5CF6" },
  ];

  // Create default categories if they don't exist
  for (const category of defaultCategories) {
    await DocumentCategory.findOrCreate({
      where: {
        name: category.name,
        clientId: null, // Global categories
      },
      defaults: {
        ...category,
        isDefault: true,
        isActive: true,
      },
    });
  }

  // Create default tags if they don't exist
  for (const tag of defaultTags) {
    await DocumentTag.findOrCreate({
      where: {
        name: tag.name,
        clientId: null, // Global tags
      },
      defaults: {
        ...tag,
        isActive: true,
      },
    });
  }
};

// Create document tag
export const createDocumentTag = async (tagData, clientId) => {
  const { name, color } = tagData;

  const tag = await DocumentTag.create({
    name,
    color,
    clientId,
  });

  return tag;
};

// Get document versions
export const getDocumentVersions = async (documentId, userId, clientId) => {
  const document = await Document.findOne({
    where: {
      id: documentId,
      clientId,
      isActive: true,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const hasAccess = await checkDocumentAccess(document, userId);
  if (!hasAccess) {
    throw new Error("Access denied");
  }

  const versions = await DocumentVersion.findAll({
    where: {
      documentId,
      isActive: true,
    },
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "fullName", "email"],
        required: false, // Use LEFT JOIN to include versions even if user doesn't exist
      },
    ],
    order: [["versionNumber", "DESC"]],
  });

  // Format versions with proper user names
  const formattedVersions = await Promise.all(
    versions.map(async (version) => {
      let createdByValue = "Unknown";
      if (version.creator && version.creator.fullName) {
        createdByValue = version.creator.fullName;
      } else if (version.createdBy) {
        const userName = await getUserNameById(version.createdBy);
        createdByValue = userName || `User ID: ${version.createdBy}`;
      }

      return {
        id: version.id,
        versionNumber: version.versionNumber,
        fileName: version.fileName,
        filePath: version.filePath,
        fileSize: formatFileSize(version.fileSize),
        mimeType: version.mimeType,
        changes: version.changes,
        createdBy: createdByValue,
        createdAt: version.createdAt,
      };
    })
  );

  return formattedVersions;
};

// Create new document version
export const createDocumentVersion = async (
  documentId,
  file,
  userId,
  clientId
) => {
  const document = await Document.findOne({
    where: {
      id: documentId,
      clientId,
      isActive: true,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const hasEditPermission = await checkDocumentEditPermission(document, userId);
  if (!hasEditPermission) {
    throw new Error("Edit permission denied");
  }

  // Get next version number
  const latestVersion = await DocumentVersion.findOne({
    where: { documentId },
    order: [["versionNumber", "DESC"]],
  });

  const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

  const version = await DocumentVersion.create({
    documentId,
    versionNumber,
    fileName: file.filename,
    filePath: file.path,
    fileSize: file.size && !isNaN(file.size) && file.size >= 0 ? file.size : 0,
    mimeType: file.mimetype,
    createdBy: userId,
  });

  // Update document version
  await document.update({ version: versionNumber });

  return version;
};

// Get document statistics
export const getDocumentStats = async (clientId) => {
  const stats = await Document.findAll({
    where: {
      clientId,
    },
    attributes: [
      "fileType",
      [sequelize.col("category.name"), "category"],
      [sequelize.fn("COUNT", sequelize.col("Document.id")), "count"],
    ],
    include: [
      {
        model: DocumentCategory,
        as: "category",
        attributes: [],
        required: false,
      },
    ],
    group: ["fileType", "category.name"],
  });

  return stats;
};

// Search documents
export const searchDocuments = async (
  query,
  filters,
  clientId,
  options = {}
) => {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  const whereClause = {
    clientId,
    isActive: true,
  };

  if (query) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${query}%` } },
      { description: { [Op.like]: `%${query}%` } },
    ];
  }

  const includeOptions = [
    {
      model: User,
      as: "uploader",
      attributes: ["id", "fullName", "email"],
      required: false,
    },
    {
      model: DocumentCategory,
      as: "category",
      attributes: ["id", "name", "color", "icon"],
      required: false,
    },
    {
      model: DocumentTag,
      as: "tags",
      attributes: ["id", "name", "color"],
      through: { attributes: [] },
      required: false,
    },
  ];

  if (filters) {
    if (filters.category) {
      const categoryRecord = await DocumentCategory.findOne({
        where: {
          name: filters.category,
          [Op.or]: [{ clientId }, { clientId: null }],
        },
      });
      if (categoryRecord) {
        whereClause.categoryId = categoryRecord.id;
      }
    }

    if (filters.fileType) whereClause.fileType = filters.fileType;
    if (filters.uploadedBy) whereClause.uploadedBy = filters.uploadedBy;

    // Add tag filter using subquery if specified
    if (filters.tags && filters.tags.length > 0) {
      const tagRecords = await DocumentTag.findAll({
        where: {
          name: { [Op.in]: filters.tags },
          [Op.or]: [{ clientId }, { clientId: null }],
        },
      });

      if (tagRecords.length > 0) {
        const tagIds = tagRecords.map((tag) => tag.id);
        whereClause.id = {
          [Op.in]: sequelize.literal(`(
                        SELECT DISTINCT dtm.documentId 
                        FROM document_tag_maps dtm 
                        WHERE dtm.tagId IN (${tagIds.join(",")})
                    )`),
        };
      }
    }
  }

  const { count, rows } = await Document.findAndCountAll({
    where: whereClause,
    include: includeOptions,
    order: [["uploadedAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    distinct: true,
  });

  // Format documents with proper user names
  const documents = await Promise.all(
    rows.map(async (doc) => {
      let uploadedByValue = "Unknown";
      if (doc.uploader && doc.uploader.fullName) {
        uploadedByValue = doc.uploader.fullName;
      } else if (doc.uploadedBy) {
        const userName = await getUserNameById(doc.uploadedBy);
        uploadedByValue = userName || `User ID: ${doc.uploadedBy}`;
      }

      // Prepare category fields for frontend mapping
      let categoryObj = null;
      let categoryName = "Uncategorized";
      if (doc.category) {
        categoryObj = {
          id: doc.category.id,
          name: doc.category.name,
          color: doc.category.color,
          icon: doc.category.icon,
        };
        categoryName = doc.category.name;
      }

      // Handle tags - ensure we get all tags, not just filtered ones
      let documentTags = [];
      let documentTagIds = [];

      // If we have tags from the association, use them
      if (doc.tags && Array.isArray(doc.tags)) {
        documentTags = doc.tags.map((tag) => tag.name);
        documentTagIds = doc.tags.map((tag) => tag.id);
      }

      return {
        id: doc.id,
        name: doc.name,
        description: doc.description,
        fileName: doc.fileName,
        originalName: doc.originalName,
        filePath: doc.filePath,
        fileSize: formatFileSize(doc.fileSize),
        mimeType: doc.mimeType,
        fileType: doc.fileType,
        category: categoryObj, // full object for selects that expect object
        categoryId: doc.categoryId, // for selects that expect id
        categoryName, // for selects that expect name
        tags: documentTags,
        tagIds: documentTagIds,
        visibility: doc.visibility,
        version: doc.version,
        isTemplate: doc.isTemplate,
        templateCategory: doc.templateCategory,
        uploadedBy: uploadedByValue,
        uploadedAt: doc.uploadedAt,
        updatedAt: doc.updatedAt,
        downloadCount: doc.downloadCount,
        viewCount: doc.viewCount,
        isCompanyDocument:
          doc.CompanyDocuments && doc.CompanyDocuments.length > 0,
      };
    })
  );

  return {
    documents,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
  };
};

// Helper function to check document access
const checkDocumentAccess = async (document, userId) => {
  // Document owner has access
  if (document.uploadedBy === userId) {
    return true;
  }

  // Public documents are accessible to all
  if (document.visibility === "public") {
    return true;
  }

  // Check if document is shared with user
  const share = await DocumentShare.findOne({
    where: {
      documentId: document.id,
      sharedWith: userId,
      isActive: true,
    },
  });

  return !!share;
};

// Helper function to check document edit permission
const checkDocumentEditPermission = async (document, userId) => {
  // Document owner has edit permission
  if (document.uploadedBy === userId) {
    return true;
  }

  // Check if user has edit permission through sharing
  const share = await DocumentShare.findOne({
    where: {
      documentId: document.id,
      sharedWith: userId,
      permission: { [Op.in]: ["edit", "comment"] },
      isActive: true,
    },
  });

  return !!share;
};

// Helper function to check document delete permission
const checkDocumentDeletePermission = async (document, userId) => {
  // Only document owner can delete
  return document.uploadedBy === userId;
};

// Helper function to check document share permission
const checkDocumentSharePermission = async (document, userId) => {
  // Document owner can share
  if (document.uploadedBy === userId) {
    return true;
  }

  // Users with edit permission can share
  const share = await DocumentShare.findOne({
    where: {
      documentId: document.id,
      sharedWith: userId,
      permission: "edit",
      isActive: true,
    },
  });

  return !!share;
};

// Helper function to record document activity
const recordDocumentActivity = async (
  documentId,
  userId,
  activityType,
  details = null,
  options = {}
) => {
  await DocumentActivity.create(
    {
      documentId,
      userId,
      activityType,
      details: details ? JSON.stringify(details) : null,
    },
    options
  );
};

// Add this mapping function near the top of the file
function mapVisibilityToShareType(visibility) {
  if (visibility === "Specific people" || visibility === "private")
    return "user";
  if (visibility === "Team" || visibility === "team") return "team";
  if (visibility === "Anyone with link" || visibility === "public")
    return "link";
  return "user";
}
