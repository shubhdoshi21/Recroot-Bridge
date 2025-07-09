import { api } from "../config/api";

export const candidateService = {
  // Get all candidates with optional filters
  async getCandidates() {
    try {
      const url = api.candidates.getAll();

      const response = await fetch(url, { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to fetch candidates" };
      }
      console.log("data", data);
      return {
        data: data.data || [],
        total: data.total || 0,
      };
    } catch (error) {
      console.log("Error in getCandidates:", error);
      return { error: "Failed to fetch candidates. Please try again." };
    }
  },

  // Get a single candidate by ID
  async getCandidateById(id) {
    try {
      const response = await fetch(api.candidates.getById(id), {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to fetch candidate" };
      }

      // Ensure all required associations are present
      const candidate = {
        ...data,
        CandidateEducations: data.CandidateEducations || [],
        CandidateExperiences: data.CandidateExperiences || [],
        CandidateExtraCurriculars: data.CandidateExtraCurriculars || [],
        CandidateSkillMaps: data.CandidateSkillMaps || [],
      };

      return { data: candidate };
    } catch (error) {
      console.log("Error in getCandidateById:", error);
      return { error: "Failed to fetch candidate. Please try again." };
    }
  },

  // Optimized methods for better performance
  async getCandidateProfileOptimized(id) {
    try {
      const response = await fetch(api.candidates.getProfileOptimized(id), {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to fetch candidate profile" };
      }

      return { data };
    } catch (error) {
      console.log("Error in getCandidateProfileOptimized:", error);
      return { error: "Failed to fetch candidate profile. Please try again." };
    }
  },

  async getCandidateEducationOptimized(id) {
    try {
      const response = await fetch(api.candidates.getEducationOptimized(id), {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to fetch education data" };
      }

      return { data };
    } catch (error) {
      console.log("Error in getCandidateEducationOptimized:", error);
      return { error: "Failed to fetch education data. Please try again." };
    }
  },

  async getCandidateExperienceOptimized(id) {
    try {
      const response = await fetch(api.candidates.getExperienceOptimized(id), {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to fetch experience data" };
      }

      return { data };
    } catch (error) {
      console.log("Error in getCandidateExperienceOptimized:", error);
      return { error: "Failed to fetch experience data. Please try again." };
    }
  },

  async getCandidateActivitiesOptimized(id) {
    try {
      const response = await fetch(api.candidates.getActivitiesOptimized(id), {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to fetch activities data" };
      }

      return { data };
    } catch (error) {
      console.log("Error in getCandidateActivitiesOptimized:", error);
      return { error: "Failed to fetch activities data. Please try again." };
    }
  },

  async getCandidateCertificationsOptimized(id) {
    try {
      const response = await fetch(api.candidates.getCertificationsOptimized(id), {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to fetch certifications data" };
      }

      return { data };
    } catch (error) {
      console.log("Error in getCandidateCertificationsOptimized:", error);
      return { error: "Failed to fetch certifications data. Please try again." };
    }
  },

  // Create a new candidate
  async createCandidate(candidateData) {
    try {
      // Check if candidateData is FormData or plain object
      const isFormData = candidateData instanceof FormData;

      const requestOptions = {
        method: "POST",
        credentials: "include",
      };

      if (isFormData) {
        // If it's FormData (from manual entry), send as-is
        requestOptions.body = candidateData;
      } else {
        // If it's a plain object (from AI parsing), send as JSON
        requestOptions.headers = {
          "Content-Type": "application/json",
        };
        requestOptions.body = JSON.stringify(candidateData);
      }

      const response = await fetch(api.candidates.create(), requestOptions);

      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to create candidate" };
      }

      return { data };
    } catch (error) {
      console.log("Error in createCandidate:", error);
      return { error: "Failed to create candidate. Please try again." };
    }
  },

  // Update a candidate
  async updateCandidate(id, candidateData) {
    try {
      const response = await fetch(api.candidates.update(id), {
        method: "PUT",
        body: candidateData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to update candidate" };
      }

      return { data };
    } catch (error) {
      console.log("Error in updateCandidate:", error);
      return { error: "Failed to update candidate. Please try again." };
    }
  },

  // Delete a candidate
  async deleteCandidate(id) {
    try {
      const response = await fetch(api.candidates.delete(id), {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to delete candidate" };
      }

      return { data };
    } catch (error) {
      console.log("Error in deleteCandidate:", error);
      return { error: "Failed to delete candidate. Please try again." };
    }
  },

  // Update candidate's job assignments
  async updateJobAssignments(candidateId, jobIds) {
    try {
      const response = await fetch(api.candidates.assignJobs(candidateId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobIds }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to update job assignments" };
      }

      return { data };
    } catch (error) {
      console.log("Error in updateJobAssignments:", error);
      return { error: "Failed to update job assignments. Please try again." };
    }
  },

  // Assign a job to a candidate
  async assignJob(candidateId, jobId) {
    try {
      const response = await fetch(api.candidates.update(candidateId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignedJobs: {
            connect: [{ id: jobId }],
          },
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to assign job" };
      }

      return { data };
    } catch (error) {
      console.log("Error in assignJob:", error);
      return { error: "Failed to assign job. Please try again." };
    }
  },

  // Remove a job assignment from a candidate
  async removeJobAssignment(candidateId, jobId) {
    try {
      const response = await fetch(api.candidates.update(candidateId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignedJobs: {
            disconnect: [{ id: jobId }],
          },
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        return { error: data.error || "Failed to remove job assignment" };
      }

      return { data };
    } catch (error) {
      console.log("Error in removeJobAssignment:", error);
      return { error: "Failed to remove job assignment. Please try again." };
    }
  },

  // Get candidate jobs
  async getCandidateJobs(candidateId) {
    console.log("[candidateService] getCandidateJobs: Starting", {
      candidateId,
    });

    try {
      const response = await fetch(api.candidates.getJobs(candidateId), {
        credentials: "include",
      });
      const data = await response.json();

      console.log("[candidateService] getCandidateJobs: Raw response", {
        status: response.status,
        data,
      });

      if (!response.ok) {
        console.log("[candidateService] getCandidateJobs: API error", {
          status: response.status,
          error: data,
        });
        return { error: data.message || "Failed to fetch candidate jobs" };
      }

      // Map the jobs to match the expected format
      const mappedJobs = (data.jobs || []).map((job) => {
        console.log("[candidateService] getCandidateJobs: Mapping job", {
          job,
        });

        return {
          id: job.id,
          jobId: job.id,
          jobTitle: job.jobTitle || job.title,
          jobDepartment: job.jobDepartment || job.department,
          jobType: job.jobType || job.type,
          jobLocation: job.jobLocation || job.location,
          jobStatus: job.jobStatus || job.status,
          companyId: job.companyId,
          assignedDate: job.assignedDate,
          assignedBy: job.assignedBy,
        };
      });

      console.log("[candidateService] getCandidateJobs: Success", {
        candidateId,
        jobCount: mappedJobs.length,
        jobs: mappedJobs,
      });

      return mappedJobs;
    } catch (error) {
      console.log("[candidateService] getCandidateJobs: Error", {
        candidateId,
        error: error.message,
      });
      throw error;
    }
  },

  // Bulk upload candidates
  async bulkUploadCandidates(file) {
    try {
      console.log("[candidateService] Starting bulk upload");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(api.candidates.bulkUpload(), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("[candidateService] Bulk upload error:", {
          status: response.status,
          error: data,
        });
        throw new Error(data.message || "Failed to bulk upload candidates");
      }

      console.log("[candidateService] Bulk upload successful:", data);
      return data;
    } catch (error) {
      console.log("[candidateService] Error in bulkUploadCandidates:", error);
      throw error;
    }
  },

  // Bulk upload resumes
  async bulkUploadResumes(files) {
    try {
      console.log("[candidateService] Starting bulk resume upload");
      const formData = new FormData();

      // Append all files
      for (let i = 0; i < files.length; i++) {
        formData.append("resumes", files[i]);
      }

      const response = await fetch(api.candidates.bulkUploadResumes(), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("[candidateService] Bulk resume upload error:", {
          status: response.status,
          error: data,
        });
        throw new Error(data.message || "Failed to bulk upload resumes");
      }

      console.log("[candidateService] Bulk resume upload successful:", data);
      return data;
    } catch (error) {
      console.log("[candidateService] Error in bulkUploadResumes:", error);
      throw error;
    }
  },

  // Download bulk upload template
  async downloadBulkUploadTemplate() {
    try {
      const response = await fetch(api.candidates.getBulkUploadTemplate(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to download template");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "candidate_bulk_upload_template.csv";
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.log("[candidateService] Error downloading template:", error);
      throw error;
    }
  },

  // Apply to a job (convert to applicant)
  async applyToJob(candidateId, jobId, applicationData) {
    try {
      const response = await fetch(api.jobs.applyToJob(jobId, candidateId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || "Failed to apply to job" };
      }
      return { data };
    } catch (error) {
      return { error: "Failed to apply to job. Please try again." };
    }
  },

  // Upload candidate resume
  async uploadResume(candidateId, formData) {
    try {
      console.log("[candidateService] uploadResume: candidateId", candidateId);

      if (!(formData instanceof FormData)) {
        console.log(
          "[candidateService] uploadResume: Not a FormData object",
          formData
        );
        return { error: "Invalid data format for resume upload." };
      }

      for (let pair of formData.entries()) {
        console.log(
          `[candidateService] uploadResume: formData ${pair[0]}:`,
          pair[1]
        );
      }
      const response = await fetch(api.candidates.uploadResume(candidateId), {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      console.log(
        "[candidateService] uploadResume: response status",
        response.status
      );
      const data = await response.json();
      console.log("[candidateService] uploadResume: response body", data);
      if (!response.ok) {
        return { error: data.error || "Failed to upload resume" };
      }
      return { data };
    } catch (error) {
      console.log("[candidateService] uploadResume: caught error", error);
      return { error: "Failed to upload resume. Please try again." };
    }
  },

  // Store resume after candidate creation (for bulk upload flow)
  async storeResumeAfterCreation(candidateId, originalFileName, filePath) {
    try {
      console.log("[candidateService] storeResumeAfterCreation:", {
        candidateId,
        originalFileName,
        filePath,
      });

      const response = await fetch(api.candidates.storeResumeAfterCreation(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId,
          originalFileName,
          filePath,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("[candidateService] storeResumeAfterCreation error:", {
          status: response.status,
          error: data,
        });
        return { error: data.message || "Failed to store resume" };
      }

      console.log("[candidateService] storeResumeAfterCreation successful:", data);
      return { data };
    } catch (error) {
      console.log("[candidateService] storeResumeAfterCreation error:", error);
      return { error: "Failed to store resume. Please try again." };
    }
  },

  // Upload multiple candidate documents for a specific entity (education, experience, etc.)
  async uploadDocuments(candidateId, type, entityId, files) {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("entityId", entityId);
    files.forEach((file) => formData.append("files", file));
    const response = await fetch(api.candidates.uploadDocuments(candidateId), {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Failed to upload documents" };
    }
    return { data };
  },

  // Update a specific candidate document
  async updateDocument(candidateId, documentId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(
      api.candidates.updateDocument(candidateId, documentId),
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Failed to update document" };
    }
    return { data };
  },

  // List all candidate documents
  async getDocuments(candidateId) {
    const response = await fetch(api.candidates.getDocuments(candidateId), {
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Failed to fetch documents" };
    }
    return { data };
  },

  // Delete a specific candidate document
  async deleteDocument(candidateId, documentId) {
    const response = await fetch(
      api.candidates.deleteDocument(candidateId, documentId),
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Failed to delete document" };
    }
    return { data };
  },
  // Get final stage candidates
  async getFinalStageCandidates() {
    try {
      const response = await fetch(api.candidates.getFinalStageCandidates());
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || "Failed to fetch final stage candidates" };
      }
      return { data };
    } catch (error) {
      return { error: "Failed to fetch final stage candidates. Please try again." };
    }
  },
};
