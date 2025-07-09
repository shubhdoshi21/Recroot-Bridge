import { Document } from "../models/Document.js";
import { DocumentShare } from "../models/DocumentShare.js";
import { DocumentVersion } from "../models/DocumentVersion.js";
import { DocumentCategory } from "../models/DocumentCategory.js";
import { DocumentTag } from "../models/DocumentTag.js";
import { DocumentActivity } from "../models/DocumentActivity.js";
import { User } from "../models/User.js";
import { Op } from "sequelize";
import { Company } from "../models/Company.js";
import { CompanyDocument } from "../models/CompanyDocument.js";

// Find documents with filtering and pagination
export const findDocuments = async (where = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "uploadedAt",
    order = "DESC",
    include = [],
  } = options;

  const offset = (page - 1) * limit;

  const { count, rows } = await Document.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "uploader",
        attributes: ["id", "fullName", "email"],
      },
      ...include,
    ],
    order: [[sortBy, order]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return { count, rows };
};

// Find document by ID
export const findDocumentById = async (id, options = {}) => {
  const { include = [] } = options;

  return await Document.findOne({
    where: { id, isActive: true },
    include: [
      {
        model: User,
        as: "uploader",
        attributes: ["id", "fullName", "email"],
      },
      ...include,
    ],
  });
};

// Create new document
export const createDocument = async (documentData) => {
  return await Document.create(documentData);
};

// Update document
export const updateDocument = async (id, updateData) => {
  const document = await Document.findByPk(id);
  if (!document) {
    throw new Error("Document not found");
  }
  return await document.update(updateData);
};

// Delete document (soft delete)
export const deleteDocument = async (id) => {
  const document = await Document.findByPk(id);
  if (!document) {
    throw new Error("Document not found");
  }
  return await document.update({ isActive: false });
};

// Increment document download count
export const incrementDownloadCount = async (id) => {
  // First get the document to preserve its fields
  const document = await Document.findByPk(id);
  if (!document) {
    throw new Error("Document not found");
  }

  // Increment the download count while preserving other fields
  return await Document.update(
    { downloadCount: document.downloadCount + 1 },
    { where: { id } }
  );
};

// Increment document view count
export const incrementViewCount = async (id) => {
  return await Document.increment("viewCount", { where: { id } });
};

// Find document shares
export const findDocumentShares = async (where = {}, options = {}) => {
  const { page = 1, limit = 10, include = [] } = options;

  const offset = (page - 1) * limit;

  const { count, rows } = await DocumentShare.findAndCountAll({
    where,
    include: [
      {
        model: Document,
        where: { isActive: true },
        include: [
          {
            model: User,
            as: "uploader",
            attributes: ["id", "fullName", "email"],
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
      ...include,
    ],
    order: [["sharedAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return { count, rows };
};

// Create document share
export const createDocumentShare = async (shareData) => {
  return await DocumentShare.create(shareData);
};

// Update document share
export const updateDocumentShare = async (id, updateData) => {
  const share = await DocumentShare.findByPk(id);
  if (!share) {
    throw new Error("Document share not found");
  }
  return await share.update(updateData);
};

// Delete document share
export const deleteDocumentShare = async (id) => {
  const share = await DocumentShare.findByPk(id);
  if (!share) {
    throw new Error("Document share not found");
  }
  return await share.update({ isActive: false });
};

// Find document versions
export const findDocumentVersions = async (documentId, options = {}) => {
  const { include = [] } = options;

  return await DocumentVersion.findAll({
    where: { documentId, isActive: true },
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "fullName", "email"],
      },
      ...include,
    ],
    order: [["versionNumber", "DESC"]],
  });
};

// Create document version
export const createDocumentVersion = async (versionData) => {
  return await DocumentVersion.create(versionData);
};

// Find latest document version
export const findLatestDocumentVersion = async (documentId) => {
  return await DocumentVersion.findOne({
    where: { documentId, isActive: true },
    order: [["versionNumber", "DESC"]],
  });
};

// Find document categories
export const findDocumentCategories = async (clientId) => {
  return await DocumentCategory.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { clientId },
        { clientId: null }, // Global categories
      ],
    },
    order: [["name", "ASC"]],
  });
};

// Create document category
export const createDocumentCategory = async (categoryData) => {
  return await DocumentCategory.create(categoryData);
};

// Update document category
export const updateDocumentCategory = async (id, updateData) => {
  const category = await DocumentCategory.findByPk(id);
  if (!category) {
    throw new Error("Document category not found");
  }
  return await category.update(updateData);
};

// Delete document category
export const deleteDocumentCategory = async (id) => {
  const category = await DocumentCategory.findByPk(id);
  if (!category) {
    throw new Error("Document category not found");
  }
  return await category.update({ isActive: false });
};

// Find document tags
export const findDocumentTags = async (clientId) => {
  return await DocumentTag.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { clientId },
        { clientId: null }, // Global tags
      ],
    },
    order: [["name", "ASC"]],
  });
};

// Create document tag
export const createDocumentTag = async (tagData) => {
  return await DocumentTag.create(tagData);
};

// Update document tag
export const updateDocumentTag = async (id, updateData) => {
  const tag = await DocumentTag.findByPk(id);
  if (!tag) {
    throw new Error("Document tag not found");
  }
  return await tag.update(updateData);
};

// Delete document tag
export const deleteDocumentTag = async (id) => {
  const tag = await DocumentTag.findByPk(id);
  if (!tag) {
    throw new Error("Document tag not found");
  }
  return await tag.update({ isActive: false });
};

// Record document activity
export const recordDocumentActivity = async (activityData) => {
  return await DocumentActivity.create(activityData);
};

// Find document activities
export const findDocumentActivities = async (documentId, options = {}) => {
  const { page = 1, limit = 10, include = [] } = options;

  const offset = (page - 1) * limit;

  const { count, rows } = await DocumentActivity.findAndCountAll({
    where: { documentId },
    include: [
      {
        model: User,
        attributes: ["id", "fullName", "email"],
      },
      ...include,
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return { count, rows };
};

// Get document statistics
export const getDocumentStats = async (clientId) => {
  const stats = await Document.findAll({
    where: {
      clientId,
      isActive: true,
    },
    attributes: [
      "fileType",
      "category",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["fileType", "category"],
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
  const { page = 1, limit = 10, include = [] } = options;

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

  if (filters) {
    if (filters.category) whereClause.category = filters.category;
    if (filters.fileType) whereClause.fileType = filters.fileType;
    if (filters.uploadedBy) whereClause.uploadedBy = filters.uploadedBy;
    if (filters.tags && filters.tags.length > 0) {
      whereClause.tags = { [Op.overlap]: filters.tags };
    }
  }

  const { count, rows } = await Document.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "uploader",
        attributes: ["id", "fullName", "email"],
      },
      ...include,
    ],
    order: [["uploadedAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return { count, rows };
};

// Check document access
export const checkDocumentAccess = async (documentId, userId) => {
  const document = await Document.findByPk(documentId);
  if (!document) {
    return false;
  }

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
      documentId,
      sharedWith: userId,
      isActive: true,
    },
  });

  return !!share;
};

// Check document edit permission
export const checkDocumentEditPermission = async (documentId, userId) => {
  const document = await Document.findByPk(documentId);
  if (!document) {
    return false;
  }

  // Document owner has edit permission
  if (document.uploadedBy === userId) {
    return true;
  }

  // Check if user has edit permission through sharing
  const share = await DocumentShare.findOne({
    where: {
      documentId,
      sharedWith: userId,
      permission: { [Op.in]: ["edit", "comment"] },
      isActive: true,
    },
  });

  return !!share;
};

// Check document delete permission
export const checkDocumentDeletePermission = async (documentId, userId) => {
  const document = await Document.findByPk(documentId);
  if (!document) {
    return false;
  }

  // Only document owner can delete
  return document.uploadedBy === userId;
};

// Check document share permission
export const checkDocumentSharePermission = async (documentId, userId) => {
  const document = await Document.findByPk(documentId);
  if (!document) {
    return false;
  }

  // Document owner can share
  if (document.uploadedBy === userId) {
    return true;
  }

  // Users with edit permission can share
  const share = await DocumentShare.findOne({
    where: {
      documentId,
      sharedWith: userId,
      permission: "edit",
      isActive: true,
    },
  });

  return !!share;
};

// Get all companies for dropdown
export const getCompanyList = async () => {
  const companies = await Company.findAll({
    attributes: ["id", "name", "email"],
    order: [["name", "ASC"]],
  });
  return companies;
};

// Get documents for a company with optional filters
export const getCompanyDocuments = async (filters = {}) => {
  const { companyId, categoryId, tags } = filters;
  const where = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  const include = [
    {
      model: CompanyDocument,
      where: companyId ? { companyId } : undefined,
      required: true,
    },
    {
      model: DocumentCategory,
      as: "category",
      required: false,
    },
    {
      model: DocumentTag,
      as: "tags",
      required: false,
      through: { attributes: [] },
    },
    {
      model: User,
      as: "uploader",
      attributes: ["id", "fullName", "email"],
      required: false,
    },
  ];
  if (tags && tags.length > 0) {
    let tagIds = tags.filter((t) => typeof t === "number");
    if (tagIds.length !== tags.length) {
      const tagRecords = await DocumentTag.findAll({
        where: { name: { [Op.in]: tags.filter((t) => typeof t === "string") } },
      });
      tagIds = tagIds.concat(tagRecords.map((t) => t.id));
    }
    if (tagIds.length > 0) {
      include.push({
        model: DocumentTag,
        as: "tags",
        where: { id: { [Op.in]: tagIds } },
        required: true,
        through: { attributes: [] },
      });
    }
  }
  const docs = await Document.findAll({
    where,
    include,
    order: [["uploadedAt", "DESC"]],
    distinct: true,
  });

  // Use the same formatting as getAllDocuments in documentService.js
  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
      return "Unknown size";
    }
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return docs.map((doc) => {
    // Uploader
    let uploadedByValue = "Unknown";
    if (doc.uploader && doc.uploader.fullName) {
      uploadedByValue = doc.uploader.fullName;
    } else if (doc.uploadedBy) {
      uploadedByValue = `User ID: ${doc.uploadedBy}`;
    }
    // Category
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
    // Tags
    let documentTags = [];
    let documentTagIds = [];
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
      category: categoryObj,
      categoryId: doc.categoryId,
      categoryName,
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
  });
};
