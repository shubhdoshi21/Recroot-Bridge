"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useCandidates } from "./candidates-context";
import { useJobs } from "./jobs-context";
import { api } from "@/config/api";
import { candidateService } from "@/services/candidateService";
import { jobService } from "@/services/jobService";

const defaultFilters = {
  skillsWeight: 40,
  experienceWeight: 35,
  educationWeight: 25,
  minMatchPercentage: 75,
  autoMatch: true, // Enable auto-match by default
};

const MatchingContext = createContext(undefined);

export function MatchingProvider({ children }) {
  const { candidates, refreshCandidates } = useCandidates();
  const { jobs: contextJobs } = useJobs();
  const [filters, setFilters] = useState(defaultFilters);
  const [matchedCandidates, setMatchedCandidates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const fetchInProgress = useRef(false);
  const latestFetchId = useRef(0);

  // Use jobs from the JobsContext instead of fetching separately
  useEffect(() => {
    if (contextJobs && contextJobs.length > 0) {
      setJobs(contextJobs);
      // If no job is selected yet or the selected job is no longer in the list, select the first job
      if (!selectedJob || !contextJobs.find(job => job.id === selectedJob.id)) {
        setSelectedJob(contextJobs[0]);
      }
    }
  }, [contextJobs, selectedJob]);

  // Fetch all jobs - keeping this as a backup and for explicit refresh
  const fetchAllJobs = useCallback(async () => {
    try {
      const response = await fetch(api.jobs.getAll(), {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJobs(data.jobs || []);
      if (data.jobs && data.jobs.length > 0) {
        setSelectedJob(data.jobs[0]);
      }
    } catch (err) {
      console.log("Error fetching jobs:", err);
      setError("Failed to fetch jobs");
    }
  }, []);

  // Function to manually refresh jobs when needed
  const refreshJobs = useCallback(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  // Fetch matched candidates for a specific job
  const fetchMatchedCandidatesForJob = useCallback(async (jobId) => {
    if (!jobId) return;

    const fetchId = ++latestFetchId.current;
    setLoading(true);
    setError(null);
    setMatchedCandidates({}); // Clear previous candidates for snappy UI

    try {
      const data = await jobService.getJobApplicants(jobId);

      const transformedCandidates = await Promise.all(
        data.map(async (applicant) => {
          const { data: fullCandidateData, error: candidateError } =
            await candidateService.getCandidateById(applicant.candidateId);

          if (candidateError) {
            return {
              id: applicant.id,
              candidateId: applicant.candidateId,
              name: applicant.name,
              title: applicant.position,
              avatar: applicant.avatar || "/placeholder.svg?height=40&width=40",
              matchPercentage: applicant.atsScore,
              skillsMatch: applicant.skillsMatch || 0,
              experienceMatch: applicant.experienceMatch || 0,
              educationMatch: applicant.educationMatch || 0,
              jobId: applicant.jobId,
              jobTitle: selectedJob?.jobTitle || "",
              dateMatched: applicant.assignedDate || new Date(),
              matchDetails: applicant.matchDetails || {},
              status: applicant.status,
            };
          }

          return {
            ...fullCandidateData,
            id: applicant.id,
            candidateId: fullCandidateData?.id || applicant.candidateId || applicant.id,
            jobId: applicant.jobId,
            jobTitle: selectedJob?.jobTitle || "",
            matchPercentage: applicant.atsScore,
            skillsMatch: applicant.skillsMatch || 0,
            experienceMatch: applicant.experienceMatch || 0,
            educationMatch: applicant.educationMatch || 0,
            dateMatched: applicant.assignedDate || new Date(),
            matchDetails: applicant.matchDetails || {},
            status: applicant.status,
          };
        })
      );

      // Only update state if this is the latest fetch
      if (fetchId === latestFetchId.current) {
        setMatchedCandidates({ [jobId]: transformedCandidates });
        setLoading(false);
      }
    } catch (err) {
      if (fetchId === latestFetchId.current) {
        setError("Failed to fetch matched candidates");
        setMatchedCandidates({});
        setLoading(false);
      }
    }
  }, [selectedJob, filters]);

  // Effect to fetch all jobs on initial load - keep as fallback
  useEffect(() => {
    if (!contextJobs || contextJobs.length === 0) {
      fetchAllJobs();
    }
  }, [fetchAllJobs, contextJobs]);

  // Effect to fetch matched candidates whenever the selectedJob changes
  useEffect(() => {
    if (selectedJob) {
      fetchMatchedCandidatesForJob(selectedJob.id);
    } else {
      setMatchedCandidates({});
    }
  }, [selectedJob, fetchMatchedCandidatesForJob]);

  // Handle updating a candidate's status in the CandidateJobMap
  const updateCandidateStatus = useCallback(async (candidateId, jobId, newStatus) => {
    try {
      // If status is being changed to 'applicant', use the dedicated service function
      if (newStatus === 'applicant') {
        await candidateService.applyToJob(candidateId, jobId, {
          status: 'Applied',
          appliedDate: new Date().toISOString(),
          source: 'ATS Matching'
        });
      } else {
        // For all other status changes (e.g., 'rejected' from sourcing view), use the dedicated service
        await jobService.updateSourcedCandidateStatus(jobId, candidateId, newStatus);
      }

      // Refresh the matched candidates for the current job
      if (selectedJob) {
        fetchMatchedCandidatesForJob(selectedJob.id);
      }

      // Refresh the main candidates list to reflect status changes
      await refreshCandidates();

      return true;
    } catch (err) {
      console.log("Error updating candidate status:", err);
      throw err;
    }
  }, [selectedJob, fetchMatchedCandidatesForJob, refreshCandidates]);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      matchedCandidates,
      loading,
      error,
      jobs,
      selectedJob,
      setSelectedJob,
      updateCandidateStatus,
      refreshJobs,
    }),
    [
      filters,
      matchedCandidates,
      loading,
      error,
      jobs,
      selectedJob,
      setSelectedJob,
      updateCandidateStatus,
      refreshJobs,
    ]
  );

  return (
    <MatchingContext.Provider value={value}>
      {children}
    </MatchingContext.Provider>
  );
}

export function useMatching() {
  const context = useContext(MatchingContext);
  if (context === undefined) {
    throw new Error("useMatching must be used within a MatchingProvider");
  }
  return context;
}