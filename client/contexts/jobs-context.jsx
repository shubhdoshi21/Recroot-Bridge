"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { jobService } from "@/services/jobService";
import { toast } from "sonner";
import { useCandidates } from "@/contexts/candidates-context";

const JobsContext = createContext({});

const initialFilters = {
  status: "all",
  departments: [],
  locations: [],
  types: [],
  searchQuery: "",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  order: "DESC",
};

// Default filter values
const defaultFilterValues = {
  departments: [
    { id: "engineering", label: "Engineering" },
    { id: "design", label: "Design" },
    { id: "sales", label: "Sales" },
    { id: "marketing", label: "Marketing" },
    { id: "executive", label: "Executive" },
  ],
  locations: [
    { id: "san-francisco", label: "San Francisco, CA" },
    { id: "new-york", label: "New York, NY" },
    { id: "chicago", label: "Chicago, IL" },
    { id: "austin", label: "Austin, TX" },
    { id: "remote", label: "Remote" },
  ],
  types: [
    { id: "full-time", label: "Full Time" },
    { id: "part-time", label: "Part Time" },
    { id: "contract", label: "Contract" },
    { id: "internship", label: "Internship" },
  ],
  statuses: ["active", "draft", "closed"],
};

export function JobsProvider({ children }) {
  const { refreshCandidates } = useCandidates();
  // State
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [availableDepartments, setAvailableDepartments] = useState(
    defaultFilterValues.departments
  );
  const [availableLocations, setAvailableLocations] = useState(
    defaultFilterValues.locations
  );
  const [availableTypes, setAvailableTypes] = useState(
    defaultFilterValues.types
  );
  const [availableStatuses, setAvailableStatuses] = useState(
    defaultFilterValues.statuses
  );
  const [error, setError] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [stats, setStats] = useState(null);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy);
  const [page, setPage] = useState(initialFilters.page);

  // Calculate active filter count
  const activeFilterCount =
    (filters.departments.length || 0) +
    (filters.locations.length || 0) +
    (filters.types.length || 0) +
    (filters.status !== "all" ? 1 : 0);

  // Fetch initial data
  useEffect(() => {
    console.log("Initial fetch triggered");
    fetchJobs();
    fetchReferenceData();
  }, []);

  // Update available filter values when jobs change
  useEffect(() => {
    if (jobs.length > 0) {
      // Extract unique departments
      const uniqueDepartments = [
        ...new Set(jobs.map((job) => job.department)),
      ].filter(Boolean);
      const departmentOptions = uniqueDepartments.map((dept) => ({
        id: dept.toLowerCase().replace(/\s+/g, "-"),
        label: dept,
      }));

      // Extract unique locations and normalize/deduplicate
      const locationMap = new Map();
      jobs.forEach((job) => {
        if (!job.location) return;
        const normalized = job.location
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        // If not already in the map, add it; otherwise, prefer the most common label
        if (!locationMap.has(normalized)) {
          locationMap.set(normalized, {
            id: normalized,
            label: job.location.trim(),
          });
        } else {
          // Optionally, you could implement logic to pick the most common label
          // For now, keep the first encountered label
        }
      });
      const locationOptions = Array.from(locationMap.values());

      // Extract unique job types and normalize them
      const uniqueTypes = [...new Set(jobs.map((job) => job.jobType))].filter(
        Boolean
      );

      // Create a Map to ensure unique IDs while preserving the most recent label
      const typeMap = new Map();
      uniqueTypes.forEach((type) => {
        const normalizedId = type.trim().toLowerCase().replace(/\s+/g, "-");
        // Only add if we haven't seen this normalized ID before
        if (!typeMap.has(normalizedId)) {
          typeMap.set(normalizedId, {
            id: normalizedId,
            label: type.trim(),
          });
        }
      });

      // Convert Map to array of unique types
      const typeOptions = Array.from(typeMap.values());

      // Extract unique statuses
      const uniqueStatuses = [
        ...new Set(jobs.map((job) => job.jobStatus)),
      ].filter(Boolean);

      // Update available filter values
      setAvailableDepartments(
        departmentOptions.length > 0
          ? departmentOptions
          : defaultFilterValues.departments
      );
      setAvailableLocations(
        locationOptions.length > 0
          ? locationOptions
          : defaultFilterValues.locations
      );
      setAvailableTypes(typeOptions);
      setAvailableStatuses(
        uniqueStatuses.length > 0
          ? uniqueStatuses
          : defaultFilterValues.statuses
      );
    }
  }, [jobs]);

  // Core operations
  const fetchJobs = useCallback(
    async (params) => {
      try {
        console.log("Fetching jobs with filters:", filters);
        setIsLoading(true);
        setError(null);

        const response = await jobService.getAllJobsWithApplicantsCount();
        console.log("Received jobs data:", response);

        // Accept both array and object-with-jobs-property
        let jobsArray, total, totalPages;
        if (Array.isArray(response)) {
          jobsArray = response;
          total = response.length;
          totalPages = 1;
        } else if (response && Array.isArray(response.jobs)) {
          jobsArray = response.jobs;
          total = response.total || response.jobs.length;
          totalPages = response.totalPages || 1;
        } else {
          console.log("Invalid jobs data received:", response);
          throw new Error("Invalid jobs data received from server");
        }

        // Store complete job data
        const normalizedJobs = jobsArray.map((job) => ({
          id: job.id || `temp-${Date.now()}`,
          jobTitle: job.jobTitle || "",
          company:
            job.company?.name ||
            job.companyName ||
            job.company ||
            "Company Not Specified",
          companyId: job.companyId || job.company?.id,
          department: job.department || "",
          location: job.location || "",
          jobType: job.jobType || "",
          jobStatus: job.jobStatus || "active",
          experienceLevel: job.experienceLevel || "entry",
          description: job.description || "",
          requirements: job.requirements || "",
          responsibilities: job.responsibilities || "",
          benefits: job.benefits || "",
          requiredSkills: Array.isArray(job.requiredSkills)
            ? job.requiredSkills
            : typeof job.requiredSkills === "string"
              ? job.requiredSkills
              : Array.isArray(job.skills)
                ? job.skills
                : [],
          postedDate: job.postedDate || null,
          deadline: job.deadline || null,
          salaryMin: job.salaryMin || 0,
          salaryMax: job.salaryMax || 0,
          openings: job.openings || 1,
          workType: job.workType || "remote",
          applicants: job.applicants || 0,
          applications: job.applications || 0,
          conversionRate: job.conversionRate || 0,
          applicationStages: job.applicationStages,
        }));

        setJobs(normalizedJobs);
        setTotalJobs(total);

        // Update stats based on the fetched data
        const activeJobsCount = normalizedJobs.filter(
          (job) => job.jobStatus.toLowerCase() === "active"
        ).length;

        const totalApplications = normalizedJobs.reduce(
          (sum, job) => sum + job.applicants,
          0
        );

        setStats({
          totalJobs: total,
          activeJobs: activeJobsCount,
          totalApplications,
          averageApplications:
            normalizedJobs.length > 0
              ? totalApplications / normalizedJobs.length
              : 0,
        });
      } catch (error) {
        console.log("Error fetching jobs:", error);
        setError(error.message);
        setJobs([]);
        toast.error("Failed to fetch jobs");
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  const fetchReferenceData = useCallback(async () => {
    try {
      console.log("Fetching reference data");
      const [depts, locs, types] = await Promise.all([
        jobService.getDepartments(),
        jobService.getLocations(),
        jobService.getJobTypes(),
      ]);
      console.log("Received reference data:", { depts, locs, types });

      setAvailableDepartments(depts);
      setAvailableLocations(locs);
      setAvailableTypes(types);
    } catch (error) {
      console.log("Error fetching reference data:", error);
      toast.error("Failed to fetch reference data");
    }
  }, []);

  const fetchJobApplicants = useCallback(async (jobId, options = {}) => {
    if (!jobId) return;
    try {
      setIsLoadingApplicants(true);
      const fetchedApplicants = await jobService.getJobApplicants(
        jobId,
        options
      );
      setApplicants(fetchedApplicants);
      return fetchedApplicants;
    } catch (error) {
      console.log(`Error fetching applicants for job ${jobId}:`, error);
      toast.error("Failed to fetch applicants.");
    } finally {
      setIsLoadingApplicants(false);
    }
  }, []);

  // Applicant-related operations
  const updateApplicantStatus = async (applicationId, newStatus) => {
    try {
      const updatedApplicant = await jobService.updateApplicantStatus(
        applicationId,
        newStatus
      );
      setApplicants((prevApplicants) =>
        prevApplicants.map((app) =>
          app.applicationId === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );

      // Refresh the candidates list to reflect status changes
      await refreshCandidates();

      toast.success("Applicant status updated successfully!");
      return updatedApplicant;
    } catch (error) {
      console.log("Error updating applicant status in context:", error);
      toast.error(
        error.message || "Failed to update applicant status. Please try again."
      );
      throw error;
    }
  };

  // Filter operations
  const setStatus = useCallback((status) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const updateFilters = useCallback((filterType, value, checked) => {
    setFilters((prev) => {
      if (filterType === "status") {
        return { ...prev, status: value };
      }

      const currentValues = prev[filterType] || [];
      let updatedValues;

      if (checked !== undefined) {
        // Checkbox behavior
        updatedValues = checked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value);
      } else {
        // Toggle behavior
        updatedValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
      }

      return { ...prev, [filterType]: updatedValues };
    });
  }, []);

  const setSearchQuery = useCallback((searchQuery) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Job operations
  const addJob = useCallback(
    async (jobData) => {
      try {
        setIsLoading(true);
        console.log("Creating job with data:", jobData);
        const newJob = await jobService.createJob(jobData);

        setJobs((prev) => {
          const updatedJobs = [...prev, newJob];

          // Update available filter values
          const uniqueDepartments = [
            ...new Set(updatedJobs.map((job) => job.department)),
          ].filter(Boolean);
          const departmentOptions = uniqueDepartments.map((dept) => ({
            id: dept.toLowerCase().replace(/\s+/g, "-"),
            label: dept,
          }));

          const uniqueLocations = [
            ...new Set(updatedJobs.map((job) => job.location)),
          ].filter(Boolean);
          const locationOptions = uniqueLocations.map((loc) => ({
            id: loc.toLowerCase().replace(/\s+/g, "-"),
            label: loc,
          }));

          const uniqueTypes = [
            ...new Set(updatedJobs.map((job) => job.jobType)),
          ].filter(Boolean);
          const typeOptions = uniqueTypes.map((type) => ({
            id: type.toLowerCase().replace(/\s+/g, "-"),
            label: type,
          }));

          const uniqueStatuses = [
            ...new Set(updatedJobs.map((job) => job.jobStatus)),
          ].filter(Boolean);

          setAvailableDepartments(
            departmentOptions.length > 0
              ? departmentOptions
              : defaultFilterValues.departments
          );
          setAvailableLocations(
            locationOptions.length > 0
              ? locationOptions
              : defaultFilterValues.locations
          );
          setAvailableTypes(
            typeOptions.length > 0 ? typeOptions : defaultFilterValues.types
          );
          setAvailableStatuses(
            uniqueStatuses.length > 0
              ? uniqueStatuses
              : defaultFilterValues.statuses
          );

          return updatedJobs;
        });

        return newJob;
      } catch (error) {
        console.log("[JobsContext] Error in addJob:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchJobs]
  );

  const updateJob = async (id, jobData) => {
    try {
      console.log("[JobsContext] Starting job update:", { id, jobData });

      // Validate required fields
      const requiredFields = [
        "jobTitle",
        "department",
        "location",
        "jobType",
        "description",
        "requirements",
      ];
      const missingFields = requiredFields.filter((field) => !jobData[field]);

      if (missingFields.length > 0) {
        console.log("[JobsContext] Missing required fields:", missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Normalize job type
      if (jobData.jobType) {
        jobData.jobType = jobData.jobType.toLowerCase().replace(/\s+/g, "-");
      }

      setIsLoading(true);
      const updatedJob = await jobService.updateJob(id, jobData);
      setJobs((prev) => prev.map((job) => (job.id === id ? updatedJob : job)));
      toast.success("Job updated successfully");
      return updatedJob;
    } catch (error) {
      console.log("[JobsContext] Error in updateJob:", error);
      toast.error("Failed to update job");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJob = useCallback(async (id) => {
    try {
      setIsLoading(true);
      await jobService.deleteJob(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
      toast.success("Job deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateJob = useCallback(async (jobId) => {
    try {
      setIsLoading(true);
      const duplicatedJob = await jobService.duplicateJob(jobId);
      setJobs((prev) => [duplicatedJob, ...prev]);
      toast.success("Job duplicated successfully");
      return duplicatedJob;
    } catch (error) {
      toast.error("Failed to duplicate job");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const archiveJob = useCallback(async (jobId) => {
    try {
      setIsLoading(true);
      const archivedJob = await jobService.archiveJob(jobId);
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? archivedJob : job))
      );
      toast.success("Job archived successfully");
      return archivedJob;
    } catch (error) {
      toast.error("Failed to archive job");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateJobStatus = useCallback(async (jobId, status) => {
    try {
      setIsLoading(true);
      const updatedJob = await jobService.updateJobStatus(jobId, status);
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, jobStatus: status } : job
        )
      );
      toast.success("Job status updated successfully");
      return updatedJob;
    } catch (error) {
      console.log("[JobsContext] Error in updateJobStatus:", error);
      toast.error("Failed to update job status");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Filter jobs based on current filters
  const filteredJobs = jobs.filter((job) => {
    // Status filter
    if (
      filters.status !== "all" &&
      job.jobStatus?.toLowerCase() !== filters.status.toLowerCase()
    ) {
      return false;
    }

    // Department filter
    if (
      filters.departments.length > 0 &&
      !filters.departments.includes(job.department)
    ) {
      return false;
    }

    // Location filter
    if (
      filters.locations.length > 0 &&
      !filters.locations.includes(job.location)
    ) {
      return false;
    }

    // Job type filter
    if (filters.types.length > 0) {
      const jobType = job.type || job.jobType;
      if (
        !jobType ||
        !filters.types.includes(jobType.toLowerCase().replace(/\s+/g, "-"))
      ) {
        return false;
      }
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        job.jobTitle.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        (job.type || job.jobType || "")?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const value = {
    jobs,
    selectedJob,
    applicants,
    isLoading,
    isLoadingApplicants,
    error,
    filteredJobs,
    filters,
    availableDepartments,
    availableLocations,
    availableTypes,
    availableStatuses,
    totalJobs,
    stats,
    activeFilterCount,
    setStatus,
    updateFilters,
    resetFilters,
    setSearchQuery,
    setSortBy,
    setPage,
    fetchJobs,
    fetchReferenceData,
    addJob,
    updateJob,
    deleteJob,
    duplicateJob,
    archiveJob,
    updateJobStatus,
    updateApplicantStatus,
    jobService,
    setSelectedJob,
    fetchJobApplicants,
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
}
