import {
  Job,
  Application,
  Company,
  JobTemplate,
  Document,
  Interview,
  Candidate,
  CandidateJobMap,
  CandidateSkillMap,
  PipelineStage,
} from "../models/index.js";
import { Op } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import csv from "csv-parser";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import { Skills } from "../models/Skills.js";
import { CandidateExperience } from "../models/CandidateExperience.js";
import { CandidateEducation } from "../models/CandidateEducation.js";
import { CandidateCertification } from "../models/CandidateCertification.js";
import { CandidateDocument } from "../models/CandidateDocument.js";
import { CandidateExtraCurricular } from "../models/CandidateExtraCurricular.js";

// Status ranking helper
const STATUS_ORDER = [
  "Applied",
  "Screening",
  "Interview",
  "Final Interview",
  "Offer",
  "Hired",
  "Rejected",
];

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
    return "Applied"; // Default status
  }

  // Filter out any invalid statuses
  const validStatuses = statuses.filter(
    (status) => statusHierarchy[status] !== undefined
  );

  if (validStatuses.length === 0) {
    return "Applied"; // Default status if no valid statuses
  }

  // Find the status with the highest hierarchy value
  return validStatuses.reduce((highest, current) => {
    return statusHierarchy[current] > statusHierarchy[highest]
      ? current
      : highest;
  });
}

export const jobRepository = {
  // Get all jobs with filtering, sorting and pagination
  async getAllJobs({
    page,
    limit,
    sortBy = "createdAt",
    order = "DESC",
    status,
    department,
    location,
    type,
    searchQuery,
    clientId,
  }) {
    if (!clientId) throw new Error("clientId is required for job queries");
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;

    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};

    if (status && status !== "all") where.jobStatus = status;
    if (department) where.department = department;
    if (location) where.location = location;
    if (type) where.jobType = type;
    if (searchQuery) {
      where[Op.or] = [
        { jobTitle: { [Op.like]: `%${searchQuery}%` } },
        { description: { [Op.like]: `%${searchQuery}%` } },
        { requirements: { [Op.like]: `%${searchQuery}%` } },
      ];
    }

    // Debug logs
    // console.log("[JobRepository][getAllJobs] clientId:", clientId);
    // console.log("[JobRepository][getAllJobs] where:", JSON.stringify(where));

    try {
      const { count, rows } = await Job.findAndCountAll({
        where,
        order: [[sortBy, order]],
        limit: parsedLimit,
        offset,
        include: [
          {
            model: Company,
            attributes: ["id", "name", "clientId"],
            required: true,
            where: { clientId },
          },
        ],
        raw: false,
        // logging: (sql) => console.log("[JobRepository][getAllJobs] SQL:", sql),
      });

      console.log(
        `Found ${count} total jobs, returning ${rows.length} jobs for page ${parsedPage}`
      );

      // Convert the rows to plain objects and ensure they have the correct structure
      const jobs = rows.map((job) => {
        const jobData = job.get({ plain: true });
        return {
          ...jobData,
          id: jobData.id,
          jobTitle: jobData.jobTitle || "",
          company: jobData.Company || {
            id: jobData.companyId,
            name: "Unknown Company",
          },
          department: jobData.department || "",
          location: jobData.location || "",
          jobType: jobData.jobType || "",
          jobStatus: jobData.jobStatus || "active",
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
          applicants: jobData.applicants || 0,
          applications: jobData.applications || 0,
          conversionRate: jobData.conversionRate || 0,
          applicationStages: jobData.applicationStages || [],
        };
      });

      return {
        jobs,
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(count / parsedLimit),
      };
    } catch (error) {
      console.log("Error in JobRepository.getAllJobs:", error);
      throw error;
    }
  },

  // Create a new job
  async createJob(jobData, options = {}) {
    // The model setters will handle JSON stringification
    return await Job.create(jobData, options);
  },

  // Get job by ID
  async getJobById(id) {
    try {
      const job = await Job.findByPk(id, {
        include: [
          {
            model: Company,
            attributes: ["id", "name"],
          },
        ],
      });

      return job;
    } catch (error) {
      console.log(`Error in getJobById(${id}):`, error);
      throw error;
    }
  },

  // Update job
  async updateJob(id, jobData, options = {}) {
    console.log("[JobRepository] Starting job update:", { id, jobData });

    try {
      // Remove any document-related fields from jobData
      const { documents, ...jobDataWithoutDocuments } = jobData;

      const job = await Job.findByPk(id, options);
      if (!job) {
        console.log("[JobRepository] Job not found:", id);
        return null;
      }

      console.log("[JobRepository] Found job:", job.toJSON());
      console.log(
        "[JobRepository] Updating with data:",
        jobDataWithoutDocuments
      );

      // The model setters will handle JSON stringification
      await job.update(jobDataWithoutDocuments, options);
      return job;
    } catch (error) {
      console.log("[JobRepository] Error in updateJob:", error);

      throw error;
    }
  },

  // Delete job
  async deleteJob(id) {
    const job = await Job.findByPk(id);
    if (!job) return false;
    await job.destroy();
    return true;
  },

  // Update job status
  async updateJobStatus(id, status) {
    const job = await Job.findByPk(id);
    if (!job) return null;
    return await job.update({ jobStatus: status });
  },

  // Get job applicants
  async getJobApplicants(
    jobId,
    { status, sortBy = "createdAt", order = "DESC", onlyApplicants = false },
    clientId
  ) {
    try {
      const where = { jobId };
      // If onlyApplicants and no status filter, exclude Archived
      if (onlyApplicants && !status) {
        where.status = { [Op.ne]: "Archived" };
      } else if (status) {
        where.status = status;
      }

      // Get the job and parse requiredSkills
      const job = await Job.findByPk(jobId);
      let requiredSkills = [];
      if (job && job.requiredSkills) {
        try {
          requiredSkills = Array.isArray(job.requiredSkills)
            ? job.requiredSkills
            : JSON.parse(job.requiredSkills);
        } catch (e) {
          requiredSkills = [];
        }
      }

      // Helper to get candidate skills (array of titles)
      async function getCandidateSkills(candidateId) {
        const skillMaps = await CandidateSkillMap.findAll({
          where: { candidateId },
          include: [
            {
              model: Skills,
              attributes: ["title"],
            },
          ],
        });
        return skillMaps
          .map((sm) => sm.Skill && sm.Skill.title)
          .filter(Boolean);
      }

      // Helper to get ATS scores from CandidateJobMap and ensure they exist
      async function getATSScores(candidateId, jobId) {
        const candidateJobMap = await CandidateJobMap.findOne({
          where: { candidateId, jobId },
        });

        // If scores don't exist or are outdated, calculate them
        if (
          !candidateJobMap ||
          candidateJobMap.atsScore === null ||
          !candidateJobMap.lastScoredAt ||
          new Date() - new Date(candidateJobMap.lastScoredAt) >
          7 * 24 * 60 * 60 * 1000
        ) {
          // Import the ATS scoring service
          const { ensureATSScores } = await import(
            "../services/ats-scoring.service.js"
          );
          const scores = await ensureATSScores(candidateId, jobId);

          return {
            atsScore: scores.atsScore || 0,
            skillsMatch: scores.skillsMatch || 0,
            experienceMatch: scores.experienceMatch || 0,
            educationMatch: scores.educationMatch || 0,
            analysis: scores.analysis || "",
          };
        }

        return {
          atsScore: candidateJobMap.atsScore || 0,
          skillsMatch: candidateJobMap.skillsMatch || 0,
          experienceMatch: candidateJobMap.experienceMatch || 0,
          educationMatch: candidateJobMap.educationMatch || 0,
          analysis: candidateJobMap.atsAnalysis || "",
        };
      }

      // Helper to get ATS scores for multiple candidates efficiently
      async function getATSScoresForCandidates(candidateIds, jobId, clientId) {
        if (!candidateIds || candidateIds.length === 0) {
          return {};
        }
        // Import the ATS scoring service
        const { ensureATSScoresForCandidates } = await import(
          "../services/ats-scoring.service.js"
        );
        const scoresMap = await ensureATSScoresForCandidates(
          candidateIds,
          jobId,
          clientId
        );
        return scoresMap;
      }

      // Get regular applications
      const applications = await Application.findAll({
        where,
        order: [[sortBy, order]],
        include: [
          {
            model: Job,
            as: "job",
            attributes: ["id", "jobTitle", "companyId"],
          },
          {
            model: Candidate,
            required: true,
            where: { clientId }, // Filter directly by Candidate.clientId
            attributes: [
              "id",
              "name",
              "email",
              "position",
              "phone",
              "location",
              "bio",
              "resumeUrl",
              "dateAdded",
              "source",
              "linkedInProfile",
              "githubProfile",
              "twitterProfile",
              "portfolioUrl",
              "currentCompany",
              "noticePeriod",
              "expectedSalary",
              "totalExperience",
            ],
            include: [
              {
                model: CandidateJobMap,
                as: "CandidateJobMaps",
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
              { model: CandidateExperience, as: "CandidateExperiences" },
              { model: CandidateEducation, as: "CandidateEducations" },
              { model: CandidateCertification, as: "CandidateCertifications" },
              { model: CandidateDocument, as: "CandidateDocuments" },
              {
                model: CandidateExtraCurricular,
                as: "CandidateExtraCurriculars",
              },
            ],
          },
        ],
      });

      // Collect all candidate IDs for bulk ATS score calculation
      const applicationCandidateIds = applications
        .map((app) =>
          app.Candidate
            ? app.Candidate.id
            : app.candidate
              ? app.candidate.id
              : null
        )
        .filter(Boolean);

      // Get ATS scores for all application candidates in bulk
      const applicationATScores = await getATSScoresForCandidates(
        applicationCandidateIds,
        jobId,
        clientId
      );

      // Combine and format the results
      const formattedApplications = await Promise.all(
        applications.map(async (app) => {
          const candidateId = app.Candidate
            ? app.Candidate.id
            : app.candidate
              ? app.candidate.id
              : null;
          const candidateSkills = candidateId
            ? await getCandidateSkills(candidateId)
            : [];
          const relevantSkills = requiredSkills.filter((skill) =>
            candidateSkills.includes(skill)
          );
          const missingSkills = requiredSkills.filter(
            (skill) => !candidateSkills.includes(skill)
          );

          // Get ATS scores from the bulk calculation
          const atsScores =
            candidateId && applicationATScores[candidateId]
              ? applicationATScores[candidateId]
              : {
                atsScore: 0,
                skillsMatch: 0,
                experienceMatch: 0,
                educationMatch: 0,
                analysis: "",
              };

          // Always use the analysis from atsScores (never fallback to candidateJobMap)
          const analysis = atsScores.analysis || "";

          // Extract full profile arrays if present
          const candidate = app.Candidate || {};
          return {
            id: app.id,
            type: "application",
            status: app.status,
            appliedDate: app.createdAt,
            name: candidate.name || "",
            email: candidate.email || "",
            candidateId,
            matchDetails: { relevantSkills, missingSkills },
            position: candidate.position,
            phone: candidate.phone,
            location: candidate.location,
            bio: candidate.bio,
            resumeUrl: candidate.resumeUrl,
            dateAdded: candidate.dateAdded,
            source: candidate.source,
            linkedInProfile: candidate.linkedInProfile,
            githubProfile: candidate.githubProfile,
            twitterProfile: candidate.twitterProfile,
            portfolioUrl: candidate.portfolioUrl,
            currentCompany: candidate.currentCompany,
            noticePeriod: candidate.noticePeriod,
            expectedSalary: candidate.expectedSalary,
            totalExperience: candidate.totalExperience,
            CandidateExperiences: candidate.CandidateExperiences,
            CandidateEducations: candidate.CandidateEducations,
            CandidateCertifications: candidate.CandidateCertifications,
            CandidateDocuments: candidate.CandidateDocuments,
            CandidateExtraCurriculars: candidate.CandidateExtraCurriculars,
            CandidateSkillMaps: candidate.CandidateSkillMaps,
            // Add ATS scores from CandidateJobMap
            atsScore: atsScores.atsScore,
            skillsMatch: atsScores.skillsMatch,
            experienceMatch: atsScores.experienceMatch,
            educationMatch: atsScores.educationMatch,
            analysis,
          };
        })
      );

      // Since we're using required: true in the query, we no longer need to filter here
      if (onlyApplicants) {
        return formattedApplications.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          return order === "ASC"
            ? aValue > bValue
              ? 1
              : -1
            : aValue < bValue
              ? 1
              : -1;
        });
      }

      // Get assigned candidates (only if not onlyApplicants)
      const assignedCandidates = await CandidateJobMap.findAll({
        where: { jobId }, // No longer filter by status here
        include: [
          {
            model: Candidate,
            as: "Candidate",
            required: true, // This ensures only assignments with valid candidates are returned
            where: { clientId }, // Filter directly by Candidate.clientId
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["assignedDate", order]],
      });

      // Collect all assigned candidate IDs for bulk ATS score calculation
      const assignedCandidateIds = assignedCandidates
        .map((assign) =>
          assign.Candidate
            ? assign.Candidate.id
            : assign.candidate
              ? assign.candidate.id
              : null
        )
        .filter(Boolean);

      // Get ATS scores for all assigned candidates in bulk
      const assignedATScores = await getATSScoresForCandidates(
        assignedCandidateIds,
        jobId,
        clientId
      );

      const formattedAssignments = await Promise.all(
        assignedCandidates.map(async (assign) => {
          const candidateId = assign.Candidate
            ? assign.Candidate.id
            : assign.candidate
              ? assign.candidate.id
              : null;
          const candidateSkills = candidateId
            ? await getCandidateSkills(candidateId)
            : [];
          const relevantSkills = requiredSkills.filter((skill) =>
            candidateSkills.includes(skill)
          );
          const missingSkills = requiredSkills.filter(
            (skill) => !candidateSkills.includes(skill)
          );

          // Get ATS scores from the bulk calculation
          const atsScores =
            candidateId && assignedATScores[candidateId]
              ? assignedATScores[candidateId]
              : {
                atsScore: 0,
                skillsMatch: 0,
                experienceMatch: 0,
                educationMatch: 0,
                analysis: "",
              };

          // Always use the analysis from atsScores (never fallback to candidateJobMap)
          const analysis = atsScores.analysis || "";

          return {
            id: assign.id,
            type: "assignment",
            status: assign.status || "assigned",
            appliedDate: assign.assignedDate,
            name: assign.Candidate
              ? assign.Candidate.name
              : assign.candidate
                ? assign.candidate.name
                : "",
            email: assign.Candidate
              ? assign.Candidate.email
              : assign.candidate
                ? assign.candidate.email
                : "",
            candidateId,
            assignedBy: assign.assignedBy,
            atsScore: atsScores.atsScore,
            skillsMatch: atsScores.skillsMatch,
            experienceMatch: atsScores.experienceMatch,
            educationMatch: atsScores.educationMatch,
            analysis,
            matchDetails: { relevantSkills, missingSkills },
          };
        })
      );

      // Since we're using required: true in the query, we no longer need to filter here
      // Combine and sort all results
      const allApplicants = [...formattedApplications, ...formattedAssignments];
      return allApplicants.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        return order === "ASC"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
            ? 1
            : -1;
      });
    } catch (error) {
      console.log("Error in jobRepository.getJobApplicants:", error);
      throw error;
    }
  },

  /**
   * Updates an application's status using its unique primary key.
   * This is the preferred method for updating statuses in the hiring pipeline.
   * @param {number} applicationId - The unique ID of the Application record.
   * @param {string} status - The new status to set.
   * @returns {Promise<Application|null>} The updated application instance or null if not found.
   */
  async updateApplicationStatusById(applicationId, status) {
    const application = await Application.findByPk(applicationId);
    if (!application) {
      return null;
    }
    // Find the job and its pipeline
    const job = await Job.findByPk(application.jobId);
    if (!job || !job.pipelineId) {
      // If no pipeline, just update status

      return await application.update({ status });
    }
    // Find all stages for this pipeline
    const stages = await PipelineStage.findAll({
      where: { pipelineId: job.pipelineId },
    });
    // Find the stage with the given status as its name
    const stage = stages.find(s => s.name === status);
    if (stage) {
      return await application.update({
        status,
        currentStage: stage.order,
        pipelineStageId: stage.id,
      });
    } else {
      // If stage not found, just update status
      return await application.update({ status });
    }
  },

  // This function is for updating the status of a SOURCED candidate (an assignment).
  async updateAssignmentStatus(jobId, candidateId, status) {
    // Update the CandidateJobMap status
    const [updatedRows] = await CandidateJobMap.update(
      { status },
      { where: { jobId: jobId, candidateId: candidateId } }
    );

    // If marking as candidate, archive all applications for this candidate and job
    if (status === "candidate") {
      const applications = await Application.findAll({
        where: {
          jobId: jobId,
          candidateId: candidateId,
          status: { [Op.ne]: "Archived" },
        },
      });
      for (const application of applications) {
        await application.update({ status: "Archived", currentStage: 0 });
      }
    }
    return updatedRows > 0;
  },

  // This function is for rejecting a formal APPLICATION.
  async rejectApplication(applicationId, reason) {
    const application = await Application.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new Error("Application not found.");
    }

    const updatedApp = await application.update({
      status: "Rejected",
      rejectionReason: reason,
    });

    // We should also update the candidate's main status to reflect their most advanced stage
    // across all applications, but we'll keep this logic self-contained for now.

    return updatedApp;
  },

  // Get job templates
  async getJobTemplates({ category, industry }) {
    const where = {};
    if (category) where.category = category;
    if (industry) where.industry = industry;

    return await JobTemplate.findAll({ where });
  },

  // Create job template
  async createJobTemplate(templateData) {
    // Map jobTitle -> title and description -> jobDescription for DB compatibility
    const mapped = {
      ...templateData,
      title: templateData.jobTitle || templateData.title,
      jobDescription: templateData.description || templateData.jobDescription,
      requirements: templateData.requirements,
      responsibilities: templateData.responsibilities,
      benefits: templateData.benefits,
      workType: templateData.workType,
    };
    return await JobTemplate.create(mapped);
  },

  // Update job template
  async updateJobTemplate(id, templateData) {
    const template = await JobTemplate.findByPk(id);
    if (!template) return null;
    // Map jobTitle -> title and description -> jobDescription for DB compatibility
    const mapped = {
      ...templateData,
      title: templateData.jobTitle || templateData.title,
      jobDescription: templateData.description || templateData.jobDescription,
      requirements: templateData.requirements,
      responsibilities: templateData.responsibilities,
      benefits: templateData.benefits,
      workType: templateData.workType,
    };
    return await template.update(mapped);
  },

  // Delete job template
  async deleteJobTemplate(id) {
    const template = await JobTemplate.findByPk(id);
    if (!template) return false;
    await template.destroy();
    return true;
  },

  // Get job statistics
  async getJobStats() {
    const stats = await Job.findAll({
      attributes: [
        "jobStatus",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["jobStatus"],
    });
    return stats;
  },

  // Get job analytics
  async getJobAnalytics() {
    const analytics = await Application.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "applications"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      limit: 30,
    });
    return analytics;
  },

  // Get job documents
  async getJobDocuments(jobId) {
    return await Document.findAll({
      where: { jobId },
      include: [
        {
          model: Job,
          attributes: ["id", "jobTitle"],
        },
      ],
    });
  },

  // Add job document
  async addJobDocument(jobId, documentData) {
    return await Document.create({
      ...documentData,
      jobId,
    });
  },

  // Bulk upload jobs
  async bulkUploadJobs(filePath) {
    const results = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", async (data) => {
          try {
            const job = await Job.create(data);
            results.push(job);
          } catch (error) {
            results.push({ error: error.message, data });
          }
        })
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  },

  // Get departments
  async getDepartments() {
    const departments = await Job.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("department")), "department"],
      ],
      where: {
        department: {
          [Op.not]: null,
        },
      },
    });
    return departments.map((d) => d.department);
  },

  // Add department
  async addDepartment(department) {
    // Since departments are stored in the jobs table, we just need to validate
    const existing = await Job.findOne({
      where: { department },
    });
    if (existing) {
      throw new Error("Department already exists");
    }
    return department;
  },

  // Get locations
  async getLocations() {
    const locations = await Job.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("location")), "location"],
      ],
      where: {
        location: {
          [Op.not]: null,
        },
      },
    });
    return locations.map((l) => l.location);
  },

  // Add location
  async addLocation(location) {
    const existing = await Job.findOne({
      where: { location },
    });
    if (existing) {
      throw new Error("Location already exists");
    }
    return location;
  },

  // Get job types
  async getJobTypes() {
    const types = await Job.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("jobType")), "jobType"],
      ],
      where: {
        jobType: {
          [Op.not]: null,
        },
      },
    });
    return types.map((t) => t.jobType);
  },

  // Add job type
  async addJobType(type) {
    const existing = await Job.findOne({
      where: { jobType: type },
    });
    if (existing) {
      throw new Error("Job type already exists");
    }
    return type;
  },

  // Get companies
  async getCompanies(clientId) {
    if (!clientId) throw new Error("clientId is required for company queries");
    return await Company.findAll({
      where: { clientId },
      attributes: ["id", "name", "industry", "location"],
    });
  },

  // Get company jobs
  async getCompanyJobs(companyId) {
    return await Job.findAll({
      where: { companyId },
      include: [
        {
          model: Company,
          attributes: ["id", "name"],
        },
      ],
    });
  },

  // Schedule interview
  async scheduleInterview(interviewData) {
    return await Interview.create(interviewData);
  },

  // Generate bulk upload template
  async generateBulkUploadTemplate() {
    const headers = [
      { id: "jobTitle", title: "Job Title" },
      { id: "jobType", title: "Job Type" },
      { id: "department", title: "Department" },
      { id: "location", title: "Location" },
      { id: "openings", title: "Number of Openings" },
      { id: "salaryMin", title: "Minimum Salary" },
      { id: "salaryMax", title: "Maximum Salary" },
      { id: "experienceLevel", title: "Experience Level" },
      { id: "description", title: "Job Description" },
      { id: "requirements", title: "Requirements" },
      { id: "responsibilities", title: "Responsibilities" },
      { id: "benefits", title: "Benefits" },
      { id: "jobStatus", title: "Job Status" },
      { id: "workType", title: "Work Type" },
      { id: "deadline", title: "Application Deadline" },
    ];

    const templatePath = "uploads/job_bulk_upload_template.csv";
    const csvWriter = createObjectCsvWriter({
      path: templatePath,
      header: headers,
    });

    // Write empty data to create template
    await csvWriter.writeRecords([]);

    return templatePath;
  },

  // Get job applicants count
  async getJobApplicantsCount(jobId) {
    const count = await Application.count({
      where: {
        jobId,
        status: { [Op.ne]: "Archived" },
      },
      include: [
        {
          model: Candidate,
          required: true, // Only count if candidate exists
        },
      ],
    });
    return count;
  },

  // Get job with dynamic applicants count
  async getJobWithApplicantsCount(jobId) {
    const job = await Job.findByPk(jobId);
    if (!job) return null;

    const applicantsCount = await this.getJobApplicantsCount(jobId);
    return {
      ...job.toJSON(),
      applicants: applicantsCount,
    };
  },

  // Get all jobs with dynamic applicants count
  async getAllJobsWithApplicantsCount({ clientId }) {
    if (!clientId) throw new Error("clientId is required for job queries");
    // Fetch jobs for this client only
    const jobs = await Job.findAll({
      include: [
        {
          model: Company,
          attributes: ["id", "name", "clientId"],
          required: true,
          where: { clientId },
        },
      ],
    });
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantsCount = await this.getJobApplicantsCount(job.id);
        return {
          ...job.toJSON(),
          applicants: applicantsCount,
        };
      })
    );
    return jobsWithCounts;
  },

  // Get application by ID
  async getApplicationById(applicationId) {
    try {
      return await Application.findByPk(applicationId);
    } catch (error) {
      console.log(`Error in getApplicationById(${applicationId}):`, error);
      throw error;
    }
  },
};
