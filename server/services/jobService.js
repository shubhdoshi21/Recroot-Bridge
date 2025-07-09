import { jobRepository } from "../repositories/jobRepository.js";
import { validateJobData, validateTemplateData } from "../utils/validators.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Company } from "../models/Company.js";
import { Job } from "../models/Job.js";
import { Op } from "sequelize";
import { Skills } from "../models/Skills.js";
import { JobSkillRequirement } from "../models/JobSkillRequirement.js";
import { sequelize } from "../config/sequelize.js";
import { matchJobWithCandidates } from "./ats-scoring.service.js";
import { communicationsService } from "./communicationsService.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const jobService = {
  // Get all jobs with filtering
  async getAllJobs(filters = {}) {
    try {
      if (!filters.clientId)
        throw new Error("clientId is required for job queries");
      return await jobRepository.getAllJobs(filters);
    } catch (error) {
      throw new Error(`Error fetching jobs: ${error.message}`);
    }
  },

  // Create a new job
  async createJob(jobData, clientId) {
    let transaction;
    try {
      if (!clientId) {
        throw new Error("clientId is required for job creation");
      }

      transaction = await sequelize.transaction();
      const validationError = validateJobData(jobData);
      if (validationError) {
        console.log("[JobService] Validation error:", validationError);
        throw new Error(validationError);
      }

      // Validate that the company belongs to the correct client
      if (jobData.companyId) {
        const company = await Company.findByPk(jobData.companyId, {
          transaction,
        });
        if (!company) {
          throw new Error("Company not found");
        }
        if (company.clientId !== clientId) {
          throw new Error("Company does not belong to this client");
        }
      }

      // Set postedDate only for new jobs that are not drafts
      if (
        jobData.jobStatus &&
        jobData.jobStatus.toLowerCase() !== "draft" &&
        !jobData.postedDate
      ) {
        jobData.postedDate = new Date().toISOString();
      }

      // Normalize requiredSkills
      let requiredSkillsArr = [];
      if (jobData.requiredSkills) {
        if (Array.isArray(jobData.requiredSkills)) {
          requiredSkillsArr = jobData.requiredSkills;
        } else if (typeof jobData.requiredSkills === "string") {
          try {
            requiredSkillsArr = JSON.parse(jobData.requiredSkills);
          } catch (e) {
            throw new Error("Invalid required skills format");
          }
        } else {
          throw new Error("Invalid required skills format");
        }
      }

      // Ensure all skills exist in Skills table
      const skillRecords = await Promise.all(
        requiredSkillsArr.map(async (skillName) => {
          const [skill] = await Skills.findOrCreate({
            where: { title: skillName.trim().toLowerCase() },
            defaults: { title: skillName.trim().toLowerCase() },
            transaction,
          });
          return skill;
        })
      );

      // Store normalized names in requiredSkills field
      jobData.requiredSkills = JSON.stringify(skillRecords.map((s) => s.title));

      // Create the job
      const job = await jobRepository.createJob(jobData, { transaction });

      // Create JobSkillRequirement records
      await Promise.all(
        skillRecords.map(async (skill) => {
          await JobSkillRequirement.create(
            {
              jobId: job.id,
              skillId: skill.id,
            },
            { transaction }
          );
        })
      );

      // Update company metrics
      if (job.companyId) {
        await Company.increment("jobs", {
          where: { id: job.companyId },
          transaction,
        });
        if (job.jobStatus !== "Closed") {
          await Company.increment("openJobs", {
            where: { id: job.companyId },
            transaction,
          });
        }
      }

      await transaction.commit();
      // Only run non-throwing code after commit
      // Use the passed clientId for ATS matching
      matchJobWithCandidates(job.id, clientId).catch(console.log);
      return job;
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw new Error(`Error creating job: ${error.message}`);
    }
  },

  // Get job by ID
  async getJobById(id, clientId) {
    try {
      if (!clientId) {
        throw new Error("clientId is required for job queries");
      }

      const job = await jobRepository.getJobById(id);
      if (!job) {
        throw new Error("Job not found");
      }

      // Validate that the job belongs to the correct client through company
      const jobWithCompany = await Job.findByPk(id, {
        include: [
          {
            model: Company,
            attributes: ["clientId"],
            required: true,
          },
        ],
      });

      if (!jobWithCompany || jobWithCompany.Company.clientId !== clientId) {
        throw new Error("Job not found or does not belong to this client");
      }

      return job;
    } catch (error) {
      throw new Error(`Error fetching job: ${error.message}`);
    }
  },

  // Update job
  async updateJob(id, jobData, clientId) {
    const transaction = await sequelize.transaction();
    try {
      if (!clientId) {
        throw new Error("clientId is required for job updates");
      }

      const validationError = validateJobData(jobData);
      if (validationError) {
        throw new Error(validationError);
      }

      const currentJob = await jobRepository.getJobById(id);
      if (!currentJob) {
        throw new Error("Job not found");
      }

      // Validate that the job belongs to the correct client through company
      const jobWithCompanyForValidation = await Job.findByPk(id, {
        include: [
          {
            model: Company,
            attributes: ["clientId"],
            required: true,
          },
        ],
        transaction,
      });

      if (
        !jobWithCompanyForValidation ||
        jobWithCompanyForValidation.Company.clientId !== clientId
      ) {
        throw new Error("Job not found or does not belong to this client");
      }

      // If companyId is being updated, validate the new company belongs to the client
      if (jobData.companyId && jobData.companyId !== currentJob.companyId) {
        const newCompany = await Company.findByPk(jobData.companyId, {
          transaction,
        });
        if (!newCompany) {
          throw new Error("Company not found");
        }
        if (newCompany.clientId !== clientId) {
          throw new Error("Company does not belong to this client");
        }
      }

      // Normalize requiredSkills
      let requiredSkillsArr = [];
      if (jobData.requiredSkills) {
        if (Array.isArray(jobData.requiredSkills)) {
          requiredSkillsArr = jobData.requiredSkills;
        } else if (typeof jobData.requiredSkills === "string") {
          try {
            requiredSkillsArr = JSON.parse(jobData.requiredSkills);
          } catch (e) {
            throw new Error("Invalid required skills format");
          }
        } else {
          throw new Error("Invalid required skills format");
        }
      }

      // Ensure all skills exist in Skills table
      const skillRecords = await Promise.all(
        requiredSkillsArr.map(async (skillName) => {
          const [skill] = await Skills.findOrCreate({
            where: { title: skillName.trim().toLowerCase() },
            defaults: { title: skillName.trim().toLowerCase() },
            transaction,
          });
          return skill;
        })
      );

      // Store normalized names in requiredSkills field
      jobData.requiredSkills = JSON.stringify(skillRecords.map((s) => s.title));

      // Remove document-related fields until document module is implemented
      const { documents, ...jobDataWithoutDocuments } = jobData;

      // Update the job
      const updatedJob = await jobRepository.updateJob(
        id,
        jobDataWithoutDocuments,
        { transaction }
      );

      // Sync JobSkillRequirement records
      const existingSkillLinks = await JobSkillRequirement.findAll({
        where: { jobId: id },
        transaction,
      });
      const existingSkillIds = existingSkillLinks.map((link) => link.skillId);
      const newSkillIds = skillRecords.map((skill) => skill.id);

      // Add new links
      for (const skillId of newSkillIds) {
        if (!existingSkillIds.includes(skillId)) {
          await JobSkillRequirement.create(
            { jobId: id, skillId },
            { transaction }
          );
        }
      }
      // Remove old links
      for (const skillId of existingSkillIds) {
        if (!newSkillIds.includes(skillId)) {
          await JobSkillRequirement.destroy({
            where: { jobId: id, skillId },
            transaction,
          });
        }
      }

      // Company metrics update (unchanged)
      if (currentJob.jobStatus !== jobDataWithoutDocuments.jobStatus) {
        if (
          currentJob.jobStatus !== "Closed" &&
          jobDataWithoutDocuments.jobStatus === "Closed"
        ) {
          await Company.decrement("openJobs", {
            where: { id: currentJob.companyId },
            transaction,
          });
        } else if (
          currentJob.jobStatus === "Closed" &&
          jobDataWithoutDocuments.jobStatus !== "Closed"
        ) {
          await Company.increment("openJobs", {
            where: { id: currentJob.companyId },
            transaction,
          });
        }
      }

      await transaction.commit();
      // Trigger ATS re-matching asynchronously
      matchJobWithCandidates(id).catch(console.log);
      return updatedJob;
    } catch (error) {
      await transaction.rollback();
      console.log("[JobService] Error updating job:", error);

      throw error;
    }
  },

  // Delete job
  async deleteJob(id, clientId) {
    try {
      if (!clientId) {
        throw new Error("clientId is required for job deletion");
      }

      // Validate that the job belongs to the correct client through company
      const jobWithCompany = await Job.findByPk(id, {
        include: [
          {
            model: Company,
            attributes: ["clientId"],
            required: true,
          },
        ],
      });

      if (!jobWithCompany || jobWithCompany.Company.clientId !== clientId) {
        throw new Error("Job not found or does not belong to this client");
      }

      const deleted = await jobRepository.deleteJob(id);

      // Update company metrics
      if (jobWithCompany.companyId) {
        await Company.decrement("jobs", { where: { id: jobWithCompany.companyId } });

        // Only decrement openJobs if the job status was not closed
        if (jobWithCompany.jobStatus !== "Closed") {
          await Company.decrement("openJobs", { where: { id: jobWithCompany.companyId } });
        }
      }

      return { message: "Job deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting job: ${error.message}`);
    }
  },

  // Update job status
  async updateJobStatus(id, status, clientId) {
    try {
      if (!clientId) {
        throw new Error("clientId is required for job status updates");
      }

      // Validate that the job belongs to the correct client through company
      const jobWithCompany = await Job.findByPk(id, {
        include: [
          {
            model: Company,
            attributes: ["clientId"],
            required: true,
          },
        ],
      });

      if (!jobWithCompany || jobWithCompany.Company.clientId !== clientId) {
        throw new Error("Job not found or does not belong to this client");
      }

      const updatedJob = await jobRepository.updateJobStatus(id, status);

      // Check if job status changed from open to closed or vice versa
      if (jobWithCompany.jobStatus !== status) {
        if (jobWithCompany.jobStatus !== "Closed" && status === "Closed") {
          // Job was open and now closed - decrement openJobs
          await Company.decrement("openJobs", { where: { id: jobWithCompany.companyId } });
        } else if (jobWithCompany.jobStatus === "Closed" && status !== "Closed") {
          // Job was closed and now open - increment openJobs
          await Company.increment("openJobs", { where: { id: jobWithCompany.companyId } });
        }
      }

      return updatedJob;
    } catch (error) {
      throw new Error(`Error updating job status: ${error.message}`);
    }
  },

  // Get job applicants
  async getJobApplicants(jobId, filters, clientId) {
    try {
      return await jobRepository.getJobApplicants(jobId, filters, clientId);
    } catch (error) {
      console.log(`Error fetching applicants for job ${jobId}:`, error);
      throw new Error(`Error fetching applicants: ${error.message}`);
    }
  },

  // Update applicant status
  async updateApplicantStatus(jobId, applicantId, status) {
    try {
      const updatedApplication = await jobRepository.updateApplicantStatus(
        jobId,
        applicantId,
        status
      );
      if (!updatedApplication) {
        throw new Error("Application not found");
      }
      return updatedApplication;
    } catch (error) {
      throw new Error(`Error updating applicant status: ${error.message}`);
    }
  },
  // Get job templates
  async getJobTemplates(filters) {
    try {
      return await jobRepository.getJobTemplates(filters);
    } catch (error) {
      throw new Error(`Error fetching job templates: ${error.message}`);
    }
  },

  // Create job template
  async createJobTemplate(templateData) {
    try {
      const validationError = validateTemplateData(templateData);
      if (validationError) {
        throw new Error(validationError);
      }
      return await jobRepository.createJobTemplate(templateData);
    } catch (error) {
      throw new Error(`Error creating job template: ${error.message}`);
    }
  },

  // Update job template
  async updateJobTemplate(id, templateData) {
    try {
      const validationError = validateTemplateData(templateData);
      if (validationError) {
        throw new Error(validationError);
      }
      const updatedTemplate = await jobRepository.updateJobTemplate(
        id,
        templateData
      );
      if (!updatedTemplate) {
        throw new Error("Template not found");
      }
      return updatedTemplate;
    } catch (error) {
      throw new Error(`Error updating job template: ${error.message}`);
    }
  },

  // Delete job template
  async deleteJobTemplate(id) {
    try {
      const deleted = await jobRepository.deleteJobTemplate(id);
      if (!deleted) {
        throw new Error("Template not found");
      }
      return { message: "Template deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting job template: ${error.message}`);
    }
  },

  // Get job statistics
  async getJobStats() {
    try {
      return await jobRepository.getJobStats();
    } catch (error) {
      throw new Error(`Error fetching job statistics: ${error.message}`);
    }
  },

  // Get job analytics
  async getJobAnalytics() {
    try {
      return await jobRepository.getJobAnalytics();
    } catch (error) {
      throw new Error(`Error fetching job analytics: ${error.message}`);
    }
  },

  // Get job documents
  async getJobDocuments(jobId) {
    try {
      return await jobRepository.getJobDocuments(jobId);
    } catch (error) {
      throw new Error(`Error fetching job documents: ${error.message}`);
    }
  },

  // Add job document
  async addJobDocument(jobId, documentData) {
    try {
      return await jobRepository.addJobDocument(jobId, documentData);
    } catch (error) {
      throw new Error(`Error adding job document: ${error.message}`);
    }
  },

  // Bulk upload jobs
  async bulkUploadJobs(filePath) {
    try {
      return await jobRepository.bulkUploadJobs(filePath);
    } catch (error) {
      throw new Error(`Error in bulk upload: ${error.message}`);
    }
  },

  // Get departments
  async getDepartments() {
    try {
      return await jobRepository.getDepartments();
    } catch (error) {
      throw new Error(`Error fetching departments: ${error.message}`);
    }
  },

  // Add department
  async addDepartment(department) {
    try {
      return await jobRepository.addDepartment(department);
    } catch (error) {
      throw new Error(`Error adding department: ${error.message}`);
    }
  },

  // Get locations
  async getLocations() {
    try {
      return await jobRepository.getLocations();
    } catch (error) {
      throw new Error(`Error fetching locations: ${error.message}`);
    }
  },

  // Add location
  async addLocation(location) {
    try {
      return await jobRepository.addLocation(location);
    } catch (error) {
      throw new Error(`Error adding location: ${error.message}`);
    }
  },

  // Get job types
  async getJobTypes() {
    try {
      return await jobRepository.getJobTypes();
    } catch (error) {
      throw new Error(`Error fetching job types: ${error.message}`);
    }
  },

  // Add job type
  async addJobType(type) {
    try {
      return await jobRepository.addJobType(type);
    } catch (error) {
      throw new Error(`Error adding job type: ${error.message}`);
    }
  },

  // Get companies
  async getCompanies(clientId) {
    try {
      if (!clientId)
        throw new Error("clientId is required for company queries");
      return await jobRepository.getCompanies(clientId);
    } catch (error) {
      throw new Error(`Error fetching companies: ${error.message}`);
    }
  },

  // Get company jobs
  async getCompanyJobs(companyId) {
    try {
      return await jobRepository.getCompanyJobs(companyId);
    } catch (error) {
      throw new Error(`Error fetching company jobs: ${error.message}`);
    }
  },

  // Generate job description using Gemini AI
  async generateJobDescription(params) {
    try {
      let prompt;

      if (params.prompt) {
        console.log("=== Prompt-Based Job Description Generation ===");
        console.log("Input Parameters:", {
          prompt: params.prompt,
          jobType: params.jobType,
          department: params.department,
          location: params.location,
          experienceLevel: params.experienceLevel,
          requiredSkills: params.requiredSkills,
        });

        // Prompt based generation
        prompt = `You are a professional job description writer. Create a detailed and well-structured job description based on the following prompt:\n\n${params.prompt}\n\nPlease structure the job description in the following format, using markdown formatting:\n\n**Job Title:** [Extract or determine the most appropriate job title]\n**Department:** [Extract or determine the most appropriate department]\n**Location:** [Extract or determine the most appropriate location]\n\n**1. Job Overview:**\n[Provide a compelling introduction to the role, company culture, and impact]\n\n**2. Key Responsibilities:**\n- [List 5-7 key responsibilities, each starting with an action verb]\n- [Focus on day-to-day tasks and major projects]\n- [Include collaboration and leadership aspects]\n\n**3. Required Skills:**\n- [List 5-7 must-have technical and soft skills as bullet points]\n- [Include specific programming languages, frameworks, or tools if relevant]\n\n**4. Required Qualifications:**\n- [List 5-7 must-have qualifications, such as years of experience, education, certifications, etc.]\n\n**5. Preferred Qualifications:**\n- [List 3-5 nice-to-have qualifications]\n- [Include additional skills that would be beneficial]\n- [Mention any preferred industry experience]\n\n**6. Benefits and Perks:**\n- [List 4-6 key benefits]\n- [Include compensation details if provided]\n- [Mention work-life balance aspects]\n- [Include professional development opportunities]\n\n**7. Application Stages:**\n[List the typical stages of the application process as a numbered or bullet list. For each stage, provide: name, order, description, and (if possible) an estimated duration in days.]\n\n**8. Other Relevant Details:**\n[Include any additional information about the role, team, or company]\n\nPlease ensure:\n1. Each section is clearly marked with markdown headers\n2. Use bullet points or numbered lists for lists\n3. Keep the language professional but engaging\n4. Focus on the impact and growth opportunities\n5. Include specific details about the role and requirements\n6. Maintain a consistent tone throughout\n7. Extract and use any specific details mentioned in the prompt (salary, location, experience, etc.)\n8. If certain details are not provided in the prompt, make reasonable assumptions based on industry standards`;
        console.log("Generated Prompt:", prompt);
      } else {
        // Fields based generation
        prompt = `Generate a detailed job description for a ${params.jobType
          } position with the following details:\n\nDepartment: ${params.department || "Not specified"
          }\nLocation: ${params.location || "Not specified"}\nExperience Level: ${params.experienceLevel || "Not specified"
          }\nRequired Skills: ${params.requiredSkills?.join(", ") || "Not specified"
          }\n\nPlease structure the response with the following sections:\n**Job Title:** [Appropriate job title based on department and experience level]\n**Department:** ${params.department || "[Department based on role]"
          }\n**Location:** ${params.location || "[Location based on role]"
          }\n\n**1. Job Overview:** [Brief overview of the role and its importance]\n**2. Key Responsibilities:** [List of main responsibilities]\n**3. Required Skills:** [List of required skills as bullet points]\n**4. Required Qualifications:** [List of required qualifications as bullet points]\n**5. Preferred Qualifications:** [List of preferred skills and qualifications]\n**6. Benefits and Perks:** [List of benefits and perks]\n**7. Application Stages:** [List the typical stages of the application process as a numbered or bullet list. For each stage, provide: name, order, description, and (if possible) an estimated duration in days.]\n**8. Other Relevant Details:** [Any additional information]\n\nPlease ensure the job description is professional, engaging, and includes all necessary details for potential candidates.`;
      }

      console.log("Calling Gemini API...");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("=== AI Response ===");
      console.log("Raw Response Length:", text.length);
      console.log("Complete Response:");
      console.log("----------------------------------------");
      console.log(text);
      console.log("----------------------------------------");

      // Helper to extract sections
      function extractSection(text, sectionTitle) {
        // This regex will match everything after the section header until the next section header or end of string
        const regex = new RegExp(
          `\\*\\*${sectionTitle}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n\\n\\*\\*|$)`,
          "i"
        );
        const match = text.match(regex);
        return match ? match[1].trim() : "";
      }

      // Helper to extract required skills from the required skills section
      function extractSkills(skillsText) {
        if (!skillsText) return [];
        return skillsText
          .split(/\r?\n/)
          .filter((line) => line.trim().match(/^[-*•]/))
          .map((line) =>
            line
              .replace(/^[-*•]\s*/, "")
              .replace(/\\/g, "")
              .trim()
          )
          .map((skill) => skill.replace(/(\s*\(?etc\.?\)?\s*)$/i, "").trim())
          .filter((skill) => {
            if (!skill) return false;
            const lower = skill.toLowerCase();
            // Remove if starts with 'and', 'or', or is just 'etc', 'etc.'
            return !(
              lower.startsWith("and ") ||
              lower.startsWith("or ") ||
              lower === "and" ||
              lower === "or" ||
              lower === "etc" ||
              lower === "etc." ||
              lower.length < 3
            );
          });
      }

      // Helper to extract application stages
      function extractApplicationStages(stagesText) {
        console.log(
          "Raw Application Stages Section:",
          JSON.stringify(stagesText)
        );
        if (!stagesText) return [];
        // Split by any newline character
        const lines = stagesText
          .split(/[\r\n]+/)
          .filter((line) => line.trim().match(/^[0-9]+\. /));
        console.log("Application Stages Lines:", lines);
        const stages = lines
          .map((line, idx) => {
            let clean = line.replace(/^[0-9]+\. ?/, "").trim();
            // Match "**Stage Name (duration):** Description" or "Stage Name (duration): Description"
            const match = clean.match(
              /^\*?\*?(.+?)(?:\s*\((.+?)\))?\*?\*?\s*:\*?\*?\s*(.*)$/
            );
            let name = "",
              description = "",
              duration = null;
            if (match) {
              name = match[1].trim();
              description = match[3].trim();
              if (match[2]) {
                // Handle days (range or single)
                const daysRange = match[2].match(/(\d+)(?:-(\d+))?\s*days?/i);
                if (daysRange) {
                  duration = daysRange[2]
                    ? parseInt(daysRange[2])
                    : parseInt(daysRange[1]);
                } else {
                  // Handle weeks (range or single)
                  const weeksRange = match[2].match(
                    /(\d+)(?:-(\d+))?\s*weeks?/i
                  );
                  if (weeksRange) {
                    const weekVal = weeksRange[2]
                      ? parseInt(weeksRange[2])
                      : parseInt(weeksRange[1]);
                    duration = weekVal * 7;
                  }
                }
              }
            } else {
              name = clean;
            }
            return { name, order: idx + 1, description, duration };
          })
          .filter((stage) => stage.name && stage.name.trim().length > 0);
        console.log("Parsed Application Stages:", stages);
        return stages;
      }

      const requiredSkillsSection =
        extractSection(text, "3. Required Skills") ||
        extractSection(text, "Required Skills");
      const requirementsSection =
        extractSection(text, "4. Required Qualifications") ||
        extractSection(text, "Required Qualifications");

      const applicationStagesSection =
        extractSection(text, "7. Application Stages") ||
        extractSection(text, "Application Stages");

      const extractedData = {
        title: extractSection(text, "Job Title") || "",
        department: extractSection(text, "Department") || "",
        location: extractSection(text, "Location") || "",
        jobOverview: extractSection(text, "1. Job Overview"),
        responsibilities: extractSection(text, "2. Key Responsibilities"),
        requiredSkills: extractSkills(requiredSkillsSection),
        requirements: requirementsSection,
        preferredQualifications: extractSection(
          text,
          "5. Preferred Qualifications"
        ),
        benefits: extractSection(text, "6. Benefits and Perks"),
        applicationStages: extractApplicationStages(applicationStagesSection),
        description: text, // full markdown
      };

      console.log("Extracted Data:", extractedData);

      // Log section presence
      const sections = {
        overview: text.includes("**1. Job Overview:**"),
        responsibilities: text.includes("**2. Key Responsibilities:**"),
        qualifications: text.includes("**4. Required Qualifications:**"),
        preferredQualifications: text.includes(
          "**5. Preferred Qualifications:**"
        ),
        benefits: text.includes("**6. Benefits and Perks:**"),
        applicationStages: text.includes("**7. Application Stages:**"),
        otherDetails: text.includes("**8. Other Relevant Details:**"),
      };

      console.log("Section Presence Check:", sections);

      // Log any potential issues
      if (
        !extractedData.title ||
        !extractedData.department ||
        !extractedData.location
      ) {
        console.warn("Warning: Missing required fields in response");
      }

      if (Object.values(sections).some((present) => !present)) {
        console.warn("Warning: Some sections are missing from the response");
      }

      console.log("=== Generation Complete ===\n");

      return extractedData;
    } catch (error) {
      console.log("=== Error in Job Description Generation ===");
      console.log("Error Type:", error.name);
      console.log("Error Message:", error.message);
      console.log("Error Stack:", error.stack);
      console.log("Input Parameters:", params);
      console.log("=== Error Details End ===\n");
      throw new Error("Failed to generate job description");
    }
  },

  // Schedule interview
  async scheduleInterview(interviewData) {
    try {
      return await jobRepository.scheduleInterview(interviewData);
    } catch (error) {
      throw new Error(`Error scheduling interview: ${error.message}`);
    }
  },

  // Generate bulk upload template
  async generateBulkUploadTemplate() {
    try {
      const templatePath = await jobRepository.generateBulkUploadTemplate();
      return templatePath;
    } catch (error) {
      throw new Error(
        `Error generating bulk upload template: ${error.message}`
      );
    }
  },

  // Get default application stages
  async getDefaultApplicationStages() {
    return DEFAULT_APPLICATION_STAGES;
  },

  // Update job application stages
  async updateJobApplicationStages(jobId, stages) {
    try {
      // Validate stages structure
      if (!Array.isArray(stages)) {
        throw new Error("Stages must be an array");
      }

      // Validate each stage
      stages.forEach((stage, index) => {
        if (!stage.name || typeof stage.order !== "number") {
          throw new Error(`Invalid stage at position ${index}`);
        }
      });

      // Sort stages by order
      const sortedStages = [...stages].sort((a, b) => a.order - b.order);

      // Update the job with new stages
      const updatedJob = await jobRepository.updateJob(jobId, {
        applicationStages: JSON.stringify(sortedStages),
      });

      return updatedJob;
    } catch (error) {
      throw new Error(`Error updating application stages: ${error.message}`);
    }
  },

  // Get job application stages
  async getJobApplicationStages(jobId) {
    try {
      const job = await jobRepository.getJobById(jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      // Return parsed stages or default stages if none set
      return job.applicationStages
        ? JSON.parse(job.applicationStages)
        : DEFAULT_APPLICATION_STAGES;
    } catch (error) {
      throw new Error(`Error fetching application stages: ${error.message}`);
    }
  },

  // Get all jobs with applicants count
  async getAllJobsWithApplicantsCount(clientId) {
    try {
      if (!clientId) throw new Error("clientId is required for job queries");
      return await jobRepository.getAllJobsWithApplicantsCount({ clientId });
    } catch (error) {
      console.log(
        "[JobService] Error in getAllJobsWithApplicantsCount:",
        error
      );
      throw error;
    }
  },

  async updateApplicationStatusById(applicationId, status, clientId, context) {
    try {
      // Fetch the application before update to get previous status and context
      const application = await jobRepository.getApplicationById(applicationId);
      const previousStatus = application?.status;
      const updatedApplication = await jobRepository.updateApplicationStatusById(
        applicationId,
        status
      );
      // Map status to trigger type
      let triggerType = null;
      const statusLower = status.toLowerCase();
      if (statusLower.includes("rejected") || statusLower.includes("declined")) {
        triggerType = "candidate_rejected";
      } else if (statusLower.includes("accepted") || statusLower.includes("hired")) {
        triggerType = "candidate_accepted";
      } else if (statusLower.includes("offer")) {
        triggerType = "offer_sent";
      }
      // Trigger automation if applicable
      if (triggerType) {
        try {
          let resolvedClientId = clientId;
          if (!resolvedClientId && application?.jobId) {
            const job = await jobRepository.getJobById(application.jobId);
            if (job && job.companyId) {
              const company = await Company.findByPk(job.companyId);
              if (company && company.clientId) {
                resolvedClientId = company.clientId;
              }
            }
          }
          await communicationsService.triggerCandidateAutomation({
            triggerType,
            context,
            clientId: resolvedClientId
          });
        } catch (automationError) {
          console.log(`[JOB][updateApplicationStatusById] Automation error:`, automationError);
        }
      }
      return updatedApplication;
    } catch (error) {
      throw new Error(`Error updating application status: ${error.message}`);
    }
  },

  async rejectApplication(applicationId, reason) {
    try {
      return await jobRepository.rejectApplication(applicationId, reason);
    } catch (error) {
      throw new Error(`Error rejecting application: ${error.message}`);
    }
  },

  async updateAssignmentStatus(jobId, candidateId, status) {
    try {
      return await jobRepository.updateAssignmentStatus(
        jobId,
        candidateId,
        status
      );
    } catch (error) {
      throw new Error(`Error updating assignment status: ${error.message}`);
    }
  },
};
