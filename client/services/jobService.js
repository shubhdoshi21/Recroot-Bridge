import { api } from "../config/api";

// Mock data for departments
const mockDepartments = [
  "Engineering",
  "Sales",
  "Marketing",
  "Human Resources",
  "Finance",
  "Operations",
  "Product",
  "Design",
  "Customer Support",
  "Legal",
];

// Mock data for locations
const mockLocations = [
  "New York, NY",
  "San Francisco, CA",
  "London, UK",
  "Singapore",
  "Toronto, Canada",
  "Berlin, Germany",
  "Sydney, Australia",
  "Bangalore, India",
  "Remote",
];

// Mock data for job types
const mockJobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Remote",
  "Temporary",
];

// Mock data for stats
const mockStats = {
  totalJobs: 150,
  activeJobs: 75,
  totalApplications: 1200,
  averageApplications: 16,
  jobsByDepartment: {
    Engineering: 45,
    Sales: 25,
    Marketing: 20,
    "Human Resources": 15,
    Finance: 10,
    Others: 35,
  },
  jobsByLocation: {
    "New York": 30,
    "San Francisco": 25,
    London: 20,
    Singapore: 15,
    Remote: 60,
  },
};

class JobService {
  // Core Job Operations
  async getAllJobs(params = {}) {
    try {
      console.log("Calling getAllJobs API with params:", params);
      console.log("API URL:", api.jobs.getAll(params));

      const response = await fetch(api.jobs.getAll(params), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("API Response status:", response.status);
      console.log(
        "API Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("API Error response:", errorData);
        throw new Error(errorData.message || "Failed to fetch jobs");
      }

      const data = await response.json();
      console.log("API Success response:", data);

      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.jobs)) return data.jobs;
      throw new Error("Invalid jobs data received from server");
    } catch (error) {
      console.log("[JobService] Error in getAllJobs:", error);
      console.log("[JobService] Error stack:", error.stack);
      throw error;
    }
  }

  async createJob(jobData) {
    try {
      // 1. Extract and validate applicationStages
      const stages = (jobData.applicationStages || []).map((stage, idx) =>
        typeof stage === "string"
          ? { name: stage, order: idx + 1, description: "" }
          : {
            name: stage.name,
            order: stage.order ?? idx + 1,
            description: stage.description || "",
          }
      );
      if (!stages.length)
        throw new Error("At least one application stage is required");

      // 2. Create pipeline
      const pipelineRes = await fetch(api.pipelines.create(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${jobData.jobTitle} Pipeline`,
          description: `Pipeline for ${jobData.jobTitle}`,
          stages,
        }),
        credentials: "include",
      });
      if (!pipelineRes.ok) {
        const errorData = await pipelineRes.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to create pipeline"
        );
      }
      const pipeline = await pipelineRes.json();
      if (!pipeline.id)
        throw new Error("Pipeline creation failed: No ID returned");

      // 3. Create job with pipelineId
      const jobPayload = { ...jobData, pipelineId: pipeline.id };
      // Optionally remove applicationStages from payload if not needed by backend
      // delete jobPayload.applicationStages;
      const response = await fetch(api.jobs.create(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobPayload),
        credentials: "include",
      });
      if (!response.ok) {
        let errorMessage = `Failed to create job: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) errorMessage = errorData.message;
          } catch {
            if (errorText) errorMessage = errorText;
          }
        } catch { }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(
        "[JobService] Error in createJob (pipeline integration):",
        error
      );
      throw error;
    }
  }

  async getJobById(id) {
    try {
      const response = await fetch(api.jobs.getById(id), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch job");
      }

      return await response.json();
    } catch (error) {
      console.log(`[JobService] Error in getJobById(${id}):`, error);
      throw error;
    }
  }

  async updateJob(id, jobData) {
    try {
      console.log("[JobService] Updating job:", id, jobData);

      const response = await fetch(api.jobs.update(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
        credentials: "include",
      });

      console.log("[JobService] Update response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("[JobService] Update error response:", errorData);
        throw new Error(
          errorData.message || `Failed to update job: ${response.status}`
        );
      }

      const updatedJob = await response.json();
      console.log("[JobService] Update success response:", updatedJob);
      return updatedJob;
    } catch (error) {
      console.log(`[JobService] Error in updateJob(${id}):`, error);
      console.log("[JobService] Error stack:", error.stack);
      throw error;
    }
  }

  async deleteJob(id) {
    try {
      const response = await fetch(api.jobs.delete(id), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete job");
      }

      return await response.json();
    } catch (error) {
      console.log(`[JobService] Error in deleteJob(${id}):`, error);
      throw error;
    }
  }

  // Job Status Management
  async updateJobStatus(id, status) {
    try {
      const response = await fetch(api.jobs.updateStatus(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update job status");
      }

      return await response.json();
    } catch (error) {
      console.log(`[JobService] Error in updateJobStatus(${id}):`, error);
      throw error;
    }
  }

  // Job Applicants
  async getJobApplicants(jobId, options = {}) {
    try {
      let url = api.jobs.getApplicants(jobId);
      if (options.onlyApplicants) {
        url += (url.includes("?") ? "&" : "?") + "onlyApplicants=true";
      }
      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch applicants");
      }

      return await response.json();
    } catch (error) {
      console.log(`[JobService] Error in getJobApplicants(${jobId}):`, error);
      throw error;
    }
  }

  async updateApplicantStatus(jobId, applicantId, status) {
    try {
      const response = await fetch(
        api.jobs.updateApplicantStatus(jobId, applicantId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update applicant status");
      }

      return await response.json();
    } catch (error) {
      console.log(
        `[JobService] Error in updateApplicantStatus(${jobId}, ${applicantId}):`,
        error
      );
      throw error;
    }
  }

  async updateSourcedCandidateStatus(jobId, candidateId, status) {
    const response = await fetch(
      api.jobs.updateSourcedCandidateStatus(jobId, candidateId),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to update sourced candidate status"
      );
    }
    return response.json();
  }

  async rejectApplicant(jobId, applicantId, reason = "") {
    try {
      const response = await fetch(
        api.jobs.rejectApplicant(jobId, applicantId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject applicant");
      }

      return await response.json();
    } catch (error) {
      console.log(
        `[JobService] Error in rejectApplicant(${jobId}, ${applicantId}):`,
        error
      );
      throw error;
    }
  }

  // Job Templates
  async getJobTemplates(params = {}) {
    try {
      const response = await fetch(api.jobs.getTemplates(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch templates");
      }

      return await response.json();
    } catch (error) {
      console.log("[JobService] Error in getJobTemplates:", error);
      throw error;
    }
  }

  async createJobTemplate(templateData) {
    try {
      const response = await fetch(api.jobs.createTemplate(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create template");
      }

      return await response.json();
    } catch (error) {
      console.log("[JobService] Error in createJobTemplate:", error);
      throw error;
    }
  }

  async deleteJobTemplate(id) {
    try {
      const response = await fetch(api.jobs.deleteTemplate(id), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete job template");
      }

      return await response.json();
    } catch (error) {
      console.log(`[JobService] Error in deleteJobTemplate(${id}):`, error);
      throw error;
    }
  }

  async updateJobTemplate(id, templateData) {
    try {
      const response = await fetch(api.jobs.updateTemplate(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update template");
      }

      return await response.json();
    } catch (error) {
      console.log(`[JobService] Error in updateJobTemplate(${id}):`, error);
      throw error;
    }
  }

  // Statistics and Analytics
  async getJobStats() {
    // Return mock stats instead of making API call
    return mockStats;
  }

  async getJobAnalytics() {
    try {
      const response = await fetch(api.jobs.getAnalytics(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch job analytics");
      }

      return await response.json();
    } catch (error) {
      console.log("[JobService] Error in getJobAnalytics:", error);
      throw error;
    }
  }

  // Document Management
  async getJobDocuments(id) {
    try {
      const response = await fetch(api.jobs.getDocuments(id), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch documents");
      }

      return await response.json();
    } catch (error) {
      console.log(`[JobService] Error in getJobDocuments(${id}):`, error);
      throw error;
    }
  }

  async addJobDocument(id, documentData) {
    try {
      const formData = new FormData();
      Object.keys(documentData).forEach((key) => {
        formData.append(key, documentData[key]);
      });

      const response = await fetch(api.jobs.addDocument(id), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add document");
      }

      return await response.json();
    } catch (error) {
      console.log(`[JobService] Error in addJobDocument(${id}):`, error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkUploadJobs(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(api.jobs.bulkUpload(), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to bulk upload jobs");
      }

      return await response.json();
    } catch (error) {
      console.log("[JobService] Error in bulkUploadJobs:", error);
      throw error;
    }
  }

  async getBulkUploadTemplate() {
    try {
      const response = await fetch(api.jobs.getBulkUploadTemplate(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get bulk upload template");
      }

      return response.blob();
    } catch (error) {
      console.log("[JobService] Error in getBulkUploadTemplate:", error);
      throw error;
    }
  }

  // Reference Data
  async getDepartments() {
    return mockDepartments;
  }

  async getLocations() {
    return mockLocations;
  }

  async getJobTypes() {
    return mockJobTypes;
  }

  async addDepartment(department) {
    if (mockDepartments.includes(department)) {
      throw new Error("Department already exists");
    }
    mockDepartments.push(department);
    return department;
  }

  async addLocation(location) {
    if (mockLocations.includes(location)) {
      throw new Error("Location already exists");
    }
    mockLocations.push(location);
    return location;
  }

  async addJobType(type) {
    if (mockJobTypes.includes(type)) {
      throw new Error("Job type already exists");
    }
    mockJobTypes.push(type);
    return type;
  }

  // AI Features
  async generateJobDescription(params) {
    try {
      const response = await fetch(api.jobs.generateDescription(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate job description");
      }

      return await response.json();
    } catch (error) {
      console.log("[JobService] Error in generateJobDescription:", error);
      throw error;
    }
  }

  // Interview Scheduling
  async scheduleInterview(interviewData) {
    try {
      const response = await fetch(api.jobs.scheduleInterview(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interviewData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to schedule interview");
      }

      return await response.json();
    } catch (error) {
      console.log("[JobService] Error in scheduleInterview:", error);
      throw error;
    }
  }

  // Job Actions
  async duplicateJob(jobId) {
    try {
      const originalJob = await this.getJobById(jobId);
      if (!originalJob) {
        throw new Error("Original job not found");
      }

      // Create a new job with the same data but a new title
      const duplicatedJob = {
        ...originalJob,
        title: `${originalJob.title} (Copy)`,
        status: "draft", // Set as draft by default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: undefined, // Remove the ID so a new one will be generated
      };

      return await this.createJob(duplicatedJob);
    } catch (error) {
      console.log(`[JobService] Error in duplicateJob(${jobId}):`, error);
      throw error;
    }
  }

  async archiveJob(jobId) {
    try {
      return await this.updateJobStatus(jobId, "archived");
    } catch (error) {
      console.log(`[JobService] Error in archiveJob(${jobId}):`, error);
      throw error;
    }
  }

  async shareJob(jobId) {
    try {
      // Get the job details
      const job = await this.getJobById(jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      // Create a shareable URL (you might want to customize this based on your frontend routes)
      const shareableUrl = `${window.location.origin}/jobs/${jobId}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareableUrl);

      return shareableUrl;
    } catch (error) {
      console.log(`[JobService] Error in shareJob(${jobId}):`, error);
      throw error;
    }
  }

  // Simple get all jobs
  async getJobs() {
    try {
      console.log("Calling getJobs API");
      const response = await fetch(api.jobs.getJobs(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("API Error response:", errorData);
        throw new Error(errorData.message || "Failed to fetch jobs");
      }

      const data = await response.json();
      console.log("API Success response:", data);

      if (!data || !data.jobs || !Array.isArray(data.jobs)) {
        console.log("Invalid response structure:", data);
        throw new Error("Invalid jobs data received from server");
      }

      return data.jobs;
    } catch (error) {
      console.log("[JobService] Error in getJobs:", error);
      throw error;
    }
  }

  async getAllJobsWithApplicantsCount() {
    try {
      const response = await fetch(api.jobs.getAllWithApplicantsCount(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch jobs with applicants count"
        );
      }
      return await response.json();
    } catch (error) {
      console.log(
        "[JobService] Error in getAllJobsWithApplicantsCount:",
        error
      );
      throw error;
    }
  }

  /**
   * Updates the status for a formal application.
   * @param {string} applicationId The ID of the application.
   * @param {string} status The new status.
   */
  async updateApplicationStatus(applicationId, status, context) {
    try {
      const response = await fetch(
        api.applications.updateStatus(applicationId),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, context }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update application status");
      }
      return await response.json();
    } catch (error) {
      console.log(
        `[JobService] Error in updateApplicationStatus(${applicationId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Updates the status for a sourced candidate (an assignment).
   * @param {string} jobId The ID of the job.
   * @param {string} candidateId The ID of the candidate.
   * @param {string} status The new status.
   */
  async updateAssignmentStatus(jobId, candidateId, status) {
    try {
      const response = await fetch(
        api.jobs.updateAssignmentStatus(jobId, candidateId),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update assignment status");
      }
      return await response.json();
    } catch (error) {
      console.log(
        `[JobService] Error in updateAssignmentStatus(${jobId}, ${candidateId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Rejects a formal application.
   * @param {string} applicationId The ID of the application to reject.
   * @param {string} reason The reason for rejection.
   */
  async rejectApplication(applicationId, reason = "") {
    try {
      const response = await fetch(api.applications.reject(applicationId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject application");
      }
      return await response.json();
    } catch (error) {
      console.log(
        `[JobService] Error in rejectApplication(${applicationId}):`,
        error
      );
      throw error;
    }
  }
}

export const jobService = new JobService();
