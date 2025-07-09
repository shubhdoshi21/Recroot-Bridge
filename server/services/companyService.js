import * as companyRepository from "../repositories/companyRepository.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getFileType } from "./documentService.js";
import * as documentService from "./documentService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  return await companyRepository.getAllCompanies({
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
  });
};

export const getCompanyById = async (id) => {
  try {
    console.log(`Service: Getting company with ID: ${id}`);

    // First get the company
    const company = await companyRepository.getCompanyById(id);

    if (!company) {
      console.log(`Service: Company with ID ${id} not found`);
      return null;
    }

    // Get company contacts
    const contacts = await companyRepository.getCompanyContacts(id);

    // Find primary contact (or first contact if no primary is marked)
    const primaryContact =
      contacts.find((contact) => contact.isPrimary) || contacts[0];

    // Merge primary contact data into company object for frontend convenience
    if (primaryContact) {
      company.contactName = primaryContact.contactName;
      company.contactPosition = primaryContact.contactPosition;
      company.contactPhone = primaryContact.contactPhone;
      company.contactEmail = primaryContact.contactEmail;
    }

    // Add contacts array to company
    company.contacts = contacts;

    console.log(`Service: Company ${company.name} retrieved with contacts`);
    return company;
  } catch (error) {
    console.log(`Service: Error getting company by ID ${id}:`, error);
    throw error;
  }
};

export const createCompany = async (companyData) => {
  try {
    // Make sure we don't manually set ID
    const { id, ...dataWithoutId } = companyData;

    // Set default values for required fields if not provided
    const companyWithDefaults = {
      ...dataWithoutId,
      status: dataWithoutId.status || "active",
      jobs: dataWithoutId.jobs || 0,
      candidates: dataWithoutId.candidates || 0,
      openJobs: dataWithoutId.openJobs || 0,
    };

    console.log("Creating company with processed data:", companyWithDefaults);
    return await companyRepository.createCompany(companyWithDefaults);
  } catch (error) {
    console.log("Error creating company:", error);
    throw new Error(`Failed to create company: ${error.message}`);
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    console.log(`Service: Updating company with ID: ${id}`);

    // Extract contact data from the request
    const {
      contactName,
      contactPosition,
      contactPhone,
      contactEmail,
      ...companyFields
    } = companyData;

    // Update the company in the database
    const updatedCompany = await companyRepository.updateCompany(
      id,
      companyFields
    );

    // If contact information is provided, update or create the primary contact
    if (contactName || contactPosition || contactPhone || contactEmail) {
      // Get existing contacts
      const existingContacts = await companyRepository.getCompanyContacts(id);
      const primaryContact =
        existingContacts.find((contact) => contact.isPrimary) ||
        existingContacts[0];

      const contactData = {
        contactName,
        contactPosition,
        contactPhone,
        contactEmail,
        isPrimary: true,
      };

      if (primaryContact) {
        // Update existing primary contact
        await companyRepository.updateCompanyContact(
          primaryContact.id,
          contactData
        );
        console.log(`Service: Updated primary contact for company ${id}`);
      } else {
        // Create new primary contact
        await companyRepository.addCompanyContact(id, contactData);
        console.log(`Service: Created new primary contact for company ${id}`);
      }
    }

    // Get the updated company with contacts
    return await getCompanyById(id);
  } catch (error) {
    console.log(`Service: Error updating company ${id}:`, error);
    throw error;
  }
};

export const deleteCompany = async (id) => {
  try {
    // First, check if the company exists
    const company = await companyRepository.getCompanyById(id);

    if (!company) {
      console.log(`Company with ID ${id} not found`);
      return false;
    }

    console.log(`Attempting to delete company with ID: ${id}`);

    // Get any associated documents
    const documents = await getCompanyDocuments(id);
    console.log(`Found ${documents.length} documents to delete`);

    // Delete physical files
    for (const doc of documents) {
      if (doc.documentUrl) {
        try {
          const filePath = path.join(__dirname, "..", doc.documentUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        } catch (error) {
          console.log(`Error deleting file: ${error.message}`);
          // Continue with deletion even if file deletion fails
        }
      }
    }

    // Delete the company from the database
    const result = await companyRepository.deleteCompany(id);
    console.log(`Company deletion result: ${result}`);
    return result;
  } catch (error) {
    console.log(`Error during company deletion: ${error.message}`);
    throw new Error(`Failed to delete company: ${error.message}`);
  }
};

export const addCompanyContact = async (companyId, contactData) => {
  return await companyRepository.addCompanyContact(companyId, contactData);
};

export const updateCompanyContact = async (contactId, contactData) => {
  return await companyRepository.updateCompanyContact(contactId, contactData);
};

export const deleteCompanyContact = async (contactId) => {
  return await companyRepository.deleteCompanyContact(contactId);
};

export const getCompanyContacts = async (companyId) => {
  return await companyRepository.getCompanyContacts(companyId);
};

export const addCompanyDocument = async (companyId, documentData, file) => {
  // Normalize fileType using getFileType
  if (file && file.mimetype) {
    documentData.fileType = getFileType(file.mimetype);
  }
  return await companyRepository.addCompanyDocument(companyId, documentData);
};

export const getCompanyDocuments = async (companyId, filters = {}) => {
  return await companyRepository.getCompanyDocuments(companyId, filters);
};

export const getCompanyDocumentById = async (documentId) => {
  return await companyRepository.getDocumentById(documentId);
};

export const deleteCompanyDocument = async (documentId) => {
  // Get document details
  const document = await companyRepository.getDocumentById(documentId);

  if (document && document.documentUrl) {
    try {
      const filePath = path.join(__dirname, "..", document.documentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.log(`Error deleting file: ${error.message}`);
    }
  }

  return await companyRepository.deleteCompanyDocument(documentId);
};

export const updateCompanyDocument = async (documentId, documentData, file) => {
  // Normalize fileType if a new file is provided
  if (file && file.mimetype) {
    documentData.fileType = getFileType(file.mimetype);
  }
  return await companyRepository.updateCompanyDocument(
    documentId,
    documentData
  );
};

export const shareCompanyDocument = async (
  documentId,
  shareData,
  userId,
  clientId
) => {
  // Use the main document sharing logic
  return await documentService.shareDocument(
    documentId,
    shareData,
    userId,
    clientId
  );
};

export const addCompanyNote = async (companyId, noteData) => {
  return await companyRepository.addCompanyNote(companyId, noteData);
};

export const getCompanyNotes = async (companyId) => {
  return await companyRepository.getCompanyNotes(companyId);
};

export const updateCompanyNote = async (noteId, noteData) => {
  return await companyRepository.updateCompanyNote(noteId, noteData);
};

export const deleteCompanyNote = async (noteId) => {
  return await companyRepository.deleteCompanyNote(noteId);
};

export const getCompanyJobs = async (
  companyId,
  { page, limit, status, department, searchQuery }
) => {
  return await companyRepository.getCompanyJobs(companyId, {
    page,
    limit,
    status,
    department,
    searchQuery,
  });
};

export const addCompanyJob = async (companyId, jobData) => {
  return await companyRepository.addCompanyJob(companyId, jobData);
};

export const deleteCompanyJob = async (jobId) => {
  return await companyRepository.deleteCompanyJob(jobId);
};

export const getCompanyCandidates = async (
  companyId,
  { page, limit, status, position, searchQuery }
) => {
  return await companyRepository.getCompanyCandidates(companyId, {
    page,
    limit,
    status,
    position,
    searchQuery,
  });
};

export const getCompanyCandidateById = async (companyId, candidateId) => {
  return await companyRepository.getCompanyCandidateById(
    companyId,
    candidateId
  );
};

export const getCompanyActivity = async (
  companyId,
  { startDate, endDate, type }
) => {
  return await companyRepository.getCompanyActivity(companyId, {
    startDate,
    endDate,
    type,
  });
};

export const getCompanyHiringAnalytics = async (companyId, { timeframe }) => {
  return await companyRepository.getCompanyHiringAnalytics(companyId, {
    timeframe,
  });
};

export const getCompanyPipelineAnalytics = async (companyId) => {
  return await companyRepository.getCompanyPipelineAnalytics(companyId);
};

export const getIndustries = async () => {
  return await companyRepository.getIndustries();
};

export const addIndustry = async (name) => {
  return await companyRepository.addIndustry(name);
};

export const getLocations = async () => {
  return await companyRepository.getLocations();
};

export const addLocation = async (name) => {
  return await companyRepository.addLocation(name);
};

export const getCompanySizes = async () => {
  return await companyRepository.getCompanySizes();
};

export const getCompanyStats = async () => {
  return await companyRepository.getCompanyStats();
};

// Add this new function to calculate recent hires
export const getCompanyRecentHires = async (companyId, months = 6) => {
  try {
    const { Op } = require("sequelize");
    const { Application } = require("../models/Application.js");
    const { Job } = require("../models/Job.js");

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    // Count hired applications in the past 6 months
    const hires = await Application.count({
      where: {
        status: "Hired",
        updatedAt: { [Op.gte]: cutoffDate },
      },
      include: [
        {
          model: Job,
          where: { companyId },
        },
      ],
    });

    return hires;
  } catch (error) {
    console.log(`Error getting recent hires for company ${companyId}:`, error);
    return 0; // Return 0 if there's an error to avoid breaking the UI
  }
};
