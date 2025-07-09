"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/config/api";
import { candidateService } from "@/services/candidateService";
import { calculateTotalExperience } from "@/lib/utils";

const initialFilters = {
  status: "all",
  positions: [],
  skills: [],
  experience: [],
  searchQuery: "",
};

// Default values for filters
const defaultFilterValues = {
  positions: [
    "frontend",
    "backend",
    "fullstack",
    "ux",
    "product",
    "devops",
    "qa",
    "data scientist",
    "mobile",
    "project manager",
  ],
  skills: [
    "javascript",
    "react",
    "node",
    "python",
    "figma",
    "typescript",
    "angular",
    "vue",
    "java",
    "c#",
    "aws",
    "docker",
    "kubernetes",
    "sql",
    "nosql",
    "graphql",
    "rest",
    "git",
    "agile",
    "scrum",
  ],
  statuses: ["applicant", "candidate"],
};

// Status mapping for normalization
const statusMapping = {
  "on leave": "on_leave",
  on_leave: "on_leave",
  active: "active",
  inactive: "inactive",
  applied: "applied",
  screening: "screening",
  interview: "interview",
  assessment: "assessment",
  offer: "offer",
  hired: "hired",
  rejected: "rejected",
};

// Initial available positions and skills
const initialPositions = [
  "frontend",
  "backend",
  "fullstack",
  "ux",
  "product",
  "devops",
  "qa",
  "data scientist",
  "mobile",
  "project manager",
];

const initialSkills = [
  "javascript",
  "react",
  "node",
  "python",
  "figma",
  "typescript",
  "angular",
  "vue",
  "java",
  "c#",
  "aws",
  "docker",
  "kubernetes",
  "sql",
  "nosql",
  "graphql",
  "rest",
  "git",
  "agile",
  "scrum",
];

const CandidatesContext = createContext(undefined);

export function CandidatesProvider({ children }) {
  const [filters, setFilters] = useState({ ...initialFilters });
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onCandidateAdded, setOnCandidateAddedCallback] = useState(undefined);
  const [availablePositions, setAvailablePositions] = useState(
    defaultFilterValues.positions
  );
  const [availableSkills, setAvailableSkills] = useState(
    defaultFilterValues.skills
  );
  const [availableStatuses, setAvailableStatuses] = useState(
    defaultFilterValues.statuses
  );
  const [hasSkillsData, setHasSkillsData] = useState(false);

  // Fetch candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(api.candidates.getAll(), {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      const data = await response.json();
      console.log("data", data);

      // Calculate total experience for candidates that don't have it
      const candidatesWithExperience = data.data.map((candidate) => {
        if (
          !candidate.totalExperience &&
          candidate.workHistory &&
          candidate.workHistory.length > 0
        ) {
          candidate.totalExperience = calculateTotalExperience(
            candidate.workHistory
          );
        }
        return candidate;
      });

      setCandidates(candidatesWithExperience);

      // Set available positions and statuses from fetched data
      const uniquePositions = [
        ...new Set(
          candidatesWithExperience.map((c) => c.position).filter(Boolean)
        ),
      ];
      const uniqueStatuses = [
        ...new Set(
          candidatesWithExperience.map((c) => c.status).filter(Boolean)
        ),
      ];

      // Update available values, use defaults if empty
      setAvailablePositions(
        uniquePositions.length > 0
          ? uniquePositions
          : defaultFilterValues.positions
      );
      setAvailableStatuses(
        uniqueStatuses.length > 0
          ? uniqueStatuses
          : defaultFilterValues.statuses
      );
      setHasSkillsData(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function that can be called externally
  const refreshCandidates = async () => {
    await fetchCandidates();
  };

  const fetchCandidatesWithSkills = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching candidates with skills...");
      const response = await fetch(api.candidates.getAllWithSkills(), {
        credentials: "include",
      });
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log("Error response:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          `Failed to fetch candidates with skills: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Successfully fetched candidates with skills:", {
        count: data.data?.length || 0,
        hasSkillsData: true,
      });

      // Calculate total experience for candidates that don't have it
      const candidatesWithExperience = data.data.map((candidate) => {
        if (
          !candidate.totalExperience &&
          candidate.workHistory &&
          candidate.workHistory.length > 0
        ) {
          candidate.totalExperience = calculateTotalExperience(
            candidate.workHistory
          );
        }
        return candidate;
      });

      setCandidates(candidatesWithExperience);
      setHasSkillsData(true);
    } catch (err) {
      console.log("Error in fetchCandidatesWithSkills:", {
        error: err,
        message: err.message,
        stack: err.stack,
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setStatus = (status) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const togglePosition = (position) => {
    setFilters((prev) => {
      const positions = prev.positions.includes(position)
        ? prev.positions.filter((p) => p !== position)
        : [...prev.positions, position];
      return { ...prev, positions };
    });
  };

  const toggleSkill = (skill) => {
    setFilters((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];

      // If we don't have skills data yet and skills are being selected, fetch it
      if (!hasSkillsData && skills.length > 0) {
        fetchCandidatesWithSkills();
      } else if (hasSkillsData && skills.length === 0) {
        // If we have skills data but no skills are selected, fetch regular candidates
        fetchCandidates();
      }

      return { ...prev, skills };
    });
  };

  const toggleExperience = (experience) => {
    setFilters((prev) => {
      const experiences = prev.experience.includes(experience)
        ? prev.experience.filter((e) => e !== experience)
        : [...prev.experience, experience];
      return { ...prev, experience: experiences };
    });
  };

  const setSearchQuery = (searchQuery) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  const resetFilters = () => {
    setFilters({
      ...initialFilters,
      searchQuery: filters.searchQuery, // Preserve search query
    });
    // If we have skills data but no skills are selected, fetch regular candidates
    if (hasSkillsData) {
      fetchCandidates();
    }
  };

  // Calculate the number of active filters (excluding "all" status)
  const activeFilterCount =
    (!filters.status.includes("all") ? 1 : 0) + // Count as 1 if status is not "all"
    filters.positions.length +
    filters.skills.length +
    filters.experience.length;

  // Add a new candidate
  const addCandidate = async (candidateData) => {
    try {
      const response = await candidateService.createCandidate(candidateData);

      if (response.error) {
        throw new Error(response.error);
      }

      const newCandidate = response.data;

      // Calculate total experience for the new candidate
      if (newCandidate.workHistory && newCandidate.workHistory.length > 0) {
        newCandidate.totalExperience = calculateTotalExperience(
          newCandidate.workHistory
        );
      }

      setCandidates((prev) => [...prev, newCandidate]);

      // Notify listeners (like the matching system) about the new candidate
      if (onCandidateAdded) {
        onCandidateAdded(newCandidate);
      }
      return newCandidate;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Assign jobs to a candidate
  const assignJobsToCandidate = async (candidateId, jobIds) => {
    try {
      const response = await fetch(api.candidates.assignJobs(candidateId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobIds }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign jobs");
      }

      const data = await response.json();

      // Update local state
      setCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id === candidateId) {
            return {
              ...candidate,
              assignedJobs: jobIds,
            };
          }
          return candidate;
        })
      );

      return { data };
    } catch (error) {
      console.log("Error in assignJobsToCandidate:", error);
      setError(error.message);
      throw error;
    }
  };

  // Remove a job from a candidate
  const removeJobFromCandidate = async (candidateId, jobId) => {
    try {
      const response = await fetch(
        api.candidates.removeJob(candidateId, jobId),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove job assignment");
      }

      // Update local state
      setCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id === candidateId && candidate.assignedJobs) {
            return {
              ...candidate,
              assignedJobs: candidate.assignedJobs.filter((id) => id !== jobId),
            };
          }
          return candidate;
        })
      );

      return { success: true };
    } catch (error) {
      console.log("Error in removeJobFromCandidate:", error);
      setError(error.message);
      throw error;
    }
  };

  // Get all jobs assigned to a candidate
  const getCandidateJobs = async (candidateId) => {
    try {
      console.log("[CandidatesContext] getCandidateJobs: Starting", {
        candidateId,
      });

      const result = await candidateService.getCandidateJobs(candidateId);

      if (result.error) {
        console.log("[CandidatesContext] getCandidateJobs: Error", {
          candidateId,
          error: result.error,
        });
        throw new Error(result.error);
      }

      // Handle both response formats: { jobs: [...] } and direct array
      const jobs = result.jobs || result;

      console.log("[CandidatesContext] getCandidateJobs: Success", {
        candidateId,
        jobCount: jobs.length,
        jobs,
      });

      return jobs;
    } catch (error) {
      console.log("[CandidatesContext] getCandidateJobs: Error", {
        candidateId,
        error: error.message,
      });
      throw error;
    }
  };

  // Update candidate's job assignments
  const updateCandidateJobs = async (candidateId, jobIds) => {
    console.log("[CandidatesContext] updateCandidateJobs called", {
      candidateId,
      jobIds,
      currentCandidates: candidates,
    });

    try {
      console.log("[CandidatesContext] updateCandidateJobs: Calling API");
      const response = await fetch(api.candidates.assignJobs(candidateId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobIds }),
        credentials: "include",
      });

      if (response.error) {
        console.log("[CandidatesContext] updateCandidateJobs: API error", {
          error: response.error,
          candidateId,
          jobIds,
        });
        throw new Error(response.error);
      }

      console.log("[CandidatesContext] updateCandidateJobs: API success", {
        response,
        candidateId,
        jobIds,
      });

      // Update local state
      setCandidates((prevCandidates) => {
        const updatedCandidates = prevCandidates.map((candidate) => {
          if (candidate.id === candidateId) {
            console.log(
              "[CandidatesContext] updateCandidateJobs: Updating candidate",
              {
                candidateId,
                oldJobs:
                  candidate.assignedJobs ||
                  candidate.jobs?.map((job) => job.id),
                newJobs: jobIds,
              }
            );
            return {
              ...candidate,
              assignedJobs: jobIds,
              jobs: jobIds.map((id) => ({ id })), // Keep minimal job info
            };
          }
          return candidate;
        });

        console.log("[CandidatesContext] updateCandidateJobs: State updated", {
          candidateId,
          jobIds,
          candidatesCount: updatedCandidates.length,
        });

        return updatedCandidates;
      });

      return response.data;
    } catch (error) {
      console.log("[CandidatesContext] updateCandidateJobs: Error", {
        error,
        errorMessage: error.message,
        candidateId,
        jobIds,
      });
      throw error;
    }
  };

  // New methods for dynamic positions and skills
  const addPosition = (position) => {
    if (!availablePositions.includes(position)) {
      setAvailablePositions((prev) => [...prev, position]);
    }
  };

  const addSkill = (skill) => {
    if (!availableSkills.includes(skill)) {
      setAvailableSkills((prev) => [...prev, skill]);
    }
  };

  const removePosition = (position) => {
    // Remove from available positions
    setAvailablePositions((prev) => prev.filter((p) => p !== position));

    // Remove from filters if selected
    if (filters.positions.includes(position)) {
      setFilters((prev) => ({
        ...prev,
        positions: prev.positions.filter((p) => p !== position),
      }));
    }
  };

  const removeSkill = (skill) => {
    // Remove from available skills
    setAvailableSkills((prev) => prev.filter((s) => s !== skill));

    // Remove from filters if selected
    if (filters.skills.includes(skill)) {
      setFilters((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s !== skill),
      }));
    }
  };

  // Unified document API methods
  const uploadCandidateDocuments = async (
    candidateId,
    type,
    entityId,
    files
  ) => {
    return candidateService.uploadDocuments(candidateId, type, entityId, files);
  };
  const updateCandidateDocument = async (candidateId, documentId, file) => {
    return candidateService.updateDocument(candidateId, documentId, file);
  };
  const getCandidateDocuments = async (candidateId) => {
    return candidateService.getDocuments(candidateId);
  };
  const deleteCandidateDocument = async (candidateId, documentId) => {
    return candidateService.deleteDocument(candidateId, documentId);
  };

  return (
    <CandidatesContext.Provider
      value={{
        filters,
        setStatus,
        togglePosition,
        toggleSkill,
        toggleExperience,
        setSearchQuery,
        resetFilters,
        activeFilterCount,
        candidates,
        setCandidates,
        hasSkillsData,
        addCandidate,
        onCandidateAdded,
        setOnCandidateAdded: setOnCandidateAddedCallback,
        // Updated job assignment methods
        assignJobsToCandidate,
        removeJobFromCandidate,
        getCandidateJobs,
        updateCandidateJobs,
        availablePositions,
        availableSkills,
        availableStatuses,
        addPosition,
        addSkill,
        removePosition,
        removeSkill,
        isLoading,
        error,
        fetchCandidatesWithSkills,
        fetchCandidates,
        uploadCandidateDocuments,
        updateCandidateDocument,
        getCandidateDocuments,
        deleteCandidateDocument,
        refreshCandidates,
      }}
    >
      {children}
    </CandidatesContext.Provider>
  );
}

export function useCandidates() {
  const context = useContext(CandidatesContext);
  if (context === undefined) {
    throw new Error("useCandidates must be used within a CandidatesProvider");
  }
  return context;
}
