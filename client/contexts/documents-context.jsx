"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { documentService } from "@/services/documentService.js";
import { useToast } from "@/hooks/use-toast";

// Format file size helper function
const formatFileSize = (bytes) => {
  // If it's already a formatted string, return it as is
  if (
    typeof bytes === "string" &&
    (bytes.includes("Bytes") ||
      bytes.includes("KB") ||
      bytes.includes("MB") ||
      bytes.includes("GB"))
  ) {
    return bytes;
  }

  // Handle null, undefined, or invalid inputs
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return "Unknown size";
  }

  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

// Create the context
const DocumentsContext = createContext(undefined);

// Create the provider component
export function DocumentsProvider({ companyId, children }) {
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [uploaders, setUploaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [candidateList, setCandidateList] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [companyList, setCompanyList] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const { toast } = useToast();

  // Load company documents
  const loadCompanyDocuments = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await documentService.getCompanyDocuments(filters);
        const docs = Array.isArray(response.documents)
          ? response.documents
          : [];
        setDocuments(docs);
        return docs;
      } catch (err) {
        setError(err.message);
        setDocuments([]);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Load candidate documents
  const loadCandidateDocuments = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await documentService.getCandidateDocuments(filters);
        const docs = Array.isArray(response.documents)
          ? response.documents
          : [];
        setDocuments(docs);
        return docs;
      } catch (err) {
        setError(err.message);
        setDocuments([]);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Load documents
  const loadDocuments = useCallback(
    async (params = {}) => {
      if (selectedCompanyId) {
        return loadCompanyDocuments({
          companyId: selectedCompanyId,
          ...params,
        });
      }
      if (selectedCandidateId) {
        return loadCandidateDocuments({
          candidateId: selectedCandidateId,
          ...params,
        });
      }
      try {
        setLoading(true);
        setError(null);
        const response = await documentService.getAllDocuments(params);

        // Ensure we always set an array, even if the response structure is unexpected
        const documentsArray = Array.isArray(response.documents)
          ? response.documents
          : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        setPage(response.page || 1);
        setLimit(response.limit || 10);
        setTotal(response.total || documentsArray.length);

        // Normalize document tags to ensure consistent format
        const normalizedDocs = documentsArray.map((doc) => {
          const normalizedDoc = { ...doc };

          // Normalize tags to strings
          if (normalizedDoc.tags) {
            normalizedDoc.tags = normalizedDoc.tags
              .map((tag) =>
                typeof tag === "string"
                  ? tag
                  : tag && tag.name
                  ? tag.name
                  : null
              )
              .filter(Boolean);
          } else {
            normalizedDoc.tags = [];
          }

          // Normalize category
          if (
            normalizedDoc.category &&
            typeof normalizedDoc.category === "object" &&
            normalizedDoc.category.name
          ) {
            normalizedDoc.categoryName = normalizedDoc.category.name;
          }

          // Normalize fileSize
          if (normalizedDoc.fileSize !== undefined) {
            normalizedDoc.fileSize = formatFileSize(normalizedDoc.fileSize);
          }

          // Ensure size property is set for backward compatibility
          if (!normalizedDoc.size && normalizedDoc.fileSize) {
            normalizedDoc.size = normalizedDoc.fileSize;
          }

          // Ensure uploadedBy is always a name, not an ID
          if (
            normalizedDoc.uploadedBy !== undefined &&
            !isNaN(normalizedDoc.uploadedBy)
          ) {
            // If uploadedBy is a number (ID), try to get the name from the uploader object
            if (normalizedDoc.uploader && normalizedDoc.uploader.fullName) {
              normalizedDoc.uploadedBy = normalizedDoc.uploader.fullName;
            } else {
              normalizedDoc.uploadedBy = "Unknown User";
            }
          }

          return normalizedDoc;
        });

        setDocuments(normalizedDocs);
        return normalizedDocs;
      } catch (err) {
        setError(err.message);
        setDocuments([]); // Ensure documents is always an array
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [
      toast,
      selectedCandidateId,
      loadCandidateDocuments,
      selectedCompanyId,
      loadCompanyDocuments,
    ]
  );

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const response = await documentService.getDocumentTemplates();
      const templatesArray = Array.isArray(response.templates)
        ? response.templates
        : Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setTemplates(templatesArray);
    } catch (err) {
      console.log("Failed to load templates:", err);
      setTemplates([]);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await documentService.getDocumentCategories();
      const categoriesArray = Array.isArray(response.categories)
        ? response.categories
        : Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setCategories(categoriesArray);
    } catch (err) {
      console.log("Failed to load categories:", err);
      setCategories([]);
    }
  }, []);

  // Load tags
  const loadTags = useCallback(async () => {
    try {
      const response = await documentService.getDocumentTags();
      const tagsArray = Array.isArray(response.tags)
        ? response.tags
        : Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setTags(tagsArray);
    } catch (err) {
      console.log("Failed to load tags:", err);
      setTags([]);
    }
  }, []);

  // Load uploaders
  const loadUploaders = useCallback(async () => {
    try {
      const response = await documentService.getDocumentUploaders();
      const uploadersArray = Array.isArray(response.uploaders)
        ? response.uploaders
        : Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setUploaders(uploadersArray);
    } catch (err) {
      console.log("Failed to load uploaders:", err);
      setUploaders([]);
    }
  }, []);

  // Load shared documents
  const loadSharedDocuments = useCallback(async (params = {}) => {
    try {
      const response = await documentService.getSharedDocuments(params);
      const sharedArray = Array.isArray(response.documents)
        ? response.documents
        : Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      // Normalize shared documents to ensure required fields are present
      const normalizedShared = sharedArray.map((doc) => {
        const normalizedDoc = { ...doc };

        // Normalize fileSize
        if (normalizedDoc.fileSize !== undefined) {
          normalizedDoc.fileSize = formatFileSize(normalizedDoc.fileSize);
        }

        // Ensure size property is set for backward compatibility
        if (!normalizedDoc.size && normalizedDoc.fileSize) {
          normalizedDoc.size = normalizedDoc.fileSize;
        }

        // Ensure mimeType, originalName are present (fallback to N/A if missing)
        if (!normalizedDoc.mimeType) {
          normalizedDoc.mimeType = "N/A";
        }
        if (!normalizedDoc.originalName) {
          normalizedDoc.originalName = "N/A";
        }

        // Ensure uploadedBy is always a name, not an ID
        if (
          normalizedDoc.uploadedBy !== undefined &&
          !isNaN(normalizedDoc.uploadedBy)
        ) {
          if (normalizedDoc.uploader && normalizedDoc.uploader.fullName) {
            normalizedDoc.uploadedBy = normalizedDoc.uploader.fullName;
          } else {
            normalizedDoc.uploadedBy = "Unknown User";
          }
        }

        return normalizedDoc;
      });
      setSharedDocuments(normalizedShared);
    } catch (err) {
      console.log("Failed to load shared documents:", err);
      setSharedDocuments([]);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await documentService.getDocumentStats();
      setStats(response);
    } catch (err) {
      console.log("Failed to load stats:", err);
    }
  }, []);

  // Upload document
  const uploadDocument = useCallback(
    async (file, documentData) => {
      try {
        setLoading(true);
        const response = await documentService.uploadDocument(
          file,
          documentData
        );
        setDocuments((prev) => {
          // Ensure prev is always an array
          const prevArray = Array.isArray(prev) ? prev : [];
          const newDocument = response.document || response;

          // Normalize fileSize
          if (newDocument.fileSize !== undefined) {
            newDocument.fileSize = formatFileSize(newDocument.fileSize);
          }

          // Ensure size property is set for backward compatibility
          if (!newDocument.size && newDocument.fileSize) {
            newDocument.size = newDocument.fileSize;
          }

          // Ensure uploadedBy is always a name, not an ID
          if (
            newDocument.uploadedBy !== undefined &&
            !isNaN(newDocument.uploadedBy)
          ) {
            // If uploadedBy is a number (ID), try to get the name from the uploader object
            if (newDocument.uploader && newDocument.uploader.fullName) {
              newDocument.uploadedBy = newDocument.uploader.fullName;
            } else {
              newDocument.uploadedBy = "Unknown User";
            }
          }

          return [newDocument, ...prevArray];
        });
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
        return response;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Update document
  const updateDocument = useCallback(
    async (id, updateData) => {
      try {
        setLoading(true);
        const response = await documentService.updateDocument(id, updateData);
        const updatedDocument = response.document || response;

        // Ensure tags are properly formatted
        if (updatedDocument.tags) {
          // Normalize tags to strings
          updatedDocument.tags = updatedDocument.tags
            .map((tag) =>
              typeof tag === "string" ? tag : tag && tag.name ? tag.name : null
            )
            .filter(Boolean);
        }

        // Normalize fileSize
        if (updatedDocument.fileSize !== undefined) {
          updatedDocument.fileSize = formatFileSize(updatedDocument.fileSize);
        }

        // Ensure size property is set for backward compatibility
        if (!updatedDocument.size && updatedDocument.fileSize) {
          updatedDocument.size = updatedDocument.fileSize;
        }

        // Ensure uploadedBy is always a name, not an ID
        if (
          updatedDocument.uploadedBy !== undefined &&
          !isNaN(updatedDocument.uploadedBy)
        ) {
          // If uploadedBy is a number (ID), try to get the name from the uploader object
          if (updatedDocument.uploader && updatedDocument.uploader.fullName) {
            updatedDocument.uploadedBy = updatedDocument.uploader.fullName;
          } else {
            updatedDocument.uploadedBy = "Unknown User";
          }
        }

        setDocuments((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.map((doc) =>
            doc.id === id ? updatedDocument : doc
          );
        });

        toast({
          title: "Success",
          description: "Document updated successfully",
        });

        return updatedDocument;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (id) => {
      try {
        setLoading(true);
        await documentService.deleteDocument(id);
        setDocuments((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.filter((doc) => doc.id !== id);
        });
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Get document by ID
  const getDocumentById = useCallback(
    (id) => {
      return documents.find((doc) => doc.id === id);
    },
    [documents]
  );

  // Download document
  const downloadDocument = useCallback(
    async (id) => {
      try {
        const doc = documents.find((d) => d.id === id);
        const response = await documentService.downloadDocumentWithResponse(id);
        const blob = response.blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc?.originalName || doc?.name || `document-${id}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Always update download count locally
        setDocuments((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.map((doc) =>
            doc.id === id
              ? { ...doc, downloadCount: (doc.downloadCount || 0) + 1 }
              : doc
          );
        });

        return true;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        return false;
      }
    },
    [documents, toast]
  );

  // Share document
  const shareDocument = useCallback(
    async (id, shareData) => {
      try {
        const response = await documentService.shareDocument(id, shareData);
        toast({
          title: "Success",
          description: "Document shared successfully",
        });
        return response;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast]
  );

  // Create template
  const createTemplate = useCallback(
    async (file, templateData) => {
      try {
        setLoading(true);
        const response = await documentService.createDocumentTemplate(
          file,
          templateData
        );
        setTemplates((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [response.template || response, ...prevArray];
        });
        toast({
          title: "Success",
          description: "Template created successfully",
        });
        return response;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Create category
  const createCategory = useCallback(
    async (categoryData) => {
      try {
        const response = await documentService.createDocumentCategory(
          categoryData
        );
        setCategories((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, response.category || response];
        });
        toast({
          title: "Success",
          description: "Category created successfully",
        });
        return response;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast]
  );

  // Create tag
  const createTag = useCallback(
    async (tagData) => {
      try {
        const response = await documentService.createDocumentTag(tagData);
        setTags((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, response.tag || response];
        });
        toast({
          title: "Success",
          description: "Tag created successfully",
        });
        return response;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast]
  );

  // Search documents
  const searchDocuments = useCallback(
    async (query, filters = {}, params = {}) => {
      try {
        setLoading(true);
        const response = await documentService.searchDocuments(
          query,
          filters,
          params
        );
        return response;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Bulk upload
  const bulkUpload = useCallback(
    async (files) => {
      try {
        setLoading(true);
        const response = await documentService.bulkUploadDocuments(files);
        if (response.uploaded > 0) {
          await loadDocuments(); // Reload documents
          toast({
            title: "Success",
            description: `${response.uploaded} documents uploaded successfully`,
          });
        }
        return response;
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDocuments, toast]
  );

  // Export documents
  const exportDocuments = useCallback(
    async (format = "json", filters = {}) => {
      try {
        const blob = await documentService.exportDocuments(format, filters);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `documents-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: "Success",
          description: "Documents exported successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Load candidate list for dropdown
  const loadCandidateList = useCallback(async () => {
    try {
      const response = await documentService.getCandidateList();
      setCandidateList(response.candidates || []);
    } catch (err) {
      setCandidateList([]);
    }
  }, []);

  // Load company list for dropdown
  const loadCompanyList = useCallback(async () => {
    try {
      const response = await documentService.getCompanyList();
      setCompanyList(response.companies || []);
    } catch (err) {
      setCompanyList([]);
    }
  }, []);

  // Method to set selected candidate and load their documents
  const selectCandidate = async (candidateId) => {
    setSelectedCandidateId(candidateId);
    if (candidateId) {
      await loadCandidateDocuments({ candidateId });
    } else {
      await loadDocuments(); // Load all documents if no candidate selected
    }
  };

  // Method to set selected company and load their documents
  const selectCompany = async (companyId) => {
    setSelectedCompanyId(companyId);
    if (companyId) {
      await loadCompanyDocuments({ companyId });
    } else {
      await loadDocuments(); // Load all documents if no company selected
    }
  };

  // Initialize data on mount
  useEffect(() => {
    loadDocuments();
    loadTemplates();
    loadCategories();
    loadTags();
    loadUploaders();
    loadSharedDocuments();
    loadStats();
    loadCandidateList();
    loadCompanyList();
  }, [
    loadDocuments,
    loadTemplates,
    loadCategories,
    loadTags,
    loadUploaders,
    loadSharedDocuments,
    loadStats,
    loadCandidateList,
    loadCompanyList,
  ]);

  const value = {
    // State
    allDocuments: documents,
    templates,
    categories,
    tags,
    sharedDocuments,
    uploaders,
    loading,
    error,
    stats,
    page,
    limit,
    total,
    candidateList,
    selectedCandidateId,
    companyList,
    selectedCompanyId,

    // Actions
    loadDocuments,
    loadTemplates,
    loadCategories,
    loadTags,
    loadUploaders,
    loadSharedDocuments,
    loadStats,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    downloadDocument,
    shareDocument,
    createTemplate,
    createCategory,
    createTag,
    searchDocuments,
    bulkUpload,
    exportDocuments,
    loadCandidateList,
    loadCandidateDocuments,
    selectCandidate,
    loadCompanyList,
    loadCompanyDocuments,
    selectCompany,
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}

// Create a hook to use the context
export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }
  return context;
}
