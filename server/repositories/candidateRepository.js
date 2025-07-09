import {
  Candidate,
  CandidateJobMap,
  CandidateEducation,
  CandidateExperience,
  CandidateExtraCurricular,
  CandidateDocument,
  Job,
  Document,
  Skills,
  CandidateSkillMap,
  CandidateCertification,
  CandidateNote,
  CandidateNoteTag,
  Application,
  ApplicationAttachment,
  ApplicationTag,
  Pipeline,
  PipelineStage,
  DocumentCategory,
  DocumentTag,
  DocumentTagMap,
  DocumentVersion,
  DocumentShare,
  DocumentActivity,
} from "../models/index.js";
import { Op } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import * as documentService from "../services/documentService.js";
import fs from "fs";
import path from "path";

// Helper function to calculate total experience in years
const calculateTotalExperience = (experiences) => {
  if (!experiences || experiences.length === 0) return 0;

  const now = new Date();
  let totalMonths = 0;

  experiences.forEach((exp) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.isCurrentRole ? now : (exp.endDate && exp.endDate.trim() !== '' ? new Date(exp.endDate) : now);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    }
  });

  return parseInt(totalMonths);
};

// Helper function to update candidate's total experience
const updateCandidateTotalExperience = async (candidateId, transaction) => {
  const experiences = await CandidateExperience.findAll({
    where: { candidateId },
    transaction,
  });

  const totalExperience = calculateTotalExperience(experiences);

  await Candidate.update(
    { totalExperience },
    {
      where: { id: candidateId },
      transaction,
    }
  );

  return totalExperience;
};

// Helper function to safely handle transaction rollback
const safeRollback = async (transaction) => {
  if (transaction && !transaction.finished) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.log("Error during transaction rollback:", rollbackError);
    }
  }
};

// Helper function to safely handle transaction commit
const safeCommit = async (transaction) => {
  if (transaction && !transaction.finished) {
    try {
      await transaction.commit();
    } catch (commitError) {
      console.log("Error during transaction commit:", commitError);
      await safeRollback(transaction);
      throw commitError;
    }
  }
};

// Utility function to monitor database performance
const logDatabaseOperation = (operation, startTime) => {
  const duration = Date.now() - startTime;
  console.log(`[DB Performance] ${operation} completed in ${duration}ms`);
  if (duration > 5000) {
    console.warn(
      `[DB Performance] Slow operation detected: ${operation} took ${duration}ms`
    );
  }
};

// Helper function to validate and format date
const formatDate = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  } catch (error) {
    console.log("Error formatting date:", error);
    return null;
  }
};

// Basic CRUD
export const findCandidates = async (where = {}, options = {}) => {
  console.log("[candidateRepository] Starting findCandidates with:", {
    whereClause: where,
    hasOptions: !!options,
    includeCount: options.include?.length,
    hasPagination: !!(options.limit || options.offset),
    hasOrder: !!options.order,
  });

  try {
    const queryOptions = {
      where,
      ...options,
      distinct: true,
    };

    console.log("[candidateRepository] Executing query with options:", {
      whereClause: queryOptions.where,
      includeModels: queryOptions.include?.map((inc) => inc.model.name),
      limit: queryOptions.limit,
      offset: queryOptions.offset,
      order: queryOptions.order,
    });

    const result = await Candidate.findAndCountAll(queryOptions);

    console.log("[candidateRepository] Query completed:", {
      success: !!result,
      count: result?.count,
      rowsCount: result?.rows?.length,
      firstRowId: result?.rows?.[0]?.id,
      hasError: false,
    });

    return result;
  } catch (error) {
    console.log("[candidateRepository] Error in findCandidates:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      query: error.sql
        ? {
          sql: error.sql,
          bind: error.bind,
        }
        : undefined,
    });
    throw error;
  }
};

export const createCandidate = async (data, user) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Format dates in the data
    const formattedData = {
      ...data,
      educationHistory: data.educationHistory?.map((edu) => ({
        ...edu,
        startDate: formatDate(edu.startDate),
        endDate: formatDate(edu.endDate),
      })),
      workHistory: data.workHistory?.map((exp) => ({
        ...exp,
        startDate: formatDate(exp.startDate),
        endDate: exp.isCurrentRole ? null : formatDate(exp.endDate),
      })),
      certifications: data.certifications?.map((cert) => ({
        ...cert,
        issueDate: formatDate(cert.issueDate),
        expiryDate: formatDate(cert.expiryDate),
      })),
    };

    // Create the main candidate record
    const candidate = await Candidate.create(formattedData, { transaction });

    // Handle skills
    if (formattedData.skills && formattedData.skills.length > 0) {
      // First ensure all skills exist in candidate_skills table
      const skillPromises = formattedData.skills.map((skillName) =>
        Skills.findOrCreate({
          where: { title: skillName.trim().toLowerCase() },
          defaults: { title: skillName.trim().toLowerCase() },
          transaction,
        })
      );
      const skills = await Promise.all(skillPromises);

      // Create skill mappings
      const skillMaps = skills.map(([skill]) => ({
        candidateId: candidate.id,
        skillId: skill.id,
        proficiencyLevel: 1,
      }));
      await CandidateSkillMap.bulkCreate(skillMaps, { transaction });
      console.log("[createCandidate] Skill mappings created:", skillMaps);
    }

    // Handle education history
    if (
      formattedData.educationHistory &&
      formattedData.educationHistory.length > 0
    ) {
      const educationPromises = formattedData.educationHistory.map(
        async (education) => {
          let documentId = null;
          if (education.fileData) {
            const newDoc = await Document.create(
              {
                name: education.fileData.originalname,
                description: `Education: ${education.degree}`,
                fileName: education.fileData.filename,
                originalName: education.fileData.originalname,
                filePath: education.fileData.path,
                fileSize: education.fileData.size,
                mimeType: education.fileData.mimetype,
                fileType: education.fileData.mimetype.split("/").pop(),
                visibility: "private",
                version: 1,
                isTemplate: false,
                uploadedBy: user.id,
                clientId: user.clientId,
                downloadCount: 0,
                viewCount: 0,
                isActive: true,
              },
              { transaction }
            );
            await CandidateDocument.create(
              {
                candidateId: candidate.id,
                documentId: newDoc.id,
                documentType: "education",
              },
              { transaction }
            );
            documentId = newDoc.id;
          }
          return CandidateEducation.create(
            {
              candidateId: candidate.id,
              degree: education.degree,
              institution: education.institution,
              fieldOfStudy:
                education.fieldOfStudy ||
                education.field ||
                formattedData.position,
              startDate: education.startDate,
              endDate: education.endDate,
              documentId,
              location: education.location,
            },
            { transaction }
          );
        }
      );
      await Promise.all(educationPromises);
    }

    // Handle work experience
    if (formattedData.workHistory && formattedData.workHistory.length > 0) {
      for (const experience of formattedData.workHistory) {
        let documentId = null;

        // Handle file upload if present
        if (experience.fileData) {
          const newDoc = await Document.create(
            {
              name: experience.fileData.originalname,
              description: `Experience: ${experience.title}`,
              fileName: experience.fileData.filename,
              originalName: experience.fileData.originalname,
              filePath: experience.fileData.path,
              fileSize: experience.fileData.size,
              mimeType: experience.fileData.mimetype,
              fileType: experience.fileData.mimetype.split("/").pop(),
              visibility: "private",
              version: 1,
              isTemplate: false,
              uploadedBy: user.id,
              clientId: user.clientId,
              downloadCount: 0,
              viewCount: 0,
              isActive: true,
            },
            { transaction }
          );

          await CandidateDocument.create(
            {
              candidateId: candidate.id,
              documentId: newDoc.id,
              documentType: "experience",
            },
            { transaction }
          );

          documentId = newDoc.id;
        }

        // Create experience record
        await CandidateExperience.create(
          {
            candidateId: candidate.id,
            title: experience.title,
            company: experience.company,
            location: experience.location || null,
            startDate: experience.startDate,
            endDate: experience.endDate,
            description: experience.description || null,
            experienceUrl: experience.experienceUrl || null,
            isCurrentRole: experience.isCurrentRole || false,
            documentId,
          },
          { transaction }
        );
      }

      // Calculate and update total experience
      await updateCandidateTotalExperience(candidate.id, transaction);
    }

    if (
      formattedData.extracurricularActivities &&
      formattedData.extracurricularActivities.length > 0
    ) {
      const activityPromises = formattedData.extracurricularActivities.map(
        async (activity) => {
          let documentId = null;
          if (activity.fileData) {
            const newDoc = await Document.create(
              {
                name: activity.fileData.originalname,
                description: `Activity: ${activity.title}`,
                fileName: activity.fileData.filename,
                originalName: activity.fileData.originalname,
                filePath: activity.fileData.path,
                fileSize: activity.fileData.size,
                mimeType: activity.fileData.mimetype,
                fileType: activity.fileData.mimetype.split("/").pop(),
                visibility: "private",
                version: 1,
                isTemplate: false,
                uploadedBy: user.id,
                clientId: user.clientId,
                downloadCount: 0,
                viewCount: 0,
                isActive: true,
              },
              { transaction }
            );
            await CandidateDocument.create(
              {
                candidateId: candidate.id,
                documentId: newDoc.id,
                documentType: "activity",
              },
              { transaction }
            );
            documentId = newDoc.id;
          }
          return CandidateExtraCurricular.create(
            {
              candidateId: candidate.id,
              title: activity.title,
              organization: activity.organization,
              description: activity.description && activity.description.length > 65535
                ? activity.description.substring(0, 65535)
                : activity.description,
              documentId,
            },
            { transaction }
          );
        }
      );
      await Promise.all(activityPromises);
    }

    // Handle certifications
    if (
      formattedData.certifications &&
      formattedData.certifications.length > 0
    ) {
      for (const certification of formattedData.certifications) {
        let documentId = null;

        // Handle file upload if present
        if (certification.fileData) {
          const newDoc = await Document.create(
            {
              name: certification.fileData.originalname,
              description: `Certification: ${certification.certificationName}`,
              fileName: certification.fileData.filename,
              originalName: certification.fileData.originalname,
              filePath: certification.fileData.path,
              fileSize: certification.fileData.size,
              mimeType: certification.fileData.mimetype,
              fileType: certification.fileData.mimetype.split("/").pop(),
              visibility: "private",
              version: 1,
              isTemplate: false,
              uploadedBy: user.id,
              clientId: user.clientId,
              downloadCount: 0,
              viewCount: 0,
              isActive: true,
            },
            { transaction }
          );

          await CandidateDocument.create(
            {
              candidateId: candidate.id,
              documentId: newDoc.id,
              documentType: "certification",
            },
            { transaction }
          );

          documentId = newDoc.id;
        }

        // Create certification record
        await CandidateCertification.create(
          {
            candidateId: candidate.id,
            certificationName: certification.certificationName,
            issuingOrganization: certification.issuingOrganization || null,
            issueDate: certification.issueDate,
            expiryDate: certification.expiryDate,
            documentId,
          },
          { transaction }
        );
      }
    }

    // Handle job assignments
    if (formattedData.assignedJobs) {
      // Fetch existing assignments
      const existingAssignments = await CandidateJobMap.findAll({
        where: { candidateId: id },
        transaction,
      });
      const existingJobIds = existingAssignments.map((a) => a.jobId);

      // Jobs to add (new assignments)
      const jobsToAdd = formattedData.assignedJobs.filter(
        (jobId) => !existingJobIds.includes(jobId)
      );
      // Jobs to remove (no longer assigned)
      const jobsToRemove = existingJobIds.filter(
        (jobId) => !formattedData.assignedJobs.includes(jobId)
      );

      // Add new assignments
      if (jobsToAdd.length > 0) {
        const jobAssignments = jobsToAdd.map((jobId) => ({
          candidateId: id,
          jobId,
          assignedDate: new Date(),
          status: "candidate", // Default status for new assignments
        }));
        await CandidateJobMap.bulkCreate(jobAssignments, { transaction });
      }

      // Remove unassigned jobs
      if (jobsToRemove.length > 0) {
        await CandidateJobMap.destroy({
          where: { candidateId: id, jobId: jobsToRemove },
          transaction,
        });
      }
    }

    await safeCommit(transaction);

    // Return candidate with work history data for frontend calculation
    const candidateWithData = {
      ...candidate.toJSON(),
      workHistory: formattedData.workHistory || [],
      educationHistory: formattedData.educationHistory || [],
      certifications: formattedData.certifications || [],
      extracurricularActivities: formattedData.extracurricularActivities || [],
    };

    return candidateWithData;
  } catch (error) {
    await safeRollback(transaction);
    console.log("Error in createCandidate:", error);
    throw error;
  }
};

export const findCandidateById = async (id, options = {}) => {
  const startTime = Date.now();
  try {
    const candidate = await Candidate.findByPk(id, {
      attributes: [
        'id', 'name', 'email', 'position', 'phone', 'location', 'currentCompany', 'bio',
        'source', 'noticePeriod', 'expectedSalary', 'linkedInProfile',
        'githubProfile', 'twitterProfile', 'portfolioUrl', 'totalExperience',
        'clientId', 'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: CandidateEducation,
          as: "CandidateEducations",
          attributes: [
            'id', 'candidateId', 'degree', 'institution', 'fieldOfStudy',
            'location', 'startDate', 'endDate', 'documentId', 'createdAt', 'updatedAt'
          ],
          include: [{
            model: Document,
            as: "Document",
            attributes: ['id', 'name', 'fileName', 'fileSize', 'mimeType', 'filePath']
          }],
          order: [['startDate', 'DESC']],
        },
        {
          model: CandidateExperience,
          as: "CandidateExperiences",
          attributes: [
            'id', 'candidateId', 'title', 'company', 'location', 'startDate',
            'endDate', 'description', 'isCurrentRole', 'documentId', 'createdAt', 'updatedAt'
          ],
          include: [{
            model: Document,
            as: "Document",
            attributes: ['id', 'name', 'fileName', 'fileSize', 'mimeType', 'filePath']
          }],
          order: [['startDate', 'DESC']],
        },
        {
          model: CandidateExtraCurricular,
          as: "CandidateExtraCurriculars",
          attributes: [
            'id', 'candidateId', 'title', 'organization', 'description',
            'documentId', 'createdAt', 'updatedAt'
          ],
          include: [{
            model: Document,
            as: "Document",
            attributes: ['id', 'name', 'fileName', 'fileSize', 'mimeType', 'filePath']
          }],
          order: [['createdAt', 'DESC']],
        },
        {
          model: CandidateCertification,
          as: "CandidateCertifications",
          attributes: [
            'id', 'candidateId', 'certificationName', 'issuingOrganization',
            'issueDate', 'expiryDate', 'documentId', 'createdAt', 'updatedAt'
          ],
          include: [{
            model: Document,
            as: "Document",
            attributes: ['id', 'name', 'fileName', 'fileSize', 'mimeType', 'filePath']
          }],
          order: [['issueDate', 'DESC']],
        },
        {
          model: Skills,
          as: "Skills",
          through: { model: CandidateSkillMap, attributes: [] },
          attributes: ["id", "title"],
        },
        {
          model: CandidateJobMap,
          as: "CandidateJobMaps",
          attributes: ["id", "status", "assignedDate", "jobId", "candidateId"],
          include: [
            {
              model: Job,
              attributes: ["id", "jobTitle"],
            },
          ],
        },
      ],
    });

    if (candidate) {
      // Add document URLs for all document types
      const API_BASE_URL =
        process.env.SERVER_URL || "http://localhost:3001/api";

      // Add URLs to education documents
      if (candidate.CandidateEducations) {
        candidate.CandidateEducations.forEach((education) => {
          if (education.Document) {
            education.Document.dataValues.url = `${API_BASE_URL}/documents/${education.Document.id}/preview`;
            education.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${education.Document.id}/download`;
          }
        });
      }

      // Add URLs to experience documents
      if (candidate.CandidateExperiences) {
        candidate.CandidateExperiences.forEach((experience) => {
          if (experience.Document) {
            experience.Document.dataValues.url = `${API_BASE_URL}/documents/${experience.Document.id}/preview`;
            experience.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${experience.Document.id}/download`;
          }
        });
      }

      // Add URLs to extracurricular documents
      if (candidate.CandidateExtraCurriculars) {
        candidate.CandidateExtraCurriculars.forEach((activity) => {
          if (activity.Document) {
            activity.Document.dataValues.url = `${API_BASE_URL}/documents/${activity.Document.id}/preview`;
            activity.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${activity.Document.id}/download`;
          }
        });
      }

      // Add URLs to certification documents
      if (candidate.CandidateCertifications) {
        candidate.CandidateCertifications.forEach((certification) => {
          if (certification.Document) {
            certification.Document.dataValues.url = `${API_BASE_URL}/documents/${certification.Document.id}/preview`;
            certification.Document.dataValues.downloadUrl = `${API_BASE_URL}/documents/${certification.Document.id}/download`;
          }
        });
      }
    }

    logDatabaseOperation('findCandidateById', startTime);
    return candidate;
  } catch (error) {
    console.log("Error in findCandidateById:", error);
    throw error;
  }
};

export const findCandidateByEmail = async (email) => {
  return Candidate.findOne({
    where: { email: email.toLowerCase() },
  });
};

export const findCandidateByEmailAndClient = async (email, clientId) => {
  return Candidate.findOne({
    where: { email: email.toLowerCase(), clientId },
  });
};

const updateOrCreateChildEntries = async (
  model,
  parentId,
  parentKey,
  entries,
  transaction,
  user
) => {
  // Get existing entries to preserve documents
  const existingEntries = await model.findAll({
    where: { [parentKey]: parentId },
    transaction,
  });

  const entryIds = entries.map((entry) => entry.id).filter(Boolean);

  // Only delete entries that are not in the current update
  await model.destroy({
    where: { [parentKey]: parentId, id: { [Op.notIn]: entryIds } },
    transaction,
  });

  for (const entry of entries) {
    let documentId = entry.documentId || null;

    // If there's new file data, create a new document
    if (entry.fileData) {
      const newDoc = await Document.create(
        {
          name: entry.fileData.originalname,
          description: `Document for ${model.name}`,
          fileName: entry.fileData.filename,
          originalName: entry.fileData.originalname,
          filePath: entry.fileData.path,
          fileSize: entry.fileData.size,
          mimeType: entry.fileData.mimetype,
          fileType: entry.fileData.mimetype.split("/").pop(),
          visibility: "private",
          version: 1,
          isTemplate: false,
          uploadedBy: user.id,
          clientId: user.clientId,
        },
        { transaction }
      );
      documentId = newDoc.id;
    } else if (entry.id) {
      // If updating existing entry and no new file, preserve existing document
      const existingEntry = existingEntries.find((e) => e.id === entry.id);
      if (existingEntry && existingEntry.documentId) {
        documentId = existingEntry.documentId;
      }
    }

    const entryData = { ...entry, [parentKey]: parentId, documentId };
    delete entryData.fileData; // Remove fileData before upsert

    if (entry.id) {
      // Update existing entry
      await model.update(entryData, {
        where: { id: entry.id, [parentKey]: parentId },
        transaction,
      });
    } else {
      // Create new entry
      const newEntry = await model.create(entryData, { transaction });
      if (documentId) {
        await Document.update(
          { entityId: newEntry.id, entityType: model.name.toLowerCase() },
          { where: { id: documentId }, transaction }
        );
      }
    }
  }
};

export const updateCandidate = async (id, data, user) => {
  let transaction;
  try {
    console.log("[candidateRepository] updateCandidate: Starting", {
      id,
      dataKeys: Object.keys(data),
      user: user?.id
    });

    transaction = await sequelize.transaction();

    // Format dates in the data
    const formattedData = {
      ...data,
      educationHistory: data.educationHistory?.map((edu) => ({
        ...edu,
        startDate: formatDate(edu.startDate),
        endDate: formatDate(edu.endDate),
      })),
      workHistory: data.workHistory?.map((exp) => ({
        ...exp,
        startDate: formatDate(exp.startDate),
        endDate: exp.isCurrentRole ? null : formatDate(exp.endDate),
      })),
      certifications: data.certifications?.map((cert) => ({
        ...cert,
        issueDate: formatDate(cert.issueDate),
        expiryDate: formatDate(cert.expiryDate),
      })),
    };

    // Update the main candidate record
    await Candidate.update(formattedData, {
      where: { id },
      transaction,
    });

    // Handle education history
    if (formattedData.educationHistory) {
      await updateOrCreateChildEntries(
        CandidateEducation,
        id,
        "candidateId",
        formattedData.educationHistory,
        transaction,
        user
      );
    }

    // Handle work experience
    if (formattedData.workHistory) {
      await updateOrCreateChildEntries(
        CandidateExperience,
        id,
        "candidateId",
        formattedData.workHistory,
        transaction,
        user
      );
      await updateCandidateTotalExperience(id, transaction);
    }

    // Handle extracurricular activities
    if (formattedData.extracurricularActivities) {
      await updateOrCreateChildEntries(
        CandidateExtraCurricular,
        id,
        "candidateId",
        formattedData.extracurricularActivities,
        transaction,
        user
      );
    }

    // Handle certifications
    if (formattedData.certifications) {
      const certificationIds = formattedData.certifications
        .map((cert) => cert.id)
        .filter(Boolean);

      // Only delete if there are certifications to keep
      if (certificationIds.length > 0) {
        await CandidateCertification.destroy({
          where: { candidateId: id, id: { [Op.notIn]: certificationIds } },
          transaction,
        });
      } else {
        // Delete all certifications if none are provided
        await CandidateCertification.destroy({
          where: { candidateId: id },
          transaction,
        });
      }

      // Process certifications with better error handling and timeout management
      if (
        formattedData.certifications &&
        formattedData.certifications.length > 0
      ) {
        console.log(
          `[updateCandidate] Processing ${formattedData.certifications.length} certifications`
        );

        for (let i = 0; i < formattedData.certifications.length; i++) {
          const certification = formattedData.certifications[i];
          try {
            console.log(
              `[updateCandidate] Processing certification ${i + 1}/${formattedData.certifications.length
              }: ${certification.id || "new"}`
            );

            if (certification.id) {
              const result = await updateCandidateCertification(
                id,
                certification.id,
                certification,
                certification.fileData,
                user.id,
                user.clientId,
                transaction
              );
              console.log(
                `[updateCandidate] Updated certification ${certification.id}:`,
                result ? "success" : "not found"
              );
            } else {
              const result = await addCandidateCertification(
                id,
                certification,
                certification.fileData,
                user.id,
                user.clientId,
                transaction
              );
              console.log(
                `[updateCandidate] Added new certification:`,
                result ? "success" : "failed"
              );
            }
          } catch (certError) {
            console.log(
              `[updateCandidate] Error processing certification ${i + 1}:`,
              certError
            );

            // If it's a timeout error, try to continue with other certifications
            if (
              certError.name === "SequelizeDatabaseError" &&
              certError.parent?.code === "ETIMEOUT"
            ) {
              console.log(
                `[updateCandidate] Timeout error for certification ${i + 1
                }, continuing with others...`
              );
              continue;
            }

            // For other errors, log but continue
            console.log(
              `[updateCandidate] Continuing with other certifications after error...`
            );
          }
        }
      }
    }

    // Handle skills
    if (formattedData.skills) {
      // Delete existing skill mappings
      await CandidateSkillMap.destroy({
        where: { candidateId: id },
        transaction,
      });

      // Create new skill mappings in batch
      if (formattedData.skills.length > 0) {
        console.log("[updateCandidate] Processing skills:", formattedData.skills);

        // First, ensure all skills exist
        const skillNames = formattedData.skills.map((skill) =>
          skill.trim().toLowerCase()
        );

        console.log("[updateCandidate] Normalized skill names:", skillNames);

        const existingSkills = await Skills.findAll({
          where: { title: { [Op.in]: skillNames } },
          transaction,
        });

        console.log("[updateCandidate] Found existing skills:", existingSkills.map(s => s.title));

        const existingSkillTitles = existingSkills.map((skill) => skill.title.toLowerCase());
        const newSkillNames = skillNames.filter(
          (name) => !existingSkillTitles.includes(name.toLowerCase())
        );

        console.log("[updateCandidate] Skills to create:", newSkillNames);

        // Create new skills if needed - use individual create instead of bulkCreate to handle duplicates
        if (newSkillNames.length > 0) {
          const newSkills = [];
          for (const skillName of newSkillNames) {
            try {
              const newSkill = await Skills.create({ title: skillName }, { transaction });
              newSkills.push(newSkill);
              console.log("[updateCandidate] Created skill:", skillName);
            } catch (skillError) {
              // If skill already exists (race condition), find it
              if (skillError.name === 'SequelizeUniqueConstraintError') {
                const existingSkill = await Skills.findOne({
                  where: { title: skillName },
                  transaction
                });
                if (existingSkill) {
                  newSkills.push(existingSkill);
                  console.log("[updateCandidate] Found existing skill after conflict:", skillName);
                }
              } else {
                throw skillError;
              }
            }
          }
          existingSkills.push(...newSkills);
        }

        // Create skill mappings
        const skillMaps = existingSkills.map((skill) => ({
          candidateId: id,
          skillId: skill.id,
          proficiencyLevel: 1,
        }));

        await CandidateSkillMap.bulkCreate(skillMaps, { transaction });
        console.log(
          "[updateCandidate] Skill mappings created:",
          skillMaps.length
        );
      }
    }

    // Handle job assignments
    if (formattedData.assignedJobs) {
      // Fetch existing assignments
      const existingAssignments = await CandidateJobMap.findAll({
        where: { candidateId: id },
        transaction,
      });
      const existingJobIds = existingAssignments.map((a) => a.jobId);

      // Jobs to add (new assignments)
      const jobsToAdd = formattedData.assignedJobs.filter(
        (jobId) => !existingJobIds.includes(jobId)
      );
      // Jobs to remove (no longer assigned)
      const jobsToRemove = existingJobIds.filter(
        (jobId) => !formattedData.assignedJobs.includes(jobId)
      );

      // Add new assignments
      if (jobsToAdd.length > 0) {
        const jobAssignments = jobsToAdd.map((jobId) => ({
          candidateId: id,
          jobId,
          assignedDate: new Date(),
          status: "candidate", // Default status for new assignments
        }));
        await CandidateJobMap.bulkCreate(jobAssignments, { transaction });
      }

      // Remove unassigned jobs
      if (jobsToRemove.length > 0) {
        await CandidateJobMap.destroy({
          where: { candidateId: id, jobId: jobsToRemove },
          transaction,
        });
      }
    }

    await safeCommit(transaction);

    // Return candidate with work history data for frontend calculation
    const updatedCandidate = await Candidate.findByPk(id);
    const candidateWithData = {
      ...updatedCandidate.toJSON(),
      workHistory: formattedData.workHistory || [],
      educationHistory: formattedData.educationHistory || [],
      certifications: formattedData.certifications || [],
      extracurricularActivities: formattedData.extracurricularActivities || [],
    };

    return candidateWithData;
  } catch (error) {
    await safeRollback(transaction);
    console.log("Error in updateCandidate:", {
      error: error.message,
      name: error.name,
      code: error.parent?.code,
      constraint: error.parent?.constraint,
      table: error.parent?.table,
      detail: error.parent?.detail,
      stack: error.stack
    });

    // Provide more specific error messages
    if (
      error.name === "SequelizeDatabaseError" &&
      error.parent?.code === "ETIMEOUT"
    ) {
      throw new Error("Database operation timed out. Please try again.");
    } else if (error.name === "SequelizeValidationError") {
      throw new Error(`Validation error: ${error.message}`);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("A record with this information already exists.");
    } else {
      throw new Error(`Failed to update candidate: ${error.message}`);
    }
  }
};

export const deleteCandidate = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    // Find all associated documentIds from related tables
    const educationDocs = await CandidateEducation.findAll({
      where: { candidateId: id },
      attributes: ["documentId"],
      transaction,
    });
    const experienceDocs = await CandidateExperience.findAll({
      where: { candidateId: id },
      attributes: ["documentId"],
      transaction,
    });
    const extraCurricularDocs = await CandidateExtraCurricular.findAll({
      where: { candidateId: id },
      attributes: ["documentId"],
      transaction,
    });
    const certificationDocs = await CandidateCertification.findAll({
      where: { candidateId: id },
      attributes: ["documentId"],
      transaction,
    });
    const candidateDocs = await CandidateDocument.findAll({
      where: { candidateId: id },
      attributes: ["documentId"],
      transaction,
    });

    // Collect all unique documentIds
    const docIds = [
      ...educationDocs.map((e) => e.documentId).filter(Boolean),
      ...experienceDocs.map((e) => e.documentId).filter(Boolean),
      ...extraCurricularDocs.map((e) => e.documentId).filter(Boolean),
      ...certificationDocs.map((e) => e.documentId).filter(Boolean),
      ...candidateDocs.map((e) => e.documentId).filter(Boolean),
    ];
    const uniqueDocIds = [...new Set(docIds)];

    // Fetch document info for permission context
    const docsToDelete = await Document.findAll({
      where: { id: uniqueDocIds },
    });

    // Delete the candidate (cascades to related tables)
    await Candidate.destroy({ where: { id }, transaction });

    // Commit the transaction first to ensure candidate deletion is successful
    await transaction.commit();

    // Delete all associated documents asynchronously after candidate deletion
    // This prevents document deletion failures from blocking candidate deletion
    if (docsToDelete.length > 0) {
      console.log(
        `[deleteCandidate] Attempting to delete ${docsToDelete.length} associated documents for candidate ${id}`
      );

      // Delete documents in parallel with individual error handling
      const deletePromises = docsToDelete.map(async (doc) => {
        try {
          console.log(
            `[deleteCandidate] Deleting document ${doc.id}: ${doc.fileName}`
          );

          // Delete the physical file first
          if (doc.filePath && fs.existsSync(doc.filePath)) {
            const filePath = doc.filePath;
            const baseName = path.basename(filePath);
            const possiblePaths = [
              filePath,
              path.join("uploads", "documents", baseName),
              path.join("server", "uploads", "documents", baseName),
              path.join(process.cwd(), "uploads", "documents", baseName),
              path.join(
                process.cwd(),
                "server",
                "uploads",
                "documents",
                baseName
              ),
            ];

            let deleted = false;
            for (const p of possiblePaths) {
              if (fs.existsSync(p)) {
                fs.unlinkSync(p);
                console.log(`[deleteCandidate] ✅ Deleted file: ${p}`);
                deleted = true;
                break;
              }
            }
            if (!deleted) {
              console.log(
                `[deleteCandidate] ⚠️ File not found for deletion: ${filePath}`
              );
            }
          }

          // Delete document versions and their physical files
          const versions = await DocumentVersion.findAll({
            where: { documentId: doc.id },
          });

          for (const version of versions) {
            if (version.filePath && fs.existsSync(version.filePath)) {
              fs.unlinkSync(version.filePath);
              console.log(
                `[deleteCandidate] ✅ Deleted version file: ${version.filePath}`
              );
            }
          }

          // Delete related records
          await DocumentShare.destroy({
            where: { documentId: doc.id },
          });

          await DocumentVersion.destroy({
            where: { documentId: doc.id },
          });

          await DocumentActivity.destroy({
            where: { documentId: doc.id },
          });

          // Delete tag associations
          await DocumentTagMap.destroy({
            where: { documentId: doc.id },
          });

          // Finally, delete the document record
          await doc.destroy();

          console.log(
            `[deleteCandidate] ✅ Successfully deleted document ${doc.id}`
          );
          return { success: true, documentId: doc.id };
        } catch (err) {
          console.log(
            `[deleteCandidate] ❌ Failed to delete document ${doc.id}:`,
            err.message
          );
          return { success: false, documentId: doc.id, error: err.message };
        }
      });

      // Wait for all document deletions to complete (with timeout)
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({ timeout: true });
        }, 10000); // 10 second timeout for document deletion
      });

      const results = await Promise.race([
        Promise.all(deletePromises),
        timeoutPromise,
      ]);

      if (results.timeout) {
        console.log(
          `[deleteCandidate] ⚠️ Document deletion timed out for candidate ${id}, but candidate was successfully deleted`
        );
      } else {
        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.filter((r) => !r.success).length;
        console.log(
          `[deleteCandidate] Document deletion completed for candidate ${id}: ${successCount} successful, ${failureCount} failed`
        );
      }
    }

    return true;
  } catch (error) {
    await transaction.rollback();
    console.log(
      `[deleteCandidate] ❌ Failed to delete candidate ${id}:`,
      error.message
    );
    throw error;
  }
};

// Job Assignments
export const getCandidateJobs = async (candidateId) => {
  try {
    console.log("[candidateRepository] getCandidateJobs: Starting", {
      candidateId,
    });

    // First verify the candidate exists
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      console.log(
        "[candidateRepository] getCandidateJobs: Candidate not found",
        { candidateId }
      );
      throw new Error("Candidate not found");
    }

    // Get all job assignments for this candidate
    const jobAssignments = await CandidateJobMap.findAll({
      where: { candidateId },
      include: [
        {
          model: Job,
          attributes: [
            "id",
            "jobTitle",
            "companyId",
            "jobStatus",
            "department",
            "location",
            "jobType",
          ],
        },
      ],
      order: [["assignedDate", "DESC"]],
    });

    // Transform the data to ensure consistent structure
    const jobs = jobAssignments.map((assignment) => {
      const job = assignment.Job;
      return {
        id: job.id,
        jobId: job.id,
        jobTitle: job.jobTitle,
        jobDepartment: job.department,
        jobType: job.jobType,
        jobLocation: job.location,
        jobStatus: job.jobStatus,
        companyId: job.companyId,
        assignedDate: assignment.assignedDate,
        assignedBy: assignment.assignedBy || "System",
      };
    });

    console.log("[candidateRepository] getCandidateJobs: Success", {
      candidateId,
      jobCount: jobs.length,
      jobs,
    });

    return jobs;
  } catch (error) {
    console.log("[candidateRepository] getCandidateJobs: Error", {
      candidateId,
      error: error.message,
    });
    throw error;
  }
};

export const assignJobsToCandidate = async (
  candidateId,
  jobIds,
  assignedBy = "System",
  transaction = null
) => {
  try {
    // First, remove all existing job assignments
    await CandidateJobMap.destroy({
      where: { candidateId },
      transaction,
    });

    // Then create new assignments
    const assignments = jobIds.map((jobId) => ({
      candidateId,
      jobId,
      assignedDate: new Date(),
      assignedBy: assignedBy,
    }));

    const result = await CandidateJobMap.bulkCreate(assignments, {
      transaction,
    });
    return result;
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.log("Error in assignJobsToCandidate:", error);
    throw error;
  }
};

export const removeJobAssignment = async (candidateId, jobId) =>
  CandidateJobMap.destroy({
    where: { candidateId, jobId },
  });

// Resume/Documents
export const getCandidateResume = async (candidateId) =>
  CandidateDocument.findOne({
    where: {
      candidateId,
      documentType: "resume",
    },
  });

export const uploadCandidateResume = async (
  candidateId,
  fileData,
  uploadedBy,
  clientId
) => {
  // Remove old resume if exists
  const oldResume = await CandidateDocument.findOne({
    where: { candidateId, documentType: "resume" },
  });
  if (oldResume) {
    // Delete associated Document and file
    const doc = await Document.findByPk(oldResume.documentId);
    if (doc) {
      try {
        const filePath = doc.filePath;
        const baseName = path.basename(filePath);
        const possiblePaths = [
          filePath,
          path.join("uploads", "resumes", baseName),
          path.join("server", "uploads", "resumes", baseName),
          path.join(process.cwd(), "uploads", "resumes", baseName),
          path.join(process.cwd(), "server", "uploads", "resumes", baseName),
        ];
        let deleted = false;
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            fs.unlinkSync(p);
            console.log(`[Resume Delete] Deleted: ${p}`);
            deleted = true;
            break;
          } else {
            console.log(`[Resume Delete] File does not exist: ${p}`);
          }
        }
        if (!deleted) {
          console.log(
            `[Resume Delete] Could not find file to delete for: ${filePath}`
          );
        }
      } catch (e) {
        console.log("[Resume Delete] Error deleting file:", e);
      }
      await doc.destroy();
    }
    await oldResume.destroy();
  }
  // Create new Document
  const newDoc = await Document.create({
    name: fileData.originalname,
    description: "Candidate Resume",
    fileName: fileData.filename,
    originalName: fileData.originalname,
    filePath: fileData.path,
    fileSize: fileData.size,
    mimeType: fileData.mimetype,
    fileType: fileData.mimetype.split("/").pop(),
    visibility: "private",
    version: 1,
    isTemplate: false,
    uploadedBy,
    clientId,
    downloadCount: 0,
    viewCount: 0,
    isActive: true,
  });
  // Link to candidate
  return CandidateDocument.create({
    candidateId,
    documentId: newDoc.id,
    documentType: "resume",
    addedDate: new Date(),
  });
};

export const deleteCandidateResume = async (candidateId) => {
  const oldResume = await CandidateDocument.findOne({
    where: { candidateId, documentType: "resume" },
  });
  if (oldResume) {
    const doc = await Document.findByPk(oldResume.documentId);
    if (doc) {
      try {
        const filePath = doc.filePath;
        const baseName = path.basename(filePath);
        const possiblePaths = [
          filePath,
          path.join("uploads", "resumes", baseName),
          path.join("server", "uploads", "resumes", baseName),
          path.join(process.cwd(), "uploads", "resumes", baseName),
          path.join(process.cwd(), "server", "uploads", "resumes", baseName),
        ];
        let deleted = false;
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            fs.unlinkSync(p);
            console.log(`[Resume Delete] Deleted: ${p}`);
            deleted = true;
            break;
          } else {
            console.log(`[Resume Delete] File does not exist: ${p}`);
          }
        }
        if (!deleted) {
          console.log(
            `[Resume Delete] Could not find file to delete for: ${filePath}`
          );
        }
      } catch (e) {
        console.log("[Resume Delete] Error deleting file:", e);
      }
      await doc.destroy();
    }
    await oldResume.destroy();
    return true;
  }
  return false;
};

// Education History
export const getCandidateEducation = async (candidateId) =>
  CandidateEducation.findAll({
    where: { candidateId },
    include: [{ model: Document, as: "Document" }],
  });

export const addCandidateEducation = async (candidateId, educationData) =>
  CandidateEducation.create({
    candidateId,
    ...educationData,
  });

export const updateCandidateEducation = async (
  candidateId,
  educationId,
  educationData
) => {
  const [updated] = await CandidateEducation.update(educationData, {
    where: {
      id: educationId,
      candidateId,
    },
  });
  if (updated) {
    return CandidateEducation.findOne({
      where: { id: educationId, candidateId },
      include: [{ model: Document, as: "Document" }],
    });
  }
  return null;
};

export const deleteCandidateEducation = async (candidateId, educationId) =>
  CandidateEducation.destroy({
    where: {
      id: educationId,
      candidateId,
    },
  });

// Work Experience
export const getCandidateExperience = async (candidateId) =>
  CandidateExperience.findAll({
    where: { candidateId },
    include: [{ model: Document, as: "Document" }],
  });

export const addCandidateExperience = async (candidateId, experienceData) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Format dates in experience data
    const formattedData = {
      ...experienceData,
      startDate: formatDate(experienceData.startDate),
      endDate: experienceData.isCurrentRole
        ? null
        : formatDate(experienceData.endDate),
    };

    const experience = await CandidateExperience.create(
      {
        candidateId,
        ...formattedData,
      },
      { transaction }
    );

    // Update total experience
    await updateCandidateTotalExperience(candidateId, transaction);

    await safeCommit(transaction);

    // Return with Document association
    return CandidateExperience.findOne({
      where: { id: experience.id },
      include: [{ model: Document, as: "Document" }],
    });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateCandidateExperience = async (
  candidateId,
  experienceId,
  experienceData
) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Format dates in experience data
    const formattedData = {
      ...experienceData,
      startDate: formatDate(experienceData.startDate),
      endDate: experienceData.isCurrentRole
        ? null
        : formatDate(experienceData.endDate),
    };

    const [updated] = await CandidateExperience.update(formattedData, {
      where: {
        id: experienceId,
        candidateId,
      },
      transaction,
    });

    if (updated) {
      // Update total experience
      await updateCandidateTotalExperience(candidateId, transaction);
    }

    await safeCommit(transaction);

    if (updated) {
      return CandidateExperience.findOne({
        where: { id: experienceId, candidateId },
        include: [{ model: Document, as: "Document" }],
      });
    }
    return null;
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteCandidateExperience = async (candidateId, experienceId) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const deleted = await CandidateExperience.destroy({
      where: {
        id: experienceId,
        candidateId,
      },
      transaction,
    });

    if (deleted) {
      // Update total experience
      await updateCandidateTotalExperience(candidateId, transaction);
    }

    await safeCommit(transaction);
    return deleted;
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

// Extracurricular Activities
export const getCandidateActivities = async (candidateId) =>
  CandidateExtraCurricular.findAll({
    where: { candidateId },
    include: [{ model: Document, as: "Document" }],
  });

export const addCandidateActivity = async (candidateId, activityData) =>
  CandidateExtraCurricular.create({
    candidateId,
    ...activityData,
  });

export const updateCandidateActivity = async (
  candidateId,
  activityId,
  activityData
) => {
  const [updated] = await CandidateExtraCurricular.update(activityData, {
    where: {
      id: activityId,
      candidateId,
    },
  });
  if (updated) {
    return CandidateExtraCurricular.findOne({
      where: { id: activityId, candidateId },
      include: [{ model: Document, as: "Document" }],
    });
  }
  return null;
};

export const deleteCandidateActivity = async (candidateId, activityId) =>
  CandidateExtraCurricular.destroy({
    where: {
      id: activityId,
      candidateId,
    },
  });

// Documents
export const uploadCandidateDocuments = async (
  candidateId,
  type,
  entityId,
  files,
  uploadedBy,
  clientId
) => {
  // type: 'education' | 'experience' | 'certification' | 'extracurricular'
  // entityId: the id of the related entity
  // files: array of multer file objects
  const createdDocs = [];

  // Determine which model to use based on type
  let EntityModel;
  switch (type) {
    case "education":
      EntityModel = CandidateEducation;
      break;
    case "experience":
      EntityModel = CandidateExperience;
      break;
    case "certification":
      EntityModel = CandidateCertification;
      break;
    case "activity":
      EntityModel = CandidateExtraCurricular;
      break;
    default:
      throw new Error(`Invalid entity type: ${type}`);
  }

  // Get the current entity to check if it has an existing document
  const entity = await EntityModel.findByPk(entityId);
  if (!entity) {
    throw new Error(`${type} entity not found with id: ${entityId}`);
  }

  // Delete the old document if it exists
  if (entity.documentId) {
    const oldDoc = await Document.findByPk(entity.documentId);
    if (oldDoc) {
      // Delete the old file from disk
      if (oldDoc.filePath && fs.existsSync(oldDoc.filePath)) {
        fs.unlinkSync(oldDoc.filePath);
      }
      // Delete the old document
      await oldDoc.destroy();
    }
  }

  // Create new document (assuming only one file per entity)
  if (files && files.length > 0) {
    const file = files[0]; // Take the first file
    const newDoc = await Document.create({
      name: file.originalname,
      description: `${type} document`,
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileType: file.mimetype.split("/").pop(),
      visibility: "private",
      version: 1,
      isTemplate: false,
      uploadedBy,
      clientId,
      downloadCount: 0,
      viewCount: 0,
      isActive: true,
      entityType: type,
      entityId: entityId,
    });

    // Update the entity to point to the new document
    await entity.update({ documentId: newDoc.id });

    // Create a CandidateDocument entry for the new file
    await CandidateDocument.create({
      candidateId,
      documentId: newDoc.id,
      documentType: type,
    });

    createdDocs.push(newDoc);
  }

  return createdDocs;
};

export const updateCandidateDocument = async (
  candidateId,
  documentId,
  file,
  uploadedBy,
  clientId
) => {
  // Find and update the document file
  const doc = await Document.findByPk(documentId);
  if (!doc) throw new Error("Document not found");

  // Delete old file from disk
  if (doc.filePath && fs.existsSync(doc.filePath)) {
    fs.unlinkSync(doc.filePath);
  }

  // Update the document with new file information
  doc.fileName = file.filename;
  doc.originalName = file.originalname;
  doc.filePath = file.path;
  doc.fileSize = file.size;
  doc.mimeType = file.mimetype;
  doc.fileType = file.mimetype.split("/").pop();
  doc.uploadedBy = uploadedBy;
  doc.clientId = clientId;
  await doc.save();

  return doc;
};

/**
 * Get candidate documents with optional filters for category and tags.
 * @param {Object} filters - { candidateId, categoryId, tags }
 * @returns {Promise<Array<Document>>}
 */
export const getCandidateDocuments = async (filters = {}) => {
  const { candidateId, categoryId, tags } = filters;

  // Build where clause for Document
  const where = { isActive: true };

  // Join with CandidateDocument to filter by candidate
  const include = [
    {
      model: CandidateDocument,
      where: candidateId ? { candidateId } : undefined,
      required: true,
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "name", "email"],
        },
      ],
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
  ];

  if (categoryId) {
    where.categoryId = categoryId;
  }

  // If tags are provided, filter documents that have ALL the specified tags
  if (tags && tags.length > 0) {
    // Find tag IDs for the given tag names (if names are provided)
    let tagIds = tags.filter((t) => typeof t === "number");
    if (tagIds.length !== tags.length) {
      // Some tags are names, fetch their IDs
      const tagRecords = await DocumentTag.findAll({
        where: {
          name: { [Op.in]: tags.filter((t) => typeof t === "string") },
        },
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

  return Document.findAll({
    where,
    include,
    order: [["uploadedAt", "DESC"]],
    distinct: true,
  });
};

export const deleteCandidateDocument = async (candidateId, documentId) => {
  const doc = await Document.findByPk(documentId);
  if (!doc) throw new Error("Document not found");

  // Find and update any entities that reference this document
  await CandidateEducation.update(
    { documentId: null },
    { where: { documentId } }
  );
  await CandidateExperience.update(
    { documentId: null },
    { where: { documentId } }
  );
  await CandidateCertification.update(
    { documentId: null },
    { where: { documentId } }
  );
  await CandidateExtraCurricular.update(
    { documentId: null },
    { where: { documentId } }
  );

  // Delete the CandidateDocument entry
  await CandidateDocument.destroy({
    where: { candidateId, documentId },
  });

  // Optionally, delete file from disk
  if (doc.filePath && fs.existsSync(doc.filePath)) {
    fs.unlinkSync(doc.filePath);
  }

  await doc.destroy();
  return true;
};

// Filtering and Reference Data
export const getPositions = async () =>
  Job.findAll({
    attributes: ["id", "title"],
    group: ["title"],
  });

export const addPosition = async (title) =>
  Job.create({
    title,
    status: "draft",
  });

export const getSkills = async () =>
  Skills.findAll({
    attributes: ["id", "name"],
  });

export const addSkill = async (name) => Skills.create({ name });

// Bulk Operations
export const bulkCreateCandidates = async (candidates) => {
  const transaction = await sequelize.transaction();
  try {
    const createdCandidates = [];

    for (const candidateData of candidates) {
      // Ensure clientId is present
      if (!candidateData.clientId) {
        throw new Error("Client ID is required for candidate creation");
      }

      // Create the main candidate record
      const candidate = await Candidate.create(candidateData, { transaction });

      // Handle skills if present
      if (candidateData.skills && candidateData.skills.length > 0) {
        // First ensure all skills exist
        const skillPromises = candidateData.skills.map((skillName) =>
          Skills.findOrCreate({
            where: { title: skillName.trim().toLowerCase() },
            defaults: { title: skillName.trim().toLowerCase() },
            transaction,
          })
        );
        const skills = await Promise.all(skillPromises);

        // Create skill mappings
        const skillMaps = skills.map(([skill]) => ({
          candidateId: candidate.id,
          skillId: skill.id,
          proficiencyLevel: 1,
        }));
        await CandidateSkillMap.bulkCreate(skillMaps, { transaction });
      }

      // Add work history data for frontend calculation
      const candidateWithData = {
        ...candidate.toJSON(),
        workHistory: candidateData.workHistory || [],
        educationHistory: candidateData.educationHistory || [],
        certifications: candidateData.certifications || [],
        extracurricularActivities:
          candidateData.extracurricularActivities || [],
      };

      createdCandidates.push(candidateWithData);
    }

    await transaction.commit();
    return createdCandidates;
  } catch (error) {
    await transaction.rollback();
    console.log("Error in bulkCreateCandidates:", error);
    throw error;
  }
};

// Statistics
export const getCandidateStats = async () =>
  Candidate.findAll({
    attributes: [
      "status",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["status"],
  });

export const getCandidateCertifications = async (candidateId) =>
  CandidateCertification.findAll({
    where: { candidateId },
    include: [{ model: Document, as: "Document" }],
    order: [["issueDate", "DESC"]],
  });

export const addCandidateCertification = async (
  candidateId,
  certificationData,
  fileData,
  uploadedBy,
  clientId,
  transaction = null
) => {
  const t = transaction || (await sequelize.transaction());
  try {
    let documentId = null;
    if (fileData) {
      const newDoc = await Document.create(
        {
          name: fileData.originalname,
          description: `Certification: ${certificationData.certificationName}`,
          fileName: fileData.filename,
          originalName: fileData.originalname,
          filePath: fileData.path,
          fileSize: fileData.size,
          mimeType: fileData.mimetype,
          fileType: fileData.mimetype.split("/").pop(),
          visibility: "private",
          version: 1,
          isTemplate: false,
          uploadedBy,
          clientId,
          downloadCount: 0,
          viewCount: 0,
          isActive: true,
        },
        { transaction: t }
      );

      await CandidateDocument.create(
        {
          candidateId,
          documentId: newDoc.id,
          documentType: "certification",
        },
        { transaction: t }
      );

      documentId = newDoc.id;
    }

    const certification = await CandidateCertification.create(
      {
        ...certificationData,
        candidateId,
        documentId,
      },
      { transaction: t }
    );

    if (!transaction) await t.commit();
    return certification;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

export const updateCandidateCertification = async (
  candidateId,
  certificationId,
  certificationData,
  fileData,
  uploadedBy,
  clientId,
  transaction = null
) => {
  const startTime = Date.now();
  const t = transaction || (await sequelize.transaction());
  try {
    // Add timeout and retry logic for the certification lookup
    let certification;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        certification = await CandidateCertification.findByPk(certificationId, {
          transaction: t,
          lock: t ? true : false, // Only lock if we're in a transaction
        });
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.log(
          `[updateCandidateCertification] Retry ${retryCount} for certification ${certificationId}:`,
          error.message
        );

        if (retryCount >= maxRetries) {
          throw new Error(
            `Failed to find certification after ${maxRetries} retries: ${error.message}`
          );
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!certification || certification.candidateId !== candidateId) {
      if (!transaction) await t.rollback();
      return null;
    }

    let { documentId } = certification;

    // If new file is provided, replace the old document
    if (fileData) {
      // 1. Delete old document if it exists
      if (certification.documentId) {
        const oldDoc = await Document.findByPk(certification.documentId, {
          transaction: t,
        });
        if (oldDoc) {
          if (fs.existsSync(oldDoc.filePath)) {
            fs.unlinkSync(oldDoc.filePath);
          }
          await oldDoc.destroy({ transaction: t }); // This should cascade to CandidateDocument
        }
      }

      // 2. Create new document
      const newDoc = await Document.create(
        {
          name: fileData.originalname,
          description: `Certification: ${certificationData.certificationName ||
            certification.certificationName
            }`,
          fileName: fileData.filename,
          originalName: fileData.originalname,
          filePath: fileData.path,
          fileSize: fileData.size,
          mimeType: fileData.mimetype,
          fileType: fileData.mimetype.split("/").pop(),
          visibility: "private",
          version: 1,
          isTemplate: false,
          uploadedBy,
          clientId,
          downloadCount: 0,
          viewCount: 0,
          isActive: true,
        },
        { transaction: t }
      );

      // 3. Create new CandidateDocument link
      await CandidateDocument.create(
        {
          candidateId,
          documentId: newDoc.id,
          documentType: "certification",
        },
        { transaction: t }
      );

      documentId = newDoc.id;
    }

    // Update certification
    const updatedCertificationData = { ...certificationData, documentId };
    delete updatedCertificationData.id; // do not try to update PK

    const [updatedRows] = await CandidateCertification.update(
      updatedCertificationData,
      {
        where: { id: certificationId, candidateId },
        transaction: t,
      }
    );

    if (!transaction) await t.commit();

    logDatabaseOperation(
      `updateCandidateCertification ${certificationId}`,
      startTime
    );

    if (updatedRows > 0) {
      return CandidateCertification.findByPk(certificationId);
    }
    return null;
  } catch (error) {
    if (!transaction) await t.rollback();
    console.log(
      `[updateCandidateCertification] Error updating certification ${certificationId}:`,
      error
    );
    throw error;
  }
};

export const deleteCandidateCertification = async (
  candidateId,
  certificationId,
  transaction = null
) => {
  const t = transaction || (await sequelize.transaction());
  try {
    const certification = await CandidateCertification.findOne({
      where: { id: certificationId, candidateId },
      transaction: t,
    });

    if (!certification) {
      if (!transaction) await t.rollback();
      return 0; // Or false
    }

    const { documentId } = certification;

    // Delete the certification record
    const deletedRows = await CandidateCertification.destroy({
      where: { id: certificationId, candidateId },
      transaction: t,
    });

    if (deletedRows > 0 && documentId) {
      // Delete associated document
      const doc = await Document.findByPk(documentId, { transaction: t });
      if (doc) {
        if (fs.existsSync(doc.filePath)) {
          fs.unlinkSync(doc.filePath);
        }
        await doc.destroy({ transaction: t }); // This will cascade to CandidateDocument
      }
    }

    if (!transaction) await t.commit();
    return deletedRows;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

// Create Application and return with Job included (using alias)
export const createApplication = async (
  candidateId,
  jobId,
  applicationData
) => {
  // Archive any existing non-archived application for this candidate/job
  await Application.update(
    { status: "Archived" },
    {
      where: {
        candidateId,
        jobId,
        status: { [Op.not]: "Archived" },
      },
    }
  );

  // Fetch the job and its pipeline
  const job = await Job.findByPk(jobId, {
    include: [{ model: Pipeline, as: "pipeline" }],
  });
  const pipelineStages = await PipelineStage.findAll({
    where: { pipelineId: job.pipelineId },
    order: [["order", "ASC"]],
  });
  const firstStage = pipelineStages[0];

  // Create the application
  const application = await Application.create({
    candidateId,
    jobId,
    status: firstStage.name,
    appliedDate: new Date(),
    source: "ATS Matching",
    currentStage: firstStage.order,
    pipelineStageId: firstStage.id,
    stageHistory: JSON.stringify([
      {
        stage: firstStage.name,
        date: new Date().toISOString(),
        status: "entered",
      },
    ]),
    scores: applicationData.scores || null,
    isShortlisted: null,
    rejectionReason: null,
    lastUpdated: new Date(),
  });

  // Fetch the application with the Job included using the correct alias
  const applicationWithJob = await Application.findByPk(application.id, {
    include: [{ model: Job, as: "job" }],
  });

  return applicationWithJob;
};

export const addCandidateEducationDocument = async (
  candidateId,
  educationId,
  fileData,
  uploadedBy,
  clientId
) => {
  const transaction = await sequelize.transaction();
  try {
    // Create Document
    const newDoc = await Document.create(
      {
        name: fileData.originalname,
        description: `Education Document`,
        fileName: fileData.filename,
        originalName: fileData.originalname,
        filePath: fileData.path,
        fileSize: fileData.size,
        mimeType: fileData.mimetype,
        fileType: fileData.mimetype.split("/").pop(),
        visibility: "private",
        version: 1,
        isTemplate: false,
        uploadedBy,
        clientId,
        downloadCount: 0,
        viewCount: 0,
        isActive: true,
      },
      { transaction }
    );
    // Update CandidateEducation
    await CandidateEducation.update(
      { documentId: newDoc.id },
      { where: { id: educationId, candidateId }, transaction }
    );
    // Create CandidateDocument
    await CandidateDocument.create(
      {
        candidateId,
        documentId: newDoc.id,
        documentType: "education",
      },
      { transaction }
    );
    await transaction.commit();
    return newDoc;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const addCandidateExperienceDocument = async (
  candidateId,
  experienceId,
  fileData,
  uploadedBy,
  clientId
) => {
  const transaction = await sequelize.transaction();
  try {
    const newDoc = await Document.create(
      {
        name: fileData.originalname,
        description: `Experience Document`,
        fileName: fileData.filename,
        originalName: fileData.originalname,
        filePath: fileData.path,
        fileSize: fileData.size,
        mimeType: fileData.mimetype,
        fileType: fileData.mimetype.split("/").pop(),
        visibility: "private",
        version: 1,
        isTemplate: false,
        uploadedBy,
        clientId,
        downloadCount: 0,
        viewCount: 0,
        isActive: true,
      },
      { transaction }
    );
    await CandidateExperience.update(
      { documentId: newDoc.id },
      { where: { id: experienceId, candidateId }, transaction }
    );
    await CandidateDocument.create(
      {
        candidateId,
        documentId: newDoc.id,
        documentType: "experience",
      },
      { transaction }
    );
    await transaction.commit();
    return newDoc;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const addCandidateActivityDocument = async (
  candidateId,
  activityId,
  fileData,
  uploadedBy,
  clientId
) => {
  const transaction = await sequelize.transaction();
  try {
    const newDoc = await Document.create(
      {
        name: fileData.originalname,
        description: `Activity Document`,
        fileName: fileData.filename,
        originalName: fileData.originalname,
        filePath: fileData.path,
        fileSize: fileData.size,
        mimeType: fileData.mimetype,
        fileType: fileData.mimetype.split("/").pop(),
        visibility: "private",
        version: 1,
        isTemplate: false,
        uploadedBy,
        clientId,
        downloadCount: 0,
        viewCount: 0,
        isActive: true,
      },
      { transaction }
    );
    await CandidateExtraCurricular.update(
      { documentId: newDoc.id },
      { where: { id: activityId, candidateId }, transaction }
    );
    await CandidateDocument.create(
      {
        candidateId,
        documentId: newDoc.id,
        documentType: "activity",
      },
      { transaction }
    );
    await transaction.commit();
    return newDoc;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Helper function to update total experience for all candidates
export const updateAllCandidatesTotalExperience = async () => {
  try {
    const candidates = await Candidate.findAll({
      include: [
        {
          model: CandidateExperience,
          as: "CandidateExperiences",
        },
      ],
    });

    for (const candidate of candidates) {
      const totalExperience = calculateTotalExperience(
        candidate.CandidateExperiences
      );
      await Candidate.update(
        { totalExperience },
        { where: { id: candidate.id } }
      );
    }

    console.log(`Updated total experience for ${candidates.length} candidates`);
  } catch (error) {
    console.log("Error updating all candidates total experience:", error);
    throw error;
  }
};

// Helper function to clean up orphaned documents
const cleanupOrphanedDocuments = async () => {
  try {
    console.log(
      "[cleanupOrphanedDocuments] Starting cleanup of orphaned documents..."
    );

    // Find documents that are not linked to any candidate
    const orphanedDocs = await Document.findAll({
      include: [
        {
          model: CandidateDocument,
          required: false,
        },
        {
          model: CandidateEducation,
          required: false,
        },
        {
          model: CandidateExperience,
          required: false,
        },
        {
          model: CandidateCertification,
          required: false,
        },
        {
          model: CandidateExtraCurricular,
          required: false,
        },
      ],
      where: {
        [Op.and]: [
          { isActive: true },
          {
            [Op.or]: [
              { "$CandidateDocuments.id$": null },
              { "$CandidateEducations.id$": null },
              { "$CandidateExperiences.id$": null },
              { "$CandidateCertifications.id$": null },
              { "$CandidateExtraCurriculars.id$": null },
            ],
          },
        ],
      },
    });

    if (orphanedDocs.length > 0) {
      console.log(
        `[cleanupOrphanedDocuments] Found ${orphanedDocs.length} orphaned documents`
      );

      for (const doc of orphanedDocs) {
        try {
          // Delete physical file
          if (doc.filePath && fs.existsSync(doc.filePath)) {
            fs.unlinkSync(doc.filePath);
            console.log(
              `[cleanupOrphanedDocuments] ✅ Deleted orphaned file: ${doc.filePath}`
            );
          }

          // Delete document record
          await doc.destroy();
          console.log(
            `[cleanupOrphanedDocuments] ✅ Deleted orphaned document: ${doc.id}`
          );
        } catch (err) {
          console.log(
            `[cleanupOrphanedDocuments] ❌ Failed to delete orphaned document ${doc.id}:`,
            err.message
          );
        }
      }
    } else {
      console.log("[cleanupOrphanedDocuments] No orphaned documents found");
    }
  } catch (error) {
    console.log(
      "[cleanupOrphanedDocuments] Error during cleanup:",
      error.message
    );
  }
};

// Manual cleanup function for orphaned documents
export const cleanupOrphanedDocumentsManual = async () => {
  return await cleanupOrphanedDocuments();
};

// Optimized methods for specific candidate data fetching
export const getCandidateProfileOptimized = async (candidateId) => {
  const startTime = Date.now();
  try {
    const candidate = await Candidate.findByPk(candidateId, {
      attributes: [
        'id', 'name', 'email', 'position', 'phone', 'location', 'currentCompany', 'bio',
        'source', 'noticePeriod', 'expectedSalary', 'linkedInProfile',
        'githubProfile', 'twitterProfile', 'portfolioUrl', 'totalExperience',
        'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Skills,
          as: "Skills",
          through: { model: CandidateSkillMap, attributes: [] },
          attributes: ["id", "title"],
        },
        {
          model: CandidateJobMap,
          as: "CandidateJobMaps",
          attributes: ["id", "status", "assignedDate", "jobId"],
          include: [
            {
              model: Job,
              attributes: ["id", "jobTitle"],
            },
          ],
        },
      ],
    });

    logDatabaseOperation('getCandidateProfileOptimized', startTime);
    return candidate;
  } catch (error) {
    console.log('Error in getCandidateProfileOptimized:', error);
    throw error;
  }
};

export const getCandidateEducationOptimized = async (candidateId) => {
  const startTime = Date.now();
  try {
    const education = await CandidateEducation.findAll({
      where: { candidateId },
      attributes: [
        'id', 'candidateId', 'degree', 'institution', 'fieldOfStudy',
        'location', 'startDate', 'endDate', 'documentId', 'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Document,
          as: "Document",
          attributes: ['id', 'name', 'fileName', 'fileSize', 'mimeType', 'filePath']
        }
      ],
      order: [['startDate', 'DESC']],
    });

    logDatabaseOperation('getCandidateEducationOptimized', startTime);
    return education;
  } catch (error) {
    console.log('Error in getCandidateEducationOptimized:', error);
    throw error;
  }
};

export const getCandidateExperienceOptimized = async (candidateId) => {
  const startTime = Date.now();
  try {
    const experience = await CandidateExperience.findAll({
      where: { candidateId },
      attributes: [
        'id', 'candidateId', 'title', 'company', 'location', 'startDate',
        'endDate', 'description', 'isCurrentRole', 'documentId', 'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Document,
          as: "Document",
          attributes: ['id', 'name', 'fileName', 'fileSize', 'mimeType', 'filePath']
        }
      ],
      order: [['startDate', 'DESC']],
    });

    logDatabaseOperation('getCandidateExperienceOptimized', startTime);
    return experience;
  } catch (error) {
    console.log('Error in getCandidateExperienceOptimized:', error);
    throw error;
  }
};

export const getCandidateActivitiesOptimized = async (candidateId) => {
  const startTime = Date.now();
  try {
    const activities = await CandidateExtraCurricular.findAll({
      where: { candidateId },
      attributes: [
        'id', 'candidateId', 'title', 'organization', 'description',
        'documentId', 'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Document,
          as: "Document",
          attributes: ['id', 'name', 'fileName', 'fileSize', 'mimeType', 'filePath']
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    logDatabaseOperation('getCandidateActivitiesOptimized', startTime);
    return activities;
  } catch (error) {
    console.log('Error in getCandidateActivitiesOptimized:', error);
    throw error;
  }
};

export const getCandidateCertificationsOptimized = async (candidateId) => {
  const startTime = Date.now();
  try {
    const certifications = await CandidateCertification.findAll({
      where: { candidateId },
      attributes: [
        'id', 'candidateId', 'certificationName', 'issuingOrganization',
        'issueDate', 'expiryDate', 'documentId', 'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Document,
          as: "Document",
          attributes: ['id', 'name', 'fileName', 'fileSize', 'mimeType', 'filePath']
        }
      ],
      order: [['issueDate', 'DESC']],
    });

    logDatabaseOperation('getCandidateCertificationsOptimized', startTime);
    return certifications;
  } catch (error) {
    console.log('Error in getCandidateCertificationsOptimized:', error);
    throw error;
  }
};
/**
 * Get all candidates who are in the final stage of any job application, with job and application info.
 * Returns: [{ candidateId, candidateName, candidateEmail, jobId, jobTitle, applicationId, finalStageName, currentStage }]
 */
export async function getFinalStageCandidatesWithJobs() {
  // 1. Find all jobs with their pipeline and stages
  const jobs = await Job.findAll({
    include: [
      { model: Pipeline, as: "pipeline", include: [{ model: PipelineStage, as: "stages" }] },
    ],
  });
  // console.log("Jobs found:", jobs.map(j => ({ id: j.id, pipelineId: j.pipelineId, title: j.jobTitle })));

  // 2. For each job, find the final stage (highest order)
  const jobFinalStages = {};
  for (const job of jobs) {
    const stages = job.pipeline?.stages || [];
    if (stages.length === 0) continue;
    const finalStage = stages.reduce((max, s) => (s.order > max.order ? s : max), stages[0]);
    jobFinalStages[job.id] = finalStage;
  }
  // console.log("jobFinalStages:", jobFinalStages);

  // 3. Find all applications in the final stage for their job
  const applications = await Application.findAll({
    where: {
      jobId: { [Op.in]: Object.keys(jobFinalStages) },
    },
    include: [
      { model: Candidate },
      { model: Job, as: 'job' },
    ],
  });
  // console.log("Applications fetched:", applications.map(a => ({ id: a.id, jobId: a.jobId, candidateId: a.candidateId, currentStage: a.currentStage })));

  // 4. Filter applications where currentStage matches the final stage's order
  const result = [];
  for (const app of applications) {
    const finalStage = jobFinalStages[app.jobId];
    if (!finalStage) continue;
    if (app.currentStage === finalStage.order) {
      result.push({
        candidateId: app.candidateId,
        candidateName: app.Candidate?.name,
        candidateEmail: app.Candidate?.email,
        candidatePhone: app.Candidate?.phone,
        jobId: app.jobId,
        jobTitle: app.job?.jobTitle,
        jobDepartment: app.job?.department,
        jobLocation: app.job?.location,
        applicationId: app.id,
        finalStageName: finalStage.name,
        currentStage: app.currentStage,
      });
    }
  }
  // console.log("Final-stage result:", result);
  return result;
}
