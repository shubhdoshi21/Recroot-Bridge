import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as companyService from "../services/companyService.js";

// @desc    Get all companies with pagination and filtering
// @route   GET /api/companies
// @access  Private
export const getAllCompanies = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    industry,
    location,
    size,
    status,
    sortBy = "name",
    order = "asc",
  } = req.query;

  const result = await companyService.getAllCompanies({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    industry,
    location,
    size,
    status,
    sortBy,
    order,
    clientId: req.user.clientId,
  });

  res.status(200).json(result);
});

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private
export const getCompanyById = asyncHandler(async (req, res) => {
  try {
    console.log(`Controller: Getting company with ID: ${req.params.id}`);
    const company = await companyService.getCompanyById(req.params.id);

    if (!company) {
      console.log(`Controller: Company with ID ${req.params.id} not found`);
      res.status(404);
      throw new Error("Company not found");
    }

    console.log(`Controller: Company ${company.name} retrieved successfully`);
    res.status(200).json(company);
  } catch (error) {
    console.log(
      `Controller: Error getting company with ID ${req.params.id}:`,
      error
    );
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Create new company
// @route   POST /api/companies
// @access  Private
export const createCompany = asyncHandler(async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name) {
      res.status(400);
      throw new Error("Company name is required");
    }
    req.body.clientId = req.user.clientId;
    console.log("Creating company with data:", req.body);
    const company = await companyService.createCompany(req.body);
    console.log("Company created successfully:", company.id);
    res.status(201).json(company);
  } catch (error) {
    console.log("Error in createCompany controller:", error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
export const updateCompany = asyncHandler(async (req, res) => {
  try {
    console.log("Updating company with ID:", req.params.id);
    console.log("Update data:", req.body);

    const company = await companyService.updateCompany(req.params.id, req.body);

    if (!company) {
      console.log("Company not found with ID:", req.params.id);
      res.status(404);
      throw new Error("Company not found");
    }

    console.log("Company updated successfully:", company.id);
    res.status(200).json(company);
  } catch (error) {
    console.log("Error in updateCompany controller:", error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private
export const deleteCompany = asyncHandler(async (req, res) => {
  try {
    console.log(`Controller: Deleting company with ID: ${req.params.id}`);
    const deleted = await companyService.deleteCompany(req.params.id);

    if (!deleted) {
      console.log(`Controller: Company with ID ${req.params.id} not found`);
      res.status(404);
      throw new Error("Company not found");
    }

    console.log(
      `Controller: Company with ID ${req.params.id} deleted successfully`
    );
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.log(
      `Controller: Error deleting company with ID ${req.params.id}:`,
      error
    );
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Add company contact
// @route   POST /api/companies/:id/contacts
// @access  Private
export const addCompanyContact = asyncHandler(async (req, res) => {
  const contact = await companyService.addCompanyContact(
    req.params.id,
    req.body
  );
  res.status(201).json(contact);
});

// @desc    Update company contact
// @route   PUT /api/companies/:id/contacts/:contactId
// @access  Private
export const updateCompanyContact = asyncHandler(async (req, res) => {
  const contact = await companyService.updateCompanyContact(
    req.params.contactId,
    req.body
  );

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  res.status(200).json(contact);
});

// @desc    Delete company contact
// @route   DELETE /api/companies/:id/contacts/:contactId
// @access  Private
export const deleteCompanyContact = asyncHandler(async (req, res) => {
  const deleted = await companyService.deleteCompanyContact(
    req.params.contactId
  );

  if (!deleted) {
    res.status(404);
    throw new Error("Contact not found");
  }

  res.status(200).json({ message: "Contact deleted successfully" });
});

// @desc    Get company contacts
// @route   GET /api/companies/:id/contacts
// @access  Private
export const getCompanyContacts = asyncHandler(async (req, res) => {
  const contacts = await companyService.getCompanyContacts(req.params.id);
  res.status(200).json(contacts);
});

// @desc    Add company document
// @route   POST /api/companies/:id/documents
// @access  Private
export const addCompanyDocument = asyncHandler(async (req, res) => {
  const { file } = req;
  const { id: companyId } = req.params;
  const { id: uploadedBy, clientId } = req.user;
  const documentData = {
    ...req.body,
    uploadedBy,
    clientId,
    fileName: file?.filename,
    originalName: file?.originalname,
    filePath: file?.path,
    fileSize: file?.size,
    mimeType: file?.mimetype,
    // fileType will be set in the service
  };
  const document = await companyService.addCompanyDocument(
    companyId,
    documentData,
    file
  );
  res.status(201).json(document);
});

// @desc    Get company documents
// @route   GET /api/companies/:id/documents
// @access  Private
export const getCompanyDocuments = asyncHandler(async (req, res) => {
  const { category, type } = req.query;
  const documents = await companyService.getCompanyDocuments(req.params.id, {
    category,
    type,
  });
  res.status(200).json(documents);
});

// @desc    Get company document by ID
// @route   GET /api/companies/:id/documents/:documentId
// @access  Private
export const getCompanyDocumentById = asyncHandler(async (req, res) => {
  const document = await companyService.getCompanyDocumentById(
    req.params.documentId
  );

  if (!document) {
    res.status(404);
    throw new Error("Document not found");
  }

  res.status(200).json(document);
});

// @desc    Delete company document
// @route   DELETE /api/companies/:id/documents/:documentId
// @access  Private
export const deleteCompanyDocument = asyncHandler(async (req, res) => {
  const deleted = await companyService.deleteCompanyDocument(
    req.params.documentId
  );

  if (!deleted) {
    res.status(404);
    throw new Error("Document not found");
  }

  res.status(200).json({ message: "Document deleted successfully" });
});

// @desc    Update company document
// @route   PUT /api/companies/:id/documents/:documentId
// @access  Private
export const updateCompanyDocument = asyncHandler(async (req, res) => {
  const { file } = req;
  const document = await companyService.updateCompanyDocument(
    req.params.documentId,
    req.body,
    file
  );
  if (!document) {
    res.status(404);
    throw new Error("Document not found");
  }
  res.status(200).json(document);
});

// @desc    Share company document
// @route   POST /api/companies/:id/documents/:documentId/share
// @access  Private
export const shareCompanyDocument = asyncHandler(async (req, res) => {
  // Accept the full sharing payload (recipients, permission, notes, etc.)
  const shareData = req.body;
  const { documentId } = req.params;
  const userId = req.user.id;
  const clientId = req.user.clientId;

  // Call the service, which will use the main document sharing logic
  const result = await companyService.shareCompanyDocument(
    documentId,
    shareData,
    userId,
    clientId
  );
  res.status(201).json({
    message: "Company document shared successfully",
    shares: result,
  });
});

// @desc    Add company note
// @route   POST /api/companies/:id/notes
// @access  Private
export const addCompanyNote = asyncHandler(async (req, res) => {
  const note = await companyService.addCompanyNote(req.params.id, {
    ...req.body,
    author: req.user.name, // Assuming authentication middleware adds user to req
    date: new Date().toISOString(),
  });

  res.status(201).json(note);
});

// @desc    Get company notes
// @route   GET /api/companies/:id/notes
// @access  Private
export const getCompanyNotes = asyncHandler(async (req, res) => {
  const notes = await companyService.getCompanyNotes(req.params.id);
  res.status(200).json(notes);
});

// @desc    Update company note
// @route   PUT /api/companies/:id/notes/:noteId
// @access  Private
export const updateCompanyNote = asyncHandler(async (req, res) => {
  const note = await companyService.updateCompanyNote(
    req.params.noteId,
    req.body
  );

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  res.status(200).json(note);
});

// @desc    Delete company note
// @route   DELETE /api/companies/:id/notes/:noteId
// @access  Private
export const deleteCompanyNote = asyncHandler(async (req, res) => {
  const deleted = await companyService.deleteCompanyNote(req.params.noteId);

  if (!deleted) {
    res.status(404);
    throw new Error("Note not found");
  }

  res.status(200).json({ message: "Note deleted successfully" });
});

// @desc    Get company jobs
// @route   GET /api/companies/:id/jobs
// @access  Private
export const getCompanyJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, department, searchQuery } = req.query;

  const jobs = await companyService.getCompanyJobs(req.params.id, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    department,
    searchQuery,
  });

  res.status(200).json(jobs);
});

// @desc    Add job to company
// @route   POST /api/companies/:id/jobs
// @access  Private
export const addCompanyJob = asyncHandler(async (req, res) => {
  const job = await companyService.addCompanyJob(req.params.id, req.body);
  res.status(201).json(job);
});

// @desc    Delete job from company
// @route   DELETE /api/companies/:id/jobs/:jobId
// @access  Private
export const deleteCompanyJob = asyncHandler(async (req, res) => {
  const deleted = await companyService.deleteCompanyJob(req.params.jobId);

  if (!deleted) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.status(200).json({ message: "Job deleted successfully" });
});

// @desc    Get company candidates
// @route   GET /api/companies/:id/candidates
// @access  Private
export const getCompanyCandidates = asyncHandler(async (req, res) => {
  try {
    console.log(
      `Controller: Getting candidates for company ID: ${req.params.id}`
    );
    const { page = 1, limit = 10, status, position, searchQuery } = req.query;

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    console.log(
      `Query params: page=${parsedPage}, limit=${parsedLimit}, status=${status}, position=${position}, searchQuery=${searchQuery}`
    );

    // Validate company ID
    if (!req.params.id || isNaN(parseInt(req.params.id))) {
      console.log(`Invalid company ID: ${req.params.id}`);
      return res.status(400).json({
        message: "Invalid company ID",
      });
    }

    const candidates = await companyService.getCompanyCandidates(
      req.params.id,
      {
        page: parsedPage,
        limit: parsedLimit,
        status,
        position,
        searchQuery,
      }
    );

    console.log(
      `Retrieved ${candidates?.candidates?.length || 0} candidates out of ${candidates?.totalCandidates || 0
      } total`
    );

    res.status(200).json(candidates);
  } catch (error) {
    console.log(
      `Error getting candidates for company ${req.params.id}:`,
      error
    );
    res.status(500).json({
      message: `Failed to get candidates: ${error.message}`,
      error: error.name || error.toString(),
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
});

// @desc    Get candidate details for company
// @route   GET /api/companies/:id/candidates/:candidateId
// @access  Private
export const getCompanyCandidateById = asyncHandler(async (req, res) => {
  const candidate = await companyService.getCompanyCandidateById(
    req.params.id,
    req.params.candidateId
  );

  if (!candidate) {
    res.status(404);
    throw new Error("Candidate not found");
  }

  res.status(200).json(candidate);
});

// @desc    Get company activity
// @route   GET /api/companies/:id/activity
// @access  Private
export const getCompanyActivity = asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;

  const activity = await companyService.getCompanyActivity(req.params.id, {
    startDate,
    endDate,
    type,
  });

  res.status(200).json(activity);
});

// @desc    Get company hiring analytics
// @route   GET /api/companies/:id/analytics/hiring
// @access  Private
export const getCompanyHiringAnalytics = asyncHandler(async (req, res) => {
  const { timeframe } = req.query;

  const analytics = await companyService.getCompanyHiringAnalytics(
    req.params.id,
    {
      timeframe,
    }
  );

  res.status(200).json(analytics);
});

// @desc    Get company pipeline analytics
// @route   GET /api/companies/:id/analytics/pipeline
// @access  Private
export const getCompanyPipelineAnalytics = asyncHandler(async (req, res) => {
  const analytics = await companyService.getCompanyPipelineAnalytics(
    req.params.id
  );
  res.status(200).json(analytics);
});

// @desc    Get available industries
// @route   GET /api/companies/industries
// @access  Private
export const getIndustries = asyncHandler(async (req, res) => {
  const industries = await companyService.getIndustries();
  res.status(200).json(industries);
});

// @desc    Add new industry
// @route   POST /api/companies/industries
// @access  Private
export const addIndustry = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Industry name is required");
  }

  const industry = await companyService.addIndustry(name);
  res.status(201).json(industry);
});

// @desc    Get available locations
// @route   GET /api/companies/locations
// @access  Private
export const getLocations = asyncHandler(async (req, res) => {
  const locations = await companyService.getLocations();
  res.status(200).json(locations);
});

// @desc    Add new location
// @route   POST /api/companies/locations
// @access  Private
export const addLocation = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Location name is required");
  }

  const location = await companyService.addLocation(name);
  res.status(201).json(location);
});

// @desc    Get available company sizes
// @route   GET /api/companies/sizes
// @access  Private
export const getCompanySizes = asyncHandler(async (req, res) => {
  const sizes = await companyService.getCompanySizes();
  res.status(200).json(sizes);
});

// @desc    Get company statistics
// @route   GET /api/companies/stats
// @access  Private
export const getCompanyStats = asyncHandler(async (req, res) => {
  const stats = await companyService.getCompanyStats();
  res.status(200).json(stats);
});

// @desc    Validate GSTIN (Indian GST Identification Number)
// @route   POST /api/companies/validate/gstin
// @access  Private
export const validateGSTIN = asyncHandler(async (req, res) => {
  const { gstin } = req.body;

  if (!gstin) {
    res.status(400);
    throw new Error("GSTIN is required");
  }

  // GSTIN format: 2 digits state code + 10 characters PAN + 1 entity number + 1 check digit + Z (for end character)
  const gstinRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const isValid = gstinRegex.test(gstin);

  res.status(200).json({
    gstin,
    isValid,
    message: isValid ? "GSTIN is valid" : "GSTIN is invalid",
  });
});

// @desc    Validate PAN (Indian Permanent Account Number)
// @route   POST /api/companies/validate/pan
// @access  Private
export const validatePAN = asyncHandler(async (req, res) => {
  const { pan } = req.body;

  if (!pan) {
    res.status(400);
    throw new Error("PAN is required");
  }

  // PAN format: 5 letters + 4 numbers + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const isValid = panRegex.test(pan);

  res.status(200).json({
    pan,
    isValid,
    message: isValid ? "PAN is valid" : "PAN is invalid",
  });
});
