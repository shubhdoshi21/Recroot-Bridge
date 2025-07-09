import { jobService } from "../services/jobService.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { candidateService } from "../services/candidateService.js";

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export const jobController = {
  // Get all jobs
  async getAllJobs(req, res) {
    try {
      const jobs = await jobService.getAllJobs({
        ...req.query,
        clientId: req.user.clientId,
      });
      res.json(jobs);
    } catch (error) {
      console.log("Error in getAllJobs controller:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  },

  // Create a new job
  async createJob(req, res) {
    try {
      const job = await jobService.createJob(req.body, req.user.clientId);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get job by ID
  async getJobById(req, res) {
    try {
      const job = await jobService.getJobById(req.params.id, req.user.clientId);
      res.json(job);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Update job
  async updateJob(req, res) {
    try {
      const job = await jobService.updateJob(
        req.params.id,
        req.body,
        req.user.clientId
      );
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete job
  async deleteJob(req, res) {
    try {
      const result = await jobService.deleteJob(
        req.params.id,
        req.user.clientId
      );
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Update job status
  async updateJobStatus(req, res) {
    try {
      const job = await jobService.updateJobStatus(
        req.params.id,
        req.body.status,
        req.user.clientId
      );
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get job applicants
  async getJobApplicants(req, res) {
    try {
      const filters = {
        status: req.query.status,
        sortBy: req.query.sortBy || "createdAt",
        order: req.query.order || "DESC",
        onlyApplicants: req.query.onlyApplicants === "true",
      };
      const applicants = await jobService.getJobApplicants(
        req.params.id,
        filters,
        req.user.clientId
      );

      if (filters.onlyApplicants) {
        // Only return applicants (type === 'application' or assignment with status 'applicant')
        return res.json(
          applicants.filter(
            (a) =>
              a.type === "application" ||
              (a.type === "assignment" && a.status === "applicant")
          )
        );
      } else {
        // Return all, no deduplication
        return res.json(applicants);
      }
    } catch (error) {
      console.log("Error in getJobApplicants controller:", error);
      res.status(500).json({
        error:
          "Error fetching job applicants: " +
          (error.message || error.toString() || "Unknown error"),
      });
    }
  },

  // Get job templates
  async getJobTemplates(req, res) {
    try {
      const filters = {
        category: req.query.category,
        industry: req.query.industry,
      };
      const templates = await jobService.getJobTemplates(filters);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create job template
  async createJobTemplate(req, res) {
    try {
      const template = await jobService.createJobTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update job template
  async updateJobTemplate(req, res) {
    try {
      const template = await jobService.updateJobTemplate(
        req.params.id,
        req.body
      );
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete job template
  async deleteJobTemplate(req, res) {
    try {
      const result = await jobService.deleteJobTemplate(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get job statistics
  async getJobStats(req, res) {
    try {
      const stats = await jobService.getJobStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get job analytics
  async getJobAnalytics(req, res) {
    try {
      const analytics = await jobService.getJobAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get job documents
  async getJobDocuments(req, res) {
    try {
      const documents = await jobService.getJobDocuments(req.params.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add job document
  async addJobDocument(req, res) {
    try {
      const document = await jobService.addJobDocument(req.params.id, req.body);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Bulk upload jobs
  async bulkUploadJobs(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const results = await jobService.bulkUploadJobs(req.file.path);
      res.json({ message: "Bulk upload completed", results });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get departments
  async getDepartments(req, res) {
    try {
      const departments = await jobService.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add department
  async addDepartment(req, res) {
    try {
      const department = await jobService.addDepartment(req.body.department);
      res.status(201).json({ department });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get locations
  async getLocations(req, res) {
    try {
      const locations = await jobService.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add location
  async addLocation(req, res) {
    try {
      const location = await jobService.addLocation(req.body.location);
      res.status(201).json({ location });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get job types
  async getJobTypes(req, res) {
    try {
      const types = await jobService.getJobTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add job type
  async addJobType(req, res) {
    try {
      const type = await jobService.addJobType(req.body.type);
      res.status(201).json({ type });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get companies
  async getCompanies(req, res) {
    try {
      if (!req.user || !req.user.clientId) {
        return res
          .status(400)
          .json({ error: "Client ID is required for company queries" });
      }
      const companies = await jobService.getCompanies(req.user.clientId);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get company jobs
  async getCompanyJobs(req, res) {
    try {
      const jobs = await jobService.getCompanyJobs(req.params.id);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Generate job description using AI
  async generateJobDescription(req, res) {
    try {
      const result = await jobService.generateJobDescription(req.body);
      res.json(result);
    } catch (error) {
      console.log("Error in generateJobDescription:", error);
      res.status(400).json({ error: error.message });
    }
  },

  // Schedule interview
  async scheduleInterview(req, res) {
    try {
      const interview = await jobService.scheduleInterview(req.body);
      res.status(201).json(interview);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Generate bulk upload template
  async generateBulkUploadTemplate(req, res) {
    try {
      const templatePath = await jobService.generateBulkUploadTemplate();

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=job_bulk_upload_template.csv"
      );

      // Stream the file to the response
      const fileStream = fs.createReadStream(templatePath);
      fileStream.pipe(res);

      // Clean up the file after sending
      fileStream.on("end", () => {
        fs.unlink(templatePath, (err) => {
          if (err) console.log("Error deleting template file:", err);
        });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Simple get all jobs
  // async getJobs(req, res) {
  //   try {
  //     console.log("GET /jobs/simple - Request received");
  //     const jobs = await jobService.getJobs();
  //     console.log(`Found ${jobs.length} jobs`);
  //     res.json({ jobs });
  //   } catch (error) {
  //     console.log("Error in getJobs controller:", error);
  //     res.status(500).json({ error: error.message });
  //   }
  // },

  // Create application
  // async createApplication(req, res) {
  //   try {
  //     const application = await candidateService.applyToJob(
  //       req.params.candidateId,
  //       req.params.jobId,
  //       req.body
  //     );
  //     res.status(201).json(application);
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // },

  // Apply to job (convert candidate to applicant)
  async applyToJob(req, res) {
    // console.log("[applyToJob] req.body:", req.body);
    // console.log("[applyToJob] req.params:", req.params);
    try {
      const application = await candidateService.applyToJob(
        req.params.candidateId,
        req.params.jobId,
        req.body
      );
      res.status(201).json(application);
    } catch (error) {
      console.log("[applyToJob] error:", error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get all jobs with applicants count
  async getAllJobsWithApplicantsCount(req, res) {
    try {
      if (!req.user || !req.user.clientId) {
        return res
          .status(400)
          .json({ error: "Client ID is required for job queries" });
      }
      const jobs = await jobService.getAllJobsWithApplicantsCount(
        req.user.clientId
      );
      res.json(jobs);
    } catch (error) {
      console.log(
        "Error in getAllJobsWithApplicantsCount controller:",
        error
      );
      res
        .status(500)
        .json({ error: "Failed to fetch jobs with applicants count" });
    }
  },
};
