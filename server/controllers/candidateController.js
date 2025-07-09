import { candidateService } from "../services/candidateService.js";
import { communicationsService } from "../services/communicationsService.js";
import { Op } from "sequelize";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import os from "os";

// GET /api/candidates
export const getCandidates = async (req, res) => {
  try {
    const clientId = req.user?.clientId;
    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required" });
    }
    const candidates = await candidateService.getCandidates(
      req.query,
      clientId
    );
    res.json({
      data: candidates.rows,
      total: candidates.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/candidates
export const createCandidate = async (req, res) => {
  try {
    const candidateData = req.body;

    // Handle AI parsed data structure (from resume parsing)
    if (candidateData.education && Array.isArray(candidateData.education)) {
      candidateData.educationHistory = candidateData.education;
    }
    if (candidateData.experience && Array.isArray(candidateData.experience)) {
      candidateData.workHistory = candidateData.experience;
    }
    if (candidateData.extraCurricular && Array.isArray(candidateData.extraCurricular)) {
      candidateData.extracurricularActivities = candidateData.extraCurricular;
    }

    // When using multipart/form-data, arrays might be stringified
    if (
      candidateData.certifications &&
      typeof candidateData.certifications === "string"
    ) {
      candidateData.certifications = JSON.parse(candidateData.certifications);
    }
    if (candidateData.skills && typeof candidateData.skills === "string") {
      candidateData.skills = JSON.parse(candidateData.skills);
    }
    if (
      candidateData.assignedJobs &&
      typeof candidateData.assignedJobs === "string"
    ) {
      candidateData.assignedJobs = JSON.parse(candidateData.assignedJobs);
    }
    if (
      candidateData.educationHistory &&
      typeof candidateData.educationHistory === "string"
    ) {
      candidateData.educationHistory = JSON.parse(
        candidateData.educationHistory
      );
    }
    if (
      candidateData.workHistory &&
      typeof candidateData.workHistory === "string"
    ) {
      candidateData.workHistory = JSON.parse(candidateData.workHistory);
    }
    if (
      candidateData.extracurricularActivities &&
      typeof candidateData.extracurricularActivities === "string"
    ) {
      candidateData.extracurricularActivities = JSON.parse(
        candidateData.extracurricularActivities
      );
    }

    // Attach files to education
    if (
      req.files &&
      req.files.educationDocuments &&
      candidateData.educationHistory
    ) {
      req.files.educationDocuments.forEach((file, index) => {
        if (candidateData.educationHistory[index]) {
          candidateData.educationHistory[index].fileData = file;
        }
      });
    }
    // Attach files to experience
    if (
      req.files &&
      req.files.experienceDocuments &&
      candidateData.workHistory
    ) {
      req.files.experienceDocuments.forEach((file, index) => {
        if (candidateData.workHistory[index]) {
          candidateData.workHistory[index].fileData = file;
        }
      });
    }
    // Attach files to extracurricular activities
    if (
      req.files &&
      req.files.activityDocuments &&
      candidateData.extracurricularActivities
    ) {
      req.files.activityDocuments.forEach((file, index) => {
        if (candidateData.extracurricularActivities[index]) {
          candidateData.extracurricularActivities[index].fileData = file;
        }
      });
    }
    // Attach files to certifications
    if (
      req.files &&
      req.files.certificationDocuments &&
      candidateData.certifications
    ) {
      req.files.certificationDocuments.forEach((file, index) => {
        if (candidateData.certifications[index]) {
          candidateData.certifications[index].fileData = file;
        }
      });
    }

    // Set clientId from user
    candidateData.clientId = req.user?.clientId;

    const candidate = await candidateService.createCandidate(
      candidateData,
      req.user
    );

    // Trigger automation for new application
    try {
      if (req.user) {
        console.log(
          `[CANDIDATE][createCandidate] Triggering automation: application_received`
        );

        const context = {
          candidateId: candidate.id,
          senderId: req.user.id,
          customVariables: {
            application_date: new Date().toISOString().split("T")[0],
          },
        };

        // Get job ID if provided in request
        if (req.body.jobId) {
          context.jobId = parseInt(req.body.jobId);
        }

        await communicationsService.triggerCandidateAutomation({
          triggerType: "application_received",
          context,
          tokens: {
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
          },
          clientId: req.user?.clientId || 1,
        });
      }
    } catch (automationError) {
      console.log(
        "[CANDIDATE][createCandidate] Automation error:",
        automationError
      );
      // Don't fail the main request if automation fails
    }

    res.status(201).json(candidate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/candidates/:id
export const getCandidate = async (req, res) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id);
    if (candidate) {
      res.json(candidate);
    } else {
      res.status(404).json({ error: "Candidate not found" });
    }
  } catch (error) {
    console.log("Error in getCandidate controller:", error);
    res.status(500).json({ error: "Failed to retrieve candidate" });
  }
};

// PUT /api/candidates/:id
export const updateCandidate = async (req, res) => {
  const { id } = req.params;
  const candidateData = req.body;
  const user = req.user; // User object from auth middleware

  if (!user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  // When using multipart/form-data, arrays might be stringified
  if (
    candidateData.certifications &&
    typeof candidateData.certifications === "string"
  ) {
    candidateData.certifications = JSON.parse(candidateData.certifications);
  }
  if (candidateData.skills && typeof candidateData.skills === "string") {
    candidateData.skills = JSON.parse(candidateData.skills);
  }
  if (
    candidateData.assignedJobs &&
    typeof candidateData.assignedJobs === "string"
  ) {
    candidateData.assignedJobs = JSON.parse(candidateData.assignedJobs);
  }
  if (
    candidateData.educationHistory &&
    typeof candidateData.educationHistory === "string"
  ) {
    candidateData.educationHistory = JSON.parse(candidateData.educationHistory);
  }
  if (
    candidateData.workHistory &&
    typeof candidateData.workHistory === "string"
  ) {
    candidateData.workHistory = JSON.parse(candidateData.workHistory);
  }
  if (
    candidateData.extracurricularActivities &&
    typeof candidateData.extracurricularActivities === "string"
  ) {
    candidateData.extracurricularActivities = JSON.parse(
      candidateData.extracurricularActivities
    );
  }

  // Attach files to education
  if (
    req.files &&
    req.files.educationDocuments &&
    candidateData.educationHistory
  ) {
    req.files.educationDocuments.forEach((file, index) => {
      if (candidateData.educationHistory[index]) {
        candidateData.educationHistory[index].fileData = file;
      }
    });
  }
  // Attach files to experience
  if (req.files && req.files.experienceDocuments && candidateData.workHistory) {
    req.files.experienceDocuments.forEach((file, index) => {
      if (candidateData.workHistory[index]) {
        candidateData.workHistory[index].fileData = file;
      }
    });
  }
  // Attach files to extracurricular activities
  if (
    req.files &&
    req.files.activityDocuments &&
    candidateData.extracurricularActivities
  ) {
    req.files.activityDocuments.forEach((file, index) => {
      if (candidateData.extracurricularActivities[index]) {
        candidateData.extracurricularActivities[index].fileData = file;
      }
    });
  }
  // Attach files to certifications
  if (
    req.files &&
    req.files.certificationDocuments &&
    candidateData.certifications
  ) {
    req.files.certificationDocuments.forEach((file, index) => {
      if (candidateData.certifications[index]) {
        candidateData.certifications[index].fileData = file;
      }
    });
  }

  candidateData.clientId = req.user?.clientId;

  const result = await candidateService.updateCandidate(
    id,
    candidateData,
    user
  );

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.status(200).json(result);
};

// DELETE /api/candidates/:id
export const deleteCandidate = async (req, res) => {
  try {
    const deleted = await candidateService.deleteCandidate(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Candidate not found" });
    res.json({ message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/candidates/:id/status
export const updateCandidateStatus = async (req, res) => {
  try {
    const oldCandidate = await candidateService.getCandidateById(req.params.id);
    if (!oldCandidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const candidate = await candidateService.updateCandidateStatus(
      req.params.id,
      req.body.status
    );

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Trigger automation based on status change
    try {
      const status = req.body.status.toLowerCase();
      let triggerType = null;

      // Map status to trigger type
      if (status.includes("rejected") || status.includes("declined")) {
        triggerType = "candidate_rejected";
      } else if (status.includes("accepted") || status.includes("hired")) {
        triggerType = "candidate_accepted";
      } else if (status.includes("offer")) {
        triggerType = "offer_sent";
      }

      if (triggerType && req.user) {
        // Check if user has required data for automation
        if (!req.user.clientId) {
          console.warn(
            "[CANDIDATE][updateCandidateStatus] Cannot trigger automation: Client ID not found for user:",
            req.user.id
          );
          // Continue with the main operation, just skip automation
        } else {
          console.log(
            `[CANDIDATE][updateCandidateStatus] Triggering automation: ${triggerType}`
          );

          const context = {
            candidateId: parseInt(req.params.id),
            senderId: req.user.id,
            customVariables: {
              status_change: req.body.status,
              previous_status: oldCandidate.status,
            },
          };

          // Get job ID if candidate has assigned jobs
          const candidateJobs = await candidateService.getCandidateJobs(
            req.params.id
          );
          if (candidateJobs && candidateJobs.length > 0) {
            context.jobId = candidateJobs[0].id; // Use first assigned job
          }

          await communicationsService.triggerCandidateAutomation({
            triggerType,
            context,
            tokens: {
              accessToken: req.user.accessToken,
              refreshToken: req.user.refreshToken,
            },
            clientId: req.user.clientId,
          });
        }
      }
    } catch (automationError) {
      console.log(
        "[CANDIDATE][updateCandidateStatus] Automation error:",
        automationError
      );
      // Don't fail the main request if automation fails
    }

    res.json(candidate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Job Assignments
export const getCandidateJobs = async (req, res) => {
  try {
    console.log("[candidateController] getCandidateJobs: Starting", {
      candidateId: req.params.id,
    });

    const jobs = await candidateService.getCandidateJobs(req.params.id);

    console.log("[candidateController] getCandidateJobs: Success", {
      candidateId: req.params.id,
      jobCount: jobs.length,
    });

    res.json({ jobs });
  } catch (error) {
    console.log("[candidateController] getCandidateJobs: Error", {
      candidateId: req.params.id,
      error: error.message,
    });

    if (error.message === "Candidate not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Failed to fetch candidate jobs",
      error: error.message,
    });
  }
};

export const assignJobsToCandidate = async (req, res) => {
  try {
    console.log("[candidateController] assignJobsToCandidate: Starting", {
      candidateId: req.params.id,
      jobIds: req.body.jobIds,
      userId: req.user?.id,
    });

    await candidateService.assignJobsToCandidate(
      req.params.id,
      req.body.jobIds,
      req.user?.id
    );

    console.log("[candidateController] assignJobsToCandidate: Success", {
      candidateId: req.params.id,
      jobCount: req.body.jobIds.length,
    });

    res.status(201).json({ message: "Jobs assigned successfully" });
  } catch (error) {
    console.log("[candidateController] assignJobsToCandidate: Error", {
      candidateId: req.params.id,
      error: error.message,
      stack: error.stack,
    });
    res.status(400).json({ message: error.message });
  }
};

export const removeJobAssignment = async (req, res) => {
  try {
    await candidateService.removeJobAssignment(req.params.id, req.params.jobId);
    res.json({ message: "Job assignment removed successfully" });
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message });
  }
};

// Resume/Documents
export const getCandidateResume = async (req, res) => {
  try {
    const resume = await candidateService.getCandidateResume(req.params.id);
    res.json(resume);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ message: error.message });
  }
};

export const uploadCandidateResume = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.clientId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: user context missing" });
  }
  try {
    const resume = await candidateService.uploadCandidateResume(
      req.params.id,
      req.file,
      req.user.id,
      req.user.clientId
    );
    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCandidateResume = async (req, res) => {
  try {
    await candidateService.deleteCandidateResume(req.params.id);
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Education History
export const getCandidateEducation = async (req, res) => {
  try {
    const education = await candidateService.getCandidateEducation(
      req.params.id
    );
    res.json(education);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCandidateEducation = async (req, res) => {
  try {
    const education = await candidateService.addCandidateEducation(
      req.params.id,
      req.body
    );
    res.status(201).json(education);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCandidateEducation = async (req, res) => {
  try {
    await candidateService.updateCandidateEducation(
      req.params.id,
      req.params.educationId,
      req.body
    );
    res.json({ message: "Education record updated successfully" });
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message });
  }
};

export const deleteCandidateEducation = async (req, res) => {
  try {
    await candidateService.deleteCandidateEducation(
      req.params.id,
      req.params.educationId
    );
    res.json({ message: "Education record deleted successfully" });
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ message: error.message });
  }
};

// Work Experience
export const getCandidateExperience = async (req, res) => {
  try {
    const experience = await candidateService.getCandidateExperience(
      req.params.id
    );
    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCandidateExperience = async (req, res) => {
  try {
    const experience = await candidateService.addCandidateExperience(
      req.params.id,
      req.body
    );
    res.status(201).json(experience);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCandidateExperience = async (req, res) => {
  try {
    await candidateService.updateCandidateExperience(
      req.params.id,
      req.params.experienceId,
      req.body
    );
    res.json({ message: "Experience record updated successfully" });
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message });
  }
};

export const deleteCandidateExperience = async (req, res) => {
  try {
    await candidateService.deleteCandidateExperience(
      req.params.id,
      req.params.experienceId
    );
    res.json({ message: "Experience record deleted successfully" });
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ message: error.message });
  }
};

// Extracurricular Activities
export const getCandidateActivities = async (req, res) => {
  try {
    const activities = await candidateService.getCandidateActivities(
      req.params.id
    );
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCandidateActivity = async (req, res) => {
  try {
    const activity = await candidateService.addCandidateActivity(
      req.params.id,
      req.body
    );
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCandidateActivity = async (req, res) => {
  try {
    await candidateService.updateCandidateActivity(
      req.params.id,
      req.params.activityId,
      req.body
    );
    res.json({ message: "Activity record updated successfully" });
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message });
  }
};

export const deleteCandidateActivity = async (req, res) => {
  try {
    await candidateService.deleteCandidateActivity(
      req.params.id,
      req.params.activityId
    );
    res.json({ message: "Activity record deleted successfully" });
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ message: error.message });
  }
};

// Documents
export const uploadCandidateDocuments = async (req, res) => {
  try {
    const { type, entityId } = req.body;
    const files = req.files;
    if (!type || !entityId || !files || files.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing type, entityId, or files" });
    }
    const docs = await candidateService.uploadCandidateDocuments(
      req.params.id,
      type,
      entityId,
      files,
      req.user?.id,
      req.user?.clientId
    );
    res.status(201).json(docs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCandidateDocument = async (req, res) => {
  try {
    const doc = await candidateService.updateCandidateDocument(
      req.params.id,
      req.params.documentId,
      req.file,
      req.user?.id,
      req.user?.clientId
    );
    res.status(200).json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCandidateDocuments = async (req, res) => {
  try {
    const docs = await candidateService.getCandidateDocuments(req.params.id);
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCandidateDocument = async (req, res) => {
  try {
    await candidateService.deleteCandidateDocument(
      req.params.id,
      req.params.documentId
    );
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filtering and Reference Data
export const getPositions = async (req, res) => {
  try {
    const positions = await candidateService.getPositions();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addPosition = async (req, res) => {
  try {
    const position = await candidateService.addPosition(req.body.title);
    res.status(201).json(position);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSkills = async (req, res) => {
  try {
    const skills = await candidateService.getSkills();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addSkill = async (req, res) => {
  try {
    const skill = await candidateService.addSkill(req.body.name);
    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Bulk Operations
export const bulkUploadCandidates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please upload a CSV file containing candidate data",
      });
    }

    if (!req.user || !req.user.clientId) {
      return res.status(400).json({
        error: "User context required",
        message: "Please ensure you are logged in with proper permissions",
      });
    }

    const results = await candidateService.bulkUploadCandidates(req.file.path, req.user);

    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.log("Error deleting uploaded file:", err);
    });

    res.status(201).json({
      message: "Bulk upload completed",
      success: results.success,
      failed: results.failed,
      total: results.total,
      errors: results.errors,
      candidates: results.candidates,
    });
  } catch (error) {
    console.log("Error in bulkUploadCandidates:", error);

    // Clean up the uploaded file in case of error
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Error deleting uploaded file:", err);
      });
    }

    res.status(400).json({
      error: "Failed to process bulk upload",
      message: error.message,
    });
  }
};

// Bulk Resume Upload
export const bulkUploadResumes = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
        message: "Please upload one or more resume files (PDF or DOCX)",
      });
    }

    if (!req.user || !req.user.id || !req.user.clientId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User context missing",
      });
    }

    // Validate file types
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const invalidFiles = req.files.filter(file => {
      const ext = path.extname(file.originalname).toLowerCase();
      return !validExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        error: "Invalid file types",
        message: `The following files have invalid formats: ${invalidFiles.map(f => f.originalname).join(', ')}. Only PDF, DOCX, and DOC files are supported.`,
      });
    }

    // Map multer file objects to expected format
    const mappedFiles = req.files.map(file => ({
      name: file.originalname || file.filename,
      path: file.path,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }));

    const results = await candidateService.bulkUploadResumes(mappedFiles, req.user);

    // Note: Do NOT clean up uploaded files here as they will be needed for resume storage after candidate creation
    // Files will be cleaned up by the resume storage process or by a scheduled cleanup task

    // Only return parsed data, do NOT create any candidates here
    res.status(201).json({
      message: "Bulk resume parsing completed",
      success: results.success,
      failed: results.failed,
      total: results.total,
      errors: results.errors,
      candidates: [], // No candidates created yet
      parseResults: results.parseResults,
    });
  } catch (error) {
    console.log("Error in bulkUploadResumes:", error);

    // Clean up uploaded files in case of error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.log(`Error deleting uploaded file ${file.originalname}:`, err);
        });
      });
    }

    res.status(400).json({
      error: "Failed to process bulk resume upload",
      message: error.message,
    });
  }
};

// Statistics
export const getCandidateStats = async (req, res) => {
  try {
    const stats = await candidateService.getCandidateStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/candidates/with-skills
export const getCandidatesWithSkills = async (req, res) => {
  try {
    const candidates = await candidateService.getAllCandidatesWithSkills();
    res.json({
      data: candidates.rows,
      total: candidates.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Certification Controllers
export const getCandidateCertifications = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const certifications = await candidateService.getCandidateCertifications(
      candidateId
    );
    res.json(certifications);
  } catch (error) {
    console.log("Error getting candidate certifications:", error);
    res.status(500).json({ error: "Failed to get candidate certifications" });
  }
};

export const createCandidateCertification = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const certificationData = req.body;

    if (!req.user || !req.user.id || !req.user.clientId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user context missing" });
    }

    const certification = await candidateService.addCandidateCertification(
      candidateId,
      certificationData,
      req.file,
      req.user.id,
      req.user.clientId
    );
    res.status(201).json(certification);
  } catch (error) {
    console.log("Error creating candidate certification:", error);
    res.status(500).json({ error: "Failed to create candidate certification" });
  }
};

export const updateCandidateCertification = async (req, res) => {
  try {
    const { candidateId, certificationId } = req.params;
    const certificationData = req.body;

    if (!req.user || !req.user.id || !req.user.clientId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user context missing" });
    }

    const certification = await candidateService.updateCandidateCertification(
      candidateId,
      certificationId,
      certificationData,
      req.file,
      req.user.id,
      req.user.clientId
    );
    if (!certification) {
      return res.status(404).json({ error: "Certification not found" });
    }
    res.json(certification);
  } catch (error) {
    console.log("Error updating candidate certification:", error);
    res.status(500).json({ error: "Failed to update candidate certification" });
  }
};

export const deleteCandidateCertification = async (req, res) => {
  try {
    const { candidateId, certificationId } = req.params;
    const deleted = await candidateService.deleteCandidateCertification(
      candidateId,
      certificationId
    );
    if (!deleted) {
      return res.status(404).json({ error: "Certification not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.log("Error deleting candidate certification:", error);
    res.status(500).json({ error: "Failed to delete candidate certification" });
  }
};

// GET /api/candidates/with-relations
export const getCandidatesWithRelations = async (req, res) => {
  console.log("[candidateController] getCandidatesWithRelations called");
  try {
    console.log(
      "[candidateController] Calling getAllCandidatesWithRelations service"
    );
    const candidates = await candidateService.getAllCandidatesWithRelations();
    console.log("[candidateController] Service returned:", {
      hasData: !!candidates,
      count: candidates?.count,
      rowsCount: candidates?.rows?.length,
      firstRowId: candidates?.rows?.[0]?.id,
    });

    if (!candidates || !candidates.rows) {
      console.log(
        "[candidateController] Invalid response from service:",
        candidates
      );
      throw new Error("Invalid response from service");
    }

    console.log("[candidateController] Sending response");
    res.json({
      data: candidates.rows,
      total: candidates.count,
    });
  } catch (err) {
    console.log("[candidateController] Error in getCandidatesWithRelations:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      original: err.original,
    });
    res.status(500).json({
      error: err.message,
      details:
        process.env.NODE_ENV === "development"
          ? {
            stack: err.stack,
            name: err.name,
            code: err.code,
          }
          : undefined,
    });
  }
};

// Generate bulk upload template
export const generateBulkUploadTemplate = async (req, res) => {
  try {
    // Define headers with exact field names that match the database
    const headers = [
      "Full Name*",
      "Email*",
      "Phone*",
      "Position*",
      "Position Type*",
      "Status*",
      "Location",
      "Education",
      "Bio",
      "Skills (semicolon separated)*",
      "Current Company",
      "Current Role",
      "Notice Period (days)",
      "Expected CTC (LPA)",
      "Current CTC (LPA)",
      "LinkedIn URL",
      "GitHub URL",
      "Portfolio URL",
      "Resume URL",
    ];

    // Sample data with semicolon-separated skills
    const sampleData = [
      [
        "John Doe",
        "john.doe@example.com",
        "9876543210",
        "Frontend Developer",
        "frontend",
        "Applied",
        "Bangalore; India",
        "B.Tech in Computer Science",
        "Experienced frontend developer with 5 years of experience in React",
        "React; JavaScript; TypeScript; HTML; CSS",
        "Tech Corp",
        "Senior Frontend Developer",
        "30",
        "25",
        "20",
        "https://linkedin.com/in/johndoe",
        "https://github.com/johndoe",
        "https://johndoe.dev",
        "https://example.com/resume.pdf",
      ],
      [
        "Jane Smith",
        "jane.smith@example.com",
        "9876543211",
        "Backend Developer",
        "backend",
        "Screening",
        "Mumbai; India",
        "M.Tech in Software Engineering",
        "Backend developer specializing in Node.js and Python",
        "Node.js; Python; PostgreSQL; AWS; Docker",
        "Data Systems Inc",
        "Lead Backend Developer",
        "60",
        "35",
        "28",
        "https://linkedin.com/in/janesmith",
        "https://github.com/janesmith",
        "https://janesmith.dev",
        "https://example.com/jane-resume.pdf",
      ],
    ];

    // Create a temporary file
    const tempFilePath = path.join(
      os.tmpdir(),
      "candidate-bulk-upload-template.csv"
    );
    const writeStream = fs.createWriteStream(tempFilePath);

    // Write headers
    writeStream.write(headers.join(",") + "\n");

    // Write sample data
    sampleData.forEach((row) => {
      writeStream.write(row.join(",") + "\n");
    });

    writeStream.end();

    // Wait for the file to be written
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Set response headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=candidate-bulk-upload-template.csv"
    );

    // Stream the file to the response
    const readStream = fs.createReadStream(tempFilePath);
    readStream.pipe(res);

    // Clean up the temporary file after sending
    readStream.on("end", () => {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.log("Error deleting temporary file:", err);
      });
    });
  } catch (error) {
    console.log("Error generating template:", error);
    res.status(500).json({
      error: "Failed to generate template file",
    });
  }
};

// Cleanup orphaned documents
export const cleanupOrphanedDocuments = async (req, res) => {
  try {
    console.log(
      "[candidateController] cleanupOrphanedDocuments: Starting cleanup"
    );

    await candidateService.cleanupOrphanedDocuments();

    console.log(
      "[candidateController] cleanupOrphanedDocuments: Cleanup completed"
    );

    res.json({
      message: "Orphaned documents cleanup completed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(
      "[candidateController] cleanupOrphanedDocuments: Error",
      error
    );
    res.status(500).json({
      error: "Failed to cleanup orphaned documents",
      message: error.message,
    });
  }
};

// Manually trigger job matching for a candidate
export const triggerJobMatching = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const clientId = req.user?.clientId;
    const userId = req.user?.id;

    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required" });
    }

    if (!candidateId) {
      return res.status(400).json({ error: "Candidate ID is required" });
    }

    console.log(
      `[candidateController] triggerJobMatching: Starting for candidate ${candidateId} in client ${clientId}`
    );

    const result = await candidateService.processCandidateJobMatching(
      candidateId,
      clientId,
      userId
    );

    console.log(
      `[candidateController] triggerJobMatching: Completed for candidate ${candidateId}`
    );

    res.json({
      message: "Job matching completed successfully",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(
      `[candidateController] triggerJobMatching: Error for candidate ${req.params.candidateId}`,
      error
    );
    res.status(500).json({
      error: "Failed to trigger job matching",
      message: error.message,
    });
  }
};

// Optimized controller methods for better performance
export const getCandidateProfileOptimized = async (req, res) => {
  try {
    const candidate = await candidateService.getCandidateProfileOptimized(req.params.id);
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidateEducationOptimized = async (req, res) => {
  try {
    const education = await candidateService.getCandidateEducationOptimized(req.params.id);
    res.json(education);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidateExperienceOptimized = async (req, res) => {
  try {
    const experience = await candidateService.getCandidateExperienceOptimized(req.params.id);
    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidateActivitiesOptimized = async (req, res) => {
  try {
    const activities = await candidateService.getCandidateActivitiesOptimized(req.params.id);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidateCertificationsOptimized = async (req, res) => {
  try {
    const certifications = await candidateService.getCandidateCertificationsOptimized(req.params.id);
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export async function getFinalStageCandidates(req, res) {
  try {
    const data = await candidateService.getFinalStageCandidatesWithJobsService();
    res.json(data);
  } catch (error) {
    console.log("[getFinalStageCandidates] Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch final stage candidates" });
  }
}

// Store resume after candidate creation (for bulk upload flow)
export const storeResumeAfterCreation = async (req, res) => {
  try {
    const { candidateId, originalFileName, filePath } = req.body;

    if (!candidateId || !originalFileName || !filePath) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "candidateId, originalFileName, and filePath are required",
      });
    }

    if (!req.user || !req.user.id || !req.user.clientId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User context missing",
      });
    }

    const result = await candidateService.storeResumeAfterCreation(
      candidateId,
      originalFileName,
      filePath,
      req.user
    );

    if (!result.success) {
      return res.status(400).json({
        error: "Failed to store resume",
        message: result.error,
      });
    }

    res.status(201).json({
      message: "Resume stored successfully",
      result: result.result,
    });
  } catch (error) {
    console.log("Error in storeResumeAfterCreation:", error);
    res.status(400).json({
      error: "Failed to store resume",
      message: error.message,
    });
  }
};

// Cleanup temporary resume files
export const cleanupTempResumeFiles = async (req, res) => {
  try {
    if (!req.user || !req.user.id || !req.user.clientId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User context missing",
      });
    }

    await candidateService.cleanupTemporaryResumeFiles();

    res.status(200).json({
      message: "Temporary resume files cleanup completed",
    });
  } catch (error) {
    console.log("Error in cleanupTempResumeFiles:", error);
    res.status(500).json({
      error: "Failed to cleanup temporary files",
      message: error.message,
    });
  }
};
