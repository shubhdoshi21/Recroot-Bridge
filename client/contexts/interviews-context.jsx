"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  getCandidateInterviews,
  getApplicationInterviews,
  getCandidatesWithApplications,
  getApplicationsWithCandidates,
  getPipelineStages,
  getCandidateWithDetails,
  getApplicationWithDetails,
  getCandidateInterviewsWithDetails,
  getApplicationInterviewsWithDetails,
} from "@/services/interviewService";
import { buildAutomationContext } from "@/lib/utils";
import { communicationService } from "@/services/communicationService";
import { useAuth } from "@/contexts/auth-context";

// Initial interviews data
const initialInterviews = [
  {
    id: 1,
    candidate: "Alex Johnson",
    candidateId: "alex-johnson",
    position: "Frontend Developer",
    date: "2025-03-24",
    time: "10:00 AM",
    duration: "60",
    type: "video",
    status: "upcoming",
    interviewer: "John Smith",
    notes:
      "Candidate has 5 years of React experience. Focus on system design skills.",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 2,
    candidate: "Sarah Williams",
    candidateId: "sarah-williams",
    position: "UX Designer",
    date: "2025-03-24",
    time: "2:30 PM",
    duration: "45",
    type: "video",
    status: "upcoming",
    interviewer: "Lisa Wong",
    notes:
      "Portfolio review. Ask about design process and collaboration experience.",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 3,
    candidate: "Michael Brown",
    candidateId: "michael-brown",
    position: "Product Manager",
    date: "2025-03-25",
    time: "11:00 AM",
    duration: "60",
    type: "video",
    status: "upcoming",
    interviewer: "Amanda Jones",
    notes: "Discuss previous product launches and stakeholder management.",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 4,
    candidate: "Emily Davis",
    candidateId: "emily-davis",
    position: "Backend Developer",
    date: "2025-03-25",
    time: "3:00 PM",
    duration: "60",
    type: "video",
    status: "upcoming",
    interviewer: "Robert Chen",
    notes: "Focus on database design and API architecture.",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: Date.now() - 86400000,
  },
  {
    id: 5,
    candidate: "David Wilson",
    candidateId: "david-wilson",
    position: "Data Scientist",
    date: "2025-03-20",
    time: "1:00 PM",
    duration: "60",
    type: "phone",
    status: "completed",
    interviewer: "John Smith",
    notes:
      "Strong technical skills. Needs improvement in communication. Recommended for next round.",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 6,
    candidate: "Jennifer Lee",
    candidateId: "jennifer-lee",
    position: "Marketing Specialist",
    date: "2025-03-19",
    time: "11:30 AM",
    duration: "45",
    type: "in-person",
    status: "completed",
    interviewer: "Amanda Jones",
    notes:
      "Excellent communication skills. Has experience with our target market. Strong candidate.",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: 7,
    candidate: "Robert Taylor",
    candidateId: "robert-taylor",
    position: "Frontend Developer",
    date: "2025-03-18",
    time: "9:00 AM",
    duration: "60",
    type: "video",
    status: "canceled",
    interviewer: "Lisa Wong",
    notes: "Candidate requested to reschedule due to personal emergency.",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: Date.now() - 86400000 * 7,
  },
];

// Create context
const InterviewsContext = createContext();

// Provider component
export function InterviewsProvider({ children }) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pipelineStages, setPipelineStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all interviews
  const fetchInterviews = async () => {
    try {
      const data = await getInterviews();
      setInterviews(data);
    } catch (error) {
      console.log("Error fetching interviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interviews. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch candidates with applications
  const fetchCandidatesWithApplications = async () => {
    try {
      const data = await getCandidatesWithApplications();
      setCandidates(data);
    } catch (error) {
      console.log("Error fetching candidates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch candidates. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch applications with candidates
  const fetchApplicationsWithCandidates = async () => {
    try {
      const data = await getApplicationsWithCandidates();
      setApplications(data);
    } catch (error) {
      console.log("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch pipeline stages
  const fetchPipelineStages = async () => {
    try {
      const data = await getPipelineStages();
      setPipelineStages(data);
    } catch (error) {
      console.log("Error fetching pipeline stages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pipeline stages. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add new interview
  const addInterview = async (interviewData) => {
    try {
      console.log("interviewData");
      console.log(interviewData);

      const newInterview = await createInterview(interviewData);
      // Fetch candidate details and attach as Candidate
      let candidateDetails = null;
      try {
        candidateDetails = await getCandidateWithDetails(
          Number(newInterview.candidateId)
        );
      } catch (err) {
        console.log(
          "Error fetching candidate details after scheduling interview:",
          err
        );
      }
      const interviewWithCandidate = {
        ...newInterview,
        Candidate: candidateDetails || undefined,
      };
      setInterviews((prev) => [...prev, interviewWithCandidate]);
      toast({
        title: "Success",
        description: "Interview scheduled successfully.",
      });
      return interviewWithCandidate;
    } catch (error) {
      console.log("Error creating interview:", error);
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update interview
  const updateInterviewById = async (id, interviewData) => {
    try {
      const updatedInterview = await updateInterview(id, interviewData);
      // Fetch candidate details and attach as Candidate
      let candidateDetails = null;
      try {
        candidateDetails = await getCandidateWithDetails(
          Number(updatedInterview.candidateId)
        );
      } catch (err) {
        console.log(
          "Error fetching candidate details after updating interview:",
          err
        );
      }
      const interviewWithCandidate = {
        ...updatedInterview,
        Candidate: candidateDetails || undefined,
      };
      setInterviews((prev) =>
        prev.map((interview) =>
          interview.id === id ? interviewWithCandidate : interview
        )
      );
      toast({
        title: "Success",
        description: "Interview updated successfully.",
      });
      return interviewWithCandidate;
    } catch (error) {
      console.log("Error updating interview:", error);
      toast({
        title: "Error",
        description: "Failed to update interview. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete interview
  const deleteInterviewById = async (id) => {
    try {
      await deleteInterview(id);
      setInterviews((prev) => prev.filter((interview) => interview.id !== id));
      toast({
        title: "Success",
        description: "Interview deleted successfully.",
      });
    } catch (error) {
      console.log("Error deleting interview:", error);
      toast({
        title: "Error",
        description: "Failed to delete interview. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get candidate interviews
  const getCandidateInterviewsById = async (candidateId) => {
    try {
      return await getCandidateInterviews(candidateId);
    } catch (error) {
      console.log("Error fetching candidate interviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate interviews. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get application interviews
  const getApplicationInterviewsById = async (applicationId) => {
    try {
      return await getApplicationInterviews(applicationId);
    } catch (error) {
      console.log("Error fetching application interviews:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch application interviews. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get candidate details
  const getCandidateDetails = async (candidateId) => {
    try {
      return await getCandidateWithDetails(candidateId);
    } catch (error) {
      console.log("Error fetching candidate details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate details. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get application details
  const getApplicationDetails = async (applicationId) => {
    try {
      return await getApplicationWithDetails(applicationId);
    } catch (error) {
      console.log("Error fetching application details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch application details. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get candidate interviews with details
  const getCandidateInterviewsWithDetailsById = async (candidateId) => {
    try {
      return await getCandidateInterviewsWithDetails(candidateId);
    } catch (error) {
      console.log("Error fetching candidate interviews with details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate interviews. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get application interviews with details
  const getApplicationInterviewsWithDetailsById = async (applicationId) => {
    try {
      return await getApplicationInterviewsWithDetails(applicationId);
    } catch (error) {
      console.log(
        "Error fetching application interviews with details:",
        error
      );
      toast({
        title: "Error",
        description:
          "Failed to fetch application interviews. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update interview notes
  const updateInterviewNotes = async (id, notes) => {
    return await updateInterviewById(id, { notes });
  };

  // Cancel interview
  const cancelInterview = async (id, reason) => {
    try {
      const updatedInterview = await updateInterview(id, {
        interviewStatus: "Canceled",
        cancelReason: reason,
      });
      // Fetch candidate details and attach as Candidate
      let candidateDetails = null;
      try {
        candidateDetails = await getCandidateWithDetails(
          Number(updatedInterview.candidateId)
        );
      } catch (err) {
        console.log(
          "Error fetching candidate details after canceling interview:",
          err
        );
      }
      const interviewWithCandidate = {
        ...updatedInterview,
        Candidate: candidateDetails || undefined,
      };
      setInterviews((prev) =>
        prev.map((interview) =>
          interview.id === id ? interviewWithCandidate : interview
        )
      );
      toast({
        title: "Interview Canceled",
        description: "Interview canceled successfully.",
      });
      return interviewWithCandidate;
    } catch (error) {
      console.log("Error canceling interview:", error);
      toast({
        title: "Error",
        description: "Failed to cancel interview. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Reschedule interview
  const rescheduleInterview = async (id, data) => {
    try {
      const updatedInterview = await updateInterview(id, {
        ...data,
        interviewStatus: "Scheduled",
      });
      // Fetch candidate details and attach as Candidate
      let candidateDetails = null;
      try {
        candidateDetails = await getCandidateWithDetails(
          Number(updatedInterview.candidateId)
        );
      } catch (err) {
        console.log(
          "Error fetching candidate details after rescheduling interview:",
          err
        );
      }
      const interviewWithCandidate = {
        ...updatedInterview,
        Candidate: candidateDetails || undefined,
      };
      setInterviews((prev) =>
        prev.map((interview) =>
          interview.id === id ? interviewWithCandidate : interview
        )
      );
      toast({
        title: "Interview Rescheduled",
        description: "Interview rescheduled successfully.",
      });
      return interviewWithCandidate;
    } catch (error) {
      console.log("Error rescheduling interview:", error);
      toast({
        title: "Error",
        description: "Failed to reschedule interview. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchInterviews(),
          fetchCandidatesWithApplications(),
          fetchApplicationsWithCandidates(),
          fetchPipelineStages(),
        ]);
      } catch (error) {
        console.log("Error fetching initial data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const value = {
    interviews,
    candidates,
    applications,
    pipelineStages,
    loading,
    error,
    addInterview,
    updateInterview: updateInterviewById,
    deleteInterview: deleteInterviewById,
    updateInterviewNotes,
    getCandidateInterviews: getCandidateInterviewsById,
    getApplicationInterviews: getApplicationInterviewsById,
    getCandidateDetails,
    getApplicationDetails,
    getCandidateInterviewsWithDetails: getCandidateInterviewsWithDetailsById,
    getApplicationInterviewsWithDetails:
      getApplicationInterviewsWithDetailsById,
    cancelInterview,
    rescheduleInterview,
  };

  return (
    <InterviewsContext.Provider value={value}>
      {children}
    </InterviewsContext.Provider>
  );
}

// Custom hook
export function useInterviews() {
  const context = useContext(InterviewsContext);
  if (!context) {
    throw new Error("useInterviews must be used within an InterviewsProvider");
  }
  return context;
}
