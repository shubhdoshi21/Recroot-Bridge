"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { communicationService } from "@/services/communicationService";
import { candidateService } from "@/services/candidateService";
import { jobService } from "@/services/jobService";
import { companyService } from "@/services/companyService";
import { getAllRecruiters } from "@/services/recruiterService";
import { getInterviews, getApplicationsWithCandidates } from "@/services/interviewService";
import { api } from "@/config/api";
import { useCandidates } from "@/contexts/candidates-context";
import { useJobs } from "@/contexts/jobs-context";
import { useCompanies } from "@/contexts/companies-context";
import { useRecruiters } from "@/contexts/recruiters-context";
import { useInterviews } from "@/contexts/interviews-context";
import { useOnboarding } from "@/contexts/onboarding-context";

// Communication context is discontinued. This file is now a stub for compatibility.
const CommunicationContext = createContext();

export function CommunicationProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { candidates, fetchCandidates: fetchCandidatesCtx } = useCandidates() || {};
  const { jobs, fetchJobs: fetchJobsCtx } = useJobs() || {};
  const { companies, fetchCompanies: fetchCompaniesCtx } = useCompanies() || {};
  const { recruiters, fetchRecruiters: fetchRecruitersCtx } = useRecruiters() || {};
  const { interviews, fetchInterviews: fetchInterviewsCtx } = useInterviews() || {};
  const { applications, fetchApplications: fetchApplicationsCtx } = useOnboarding() || {};
  const [automations, setAutomations] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [emailTemplatesLoading, setEmailTemplatesLoading] = useState(false);
  const [emailTemplatesError, setEmailTemplatesError] = useState(null);

  // Entity fetchers
  const fetchCandidates = fetchCandidatesCtx;
  const fetchJobs = fetchJobsCtx;
  const fetchCompanies = fetchCompaniesCtx;
  const fetchRecruiters = fetchRecruitersCtx;
  const fetchInterviews = fetchInterviewsCtx;
  const fetchApplications = fetchApplicationsCtx;

  // Automations
  const fetchAutomations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await communicationService.fetchAutomatedMessages();
      setAutomations(res || []);
      return res || [];
    } catch (err) {
      setError(err.message || "Failed to fetch automations");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAutomation = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communicationService.createAutomatedMessage(payload);
      await fetchAutomations();
      return res;
    } catch (err) {
      setError(err.message || "Failed to create automation");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAutomations]);

  const updateAutomation = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communicationService.updateAutomatedMessage(id, payload);
      await fetchAutomations();
      return res;
    } catch (err) {
      setError(err.message || "Failed to update automation");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAutomations]);

  const toggleAutomationStatus = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communicationService.toggleAutomatedMessageStatus(id);
      await fetchAutomations();
      return res;
    } catch (err) {
      setError(err.message || "Failed to toggle automation status");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAutomations]);

  const deleteAutomation = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communicationService.deleteAutomatedMessage(id);
      await fetchAutomations();
      return res;
    } catch (err) {
      setError(err.message || "Failed to delete automation");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAutomations]);

  // Automation helpers
  const runTestAutomation = useCallback(async (testPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communicationService.testAutomation(testPayload);
      return res;
    } catch (err) {
      setError(err.message || "Failed to test automation");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmailTemplates = useCallback(async () => {
    setEmailTemplatesLoading(true);
    setEmailTemplatesError(null);
    try {
      const res = await fetch(api.communications.emailTemplates.getAll(), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch email templates");
      const data = await res.json();
      setEmailTemplates(data || []);
      return data || [];
    } catch (err) {
      setEmailTemplatesError(err.message || "Failed to fetch email templates");
      return [];
    } finally {
      setEmailTemplatesLoading(false);
    }
  }, []);

  const entityLists = {
    candidates,
    jobs,
    companies,
    recruiters,
    interviews,
    applications,
  };

  const sendMessage = async (msgObj) => {
    // Use the communicationService.sendEmail which handles FormData for attachments
    return communicationService.sendEmail(msgObj);
  };

  const value = {
    loading,
    error,
    entityLists,
    automations,
    fetchCandidates,
    fetchJobs,
    fetchCompanies,
    fetchRecruiters,
    fetchInterviews,
    fetchApplications,
    fetchAutomations,
    createAutomation,
    updateAutomation,
    toggleAutomationStatus,
    deleteAutomation,
    runTestAutomation,
    emailTemplates,
    fetchEmailTemplates,
    emailTemplatesLoading,
    emailTemplatesError,
    sendMessage,
  };

  return (
    <CommunicationContext.Provider value={value}>
      {children}
    </CommunicationContext.Provider>
  );
}

export function useCommunication() {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error("useCommunication must be used within a CommunicationProvider");
  }
  return context;
}
