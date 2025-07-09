import { api } from "../config/api";
import { documentService } from "./documentService";

class CompanyService {
  // Core company operations
  async getAllCompanies(params = {}) {
    try {
      const response = await fetch(api.companies.getAll(params), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch companies");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getCompanyById(id) {
    try {
      const response = await fetch(api.companies.getById(id), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch company");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async createCompany(companyData) {
    try {
      const response = await fetch(api.companies.create(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create company");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateCompany(id, companyData) {
    try {
      console.log(`Updating company ${id} with data:`, companyData);
      console.log(`API URL: ${api.companies.update(id)}`);

      // Ensure contact fields are sent to the server
      const dataToSend = {
        ...companyData,
        contactName: companyData.contactName,
        contactPosition: companyData.contactPosition,
        contactPhone: companyData.contactPhone,
        contactEmail: companyData.contactEmail,
      };

      console.log("Full data being sent to server:", dataToSend);

      const response = await fetch(api.companies.update(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(
          `Server responded with status ${response.status}:`,
          errorData
        );
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.log(`Failed to update company ${id}:`, error);
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        console.log("Network error. Server might be down or CORS issue.");
        throw new Error(
          "Network error. Please check your connection or the server status."
        );
      }
      throw error;
    }
  }

  async deleteCompany(id) {
    try {
      const response = await fetch(api.companies.delete(id), {
        method: "DELETE",
        credentials: "include",
      });

      // If the response is 404 (Not Found), we'll consider this a success
      // since the goal was to delete the company and it's already gone
      if (response.status === 404) {
        console.log(
          `Company with ID ${id} not found on server, considering delete successful`
        );
        return { message: "Company deleted successfully" };
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete company");
      }

      return await response.json();
    } catch (error) {
      console.log(`Error in deleteCompany service for ID ${id}:`, error);
      throw error;
    }
  }

  // Company contacts operations
  async getCompanyContacts(companyId) {
    try {
      const response = await fetch(api.companies.getContacts(companyId), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch company contacts");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async addCompanyContact(companyId, contactData) {
    try {
      const response = await fetch(api.companies.addContact(companyId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add contact");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateCompanyContact(companyId, contactId, contactData) {
    try {
      const response = await fetch(
        api.companies.updateContact(companyId, contactId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update contact");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteCompanyContact(companyId, contactId) {
    try {
      const response = await fetch(
        api.companies.deleteContact(companyId, contactId),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete contact");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Company documents operations
  async getCompanyDocuments(companyId, params = {}) {
    try {
      const url = new URL(api.companies.getDocuments(companyId));
      Object.keys(params).forEach(
        (key) =>
          params[key] !== undefined && url.searchParams.append(key, params[key])
      );

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch documents");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async addCompanyDocument(companyId, documentData) {
    try {
      const formData = new FormData();

      // Append file if it exists
      if (documentData.file) {
        formData.append("document", documentData.file);
      }

      // Append other data, always stringify tags if array
      Object.keys(documentData).forEach((key) => {
        if (key !== "file") {
          if (key === "tags" && Array.isArray(documentData[key])) {
            formData.append("tags", JSON.stringify(documentData[key]));
          } else {
            formData.append(key, documentData[key]);
          }
        }
      });

      const response = await fetch(api.companies.addDocument(companyId), {
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
      throw error;
    }
  }

  async updateCompanyDocument(companyId, documentId, documentData) {
    try {
      const response = await fetch(
        api.companies.updateDocument(companyId, documentId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(documentData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update document");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteCompanyDocument(companyId, documentId) {
    try {
      const response = await fetch(
        api.companies.deleteDocument(companyId, documentId),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete document");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async shareCompanyDocument(companyId, documentId, shareData) {
    // Use the unified documentService.shareDocument for company documents
    return documentService.shareDocument(documentId, shareData);
  }

  async downloadCompanyDocument(companyId, documentId) {
    try {
      const response = await fetch(
        api.companies.getDocumentById(companyId, documentId),
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to download company document");
      }
      return await response.blob();
    } catch (error) {
      throw error;
    }
  }

  async getCompanyDocumentById(companyId, documentId) {
    try {
      const response = await fetch(
        api.companies.getDocumentById(companyId, documentId),
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch company document");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Company jobs operations
  async getCompanyJobs(companyId, params = {}) {
    try {
      const url = new URL(api.companies.getJobs(companyId));
      Object.keys(params).forEach(
        (key) =>
          params[key] !== undefined && url.searchParams.append(key, params[key])
      );

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch jobs");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async addCompanyJob(companyId, jobData) {
    try {
      // Format the job data according to backend requirements
      const formattedJobData = {
        jobTitle: jobData.title || jobData.jobTitle, // Handle both old and new field names
        companyId: parseInt(companyId),
        jobStatus: jobData.status || jobData.jobStatus || "new", // Default to "new" if not provided
        jobType: jobData.type || jobData.jobType,
        department: jobData.department,
        location: jobData.location,
        openings: parseInt(jobData.openings) || 1,
        salaryMin: parseInt(jobData.salaryMin),
        salaryMax: parseInt(jobData.salaryMax),
        experienceLevel: jobData.experienceLevel,
        description: jobData.description,
        requirements: jobData.requirements,
        responsibilities: jobData.responsibilities,
        benefits: jobData.benefits,
        postedDate: jobData.postedDate || new Date().toISOString(),
        deadline: jobData.deadline,
        workType: jobData.workType,
        // Only include applicationStages if it's a valid JSON string
        ...(jobData.applicationStages && {
          applicationStages:
            typeof jobData.applicationStages === "string"
              ? jobData.applicationStages
              : JSON.stringify(jobData.applicationStages),
        }),
      };

      console.log(
        "[CompanyService] Adding job with formatted data:",
        formattedJobData
      );

      const response = await fetch(api.jobs.create(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedJobData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("[CompanyService] Failed to add job:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
          requestData: formattedJobData,
        });
        throw new Error(
          data.message ||
          data.error ||
          `Failed to add job: ${response.statusText}`
        );
      }

      console.log("[CompanyService] Job added successfully:", data);
      return data;
    } catch (error) {
      console.log("[CompanyService] Error in addCompanyJob:", {
        companyId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async deleteCompanyJob(companyId, jobId) {
    try {
      const response = await fetch(api.companies.deleteJob(companyId, jobId), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete job");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Company candidates operations
  async getCompanyCandidates(companyId, params = {}) {
    try {
      console.log(`Calling API: ${api.companies.getCandidates(companyId)}`);

      // Validate company ID
      if (!companyId) {
        console.log("Missing company ID");
        throw new Error("Company ID is required");
      }

      const url = new URL(api.companies.getCandidates(companyId));
      Object.keys(params).forEach(
        (key) =>
          params[key] !== undefined && url.searchParams.append(key, params[key])
      );

      console.log(`Making request to: ${url.toString()}`);
      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`API Error (${response.status}):`, errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || `HTTP error ${response.status}` };
        }

        throw new Error(
          errorData.message || `Failed to fetch candidates (${response.status})`
        );
      }

      const data = await response.json();
      console.log("API Response data:", data);

      // Validate response structure
      if (!data || !Array.isArray(data.candidates)) {
        console.log("Invalid response format:", data);
        return {
          candidates: [],
          totalCandidates: 0,
          totalPages: 1,
          currentPage: 1,
        };
      }

      return data;
    } catch (error) {
      console.log("Error in getCompanyCandidates service:", error);
      throw error;
    }
  }

  // Analytics operations
  async getCompanyActivity(companyId, params = {}) {
    try {
      const url = new URL(api.companies.getActivity(companyId));
      Object.keys(params).forEach(
        (key) =>
          params[key] !== undefined && url.searchParams.append(key, params[key])
      );

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch activity");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getCompanyHiringAnalytics(companyId, timeframe) {
    try {
      const url = new URL(api.companies.getHiringAnalytics(companyId));
      if (timeframe) {
        url.searchParams.append("timeframe", timeframe);
      }

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch hiring analytics");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getCompanyPipelineAnalytics(companyId) {
    try {
      const response = await fetch(
        api.companies.getPipelineAnalytics(companyId),
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch pipeline analytics");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Reference data operations
  async getIndustries() {
    try {
      const response = await fetch(api.companies.getIndustries(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch industries");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getLocations() {
    try {
      const response = await fetch(api.companies.getLocations(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch locations");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getCompanySizes() {
    try {
      const response = await fetch(api.companies.getSizes(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch company sizes");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getCompanyStats() {
    try {
      const response = await fetch(api.companies.getStats(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch company stats");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Validation operations
  async validateGSTIN(gstin) {
    try {
      const response = await fetch(api.companies.validateGSTIN(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gstin }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "GSTIN validation failed");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async validatePAN(pan) {
    try {
      const response = await fetch(api.companies.validatePAN(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pan }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "PAN validation failed");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export const companyService = new CompanyService();
