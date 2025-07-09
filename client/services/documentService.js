import { api } from "@/config/api.js";

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    console.log("API Error:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });

    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || "An error occurred";
    } catch (e) {
      errorMessage = "Failed to fetch data";
    }

    throw new Error(errorMessage);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Helper function to get multipart headers for file uploads
const getMultipartHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to prepare form data
const prepareFormData = (file, data = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  // Convert tags array to string if present
  if (data.tags) {
    if (Array.isArray(data.tags)) {
      data.tags = JSON.stringify(data.tags);
    } else if (typeof data.tags === "string" && data.tags.includes(",")) {
      // Convert comma-separated string to array, then stringify
      data.tags = JSON.stringify(
        data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      );
    }
  }

  // Append other data
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  return formData;
};

export const documentService = {
  // Core Document Operations
  async getAllDocuments(params = {}) {
    try {
      const response = await fetch(api.documents.getAll(params), {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await handleResponse(response);
      return {
        documents: data.documents || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
      };
    } catch (error) {
      console.log("Error in getAllDocuments:", error);
      throw error;
    }
  },

  async getDocumentById(id) {
    try {
      const response = await fetch(api.documents.getById(id), {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await handleResponse(response);
      return data.document;
    } catch (error) {
      console.log("Error in getDocumentById:", error);
      throw error;
    }
  },

  async uploadDocument(file, documentData = {}) {
    try {
      const formData = prepareFormData(file, documentData);
      const response = await fetch(api.documents.upload(), {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await handleResponse(response);
      return data.document;
    } catch (error) {
      console.log("Error in uploadDocument:", error);
      throw error;
    }
  },

  async updateDocument(id, updateData = {}) {
    try {
      // Format tags if they exist in the update data
      if (updateData.tags) {
        // Make sure tags are an array
        const tagsArray = Array.isArray(updateData.tags)
          ? updateData.tags
          : [updateData.tags];

        // Filter out any null/undefined values and normalize to strings
        updateData.tags = tagsArray
          .filter((tag) => tag !== null && tag !== undefined)
          .map((tag) =>
            typeof tag === "string" ? tag : tag?.name || tag?.toString() || ""
          )
          .filter((tag) => tag.trim() !== "");
      }

      // Format category if it's an object
      if (
        updateData.category &&
        typeof updateData.category === "object" &&
        updateData.category.name
      ) {
        updateData.category = updateData.category.name;
      }

      const response = await fetch(api.documents.update(id), {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      const data = await handleResponse(response);

      // Normalize the response data
      const document = data.document || data;

      // Normalize tags in the response
      if (document.tags) {
        document.tags = document.tags
          .map((tag) =>
            typeof tag === "string" ? tag : tag?.name || tag?.toString() || ""
          )
          .filter(Boolean);
      }

      // Normalize category in the response
      if (
        document.category &&
        typeof document.category === "object" &&
        document.category.name
      ) {
        document.categoryName = document.category.name;
      }

      return document;
    } catch (error) {
      console.log("Error updating document:", error);
      throw error;
    }
  },

  async deleteDocument(id) {
    try {
      const response = await fetch(api.documents.delete(id), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      return handleResponse(response);
    } catch (error) {
      console.log("Error in deleteDocument:", error);
      throw error;
    }
  },

  // Document Content Management
  async getDocumentContent(id) {
    try {
      // The service should download the document and return a blob for preview
      const response = await fetch(api.documents.getContent(id), {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to load preview" }));
        throw new Error(errorData.message || "Failed to load document preview");
      }
      return await response.blob();
    } catch (error) {
      console.log("Error in getDocumentContent:", error);
      throw error;
    }
  },

  async downloadDocument(id) {
    try {
      console.log(`Attempting to download document with ID: ${id}`);

      if (!id) {
        console.log("Invalid document ID for download");
        throw new Error("Invalid document ID");
      }

      const response = await fetch(api.documents.download(id), {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      console.log(
        `Download response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        let errorMessage = `Download failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.log("Download error response:", errorData);
        } catch (parseError) {
          console.log("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("Content-Type");
      console.log(`Document content type: ${contentType}`);

      const blob = await response.blob();
      console.log(
        `Downloaded blob size: ${blob.size} bytes, type: ${blob.type}`
      );

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      return blob;
    } catch (error) {
      console.log("Error in downloadDocument:", error);
      throw error;
    }
  },

  async downloadDocumentWithResponse(id) {
    try {
      console.log(`Attempting to download document with ID: ${id}`);

      if (!id) {
        console.log("Invalid document ID for download");
        throw new Error("Invalid document ID");
      }

      const response = await fetch(api.documents.download(id), {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      console.log(
        `Download response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        let errorMessage = `Download failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.log("Download error response:", errorData);
        } catch (parseError) {
          console.log("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("Content-Type");
      console.log(`Document content type: ${contentType}`);

      const blob = await response.blob();
      console.log(
        `Downloaded blob size: ${blob.size} bytes, type: ${blob.type}`
      );

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // Return both the blob and headers
      return {
        blob,
        headers: response.headers,
      };
    } catch (error) {
      console.log("Error in downloadDocumentWithResponse:", error);
      throw error;
    }
  },

  // Document Sharing
  async shareDocument(id, shareData) {
    try {
      const response = await fetch(api.documents.share(id), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(shareData),
      });
      const data = await handleResponse(response);
      return data.shares;
    } catch (error) {
      console.log("Error in shareDocument:", error);
      throw error;
    }
  },

  async getSharedDocuments(params = {}) {
    try {
      const response = await fetch(api.documents.getShared(params), {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await handleResponse(response);
      return {
        documents: data.documents || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
      };
    } catch (error) {
      console.log("Error in getSharedDocuments:", error);
      throw error;
    }
  },

  async removeDocumentAccess(id) {
    const response = await fetch(api.documents.removeAccess(id), {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Document Templates
  async getDocumentTemplates(params = {}) {
    const response = await fetch(api.documents.getTemplates(), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  async createDocumentTemplate(file, templateData) {
    const formData = new FormData();
    formData.append("file", file);

    Object.keys(templateData).forEach((key) => {
      if (templateData[key] !== undefined && templateData[key] !== null) {
        if (typeof templateData[key] === "object") {
          formData.append(key, JSON.stringify(templateData[key]));
        } else {
          formData.append(key, templateData[key]);
        }
      }
    });

    const response = await fetch(api.documents.createTemplate(), {
      method: "POST",
      headers: getMultipartHeaders(),
      body: formData,
      credentials: "include",
    });
    return handleResponse(response);
  },

  async getDocumentTemplateById(id) {
    const response = await fetch(api.documents.getTemplateById(id), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  async updateDocumentTemplate(id, updateData) {
    const response = await fetch(api.documents.updateTemplate(id), {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
      credentials: "include",
    });
    return handleResponse(response);
  },

  async deleteDocumentTemplate(id) {
    const response = await fetch(api.documents.deleteTemplate(id), {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  async useDocumentTemplate(id) {
    const response = await fetch(api.documents.useTemplate(id), {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Document Categories
  async getDocumentCategories() {
    const response = await fetch(api.documents.getCategories(), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  async createDocumentCategory(categoryData) {
    const response = await fetch(api.documents.createCategory(), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Document Uploaders
  async getDocumentUploaders() {
    const response = await fetch(api.documents.getUploaders(), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Document Tags
  async getDocumentTags() {
    const response = await fetch(api.documents.getTags(), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  async createDocumentTag(tagData) {
    const response = await fetch(api.documents.createTag(), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(tagData),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Document Versions
  async getDocumentVersions(id) {
    const response = await fetch(api.documents.getVersions(id), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  async createDocumentVersion(id, file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(api.documents.createVersion(id), {
      method: "POST",
      headers: getMultipartHeaders(),
      body: formData,
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Document Analytics
  async getDocumentStats() {
    const response = await fetch(api.documents.getStats(), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  async searchDocuments(query, filters = {}, params = {}) {
    const searchParams = new URLSearchParams();
    searchParams.append("q", query);

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        searchParams.append(key, filters[key]);
      }
    });

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(
      `${api.documents.search()}?${searchParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );
    return handleResponse(response);
  },

  async getDocumentActivity(id) {
    const response = await fetch(api.documents.getActivity(id), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Bulk Operations
  async bulkUploadDocuments(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(api.documents.bulkUpload(), {
      method: "POST",
      headers: getMultipartHeaders(),
      body: formData,
      credentials: "include",
    });
    return handleResponse(response);
  },

  async exportDocuments(format = "json", filters = {}) {
    const searchParams = new URLSearchParams();
    searchParams.append("format", format);

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        searchParams.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${api.documents.export()}?${searchParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Export failed" }));
      throw new Error(error.message || "Failed to export documents");
    }

    const blob = await response.blob();
    return blob;
  },

  // Utility functions
  formatFileSize(bytes) {
    // Handle null, undefined, or invalid inputs
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
      return "Unknown size";
    }

    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  getFileIcon(fileType) {
    const iconMap = {
      pdf: "FileText",
      doc: "FileText",
      docx: "FileText",
      xls: "FileSpreadsheet",
      xlsx: "FileSpreadsheet",
      ppt: "FilePresentation",
      pptx: "FilePresentation",
      txt: "FileText",
      jpg: "FileImage",
      jpeg: "FileImage",
      png: "FileImage",
      gif: "FileImage",
      svg: "FileImage",
      mp4: "FileVideo",
      avi: "FileVideo",
      mov: "FileVideo",
      mp3: "FileAudio",
      wav: "FileAudio",
      zip: "FileArchive",
      rar: "FileArchive",
      json: "FileCode",
      js: "FileCode",
      ts: "FileCode",
      jsx: "FileCode",
      tsx: "FileCode",
      html: "FileCode",
      css: "FileCode",
      scss: "FileCode",
      sql: "FileCode",
      md: "FileText",
    };
    return iconMap[fileType.toLowerCase()] || "File";
  },

  getFileColor(fileType) {
    const colorMap = {
      pdf: "text-red-500",
      doc: "text-blue-500",
      docx: "text-blue-500",
      xls: "text-green-500",
      xlsx: "text-green-500",
      ppt: "text-orange-500",
      pptx: "text-orange-500",
      txt: "text-gray-500",
      jpg: "text-purple-500",
      jpeg: "text-purple-500",
      png: "text-purple-500",
      gif: "text-purple-500",
      svg: "text-purple-500",
      mp4: "text-pink-500",
      avi: "text-pink-500",
      mov: "text-pink-500",
      mp3: "text-indigo-500",
      wav: "text-indigo-500",
      zip: "text-yellow-500",
      rar: "text-yellow-500",
      json: "text-yellow-500",
      js: "text-yellow-500",
      ts: "text-yellow-500",
      jsx: "text-yellow-500",
      tsx: "text-yellow-500",
      html: "text-orange-500",
      css: "text-blue-500",
      scss: "text-blue-500",
      sql: "text-blue-500",
      md: "text-gray-500",
    };
    return colorMap[fileType.toLowerCase()] || "text-gray-500";
  },

  // Candidate Document Filtering
  async getCandidateList() {
    const response = await fetch(api.documents.getCandidateList(), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },
  async getCandidateDocuments({ candidateId, categoryId, tags }) {
    const params = new URLSearchParams();
    if (candidateId) params.append("candidateId", candidateId);
    if (categoryId) params.append("categoryId", categoryId);
    if (tags && tags.length > 0) {
      if (Array.isArray(tags)) {
        tags.forEach((tag) => params.append("tags", tag));
      } else {
        params.append("tags", tags);
      }
    }
    const response = await fetch(
      `${api.documents.getCandidateDocuments()}?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );
    return handleResponse(response);
  },

  // Company Document Filtering
  async getCompanyList() {
    const response = await fetch(api.documents.getCompanyList(), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },
  async getCompanyDocuments({ companyId, categoryId, tags }) {
    const params = new URLSearchParams();
    if (companyId) params.append("companyId", companyId);
    if (categoryId) params.append("categoryId", categoryId);
    if (tags && tags.length > 0) {
      if (Array.isArray(tags)) {
        tags.forEach((tag) => params.append("tags", tag));
      } else {
        params.append("tags", tags);
      }
    }
    const response = await fetch(
      `${api.documents.getCompanyDocuments()}?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );
    return handleResponse(response);
  },
};
