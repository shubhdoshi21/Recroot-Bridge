import * as candidateRepository from "../repositories/candidateRepository.js";
import { Op } from "sequelize";
import csv from "csv-parser";
import fs from "fs";
import {
  CandidateSkillMap,
  Skills,
  Application,
  ApplicationAttachment,
  ApplicationTag,
  Job,
  Company,
  Document,
  CandidateEducation,
  CandidateExperience,
  CandidateExtraCurricular,
  CandidateCertification,
  CandidateDocument,
  User,
  CandidateJobMap,
  Candidate,
} from "../models/index.js";
import { sequelize } from "../config/sequelize.js";
import { matchCandidateWithJobs } from "./ats-scoring.service.js";
import { parseMultipleResumes } from "./resumeParserService.js";
import path from "path";

// Utility function for logging database operations
const logDatabaseOperation = (operation, startTime) => {
  const duration = Date.now() - startTime;
  console.log(`[Database] ${operation} completed in ${duration}ms`);
};

// Candidate CRUD
const getCandidates = async (query, clientId) => {
  try {
    const {
      sortBy = "dateAdded",
      order = "DESC",
      position,
      skills,
      experience,
      searchQuery,
    } = query;

    const where = {};
    if (position && position !== "") where.position = position;
    if (skills)
      where.skills = {
        [Op.overlap]: Array.isArray(skills) ? skills : [skills],
      };
    if (experience)
      where.totalExperience = { [Op.gte]: parseFloat(experience) };
    if (searchQuery && searchQuery !== "") {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { email: { [Op.iLike]: `%${searchQuery}%` } },
        { position: { [Op.iLike]: `%${searchQuery}%` } },
      ];
    }
    if (clientId) {
      where.clientId = clientId;
    }

    const options = {
      order: [[sortBy, order]],
      include: [
        {
          model: CandidateJobMap,
          as: "CandidateJobMaps",
          attributes: ["id", "status", "assignedDate", "jobId", "candidateId"],
        },
      ],
    };

    return await candidateRepository.findCandidates(where, options);
  } catch (error) {
    throw error;
  }
};

const deduplicateArray = (arr, keyFn) => {
  const seen = new Set();
  return arr.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const createCandidate = async (data, user) => {
  // Truncate bio to 255 chars if present
  if (data.bio && data.bio.length > 255) {
    data.bio = data.bio.substring(0, 255);
  }

  // Hard delete any old arrays to prevent duplicates
  delete data.education;
  delete data.experience;
  delete data.extraCurricular;

  // Deduplicate arrays before saving
  if (data.skills) {
    data.skills = deduplicateArray(data.skills, skill => (skill || '').trim().toLowerCase());
  }
  if (data.educationHistory) {
    data.educationHistory = deduplicateArray(data.educationHistory, edu => [edu.degree, edu.institution, edu.fieldOfStudy, edu.startDate, edu.endDate, edu.location].map(x => (x || '').trim().toLowerCase()).join('|'));
  }
  if (data.workHistory) {
    data.workHistory = deduplicateArray(data.workHistory, exp => [exp.title, exp.company, exp.location, exp.startDate, exp.endDate].map(x => (x || '').trim().toLowerCase()).join('|'));
  }
  if (data.certifications) {
    data.certifications = deduplicateArray(data.certifications, cert => [cert.certificationName, cert.issuingOrganization, cert.issueDate, cert.expiryDate].map(x => (x || '').trim().toLowerCase()).join('|'));
  }
  if (data.extracurricularActivities) {
    data.extracurricularActivities = deduplicateArray(data.extracurricularActivities, activity => [activity.title, activity.organization, activity.description].map(x => (x || '').trim().toLowerCase()).join('|'));
  }

  const existingCandidate =
    await candidateRepository.findCandidateByEmailAndClient(
      data.email,
      data.clientId
    );
  if (existingCandidate)
    throw new Error(
      "A candidate with this email already exists for this client"
    );
  const candidate = await candidateRepository.createCandidate(data, user);

  // Handle AI parsed data - create related records
  if (candidate && candidate.id) {
    try {
      // Delete all existing related records for this candidate
      await CandidateEducation.destroy({ where: { candidateId: candidate.id } });
      await CandidateExperience.destroy({ where: { candidateId: candidate.id } });
      await CandidateCertification.destroy({ where: { candidateId: candidate.id } });
      await CandidateExtraCurricular.destroy({ where: { candidateId: candidate.id } });
      await CandidateSkillMap.destroy({ where: { candidateId: candidate.id } });

      // Add skills
      if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
        for (const skillName of data.skills) {
          try {
            // Find or create skill
            let skill = await Skills.findOne({ where: { title: skillName } });
            if (!skill) {
              skill = await Skills.create({ title: skillName });
            }

            // Create skill mapping
            await CandidateSkillMap.create({
              candidateId: candidate.id,
              skillId: skill.id,
            });
          } catch (skillError) {
            console.log(`[candidateService] Error adding skill ${skillName}:`, skillError);
          }
        }
      }

      // Add education
      if (data.educationHistory && Array.isArray(data.educationHistory) && data.educationHistory.length > 0) {
        for (const edu of data.educationHistory) {
          try {
            await CandidateEducation.create({
              candidateId: candidate.id,
              degree: edu.degree,
              institution: edu.institution,
              fieldOfStudy: edu.fieldOfStudy,
              startDate: edu.startDate,
              endDate: edu.endDate,
              location: edu.location,
            });
          } catch (eduError) {
            console.log(`[candidateService] Error adding education:`, eduError);
          }
        }
      }

      // Add experience
      if (data.workHistory && Array.isArray(data.workHistory) && data.workHistory.length > 0) {
        for (const exp of data.workHistory) {
          try {
            await CandidateExperience.create({
              candidateId: candidate.id,
              title: exp.title,
              company: exp.company,
              location: exp.location,
              startDate: exp.startDate,
              endDate: exp.endDate,
              description: exp.description,
              isCurrentRole: exp.isCurrentRole,
            });
          } catch (expError) {
            console.log(`[candidateService] Error adding experience:`, expError);
          }
        }
      }

      // Add certifications
      if (data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0) {
        for (const cert of data.certifications) {
          try {
            await CandidateCertification.create({
              candidateId: candidate.id,
              certificationName: cert.certificationName,
              issuingOrganization: cert.issuingOrganization,
              issueDate: cert.issueDate,
              expiryDate: cert.expiryDate,
            });
          } catch (certError) {
            console.log(`[candidateService] Error adding certification:`, certError);
          }
        }
      }

      // Add extracurricular activities
      if (data.extracurricularActivities && Array.isArray(data.extracurricularActivities) && data.extracurricularActivities.length > 0) {
        for (const activity of data.extracurricularActivities) {
          try {
            // Truncate description if it's too long (safety measure)
            let description = activity.description;
            if (description && description.length > 65535) { // TEXT field limit
              description = description.substring(0, 65535);
              console.log(`[candidateService] Truncated extracurricular description for ${activity.title}`);
            }

            await CandidateExtraCurricular.create({
              candidateId: candidate.id,
              title: activity.title,
              organization: activity.organization,
              description: description,
            });
          } catch (activityError) {
            console.log(`[candidateService] Error adding extracurricular:`, activityError);
          }
        }
      }
    } catch (error) {
      console.log(`[candidateService] Error creating related records:`, error);
    }
  }

  // Trigger ATS re-matching and automatic job applications asynchronously
  if (candidate && candidate.id && data.clientId) {
    processCandidateJobMatching(candidate.id, data.clientId, user?.id).catch(
      console.log
    );
  }
  return candidate;
};

const getCandidateById = async (id) => {
  const startTime = Date.now();
  try {
    const candidate = await candidateRepository.findCandidateById(id);

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Normalize skills data more efficiently
    const skills = new Set();
    if (candidate.Skills && Array.isArray(candidate.Skills)) {
      candidate.Skills.forEach(skill => skills.add(skill.title));
    }
    candidate.dataValues.skills = Array.from(skills);

    logDatabaseOperation('getCandidateById', startTime);
    return candidate;
  } catch (error) {
    console.log("Error in getCandidateById:", error);
    throw error;
  }
};

const updateCandidate = async (id, data, user) => {
  try {
    console.log("[candidateService] updateCandidate: Starting", {
      id,
      email: data.email,
      clientId: data.clientId,
      user: user?.id
    });

    // Only check email uniqueness if email is provided and not empty
    if (data.email && data.email.trim() !== '') {
      const existingCandidate =
        await candidateRepository.findCandidateByEmailAndClient(
          data.email,
          data.clientId
        );

      console.log("[candidateService] updateCandidate: Email check", {
        existingCandidateId: existingCandidate?.id,
        currentId: id,
        isConflict: existingCandidate && existingCandidate.id.toString() !== id
      });

      if (existingCandidate && existingCandidate.id.toString() !== id) {
        throw new Error(
          "A candidate with this email already exists for this client."
        );
      }
    } else {
      console.log("[candidateService] updateCandidate: Skipping email check - email is empty or null");
    }

    // Add timeout handling for the update operation
    const updatePromise = candidateRepository.updateCandidate(id, data, user);

    // Set a timeout for the entire update operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error("Candidate update operation timed out. Please try again.")
        );
      }, 90000); // 90 seconds timeout
    });

    const updatedCandidate = await Promise.race([
      updatePromise,
      timeoutPromise,
    ]);

    // Trigger ATS re-matching and automatic job applications asynchronously
    if (updatedCandidate && data.clientId) {
      processCandidateJobMatching(id, data.clientId, user?.id).catch(
        console.log
      );
    }

    return { data: updatedCandidate };
  } catch (error) {
    console.log("Error in updateCandidate:", error);

    // Provide more specific error messages
    if (error.message.includes("timed out")) {
      return {
        error: "The operation took too long to complete. Please try again.",
      };
    } else if (
      error.name === "SequelizeDatabaseError" &&
      error.parent?.code === "ETIMEOUT"
    ) {
      return { error: "Database operation timed out. Please try again." };
    } else {
      return { error: error.message };
    }
  }
};

const deleteCandidate = async (id) => candidateRepository.deleteCandidate(id);

// Job Assignments
const getCandidateJobs = async (candidateId) => {
  try {
    console.log("[candidateService] getCandidateJobs: Starting", {
      candidateId,
    });

    if (!candidateId) {
      throw new Error("Candidate ID is required");
    }

    const jobs = await candidateRepository.getCandidateJobs(candidateId);

    console.log("[candidateService] getCandidateJobs: Success", {
      candidateId,
      jobCount: jobs.length,
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.jobTitle,
        companyId: job.companyId,
        status: job.jobStatus,
        assignedDate: job.CandidateJobMap?.assignedDate,
        assignedBy: job.CandidateJobMap?.assignedBy,
      })),
    });

    return jobs.map((job) => ({
      id: job.id,
      title: job.jobTitle,
      companyId: job.companyId,
      status: job.jobStatus,
      assignedDate: job.CandidateJobMap?.assignedDate,
      assignedBy: job.CandidateJobMap?.assignedBy,
    }));
  } catch (error) {
    console.log("[candidateService] getCandidateJobs: Error", {
      candidateId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const assignJobsToCandidate = async (candidateId, jobIds, userId) => {
  if (!candidateId) throw new Error("Candidate ID is required");
  if (!jobIds || !Array.isArray(jobIds))
    throw new Error("Invalid job IDs provided");

  // Verify candidate exists
  const candidate = await candidateRepository.findCandidateById(candidateId);
  if (!candidate) throw new Error("Candidate not found");

  // Verify all jobs exist
  const jobs = await Job.findAll({
    where: { id: { [Op.in]: jobIds } },
  });
  if (jobs.length !== jobIds.length) {
    throw new Error("One or more jobs not found");
  }

  // Get user info for assignedBy
  const user = await User.findByPk(userId);
  const assignedBy = user ? `${user.firstName} ${user.lastName}` : "System";

  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Assign jobs
    const assignments = await candidateRepository.assignJobsToCandidate(
      candidateId,
      jobIds,
      assignedBy,
      transaction
    );

    // Create application records for each job
    for (const jobId of jobIds) {
      // Check if application already exists
      const existingApplication = await Application.findOne({
        where: {
          candidateId,
          jobId,
        },
        transaction,
      });

      if (!existingApplication) {
        // Create new application
        await Application.create(
          {
            candidateId,
            jobId,
            status: "assigned",
            appliedDate: new Date(),
            source: "manual_assignment",
            notes: `Manually assigned by ${assignedBy}`,
            currentStage: 1,
            stageHistory: JSON.stringify([
              {
                stage: 1,
                status: "assigned",
                date: new Date(),
                updatedBy: assignedBy,
              },
            ]),
          },
          { transaction }
        );
      }

      // Update applicants count for each job within the transaction
      await Job.update(
        {
          applicants: sequelize.literal(
            '(SELECT COUNT(*) FROM "candidate_job_maps" WHERE "jobId" = ' +
            jobId +
            ")"
          ),
        },
        {
          where: { id: jobId },
          transaction,
        }
      );
    }

    // Update candidate status to most advanced
    const allApplications = await Application.findAll({
      where: { candidateId },
      transaction,
    });
    const statuses = allApplications.map((app) => app.status);
    const mostAdvanced = getMostAdvancedStatus(statuses);
    await Candidate.update(
      { status: mostAdvanced },
      { where: { id: candidateId }, transaction }
    );

    // Update CandidateJobMap status to 'applicant' for this job
    await CandidateJobMap.update(
      { status: "applicant" },
      { where: { candidateId, jobId }, transaction }
    );

    await transaction.commit();

    // Return updated candidate with job assignments
    return candidateRepository.findCandidateById(candidateId);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.log("Error in assignJobsToCandidate:", error);
    throw error;
  }
};

const removeJobAssignment = async (candidateId, jobId) => {
  if (!jobId) throw new Error("Job ID is required");
  return candidateRepository.removeJobAssignment(candidateId, jobId);
};

// Resume/Documents
const getCandidateResume = async (candidateId) => {
  const link = await candidateRepository.getCandidateResume(candidateId);
  if (!link) return null;
  const doc = await Document.findByPk(link.documentId);
  if (!doc) return null;
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";
  return {
    id: doc.id,
    name: doc.name,
    fileName: doc.fileName,
    originalName: doc.originalName,
    filePath: doc.filePath,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    uploadedAt: doc.uploadedAt,
    url: `${API_BASE_URL}/documents/${doc.id}/preview`,
    downloadUrl: `${API_BASE_URL}/documents/${doc.id}/download`,
    type: doc.fileType,
  };
};

const uploadCandidateResume = async (
  candidateId,
  fileData,
  uploadedBy,
  clientId
) => {
  const link = await candidateRepository.uploadCandidateResume(
    candidateId,
    fileData,
    uploadedBy,
    clientId
  );
  // Return the document metadata for frontend
  const doc = await Document.findByPk(link.documentId);
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";
  return {
    id: doc.id,
    name: doc.name,
    fileName: doc.fileName,
    originalName: doc.originalName,
    filePath: doc.filePath,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    uploadedAt: doc.uploadedAt,
    url: `${API_BASE_URL}/documents/${doc.id}/preview`,
    downloadUrl: `${API_BASE_URL}/documents/${doc.id}/download`,
    type: doc.fileType,
  };
};

const deleteCandidateResume = async (candidateId) => {
  return candidateRepository.deleteCandidateResume(candidateId);
};

// Education History
const getCandidateEducation = async (candidateId) => {
  const education = await candidateRepository.getCandidateEducation(
    candidateId
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  return education.map((edu) => ({
    ...edu.toJSON(),
    Document: edu.Document
      ? {
        ...edu.Document.toJSON(),
        url: `${API_BASE_URL}/documents/${edu.Document.id}/preview`,
        downloadUrl: `${API_BASE_URL}/documents/${edu.Document.id}/download`,
      }
      : null,
  }));
};

const addCandidateEducation = async (candidateId, educationData) => {
  const education = await candidateRepository.addCandidateEducation(
    candidateId,
    educationData
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  if (education.Document) {
    education.Document.dataValues.url = `${API_BASE_URL}/documents/${education.Document.id}/preview`;
    education.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${education.Document.id}/download`;
  }

  return education;
};

const updateCandidateEducation = async (
  candidateId,
  educationId,
  educationData
) => {
  const education = await candidateRepository.updateCandidateEducation(
    candidateId,
    educationId,
    educationData
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  if (education && education.Document) {
    education.Document.dataValues.url = `${API_BASE_URL}/documents/${education.Document.id}/preview`;
    education.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${education.Document.id}/download`;
  }

  return education;
};

const deleteCandidateEducation = async (candidateId, educationId) => {
  const deleted = await candidateRepository.deleteCandidateEducation(
    candidateId,
    educationId
  );
  if (!deleted) throw new Error("Education record not found");
  return deleted;
};

// Work Experience
const getCandidateExperience = async (candidateId) => {
  const experience = await candidateRepository.getCandidateExperience(
    candidateId
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  return experience.map((exp) => ({
    ...exp.toJSON(),
    Document: exp.Document
      ? {
        ...exp.Document.toJSON(),
        url: `${API_BASE_URL}/documents/${exp.Document.id}/preview`,
        downloadUrl: `${API_BASE_URL}/documents/${exp.Document.id}/download`,
      }
      : null,
  }));
};

const addCandidateExperience = async (candidateId, experienceData) => {
  const experience = await candidateRepository.addCandidateExperience(
    candidateId,
    experienceData
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  if (experience.Document) {
    experience.Document.dataValues.url = `${API_BASE_URL}/documents/${experience.Document.id}/preview`;
    experience.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${experience.Document.id}/download`;
  }

  return experience;
};

const updateCandidateExperience = async (
  candidateId,
  experienceId,
  experienceData
) => {
  const experience = await candidateRepository.updateCandidateExperience(
    candidateId,
    experienceId,
    experienceData
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  if (experience && experience.Document) {
    experience.Document.dataValues.url = `${API_BASE_URL}/documents/${experience.Document.id}/preview`;
    experience.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${experience.Document.id}/download`;
  }

  return experience;
};

const deleteCandidateExperience = async (candidateId, experienceId) => {
  const deleted = await candidateRepository.deleteCandidateExperience(
    candidateId,
    experienceId
  );
  if (!deleted) throw new Error("Experience record not found");
  return deleted;
};

// Extracurricular Activities
const getCandidateActivities = async (candidateId) => {
  const activities = await candidateRepository.getCandidateActivities(
    candidateId
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  return activities.map((activity) => ({
    ...activity.toJSON(),
    Document: activity.Document
      ? {
        ...activity.Document.toJSON(),
        url: `${API_BASE_URL}/documents/${activity.Document.id}/preview`,
        downloadUrl: `${API_BASE_URL}/documents/${activity.Document.id}/download`,
      }
      : null,
  }));
};

const addCandidateActivity = async (candidateId, activityData) => {
  const activity = await candidateRepository.addCandidateActivity(
    candidateId,
    activityData
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  if (activity.Document) {
    activity.Document.dataValues.url = `${API_BASE_URL}/documents/${activity.Document.id}/preview`;
    activity.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${activity.Document.id}/download`;
  }

  return activity;
};

const updateCandidateActivity = async (
  candidateId,
  activityId,
  activityData
) => {
  const activity = await candidateRepository.updateCandidateActivity(
    candidateId,
    activityId,
    activityData
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  if (activity && activity.Document) {
    activity.Document.dataValues.url = `${API_BASE_URL}/documents/${activity.Document.id}/preview`;
    activity.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${activity.Document.id}/download`;
  }

  return activity;
};

const deleteCandidateActivity = async (candidateId, activityId) => {
  const deleted = await candidateRepository.deleteCandidateActivity(
    candidateId,
    activityId
  );
  if (!deleted) throw new Error("Activity record not found");
  return deleted;
};

// Documents
const uploadCandidateDocuments = async (
  candidateId,
  type,
  entityId,
  files,
  uploadedBy,
  clientId
) => {
  // For each file, create a Document and link to the correct entity
  const docs = await candidateRepository.uploadCandidateDocuments(
    candidateId,
    type,
    entityId,
    files,
    uploadedBy,
    clientId
  );
  // Return document metadata with preview/download URLs
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";
  return docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    fileName: doc.fileName,
    originalName: doc.originalName,
    filePath: doc.filePath,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    uploadedAt: doc.uploadedAt,
    url: `${API_BASE_URL}/documents/${doc.id}/preview`,
    downloadUrl: `${API_BASE_URL}/documents/${doc.id}/download`,
    type: doc.fileType,
    entityType: doc.entityType,
    entityId: doc.entityId,
  }));
};

const updateCandidateDocument = async (
  candidateId,
  documentId,
  file,
  uploadedBy,
  clientId
) => {
  const doc = await candidateRepository.updateCandidateDocument(
    candidateId,
    documentId,
    file,
    uploadedBy,
    clientId
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";
  return {
    id: doc.id,
    name: doc.name,
    fileName: doc.fileName,
    originalName: doc.originalName,
    filePath: doc.filePath,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    uploadedAt: doc.uploadedAt,
    url: `${API_BASE_URL}/documents/${doc.id}/preview`,
    downloadUrl: `${API_BASE_URL}/documents/${doc.id}/download`,
    type: doc.fileType,
    entityType: doc.entityType,
    entityId: doc.entityId,
  };
};

const getCandidateDocuments = async (filters = {}) => {
  const docs = await candidateRepository.getCandidateDocuments(filters);
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";
  return docs.map((doc) => {
    // Try to get candidate info from doc.CandidateDocuments[0].candidate
    let candidateInfo = null;
    if (doc.CandidateDocuments && doc.CandidateDocuments.length > 0) {
      const cd = doc.CandidateDocuments[0];
      if (cd.candidate) {
        candidateInfo = {
          id: cd.candidate.id,
          name: cd.candidate.name,
          email: cd.candidate.email,
        };
      }
    }
    // Format tags and tagIds
    const tagsArr = doc.tags ? doc.tags.map((tag) => tag.name) : [];
    const tagIdsArr = doc.tags ? doc.tags.map((tag) => tag.id) : [];
    // Format category
    const categoryObj = doc.category
      ? {
        id: doc.category.id,
        name: doc.category.name,
        color: doc.category.color || "#6B7280",
        icon: doc.category.icon || "file",
        isDefault: doc.category.isDefault || false,
        isActive: doc.category.isActive,
      }
      : null;
    return {
      id: doc.id,
      name: doc.name,
      description: doc.description || "",
      fileName: doc.fileName,
      originalName: doc.originalName,
      filePath: doc.filePath,
      fileSize:
        typeof doc.fileSize === "number"
          ? Math.round((doc.fileSize / 1024) * 100) / 100 + " KB"
          : doc.fileSize,
      mimeType: doc.mimeType,
      fileType: doc.fileType,
      category: categoryObj,
      categoryId: doc.categoryId || (categoryObj ? categoryObj.id : null),
      categoryName: categoryObj ? categoryObj.name : "Uncategorized",
      tags: tagsArr,
      tagIds: tagIdsArr,
      visibility: doc.visibility || "private",
      version: doc.version || 1,
      isTemplate: doc.isTemplate || false,
      templateCategory: doc.templateCategory || null,
      uploadedBy:
        doc.uploadedBy || (doc.uploader && doc.uploader.fullName) || "Unknown",
      uploadedAt: doc.uploadedAt,
      downloadCount: doc.downloadCount || 0,
      viewCount: doc.viewCount || 0,
      isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
      url: `${API_BASE_URL}/documents/${doc.id}/preview`,
      downloadUrl: `${API_BASE_URL}/documents/${doc.id}/download`,
      candidate: candidateInfo,
      isCompanyDocument: !!doc.CompanyDocuments,
    };
  });
};

const deleteCandidateDocument = async (candidateId, documentId) => {
  return candidateRepository.deleteCandidateDocument(candidateId, documentId);
};

// Filtering and Reference Data
const getPositions = async () => candidateRepository.getPositions();

const addPosition = async (title) => {
  if (!title) throw new Error("Position title is required");
  return candidateRepository.addPosition(title);
};

const getSkills = async () => candidateRepository.getSkills();

const addSkill = async (name) => {
  if (!name) throw new Error("Skill name is required");
  return candidateRepository.addSkill(name);
};

// Bulk Operations
const bulkUploadCandidates = async (filePath, user) => {
  if (!filePath) throw new Error("No file uploaded");
  if (!user || !user.clientId) throw new Error("User context required");

  return new Promise((resolve, reject) => {
    const results = {
      success: 0,
      failed: 0,
      total: 0,
      errors: [],
      candidates: [],
    };

    // Map display headers to database fields
    const headerMapping = {
      "Full Name*": "name",
      "Email*": "email",
      "Phone*": "phone",
      "Position*": "position",
      "Position Type*": "positionType",
      "Status*": "status",
      "Location": "location",
      "Education": "education",
      "Bio": "bio",
      "Skills (semicolon separated)*": "skills",
      "Current Company": "currentCompany",
      "Current Role": "currentRole",
      "Notice Period (days)": "noticePeriod",
      "Expected CTC (LPA)": "expectedSalary",
      "Current CTC (LPA)": "currentSalary",
      "LinkedIn URL": "linkedInProfile",
      "GitHub URL": "githubProfile",
      "Portfolio URL": "portfolioUrl",
      "Resume URL": "resumeUrl",
    };

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => {
            // Map the header to its database field name
            return headerMapping[header] || header.toLowerCase();
          },
          // Ensure numeric values are properly parsed
          mapValues: ({ header, value }) => {
            // Remove any currency symbols, commas, or spaces from numeric fields
            if (
              header === "noticePeriod" ||
              header === "expectedSalary" ||
              header === "currentSalary"
            ) {
              if (!value || value.trim() === "") return null;
              const cleanValue = value.replace(/[₹,\s]/g, "").trim();
              return cleanValue === "" ? null : cleanValue;
            }
            return value;
          },
        })
      )
      .on("data", (data) => {
        results.total++;
        try {
          // Validate required fields
          if (!data.name) throw new Error("Missing name");
          if (!data.email) throw new Error("Missing email");
          if (!data.phone) throw new Error("Missing phone");
          if (!data.position) throw new Error("Missing position");
          if (!data.skills) throw new Error("Missing skills");

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data.email)) {
            throw new Error("Invalid email format");
          }

          // Validate phone number
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(data.phone.replace(/\D/g, ""))) {
            throw new Error("Invalid phone number - must be exactly 10 digits");
          }

          // Parse numeric fields with proper error handling
          let noticePeriod = null;
          let expectedSalary = null;
          let currentSalary = null;

          try {
            if (data.noticePeriod) {
              noticePeriod = parseInt(data.noticePeriod);
              if (isNaN(noticePeriod)) throw new Error("Invalid notice period");
              // Round to 1 decimal place
              noticePeriod = Math.round(noticePeriod * 10) / 10;
            }
          } catch (error) {
            throw new Error(
              "Notice period must be a valid number (can include decimals)"
            );
          }

          try {
            if (data.expectedSalary) {
              expectedSalary = parseFloat(data.expectedSalary);
              if (isNaN(expectedSalary))
                throw new Error("Invalid expected salary");
              // Round to 2 decimal places
              expectedSalary = Math.round(expectedSalary * 100) / 100;
            }
          } catch (error) {
            throw new Error("Expected salary must be a valid number");
          }

          try {
            if (data.currentSalary) {
              currentSalary = parseFloat(data.currentSalary);
              if (isNaN(currentSalary))
                throw new Error("Invalid current salary");
              // Round to 2 decimal places
              currentSalary = Math.round(currentSalary * 100) / 100;
            }
          } catch (error) {
            throw new Error("Current salary must be a valid number");
          }

          // Format the data
          const candidate = {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            position: data.position.trim(),
            positionType: data.positionType || "frontend",
            status: data.status || "Applied",
            location: data.location?.trim(),
            education: data.education?.trim(),
            bio: data.bio?.trim(),
            // Split skills by semicolon and trim each skill
            skills: data.skills?.split(";").map((s) => s.trim()) || [],
            currentCompany: data.currentCompany?.trim(),
            currentRole: data.currentRole?.trim(),
            noticePeriod,
            expectedSalary,
            currentSalary,
            linkedInProfile: data.linkedInProfile?.trim(),
            githubProfile: data.githubProfile?.trim(),
            portfolioUrl: data.portfolioUrl?.trim(),
            resumeUrl: data.resumeUrl?.trim(),
            dateAdded: new Date(),
            assignedJobs: [],
            clientId: user.clientId, // Add clientId
          };

          results.candidates.push(candidate);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${results.total}: ${error.message}`);
        }
      })
      .on("end", async () => {
        try {
          if (results.success > 0) {
            // Create candidates in bulk
            const createdCandidates =
              await candidateRepository.bulkCreateCandidates(
                results.candidates
              );
            results.candidates = createdCandidates;
          }
          resolve(results);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

// Statistics
const getCandidateStats = async () => candidateRepository.getCandidateStats();

// Get all candidates with their skills
const getAllCandidatesWithSkills = async () => {
  try {
    const options = {
      include: [
        {
          model: CandidateJobMap,
          as: "CandidateJobMaps",
          attributes: ["id", "status", "assignedDate", "jobId", "candidateId"],
        },
        {
          model: CandidateSkillMap,
          as: "CandidateSkillMaps",
          include: [
            {
              model: Skills,
              attributes: ["id", "title"],
            },
          ],
        },
      ],
    };

    return await candidateRepository.findCandidates({}, options);
  } catch (error) {
    console.log("Error in getAllCandidatesWithSkills:", error);
    throw error;
  }
};

const getCandidateCertifications = async (candidateId) => {
  const certifications = await candidateRepository.getCandidateCertifications(
    candidateId
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  return certifications.map((cert) => ({
    ...cert.toJSON(),
    Document: cert.Document
      ? {
        ...cert.Document.toJSON(),
        url: `${API_BASE_URL}/documents/${cert.Document.id}/preview`,
        downloadUrl: `${API_BASE_URL}/documents/${cert.Document.id}/download`,
      }
      : null,
  }));
};

const addCandidateCertification = async (
  candidateId,
  certificationData,
  fileData,
  uploadedBy,
  clientId
) => {
  const certification = await candidateRepository.addCandidateCertification(
    candidateId,
    certificationData,
    fileData,
    uploadedBy,
    clientId
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  if (certification.Document) {
    certification.Document.dataValues.url = `${API_BASE_URL}/documents/${certification.Document.id}/preview`;
    certification.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${certification.Document.id}/download`;
  }

  return certification;
};

const updateCandidateCertification = async (
  candidateId,
  certificationId,
  certificationData,
  fileData,
  uploadedBy,
  clientId
) => {
  const certification = await candidateRepository.updateCandidateCertification(
    candidateId,
    certificationId,
    certificationData,
    fileData,
    uploadedBy,
    clientId
  );
  const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

  if (certification && certification.Document) {
    certification.Document.dataValues.url = `${API_BASE_URL}/documents/${certification.Document.id}/preview`;
    certification.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${certification.Document.id}/download`;
  }

  return certification;
};

const deleteCandidateCertification = async (candidateId, certificationId) =>
  candidateRepository.deleteCandidateCertification(
    candidateId,
    certificationId
  );

// Helper function to update the company's candidate count
async function updateCompanyCandidateCount(candidateId, increment = true) {
  try {
    // Find all unique company IDs this candidate is associated with through applications
    const companies = await Job.findAll({
      attributes: ["companyId"],
      include: [
        {
          model: Application,
          where: { candidateId },
          attributes: [],
        },
      ],
      group: ["companyId"],
    });

    // Update each company's candidate count
    for (const company of companies) {
      if (increment) {
        await Company.increment("candidates", {
          where: { id: company.companyId },
        });
      } else {
        await Company.decrement("candidates", {
          where: { id: company.companyId },
        });
      }
    }
  } catch (error) {
    console.log("Error updating company candidate count:", error);
  }
}

// Update apply function to modify company candidate count
const applyToJob = async (candidateId, jobId, applicationData) => {
  // console.log("[candidateService.applyToJob] candidateId:", candidateId);
  // console.log("[candidateService.applyToJob] jobId:", jobId);
  // console.log(
  //   "[candidateService.applyToJob] applicationData:",
  //   applicationData
  // );
  let transaction;
  try {
    transaction = await sequelize.transaction();

    function getMostAdvancedStatus(statuses) {
      const statusHierarchy = {
        Hired: 7,
        Offer: 6,
        Interview: 5,
        Assessment: 4,
        Screening: 3,
        Applied: 2,
        Rejected: 1,
      };
      if (!statuses || statuses.length === 0) {
        return "Applied";
      }
      const validStatuses = statuses.filter(
        (status) => statusHierarchy[status] !== undefined
      );
      if (validStatuses.length === 0) {
        return "Applied";
      }
      return validStatuses.reduce((highest, current) => {
        return statusHierarchy[current] > statusHierarchy[highest]
          ? current
          : highest;
      });
    }

    // Fetch the job
    const job = await Job.findByPk(jobId);

    // Determine the first stage name
    let firstStageName = "Applied";
    if (
      job &&
      job.applicationStages &&
      Array.isArray(job.applicationStages) &&
      job.applicationStages.length > 0
    ) {
      firstStageName = job.applicationStages[0].name || "Applied";
    }

    // Set the status to the first stage
    applicationData.status = firstStageName;

    // Fetch ATS score and breakdown from CandidateJobMap
    const candidateJobMap = await CandidateJobMap.findOne({
      where: { candidateId, jobId },
      transaction,
    });
    if (candidateJobMap) {
      applicationData.scores = JSON.stringify({
        atsScore: candidateJobMap.atsScore,
        skillsMatch: candidateJobMap.skillsMatch,
        experienceMatch: candidateJobMap.experienceMatch,
        educationMatch: candidateJobMap.educationMatch,
      });
    } else {
      applicationData.scores = null;
    }

    // Now create the application as before
    const application = await candidateRepository.createApplication(
      candidateId,
      jobId,
      applicationData,
      transaction
    );

    // Update candidate status to most advanced
    const allApplications = await Application.findAll({
      where: { candidateId },
      transaction,
    });
    const statuses = allApplications.map((app) => app.status);
    const mostAdvanced = getMostAdvancedStatus(statuses);
    await Candidate.update(
      { status: mostAdvanced },
      { where: { id: candidateId }, transaction }
    );

    // Get the job to find its company
    if (job && job.companyId) {
      // Check if this is the first application from this candidate to this company
      const previousApplications = await Application.count({
        where: { candidateId },
        include: [
          {
            model: Job,
            as: "job",
            where: { companyId: job.companyId },
          },
        ],
        transaction,
      });

      // Only increment if this is the first application to this company
      if (previousApplications <= 1) {
        // 1 because we just created an application
        await Company.increment("candidates", {
          where: { id: job.companyId },
          transaction,
        });
      }
    }

    // Update CandidateJobMap status to 'applicant' for this job
    await CandidateJobMap.update(
      { status: "applicant" },
      { where: { candidateId, jobId }, transaction }
    );

    await transaction.commit();
    return application;
  } catch (error) {
    console.log("[candidateService.applyToJob] error:", error);
    if (transaction && !transaction.finished) await transaction.rollback();
    throw new Error("Error applying to job: " + error.message);
  }
};

// Add this to withdraw function to potentially decrement candidate count
const withdrawApplication = async (candidateId, applicationId) => {
  const transaction = await sequelize.transaction();

  try {
    const application = await Application.findByPk(applicationId, {
      include: [{ model: Job, as: "job" }],
      transaction,
    });

    if (!application) {
      await transaction.rollback();
      throw new Error("Application not found");
    }

    if (application.candidateId !== candidateId) {
      await transaction.rollback();
      throw new Error("Application does not belong to this candidate");
    }

    // Delete the application
    await application.destroy({ transaction });

    // Check if the candidate has any other applications with this company
    if (application.Job && application.Job.companyId) {
      const otherApplications = await Application.count({
        where: { candidateId, id: { [Op.ne]: applicationId } },
        include: [
          {
            model: Job,
            as: "job",
            where: { companyId: application.Job.companyId },
          },
        ],
        transaction,
      });

      // If this was the last application to this company, decrement the count
      if (otherApplications === 0) {
        await Company.decrement("candidates", {
          where: { id: application.Job.companyId },
          transaction,
        });
      }
    }

    await transaction.commit();
    return { message: "Application withdrawn successfully" };
  } catch (error) {
    await transaction.rollback();
    throw new Error(`Error withdrawing application: ${error.message}`);
  }
};

// Get all candidates with all related data populated
const getAllCandidatesWithRelations = async (options = {}) => {
  console.log(
    "[candidateService] Starting getAllCandidatesWithRelations with options:",
    {
      ...options,
      include: options.include
        ? "include options present"
        : "no include options",
    }
  );

  try {
    console.log("[candidateService] Calling findCandidates repository method");
    const includeOptions = [
      {
        model: CandidateJobMap,
        as: "CandidateJobMaps",
        include: [
          {
            model: Job,
            as: "job",
            include: [
              {
                model: Company,
                as: "company",
                attributes: ["id", "name"],
              },
            ],
            attributes: ["id", "jobTitle", "companyId"],
          },
        ],
        attributes: ["id", "status", "assignedDate"],
      },
      {
        model: CandidateEducation,
        attributes: [
          "id",
          "candidateId",
          "degree",
          "institution",
          "fieldOfStudy",
          "startDate",
          "endDate",
        ],
      },
      {
        model: CandidateExperience,
        attributes: [
          "id",
          "candidateId",
          "title",
          "company",
          "location",
          "startDate",
          "endDate",
          "description",
          "isCurrentRole",
        ],
      },
      {
        model: CandidateExtraCurricular,
        attributes: [
          "id",
          "candidateId",
          "title",
          "organization",
          "description",
        ],
      },
      {
        model: CandidateCertification,
        attributes: [
          "id",
          "candidateId",
          "certificationName",
          "issuingOrganization",
          "issueDate",
          "expiryDate",
        ],
      },
      {
        model: CandidateDocument,
        attributes: [
          "id",
          "candidateId",
          "documentId",
          "documentType",
          "addedDate",
        ],
      },
      {
        model: Skills,
        as: "Skills",
        through: { model: CandidateSkillMap, attributes: [] },
        attributes: ["id", "title"],
      },
      {
        model: CandidateSkillMap,
        as: "CandidateSkillMaps",
        include: [{ model: Skills, as: "Skill" }],
      },
    ];

    const result = await candidateRepository.findCandidates(
      {},
      {
        ...options,
        include: includeOptions,
      }
    );

    console.log("[candidateService] Repository returned:", {
      hasData: !!result,
      count: result?.count,
      rowsCount: result?.rows?.length,
      firstRowId: result?.rows?.[0]?.id,
      firstRowSkills: result?.rows?.[0]?.Skills?.length,
      firstRowJobMaps: result?.rows?.[0]?.CandidateJobMaps?.length,
    });

    if (!result || !result.rows) {
      console.log(
        "[candidateService] Invalid response from repository:",
        result
      );
      throw new Error("Invalid response from repository");
    }

    // Log a sample of the first candidate's data structure if available
    if (result.rows.length > 0) {
      const sampleCandidate = result.rows[0];
      console.log("[candidateService] Sample candidate data structure:", {
        id: sampleCandidate.id,
        hasSkillMaps: !!sampleCandidate.Skills,
        skillMapsCount: sampleCandidate.Skills?.length,
        hasJobMaps: !!sampleCandidate.CandidateJobMaps,
        jobMapsCount: sampleCandidate.CandidateJobMaps?.length,
        hasEducation: !!sampleCandidate.CandidateEducation,
        educationCount: sampleCandidate.CandidateEducation?.length,
        hasExperience: !!sampleCandidate.CandidateExperience,
        experienceCount: sampleCandidate.CandidateExperience?.length,
        hasExtracurricular: !!sampleCandidate.CandidateExtraCurricular,
        extracurricularCount: sampleCandidate.CandidateExtraCurricular?.length,
        hasCertifications: !!sampleCandidate.CandidateCertification,
        certificationsCount: sampleCandidate.CandidateCertification?.length,
        hasDocuments: !!sampleCandidate.CandidateDocument,
        documentsCount: sampleCandidate.CandidateDocument?.length,
      });
    }

    // Add jobStatuses array to each candidate and calculate total experience
    result.rows = result.rows.map((candidate) => {
      const jobStatuses = (candidate.CandidateJobMaps || []).map((jobMap) => ({
        jobId: jobMap.job?.id,
        jobTitle: jobMap.job?.jobTitle,
        companyId: jobMap.job?.companyId,
        companyName: jobMap.job?.companyId
          ? jobMap.job?.company?.name || null
          : null,
        status: jobMap.status,
      }));

      // Calculate total experience from CandidateExperiences
      let totalExperience = 0;
      if (
        candidate.CandidateExperiences &&
        candidate.CandidateExperiences.length > 0
      ) {
        const now = new Date();
        candidate.CandidateExperiences.forEach((exp) => {
          const startDate = new Date(exp.startDate);
          const endDate = exp.isCurrentRole ? now : (exp.endDate && exp.endDate.trim() !== '' ? new Date(exp.endDate) : now);

          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const months =
              (endDate.getFullYear() - startDate.getFullYear()) * 12 +
              (endDate.getMonth() - startDate.getMonth());
            totalExperience += Math.max(0, months);
          }
        });
      }

      return {
        ...candidate.toJSON(),
        jobStatuses,
        totalExperience: parseInt(totalExperience),
      };
    });

    return result;
  } catch (error) {
    console.log("[candidateService] Error in getAllCandidatesWithRelations:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
    });
    throw error;
  }
};

// Utility to get all candidates for filter dropdown
const getAllCandidates = async () => {
  const candidates = await candidateRepository.findCandidates(
    {},
    { attributes: ["id", "name", "email"] }
  );
  return candidates.rows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
  }));
};

// Process candidate job matching using existing ATS service
const processCandidateJobMatching = async (candidateId, clientId, userId) => {
  try {
    console.log(
      `[candidateService] Starting job matching for candidate ${candidateId} in client ${clientId}`
    );

    // Use the existing matchCandidateWithJobs function
    const result = await matchCandidateWithJobs(candidateId, clientId);

    console.log(
      `[candidateService] Job matching completed for candidate ${candidateId}:`
    );
    console.log(`  - Processed ${result.length} jobs`);

    return {
      candidateId,
      totalJobs: result.length,
      results: result,
    };
  } catch (error) {
    console.log(
      `[candidateService] Error in processCandidateJobMatching for candidate ${candidateId}:`,
      error
    );
    throw error;
  }
};

// Optimized service methods for better performance
const getCandidateProfileOptimized = async (candidateId) => {
  try {
    const candidate = await candidateRepository.getCandidateProfileOptimized(candidateId);
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

    // Transform the data to include document URLs
    const transformedCandidate = {
      ...candidate.toJSON(),
      Skills: candidate.Skills || [],
      CandidateJobMaps: (candidate.CandidateJobMaps || []).map(jobMap => ({
        ...jobMap.toJSON(),
        job: jobMap.job ? {
          ...jobMap.job.toJSON(),
        } : null,
      })),
    };

    return transformedCandidate;
  } catch (error) {
    console.log('Error in getCandidateProfileOptimized:', error);
    throw error;
  }
};

const getCandidateEducationOptimized = async (candidateId) => {
  try {
    const education = await candidateRepository.getCandidateEducationOptimized(candidateId);
    const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

    return education.map((edu) => ({
      ...edu.toJSON(),
      Document: edu.Document
        ? {
          ...edu.Document.toJSON(),
          url: `${API_BASE_URL}/documents/${edu.Document.id}/preview`,
          downloadUrl: `${API_BASE_URL}/documents/${edu.Document.id}/download`,
        }
        : null,
    }));
  } catch (error) {
    console.log('Error in getCandidateEducationOptimized:', error);
    throw error;
  }
};

const getCandidateExperienceOptimized = async (candidateId) => {
  try {
    const experience = await candidateRepository.getCandidateExperienceOptimized(candidateId);
    const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

    return experience.map((exp) => ({
      ...exp.toJSON(),
      Document: exp.Document
        ? {
          ...exp.Document.toJSON(),
          url: `${API_BASE_URL}/documents/${exp.Document.id}/preview`,
          downloadUrl: `${API_BASE_URL}/documents/${exp.Document.id}/download`,
        }
        : null,
    }));
  } catch (error) {
    console.log('Error in getCandidateExperienceOptimized:', error);
    throw error;
  }
};

const getCandidateActivitiesOptimized = async (candidateId) => {
  try {
    const activities = await candidateRepository.getCandidateActivitiesOptimized(candidateId);
    const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

    return activities.map((activity) => ({
      ...activity.toJSON(),
      Document: activity.Document
        ? {
          ...activity.Document.toJSON(),
          url: `${API_BASE_URL}/documents/${activity.Document.id}/preview`,
          downloadUrl: `${API_BASE_URL}/documents/${activity.Document.id}/download`,
        }
        : null,
    }));
  } catch (error) {
    console.log('Error in getCandidateActivitiesOptimized:', error);
    throw error;
  }
};

const getCandidateCertificationsOptimized = async (candidateId) => {
  try {
    const certifications = await candidateRepository.getCandidateCertificationsOptimized(candidateId);
    const API_BASE_URL = process.env.SERVER_URL || "http://localhost:3001/api";

    return certifications.map((cert) => ({
      ...cert.toJSON(),
      Document: cert.Document
        ? {
          ...cert.Document.toJSON(),
          url: `${API_BASE_URL}/documents/${cert.Document.id}/preview`,
          downloadUrl: `${API_BASE_URL}/documents/${cert.Document.id}/download`,
        }
        : null,
    }));
  } catch (error) {
    console.log('Error in getCandidateCertificationsOptimized:', error);
    throw error;
  }
};
export async function getFinalStageCandidatesWithJobsService() {
  return await candidateRepository.getFinalStageCandidatesWithJobs();
}

// Store resume file after successful candidate creation
const storeResumeAfterCreation = async (candidateId, originalFileName, filePath, user) => {
  try {
    console.log(`[candidateService] Storing resume for candidate ${candidateId}: ${originalFileName}`);

    // Check if file still exists
    if (!fs.existsSync(filePath)) {
      console.log(`[candidateService] File no longer exists: ${filePath}`);
      return { success: false, error: "Original file not found" };
    }

    // Create file data object for uploadCandidateResume
    const fileData = {
      originalname: originalFileName,
      filename: path.basename(filePath),
      path: filePath,
      size: fs.statSync(filePath).size,
      mimetype: path.extname(originalFileName).toLowerCase() === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    // Store the resume using existing uploadCandidateResume function
    const result = await candidateRepository.uploadCandidateResume(
      candidateId,
      fileData,
      user.id,
      user.clientId
    );

    console.log(`[candidateService] Successfully stored resume for candidate ${candidateId}`);
    return { success: true, result };
  } catch (error) {
    console.log(`[candidateService] Error storing resume for candidate ${candidateId}:`, error);
    return { success: false, error: error.message };
  }
};

// Cleanup temporary resume files that weren't used
const cleanupTemporaryResumeFiles = async () => {
  try {
    console.log("[candidateService] Starting cleanup of temporary resume files");

    const uploadsDir = "uploads/";
    if (!fs.existsSync(uploadsDir)) {
      console.log("[candidateService] Uploads directory does not exist");
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    let cleanedCount = 0;
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtime.getTime();

      // Remove files older than 24 hours that look like temporary resume files
      if (age > maxAge && (file.endsWith('.pdf') || file.endsWith('.docx') || file.endsWith('.doc'))) {
        try {
          fs.unlinkSync(filePath);
          console.log(`[candidateService] Cleaned up temporary file: ${file}`);
          cleanedCount++;
        } catch (error) {
          console.log(`[candidateService] Error deleting temporary file ${file}:`, error);
        }
      }
    }

    console.log(`[candidateService] Cleanup completed. Removed ${cleanedCount} temporary files`);
  } catch (error) {
    console.log("[candidateService] Error during cleanup:", error);
  }
};

export const candidateService = {
  getCandidates,
  createCandidate,
  getCandidateById,
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
  getAllCandidatesWithSkills,
  getCandidateCertifications,
  addCandidateCertification,
  updateCandidateCertification,
  deleteCandidateCertification,
  applyToJob,
  withdrawApplication,
  getAllCandidatesWithRelations,
  getAllCandidates,
  processCandidateJobMatching,
  updateAllCandidatesTotalExperience: () =>
    candidateRepository.updateAllCandidatesTotalExperience(),
  cleanupOrphanedDocuments: () =>
    candidateRepository.cleanupOrphanedDocumentsManual(),
  bulkUploadResumes: async (files, user) => {
    try {
      console.log(`[candidateService] Starting bulk resume upload for ${files.length} files`);

      // Parse all resumes using AI
      const parseResults = await parseMultipleResumes(files);

      if (parseResults.success === 0) {
        throw new Error("No resumes were successfully parsed");
      }

      // Only return parsed data for customization, do NOT create any candidates here
      return {
        success: 0, // No candidates created yet
        failed: parseResults.failed,
        total: parseResults.total,
        errors: parseResults.errors,
        candidates: [], // No candidates created yet
        parseResults: {
          success: parseResults.success,
          failed: parseResults.failed,
          total: parseResults.total,
          errors: parseResults.errors,
          candidates: parseResults.candidates, // Return parsed candidates for customization
          files: files.map(f => ({
            name: f.name,
            path: f.path,
            originalname: f.originalname || f.name,
            filename: f.filename || path.basename(f.path),
            mimetype: f.mimetype,
            size: f.size
          })) // Include complete file info for later storage
        }
      };
    } catch (error) {
      console.log(`[candidateService] Error in bulkUploadResumes:`, error);
      throw error;
    }
  },
  storeResumeAfterCreation: async (candidateId, originalFileName, filePath, user) => {
    return storeResumeAfterCreation(candidateId, originalFileName, filePath, user);
  },
  getCandidateProfileOptimized,
  getCandidateEducationOptimized,
  getCandidateExperienceOptimized,
  getCandidateActivitiesOptimized,
  getCandidateCertificationsOptimized,
  getFinalStageCandidatesWithJobsService,
  cleanupTemporaryResumeFiles: async () => {
    return cleanupTemporaryResumeFiles();
  },
};
