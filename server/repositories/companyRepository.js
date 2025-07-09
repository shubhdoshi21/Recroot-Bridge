import { Op } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import { Company } from "../models/Company.js";
import { CompanyContact } from "../models/CompanyContact.js";
import { Document } from "../models/Document.js";
import { CompanyDocument } from "../models/CompanyDocument.js";
import { DocumentShare } from "../models/DocumentShare.js";
import { Note } from "../models/Note.js";
import { Job } from "../models/Job.js";
import { User } from "../models/User.js";
import { Application } from "../models/Application.js";
import { Candidate } from "../models/Candidate.js";
import { CandidateJobMap } from "../models/CandidateJobMap.js";
import { DocumentCategory } from "../models/DocumentCategory.js";
import { DocumentTag } from "../models/DocumentTag.js";
import { DocumentTagMap } from "../models/DocumentTagMap.js";
import { CandidateSkillMap } from "../models/CandidateSkillMap.js";
import { Skills } from "../models/Skills.js";
import { CandidateEducation } from "../models/CandidateEducation.js";
import { CandidateExperience } from "../models/CandidateExperience.js";
import { CandidateCertification } from "../models/CandidateCertification.js";
import { CandidateDocument } from "../models/CandidateDocument.js";
import { CandidateExtraCurricular } from "../models/CandidateExtraCurricular.js";

export const getAllCompanies = async ({
  page,
  limit,
  search,
  industry,
  location,
  size,
  status,
  sortBy,
  order,
  clientId,
}) => {
  if (!clientId) throw new Error("clientId is required for company queries");
  const offset = (page - 1) * limit;

  // Build where clause based on filters
  const whereClause = { clientId };

  if (search) {
    whereClause.name = { [Op.like]: `%${search}%` };
  }

  if (industry) {
    whereClause.industry = industry;
  }

  if (location) {
    whereClause.location = location;
  }

  if (size) {
    whereClause.size = size;
  }

  if (status) {
    whereClause.status = status;
  }

  const { count, rows } = await Company.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[sortBy || "name", order || "ASC"]],
  });

  return {
    companies: rows,
    totalCompanies: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  };
};

export const getCompanyById = async (id) => {
  try {
    if (!id) {
      console.log("Invalid company ID: empty or undefined");
      return null;
    }

    // Convert string IDs to numbers if needed
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    // Check if ID is valid after conversion
    if (isNaN(numericId) || numericId <= 0) {
      console.log(`Invalid company ID: ${id}`);
      return null;
    }

    console.log(`Looking up company with ID: ${numericId}`);
    const company = await Company.findByPk(numericId, {
      include: [
        {
          model: CompanyContact,
          as: "contacts",
        },
      ],
    });

    if (!company) {
      console.log(`Company with ID ${numericId} not found`);
      return null;
    }

    console.log(`Found company: ${company.name}`);

    // Convert to plain object and add primary contact fields if available
    const companyData = company.toJSON();

    // Check if there's a primary contact
    const primaryContact =
      companyData.contacts?.find((contact) => contact.isPrimary) ||
      companyData.contacts?.[0];

    if (primaryContact) {
      // Add contact fields to the main company object for backward compatibility
      companyData.contactName = primaryContact.contactName;
      companyData.contactPosition = primaryContact.contactPosition;
      companyData.contactPhone = primaryContact.contactPhone;
      companyData.contactEmail = primaryContact.contactEmail;
    }

    return companyData;
  } catch (error) {
    console.log(`Error getting company by ID ${id}:`, error);
    throw error;
  }
};

export const createCompany = async (companyData) => {
  try {
    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Extract contact fields
      const {
        contactName,
        contactPosition,
        contactPhone,
        contactEmail,
        ...companyFields
      } = companyData;

      // Check if a company with the same name already exists for this client
      if (companyFields.name && companyFields.clientId) {
        const existingCompany = await Company.findOne({
          where: { name: companyFields.name, clientId: companyFields.clientId },
          transaction,
        });

        if (existingCompany) {
          console.log(
            `Company with name "${companyFields.name}" already exists for clientId ${companyFields.clientId} with ID: ${existingCompany.id}`
          );
          await transaction.rollback();

          // Return the existing company instead of creating a duplicate
          return await getCompanyById(existingCompany.id);
        }
      }

      // Create company record
      const company = await Company.create(companyFields, { transaction });

      // Create contact record if contact name is provided
      if (contactName) {
        await CompanyContact.create(
          {
            companyId: company.id,
            contactName,
            contactPosition,
            contactPhone,
            contactEmail,
            isPrimary: true,
          },
          { transaction }
        );
      }

      // Commit transaction
      await transaction.commit();

      // Return the company with contacts
      return await getCompanyById(company.id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      console.log("Transaction error creating company:", error);
      throw error;
    }
  } catch (error) {
    console.log("Repository error creating company:", error);
    throw error;
  }
};

export const updateCompany = async (id, companyData) => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Find the company
    const company = await Company.findByPk(id, { transaction });

    if (!company) {
      await transaction.rollback();
      return null;
    }

    // Extract contact fields
    const {
      contactName,
      contactPosition,
      contactPhone,
      contactEmail,
      ...companyFields
    } = companyData;

    // Update company record
    await company.update(companyFields, { transaction });

    // Handle contact information
    if (contactName !== undefined) {
      // First check if there's already a primary contact
      let existingPrimaryContact = await CompanyContact.findOne({
        where: {
          companyId: id,
          isPrimary: true,
        },
        transaction,
      });

      if (existingPrimaryContact) {
        // Update existing contact
        await existingPrimaryContact.update(
          {
            contactName,
            contactPosition,
            contactPhone,
            contactEmail,
          },
          { transaction }
        );
      } else {
        // Create new contact
        await CompanyContact.create(
          {
            companyId: id,
            contactName,
            contactPosition,
            contactPhone,
            contactEmail,
            isPrimary: true,
          },
          { transaction }
        );
      }
    }

    // Commit transaction
    await transaction.commit();

    // Return updated company with contacts
    return await getCompanyById(id);
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.log(`Error updating company with ID ${id}:`, error);
    throw error;
  }
};

export const deleteCompany = async (id) => {
  try {
    if (!id) {
      console.log("Invalid company ID for deletion: empty or undefined");
      return false;
    }

    // Convert string IDs to numbers if needed
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    // Check if ID is valid after conversion
    if (isNaN(numericId) || numericId <= 0) {
      console.log(`Invalid company ID for deletion: ${id}`);
      return false;
    }

    console.log(`Preparing to delete company with ID: ${numericId}`);

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Find the company
      const company = await Company.findByPk(numericId, { transaction });

      if (!company) {
        await transaction.rollback();
        console.log(`Company with ID ${numericId} not found in database`);
        return false;
      }

      console.log(
        `Found company for deletion: ${company.name} (ID: ${company.id})`
      );

      // Delete any company contacts
      const deletedContacts = await CompanyContact.destroy({
        where: { companyId: numericId },
        transaction,
      });
      console.log(`Deleted ${deletedContacts} company contacts`);

      // Delete any company notes
      const deletedNotes = await Note.destroy({
        where: { companyId: numericId },
        transaction,
      });
      console.log(`Deleted ${deletedNotes} company notes`);

      // Find company documents to delete them
      const companyDocs = await CompanyDocument.findAll({
        where: { companyId: numericId },
        transaction,
      });
      console.log(`Found ${companyDocs.length} company documents to delete`);

      // Get document IDs to delete
      const documentIds = companyDocs.map((doc) => doc.documentId);

      // Delete company document associations
      const deletedCompanyDocs = await CompanyDocument.destroy({
        where: { companyId: numericId },
        transaction,
      });
      console.log(
        `Deleted ${deletedCompanyDocs} company document associations`
      );

      // Delete document shares
      if (documentIds.length > 0) {
        const deletedShares = await DocumentShare.destroy({
          where: { documentId: { [Op.in]: documentIds } },
          transaction,
        });
        console.log(`Deleted ${deletedShares} document shares`);

        // Delete documents
        const deletedDocs = await Document.destroy({
          where: { id: { [Op.in]: documentIds } },
          transaction,
        });
        console.log(`Deleted ${deletedDocs} documents`);
      }

      // Finally delete the company
      await company.destroy({ transaction });
      console.log(`Deleted company with ID: ${numericId}`);

      // Commit transaction
      await transaction.commit();
      console.log(
        `Transaction committed successfully for deleting company ID: ${numericId}`
      );
      return true;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      console.log(
        `Error in deleteCompany transaction for ID ${numericId}:`,
        error
      );
      throw error;
    }
  } catch (error) {
    console.log(`Repository error deleting company with ID ${id}:`, error);
    throw error;
  }
};

export const addCompanyContact = async (companyId, contactData) => {
  return await CompanyContact.create({
    ...contactData,
    companyId,
  });
};

export const updateCompanyContact = async (contactId, contactData) => {
  const contact = await CompanyContact.findByPk(contactId);

  if (!contact) {
    return null;
  }

  return await contact.update(contactData);
};

export const deleteCompanyContact = async (contactId) => {
  const contact = await CompanyContact.findByPk(contactId);

  if (!contact) {
    return false;
  }

  await contact.destroy();
  return true;
};

export const getCompanyContacts = async (companyId) => {
  return await CompanyContact.findAll({
    where: { companyId },
    order: [
      ["isPrimary", "DESC"],
      ["contactName", "ASC"],
    ],
  });
};

export const addCompanyDocument = async (companyId, documentData) => {
  console.log("Received tags in addCompanyDocument:", documentData.tags);

  // Sanitize integer fields to prevent database conversion errors
  const sanitizeIntField = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "null" ||
      value === ""
    ) {
      return null;
    }
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  };

  // First create the document
  const document = await Document.create({
    name: documentData.name,
    description: documentData.description,
    fileName: documentData.fileName,
    originalName: documentData.originalName,
    filePath: documentData.filePath,
    fileSize: documentData.fileSize,
    mimeType: documentData.mimeType,
    fileType: documentData.fileType,
    categoryId: sanitizeIntField(documentData.categoryId),
    visibility: "private", // or from documentData
    version: 1,
    isTemplate: documentData.isTemplate || false,
    templateCategory: documentData.templateCategory || null,
    uploadedBy: sanitizeIntField(documentData.uploadedBy),
    clientId: sanitizeIntField(documentData.clientId),
    downloadCount: 0,
    viewCount: 0,
    isActive: true,
  });

  // Then create the company document link
  const companyDocument = await CompanyDocument.create({
    companyId,
    documentId: document.id,
    addedDate: new Date(),
    addedBy: sanitizeIntField(documentData.uploadedBy),
    category: documentData.category,
    notes: documentData.notes,
  });

  // Helper to upsert a single tag
  async function upsertTag(tagName) {
    if (!tagName || typeof tagName !== "string") return;
    let tag = await DocumentTag.findOne({ where: { name: tagName } });
    if (!tag) {
      tag = await DocumentTag.create({ name: tagName, isActive: true });
    }
    await DocumentTagMap.create({ documentId: document.id, tagId: tag.id });
  }

  // Handle tags (create mappings, robust to stringified arrays)
  let tags = documentData.tags;
  if (typeof tags === "string" && tags.trim() !== "") {
    try {
      tags = JSON.parse(tags);
    } catch (e) {
      tags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }
  if (Array.isArray(tags)) {
    for (let tagName of tags) {
      // If tagName is a stringified array, parse and flatten
      if (
        typeof tagName === "string" &&
        tagName.startsWith("[") &&
        tagName.endsWith("]")
      ) {
        try {
          const parsed = JSON.parse(tagName);
          if (Array.isArray(parsed)) {
            for (const innerTag of parsed) {
              await upsertTag(innerTag);
            }
            continue; // skip to next tagName
          }
        } catch (e) {
          // fall through, treat as string
        }
      }
      await upsertTag(tagName);
    }
  }

  // Fix: fetch document with uploader before returning
  const docWithUploader = await Document.findByPk(document.id, {
    include: [{ model: User, as: "uploader", attributes: ["id", "fullName"] }],
  });
  const docJson = docWithUploader.toJSON();
  return {
    ...docJson,
    uploadedBy: docJson.uploader ? docJson.uploader.fullName : "System",
    companyDocument: companyDocument.toJSON(),
  };
};

export const getCompanyDocuments = async (companyId, filters = {}) => {
  const { category, type } = filters;
  const whereClause = { companyId };
  const documentWhereClause = {};

  if (category) {
    whereClause.category = category;
  }

  if (type) {
    // Assuming document type is stored in the name or a separate field
    documentWhereClause.name = { [Op.like]: `%.${type}` };
  }

  const companyDocuments = await CompanyDocument.findAll({
    where: whereClause,
    include: [
      {
        model: Document,
        required: true,
        where:
          Object.keys(documentWhereClause).length > 0
            ? documentWhereClause
            : undefined,
        include: [
          {
            model: User,
            as: "uploader",
            attributes: ["id", "fullName"],
          },
        ],
      },
    ],
  });

  return companyDocuments.map((cd) => {
    const docJson = cd.Document.toJSON();
    return {
      ...docJson,
      uploadedBy: docJson.uploader ? docJson.uploader.fullName : "System",
      companyDocument: cd.toJSON(),
    };
  });
};

export const getDocumentById = async (documentId) => {
  const doc = await Document.findByPk(documentId, {
    include: [
      { model: User, as: "uploader", attributes: ["id", "fullName"] },
      { model: DocumentCategory, as: "category", attributes: ["id", "name"] },
      {
        model: DocumentTag,
        as: "tags",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
  });
  if (!doc) return null;
  const plain = doc.toJSON();
  return {
    id: plain.id,
    name: plain.name,
    description: plain.description,
    fileName: plain.fileName,
    originalName: plain.originalName,
    filePath: plain.filePath,
    fileSize: plain.fileSize,
    mimeType: plain.mimeType,
    fileType: plain.fileType,
    categoryId: plain.categoryId,
    category: plain.category
      ? { id: plain.category.id, name: plain.category.name }
      : null,
    visibility: plain.visibility,
    version: plain.version,
    isTemplate: plain.isTemplate,
    templateCategory: plain.templateCategory,
    uploadedBy: plain.uploader ? plain.uploader.fullName : null,
    uploadedById: plain.uploadedBy,
    clientId: plain.clientId,
    downloadCount: plain.downloadCount,
    viewCount: plain.viewCount,
    isActive: plain.isActive,
    uploadedAt: plain.uploadedAt,
    updatedAt: plain.updatedAt,
    tags: plain.tags ? plain.tags.map((tag) => tag.name) : [],
  };
};

export const deleteCompanyDocument = async (documentId) => {
  const companyDocument = await CompanyDocument.findOne({
    where: { documentId },
  });

  if (!companyDocument) {
    return false;
  }

  // Delete document shares
  await DocumentShare.destroy({
    where: { documentId },
  });

  // Delete company document link
  await companyDocument.destroy();

  // Delete the document itself
  await Document.destroy({
    where: { id: documentId },
  });

  return true;
};

export const updateCompanyDocument = async (documentId, documentData) => {
  const document = await Document.findByPk(documentId);

  if (!document) {
    return null;
  }

  // Update document fields, including categoryId
  await document.update({
    name: documentData.name || document.name,
    description: documentData.description || document.description,
    categoryId: documentData.hasOwnProperty("categoryId")
      ? documentData.categoryId
      : document.categoryId,
    isTemplate:
      documentData.isTemplate !== undefined
        ? documentData.isTemplate
        : document.isTemplate,
    isShared:
      documentData.isShared !== undefined
        ? documentData.isShared
        : document.isShared,
    permissions: documentData.permissions
      ? JSON.stringify(documentData.permissions)
      : document.permissions,
  });

  // Update tags (replace all)
  if (Array.isArray(documentData.tags)) {
    // Remove existing tag mappings
    await DocumentTagMap.destroy({ where: { documentId } });

    // For each tag name, find or create the tag, then create the mapping
    for (const tagName of documentData.tags) {
      let tag = await DocumentTag.findOne({ where: { name: tagName } });
      if (!tag) {
        tag = await DocumentTag.create({ name: tagName, isActive: true });
      }
      await DocumentTagMap.create({ documentId, tagId: tag.id });
    }
  }

  // Update company document if needed
  if (documentData.notes || documentData.category) {
    const companyDocument = await CompanyDocument.findOne({
      where: { documentId },
    });

    if (companyDocument) {
      await companyDocument.update({
        category: documentData.category || companyDocument.category,
        notes: documentData.notes || companyDocument.notes,
      });
    }
  }

  // Get the updated document with company document info
  const updatedCompanyDocument = await CompanyDocument.findOne({
    where: { documentId },
    include: [
      {
        model: Document,
        required: true,
      },
    ],
  });

  return {
    ...updatedCompanyDocument.Document.toJSON(),
    companyDocument: updatedCompanyDocument.toJSON(),
  };
};

export const shareCompanyDocument = async (documentId, userId, permission) => {
  // Check if share already exists
  const existingShare = await DocumentShare.findOne({
    where: {
      documentId,
      userId,
    },
  });

  if (existingShare) {
    // Update permission
    await existingShare.update({ permission });
    return existingShare;
  }

  // Create new share
  return await DocumentShare.create({
    documentId,
    userId,
    permission,
    sharedAt: new Date(),
  });
};

export const addCompanyNote = async (companyId, noteData) => {
  return await Note.create({
    companyId,
    date: noteData.date,
    author: noteData.author,
    content: noteData.content,
    category: noteData.category || "General",
    isPinned: noteData.isPinned || false,
    isPrivate: noteData.isPrivate || false,
  });
};

export const getCompanyNotes = async (companyId) => {
  return await Note.findAll({
    where: { companyId },
    order: [
      ["isPinned", "DESC"],
      ["date", "DESC"],
    ],
  });
};

export const updateCompanyNote = async (noteId, noteData) => {
  const note = await Note.findByPk(noteId);

  if (!note) {
    return null;
  }

  return await note.update(noteData);
};

export const deleteCompanyNote = async (noteId) => {
  const note = await Note.findByPk(noteId);

  if (!note) {
    return false;
  }

  await note.destroy();
  return true;
};

export const getCompanyJobs = async (
  companyId,
  { page, limit, status, department, searchQuery }
) => {
  const offset = (page - 1) * limit;

  // Build where clause based on filters
  const whereClause = { companyId };

  if (status) {
    whereClause.jobStatus = status; // Use jobStatus instead of status to match the Job model
  }

  if (department) {
    whereClause.department = department;
  }

  if (searchQuery) {
    whereClause[Op.or] = [
      { jobTitle: { [Op.like]: `%${searchQuery}%` } }, // Use jobTitle instead of title
      { description: { [Op.like]: `%${searchQuery}%` } },
    ];
  }

  const { count, rows } = await Job.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Company,
        attributes: ["id", "name"],
      },
    ],
  });

  console.log(
    "[getCompanyJobs] Raw job data from database:",
    rows.map((row) => ({
      id: row.id,
      jobTitle: row.jobTitle,
      applicants: row.applicants,
      applications: row.applications,
    }))
  );

  // Convert the rows to plain objects and ensure they have the correct structure
  const jobs = await Promise.all(
    rows.map(async (job) => {
      const jobData = job.get({ plain: true });

      // Calculate applicants count dynamically
      const applicantsCount = await Application.count({
        where: {
          jobId: jobData.id,
          status: { [Op.ne]: "Archived" },
        },
        include: [
          {
            model: Candidate,
            required: true, // Only count if candidate exists
          },
        ],
      });

      console.log("[getCompanyJobs] Job data for job", jobData.id, ":", {
        applicants: jobData.applicants,
        applications: jobData.applications,
        calculatedApplicants: applicantsCount,
      });

      return {
        ...jobData,
        id: jobData.id,
        jobTitle: jobData.jobTitle || jobData.title || "",
        title: jobData.jobTitle || jobData.title || "",
        company: jobData.Company || {
          id: jobData.companyId,
          name: "Unknown Company",
        },
        department: jobData.department || "",
        location: jobData.location || "",
        jobType: jobData.jobType || jobData.type || "",
        type: jobData.jobType || jobData.type || "",
        jobStatus: jobData.jobStatus || jobData.status || "active",
        status: jobData.jobStatus || jobData.status || "active",
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        responsibilities: jobData.responsibilities || "",
        benefits: jobData.benefits || "",
        postedDate: jobData.postedDate || new Date().toISOString(),
        deadline: jobData.deadline || null,
        salaryMin: jobData.salaryMin || 0,
        salaryMax: jobData.salaryMax || 0,
        openings: jobData.openings || 1,
        workType: jobData.workType || "remote",
        applicants: applicantsCount, // Use dynamically calculated count
        applications: jobData.applications || 0,
        conversionRate: jobData.conversionRate || 0,
        applicationStages: jobData.applicationStages || [],
      };
    })
  );

  console.log(
    "[getCompanyJobs] Final processed jobs:",
    jobs.map((job) => ({
      id: job.id,
      jobTitle: job.jobTitle,
      applicants: job.applicants,
      applications: job.applications,
    }))
  );

  return {
    jobs: jobs,
    totalJobs: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  };
};

export const addCompanyJob = async (companyId, jobData) => {
  return await Job.create({
    ...jobData,
    companyId,
  });
};

export const deleteCompanyJob = async (jobId) => {
  const job = await Job.findByPk(jobId);

  if (!job) {
    return false;
  }

  await job.destroy();
  return true;
};

export const getCompanyCandidates = async (
  companyId,
  { page, limit, status, position, searchQuery }
) => {
  try {
    const offset = (page - 1) * limit;

    // Get all jobs for the company
    const companyJobs = await Job.findAll({
      where: { companyId },
      attributes: ["id"],
    });

    if (!companyJobs || companyJobs.length === 0) {
      return {
        candidates: [],
        totalCandidates: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // Extract job IDs
    const jobIds = companyJobs.map((job) => job.id);

    // Use raw SQL with explicit column names to avoid Sequelize association issues
    const query = `
            SELECT DISTINCT 
                c.id, c.name, c.email, c.phone, c.location, c.position, c.currentCompany,
                a.id as applicationId, a.status, a.createdAt as appliedDate, a.jobId,
                j.jobTitle
            FROM applications a
            JOIN candidates c ON a.candidateId = c.id
            JOIN jobs j ON a.jobId = j.id
            WHERE a.jobId IN (${jobIds.join(",")})
        `;

    console.log("Executing SQL query:", query);
    const [results] = await sequelize.query(query);

    // Apply filters manually
    let filteredResults = results;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredResults = filteredResults.filter(
        (candidate) =>
          (candidate.name && candidate.name.toLowerCase().includes(query)) ||
          (candidate.email && candidate.email.toLowerCase().includes(query)) ||
          (candidate.location &&
            candidate.location.toLowerCase().includes(query)) ||
          (candidate.jobTitle &&
            candidate.jobTitle.toLowerCase().includes(query))
      );
    }

    if (status) {
      filteredResults = filteredResults.filter(
        (candidate) =>
          candidate.status &&
          candidate.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (position) {
      filteredResults = filteredResults.filter(
        (candidate) =>
          candidate.position &&
          candidate.position.toLowerCase().includes(position.toLowerCase())
      );
    }

    // Format candidates for response
    const formattedCandidates = filteredResults
      .slice(offset, offset + limit)
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name || "Unknown",
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        currentCompany: candidate.currentCompany,
        status: candidate.status || "Unknown",
        appliedDate: candidate.appliedDate,
        avatarUrl: candidate.avatarUrl || null,
        position: candidate.position || "Applicant",
        applicationId: candidate.applicationId,
        jobId: candidate.jobId,
        jobTitle: candidate.jobTitle || "Unknown Job",
      }));

    return {
      candidates: formattedCandidates,
      totalCandidates: filteredResults.length,
      totalPages: Math.ceil(filteredResults.length / limit),
      currentPage: page,
    };
  } catch (error) {
    console.log("Error in getCompanyCandidates:", error);
    throw error;
  }
};

export const getCompanyCandidateById = async (companyId, candidateId) => {
  // First verify the candidate is associated with the company
  const companyJobs = await Job.findAll({
    where: { companyId },
    attributes: ["id"],
  });

  const jobIds = companyJobs.map((job) => job.id);

  // Check if candidate is associated with any of the company's jobs
  const candidateJobMap = await CandidateJobMap.findOne({
    where: {
      candidateId,
      jobId: { [Op.in]: jobIds },
    },
  });

  if (!candidateJobMap) {
    return null;
  }

  // Get full candidate details
  return await Candidate.findByPk(candidateId, {
    include: [
      {
        model: CandidateJobMap,
        where: {
          jobId: { [Op.in]: jobIds },
        },
        include: [
          {
            model: Job,
            where: { companyId },
          },
        ],
      },
    ],
  });
};

export const getCompanyActivity = async (
  companyId,
  { startDate, endDate, type }
) => {
  // Define base where clause with company ID
  const whereClause = {};

  // Add date filters if provided
  if (startDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      [Op.gte]: new Date(startDate),
    };
  }

  if (endDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      [Op.lte]: new Date(endDate),
    };
  }

  // Placeholder - actual implementation would depend on how activity is tracked
  // This might be in an ActivityLog table or derived from actions in various tables

  // Returning mock data for now
  return [
    {
      id: 1,
      type: "job_created",
      description: "Created new job: Software Engineer",
      timestamp: new Date().toISOString(),
      user: "John Doe",
    },
    {
      id: 2,
      type: "candidate_applied",
      description: "New application for Software Engineer",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      user: "System",
    },
  ];
};

export const getCompanyHiringAnalytics = async (companyId, { timeframe }) => {
  // Placeholder - actual implementation would calculate analytics based on applications, interviews, hires
  // Returning mock data for now
  return {
    applications: 48,
    interviews: 15,
    hires: 5,
    rejections: 25,
    pending: 18,
    timeToHire: 21, // days
    conversionRate: 10.4, // percent
    topSources: [
      { name: "LinkedIn", count: 20 },
      { name: "Indeed", count: 15 },
      { name: "Referral", count: 8 },
    ],
  };
};

export const getCompanyPipelineAnalytics = async (companyId) => {
  // Placeholder - actual implementation would get data from the database
  // Returning mock data for now
  return {
    stages: [
      { name: "Applied", count: 48 },
      { name: "Screening", count: 32 },
      { name: "Interview", count: 15 },
      { name: "Offer", count: 8 },
      { name: "Hired", count: 5 },
    ],
    dropOffRates: [
      { fromStage: "Applied", toStage: "Screening", rate: 33.3 },
      { fromStage: "Screening", toStage: "Interview", rate: 53.1 },
      { fromStage: "Interview", toStage: "Offer", rate: 46.7 },
      { fromStage: "Offer", toStage: "Hired", rate: 62.5 },
    ],
  };
};

export const getIndustries = async () => {
  // In a real implementation, this might come from a reference table
  // For now, return distinct values from the companies table
  const industries = await Company.findAll({
    attributes: [
      [sequelize.fn("DISTINCT", sequelize.col("industry")), "industry"],
    ],
    where: {
      industry: {
        [Op.not]: null,
      },
    },
    order: [["industry", "ASC"]],
  });

  return industries.map((item) => item.industry);
};

export const addIndustry = async (name) => {
  // In a real implementation, this would add to a reference table
  // For this example, we'll just return the name as if it was added
  return { name };
};

export const getLocations = async () => {
  // In a real implementation, this might come from a reference table
  // For now, return distinct values from the companies table
  const locations = await Company.findAll({
    attributes: [
      [sequelize.fn("DISTINCT", sequelize.col("location")), "location"],
    ],
    where: {
      location: {
        [Op.not]: null,
      },
    },
    order: [["location", "ASC"]],
  });

  return locations.map((item) => item.location);
};

export const addLocation = async (name) => {
  // In a real implementation, this would add to a reference table
  // For this example, we'll just return the name as if it was added
  return { name };
};

export const getCompanySizes = async () => {
  // In a real implementation, this might come from a reference table
  // For now, return distinct values from the companies table
  const sizes = await Company.findAll({
    attributes: [[sequelize.fn("DISTINCT", sequelize.col("size")), "size"]],
    where: {
      size: {
        [Op.not]: null,
      },
    },
    order: [["size", "ASC"]],
  });

  return sizes.map((item) => item.size);
};

export const getCompanyStats = async () => {
  // Count companies by status
  const statusCounts = await Company.findAll({
    attributes: [
      "status",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["status"],
    where: {
      status: {
        [Op.not]: null,
      },
    },
  });

  // Count companies by industry
  const industryCounts = await Company.findAll({
    attributes: [
      "industry",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["industry"],
    where: {
      industry: {
        [Op.not]: null,
      },
    },
    order: [[sequelize.literal("count"), "DESC"]],
    limit: 5,
  });

  // Count companies by size
  const sizeCounts = await Company.findAll({
    attributes: ["size", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
    group: ["size"],
    where: {
      size: {
        [Op.not]: null,
      },
    },
  });

  // Count total companies
  const totalCompanies = await Company.count();

  // Count total active jobs across all companies
  const totalJobs = await Job.count({
    where: {
      status: "active",
    },
  });

  return {
    totalCompanies,
    totalJobs,
    byStatus: statusCounts.map((item) => ({
      status: item.status,
      count: parseInt(item.dataValues.count),
    })),
    byIndustry: industryCounts.map((item) => ({
      industry: item.industry,
      count: parseInt(item.dataValues.count),
    })),
    bySize: sizeCounts.map((item) => ({
      size: item.size,
      count: parseInt(item.dataValues.count),
    })),
  };
};
