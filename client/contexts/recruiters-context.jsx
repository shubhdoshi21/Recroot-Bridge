"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  getAllRecruiters,
  createRecruiter,
  updateRecruiter as updateRecruiterApi,
  deleteRecruiter as deleteRecruiterApi,
  getRecruiterStats,
  getUnassignedJobs,
  getRecruiterJobs,
  assignJobToRecruiter,
  removeJobFromRecruiter,
} from "../services/recruiterService";
import { useToast } from "@/hooks/use-toast";

// Initial filter state
const initialFilters = {
  status: "all",
  departments: [],
  specializations: [],
  performance: [],
  searchQuery: "",
};

// Default values for filters
const defaultFilterValues = {
  departments: [
    "Technical Recruiting",
    "Corporate Recruiting",
    "Campus Recruiting",
    "Executive Recruiting",
  ],
  specializations: [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Executive",
    "Entry Level",
  ],
  statuses: ["active", "inactive", "on_leave"],
  performance: ["High Performers", "Mid Performers", "Low Performers"],
};

// Status mapping for normalization
const statusMapping = {
  "on leave": "on_leave",
  on_leave: "on_leave",
  active: "active",
  inactive: "inactive",
};

// Create context
const RecruitersContext = createContext(undefined);

// Provider component
export function RecruitersProvider({ children }) {
  const { toast } = useToast();
  const [allRecruiters, setAllRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recruiterStats, setRecruiterStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [recruiterJobs, setRecruiterJobs] = useState({});
  const [availableDepartments, setAvailableDepartments] = useState(
    defaultFilterValues.departments
  );
  const [availableSpecializations, setAvailableSpecializations] = useState(
    defaultFilterValues.specializations
  );
  const [availableStatuses, setAvailableStatuses] = useState(
    defaultFilterValues.statuses
  );
  const [availablePerformance, setAvailablePerformance] = useState(
    defaultFilterValues.performance
  );

  // Fetch all recruiters on component mount
  useEffect(() => {
    fetchRecruiters();
    fetchRecruiterStats();
  }, []);

  // Apply filters whenever filters or allRecruiters change
  useEffect(() => {
    applyFilters();
  }, [filters, allRecruiters, currentPage, limit]);

  // Apply filters to recruiters
  const applyFilters = () => {
    console.group("Applying Filters");
    console.log("Initial state:", {
      totalRecruiters: allRecruiters.length,
      currentFilters: filters,
      currentPage,
      limit,
    });

    let filtered = [...allRecruiters];

    // Apply status filter
    if (filters.status !== "all") {
      const beforeCount = filtered.length;
      const normalizedStatus =
        statusMapping[filters.status.toLowerCase()] ||
        filters.status.toLowerCase();

      // Debug log for all recruiters' statuses
      console.log(
        "All recruiters statuses:",
        allRecruiters.map((r) => ({
          id: r.id,
          status: r.status,
          normalizedStatus: r.status?.toLowerCase(),
        }))
      );

      console.log("Status normalization:", {
        originalStatus: filters.status,
        normalizedStatus: normalizedStatus,
        statusMapping: statusMapping,
      });

      filtered = filtered.filter((recruiter) => {
        const recruiterStatus = recruiter.status?.toLowerCase();
        const matches = recruiterStatus === normalizedStatus;

        // Debug log for each recruiter's status comparison
        console.log("Status comparison:", {
          recruiterId: recruiter.id,
          recruiterStatus,
          normalizedStatus,
          matches,
          originalStatus: recruiter.status,
        });

        return matches;
      });

      console.log("Status filter results:", {
        filter: filters.status,
        normalizedFilter: normalizedStatus,
        beforeCount,
        afterCount: filtered.length,
        removed: beforeCount - filtered.length,
        filteredRecruiters: filtered.map((r) => ({
          id: r.id,
          status: r.status,
          normalizedStatus: r.status?.toLowerCase(),
        })),
      });
    }

    // Apply department filter
    if (filters.departments.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((recruiter) =>
        filters.departments.includes(recruiter.department)
      );
      console.log("Department filter:", {
        departments: filters.departments,
        beforeCount,
        afterCount: filtered.length,
        removed: beforeCount - filtered.length,
      });
    }

    // Apply specialization filter
    if (filters.specializations.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((recruiter) =>
        filters.specializations.includes(recruiter.specialization)
      );
      console.log("Specialization filter:", {
        specializations: filters.specializations,
        beforeCount,
        afterCount: filtered.length,
        removed: beforeCount - filtered.length,
      });
    }

    // Apply performance filter
    if (filters.performance.length > 0) {
      const beforeCount = filtered.length;
      const highPerformers = filters.performance.includes("High Performers")
        ? filtered.filter((r) => r.hires >= 10)
        : [];
      const midPerformers = filters.performance.includes("Mid Performers")
        ? filtered.filter((r) => r.hires >= 5 && r.hires < 10)
        : [];
      const lowPerformers = filters.performance.includes("Low Performers")
        ? filtered.filter((r) => r.hires < 5)
        : [];

      filtered = [...highPerformers, ...midPerformers, ...lowPerformers];
      filtered = Array.from(new Set(filtered.map((r) => r.id))).map((id) =>
        filtered.find((r) => r.id === id)
      );

      console.log("Performance filter:", {
        performance: filters.performance,
        beforeCount,
        afterCount: filtered.length,
        removed: beforeCount - filtered.length,
      });
    }

    // Apply search query
    if (filters.searchQuery) {
      const beforeCount = filtered.length;
      const query = filters.searchQuery.toLowerCase().trim();

      // Split search query into words
      const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

      console.log("Search terms:", {
        originalQuery: filters.searchQuery,
        normalizedQuery: query,
        searchTerms,
      });

      filtered = filtered.filter((recruiter) => {
        // Create searchable text from recruiter fields
        const searchableText = [
          recruiter.firstName,
          recruiter.lastName,
          `${recruiter.firstName} ${recruiter.lastName}`, // Full name
          recruiter.email,
          recruiter.department,
          recruiter.specialization,
        ]
          .filter(Boolean)
          .map((text) => text.toLowerCase())
          .join(" ");

        // Check if all search terms are found in the searchable text
        const matches = searchTerms.every((term) =>
          searchableText.includes(term)
        );

        console.log("Search comparison:", {
          recruiterId: recruiter.id,
          searchableText,
          searchTerms,
          matches,
          firstName: recruiter.firstName,
          lastName: recruiter.lastName,
        });

        return matches;
      });

      console.log("Search filter:", {
        query: filters.searchQuery,
        normalizedQuery: query,
        searchTerms,
        beforeCount,
        afterCount: filtered.length,
        removed: beforeCount - filtered.length,
        sampleMatches: filtered.slice(0, 2).map((r) => ({
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          fullName: `${r.firstName} ${r.lastName}`,
          email: r.email,
          department: r.department,
          specialization: r.specialization,
        })),
      });
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecruiters = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / limit);

    console.log("Pagination:", {
      totalItems: filtered.length,
      currentPage,
      itemsPerPage: limit,
      totalPages,
      startIndex,
      endIndex,
      paginatedCount: paginatedRecruiters.length,
    });

    setFilteredRecruiters(paginatedRecruiters);
    setTotalPages(totalPages);
    console.groupEnd();
  };

  // Fetch recruiter statistics
  const fetchRecruiterStats = async () => {
    try {
      const stats = await getRecruiterStats();
      setRecruiterStats(stats);
    } catch (error) {
      console.log("Error fetching recruiter stats:", error);
      setError("Failed to fetch recruiter statistics");
    }
  };

  // Fetch all recruiters
  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const result = await getAllRecruiters();
      const recruiters = result.recruiters || [];
      setAllRecruiters(recruiters);

      // Set available departments and specializations
      const uniqueDepartments = [
        ...new Set(recruiters.map((r) => r.department).filter(Boolean)),
      ];
      const uniqueSpecializations = [
        ...new Set(recruiters.map((r) => r.specialization).filter(Boolean)),
      ];
      const uniqueStatuses = [
        ...new Set(recruiters.map((r) => r.status).filter(Boolean)),
      ];

      // Calculate available performance levels based on hires
      const hasHighPerformers = recruiters.some((r) => r.hires >= 10);
      const hasMidPerformers = recruiters.some(
        (r) => r.hires >= 5 && r.hires < 10
      );
      const hasLowPerformers = recruiters.some((r) => r.hires < 5);

      const availablePerformanceLevels = [];
      if (hasHighPerformers) availablePerformanceLevels.push("High Performers");
      if (hasMidPerformers) availablePerformanceLevels.push("Mid Performers");
      if (hasLowPerformers) availablePerformanceLevels.push("Low Performers");

      // Set available values, use defaults if empty
      setAvailableDepartments(
        uniqueDepartments.length > 0
          ? uniqueDepartments
          : defaultFilterValues.departments
      );
      setAvailableSpecializations(
        uniqueSpecializations.length > 0
          ? uniqueSpecializations
          : defaultFilterValues.specializations
      );
      setAvailableStatuses(
        uniqueStatuses.length > 0
          ? uniqueStatuses
          : defaultFilterValues.statuses
      );
      setAvailablePerformance(
        availablePerformanceLevels.length > 0
          ? availablePerformanceLevels
          : defaultFilterValues.performance
      );

      setError(null);
    } catch (error) {
      console.log("Error fetching recruiters:", error);
      setError("Failed to fetch recruiters");
    } finally {
      setLoading(false);
    }
  };

  // Filter update functions
  const setStatus = (status) => {
    setFilters((prev) => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const toggleDepartment = (department) => {
    setFilters((prev) => {
      const departments = prev.departments.includes(department)
        ? prev.departments.filter((d) => d !== department)
        : [...prev.departments, department];
      return { ...prev, departments };
    });
    setCurrentPage(1);
  };

  const toggleSpecialization = (specialization) => {
    setFilters((prev) => {
      const specializations = prev.specializations.includes(specialization)
        ? prev.specializations.filter((s) => s !== specialization)
        : [...prev.specializations, specialization];
      return { ...prev, specializations };
    });
    setCurrentPage(1);
  };

  const togglePerformance = (performance) => {
    setFilters((prev) => {
      const performances = prev.performance.includes(performance)
        ? prev.performance.filter((p) => p !== performance)
        : [...prev.performance, performance];
      return { ...prev, performance: performances };
    });
    setCurrentPage(1);
  };

  const setSearchQuery = (searchQuery) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
    setCurrentPage(1);
  };

  // For backward compatibility
  const updateFilter = (key, value) => {
    console.log("Updating filter:", { key, value });
    switch (key) {
      case "status":
        setStatus(value);
        break;
      case "departments":
        if (Array.isArray(value)) {
          setFilters((prev) => ({ ...prev, departments: value }));
        } else {
          toggleDepartment(value);
        }
        break;
      case "specializations":
        if (Array.isArray(value)) {
          setFilters((prev) => ({ ...prev, specializations: value }));
        } else {
          toggleSpecialization(value);
        }
        break;
      case "performance":
        if (Array.isArray(value)) {
          setFilters((prev) => ({ ...prev, performance: value }));
        } else {
          togglePerformance(value);
        }
        break;
      case "searchQuery":
        setSearchQuery(value);
        break;
      default:
        setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  // Calculate active filter count
  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    filters.departments.length +
    filters.specializations.length +
    filters.performance.length;

  // Add a new recruiter
  const addRecruiter = async (newRecruiterData) => {
    try {
      setLoading(true);
      const newRecruiter = await createRecruiter(newRecruiterData);
      await fetchRecruiters();
      toast({
        title: "Success",
        description: "Recruiter added successfully",
      });
      return newRecruiter;
    } catch (error) {
      console.log("Error adding recruiter:", error);
      toast({
        title: "Error",
        description: "Failed to add recruiter",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing recruiter
  const updateRecruiter = async (id, updatedRecruiterData) => {
    try {
      setLoading(true);
      const updatedRecruiter = await updateRecruiterApi(
        id,
        updatedRecruiterData
      );
      await fetchRecruiters();
      toast({
        title: "Success",
        description: "Recruiter updated successfully",
      });
      return updatedRecruiter;
    } catch (error) {
      console.log(`Error updating recruiter ${id}:`, error);
      toast({
        title: "Error",
        description: "Failed to update recruiter",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a recruiter
  const deleteRecruiter = async (id) => {
    try {
      setLoading(true);
      await deleteRecruiterApi(id);
      await fetchRecruiters();
      toast({
        title: "Success",
        description: "Recruiter deleted successfully",
      });
    } catch (error) {
      console.log(`Error deleting recruiter ${id}:`, error);
      toast({
        title: "Error",
        description: "Failed to delete recruiter",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add job assignment methods
  const getRecruiterAssignedJobs = async (recruiterId) => {
    try {
      console.log("[RecruitersContext] getRecruiterAssignedJobs: Starting", {
        recruiterId,
      });

      const result = await getRecruiterJobs(recruiterId);

      if (result.error) {
        console.log("[RecruitersContext] getRecruiterAssignedJobs: Error", {
          recruiterId,
          error: result.error,
        });
        throw new Error(result.error);
      }

      // Update local state
      setRecruiterJobs((prev) => ({
        ...prev,
        [recruiterId]: result,
      }));

      console.log("[RecruitersContext] getRecruiterAssignedJobs: Success", {
        recruiterId,
        jobCount: result.length,
        jobs: result,
      });

      return result;
    } catch (error) {
      console.log("[RecruitersContext] getRecruiterAssignedJobs: Error", {
        recruiterId,
        error: error.message,
      });
      throw error;
    }
  };

  const updateRecruiterJobs = async (recruiterId, jobIds) => {
    console.log("[RecruitersContext] updateRecruiterJobs called", {
      recruiterId,
      jobIds,
      currentRecruiters: allRecruiters,
    });

    try {
      // First get current assignments
      const currentJobs = await getRecruiterJobs(recruiterId);
      const currentJobIds = currentJobs.map((job) => job.jobId);

      // Determine jobs to add and remove
      const jobsToAdd = jobIds.filter((id) => !currentJobIds.includes(id));
      const jobsToRemove = currentJobIds.filter((id) => !jobIds.includes(id));

      // Add new jobs
      for (const jobId of jobsToAdd) {
        await assignJobToRecruiter(recruiterId, {
          jobId,
          priorityLevel: "normal",
        });
      }

      // Remove unassigned jobs
      for (const jobId of jobsToRemove) {
        await removeJobFromRecruiter(recruiterId, jobId);
      }

      // Update local state
      setRecruiterJobs((prev) => ({
        ...prev,
        [recruiterId]: jobIds.map((id) => ({ jobId: id })),
      }));

      // Update recruiter's active jobs count
      setAllRecruiters((prevRecruiters) =>
        prevRecruiters.map((recruiter) => {
          if (recruiter.id === recruiterId) {
            return {
              ...recruiter,
              activeJobs: jobIds.length,
            };
          }
          return recruiter;
        })
      );

      console.log("[RecruitersContext] updateRecruiterJobs: Success", {
        recruiterId,
        jobIds,
        jobsAdded: jobsToAdd,
        jobsRemoved: jobsToRemove,
      });

      return { success: true };
    } catch (error) {
      console.log("[RecruitersContext] updateRecruiterJobs: Error", {
        error,
        errorMessage: error.message,
        recruiterId,
        jobIds,
      });
      throw error;
    }
  };

  return (
    <RecruitersContext.Provider
      value={{
        recruiters: allRecruiters,
        filteredRecruiters,
        filters,
        setStatus,
        toggleDepartment,
        toggleSpecialization,
        togglePerformance,
        setSearchQuery,
        updateFilter,
        resetFilters,
        activeFilterCount,
        addRecruiter,
        updateRecruiter,
        deleteRecruiter,
        loading,
        error,
        recruiterStats,
        currentPage,
        totalPages,
        limit,
        setCurrentPage,
        setLimit,
        isFilterCollapsed,
        setIsFilterCollapsed,
        getRecruiterAssignedJobs,
        updateRecruiterJobs,
        recruiterJobs,
        availableDepartments,
        availableSpecializations,
        availableStatuses,
        availablePerformance,
      }}
    >
      {children}
    </RecruitersContext.Provider>
  );
}

// Custom hook to use the context
export function useRecruiters() {
  const context = useContext(RecruitersContext);
  if (context === undefined) {
    throw new Error("useRecruiters must be used within a RecruitersProvider");
  }
  return context;
}
