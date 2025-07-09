import {
  createInterview,
  findAllInterviews,
  findInterviewById,
  updateInterview,
  deleteInterview,
  findInterviewsByCandidateId,
  findInterviewsByApplicationId,
} from "../repositories/interviewRepository.js";
import { Candidate } from "../models/Candidate.js";
import { Application } from "../models/Application.js";
import { PipelineStage } from "../models/PipelineStage.js";
import { Job } from "../models/Job.js";

export const createInterviewService = async (interviewData) => {
  try {
    console.log("[Service] Creating interview");
    const interview = await createInterview(interviewData);
    console.log("[Service] Interview created successfully:", interview.id);
    return interview;
  } catch (error) {
    console.log("[Service] Error in createInterviewService:", error);
    throw new Error(`Error creating interview: ${error.message}`);
  }
};

export const getInterviewsService = async ({ clientId }) => {
  try {
    console.log("[Service] Fetching all interviews for clientId:", clientId);
    const interviews = await findAllInterviews({ clientId });
    console.log("[Service] Found interviews count:", interviews.length);
    return interviews;
  } catch (error) {
    console.log("[Service] Error in getInterviewsService:", error);
    throw new Error(`Error fetching interviews: ${error.message}`);
  }
};

export const getInterviewByIdService = async (id) => {
  try {
    console.log("[Service] Fetching interview by id:", id);
    const interview = await findInterviewById(id);
    console.log("[Service] Interview found:", interview ? "yes" : "no");
    return interview;
  } catch (error) {
    console.log("[Service] Error in getInterviewByIdService:", error);
    throw new Error(`Error fetching interview: ${error.message}`);
  }
};

export const updateInterviewService = async (id, interviewData) => {
  try {
    console.log("[Service] Updating interview:", id);
    const interview = await updateInterview(id, interviewData);
    console.log("[Service] Interview updated successfully:", id);
    return interview;
  } catch (error) {
    console.log("[Service] Error in updateInterviewService:", error);
    throw new Error(`Error updating interview: ${error.message}`);
  }
};

export const deleteInterviewService = async (id) => {
  try {
    console.log("[Service] Deleting interview:", id);
    await deleteInterview(id);
    console.log("[Service] Interview deleted successfully:", id);
  } catch (error) {
    console.log("[Service] Error in deleteInterviewService:", error);
    throw new Error(`Error deleting interview: ${error.message}`);
  }
};

export const getCandidateInterviewsService = async (candidateId, clientId) => {
  try {
    console.log(
      "[Service] Fetching interviews for candidate:",
      candidateId,
      "clientId:",
      clientId
    );
    const interviews = await findInterviewsByCandidateId(candidateId, clientId);
    console.log("[Service] Found interviews count:", interviews.length);
    return interviews;
  } catch (error) {
    console.log("[Service] Error in getCandidateInterviewsService:", error);
    throw new Error(`Error fetching candidate interviews: ${error.message}`);
  }
};

export const getApplicationInterviewsService = async (
  applicationId,
  clientId
) => {
  try {
    console.log(
      "[Service] Fetching interviews for application:",
      applicationId,
      "clientId:",
      clientId
    );
    const interviews = await findInterviewsByApplicationId(
      applicationId,
      clientId
    );
    console.log("[Service] Found interviews count:", interviews.length);
    return interviews;
  } catch (error) {
    console.log("[Service] Error in getApplicationInterviewsService:", error);
    throw new Error(`Error fetching application interviews: ${error.message}`);
  }
};

export const getCandidatesWithApplicationsService = async () => {
  try {
    console.log("[Service] Fetching candidates with applications");
    const candidates = await Candidate.findAll({
      include: [
        {
          model: Application,
          as: "Applications",
          include: [
            {
              model: PipelineStage,
              as: "stage",
            },
          ],
        },
      ],
    });
    console.log("[Service] Found candidates count:", candidates.length);
    return candidates;
  } catch (error) {
    console.log(
      "[Service] Error in getCandidatesWithApplicationsService:",
      error
    );
    throw new Error(
      `Error fetching candidates with applications: ${error.message}`
    );
  }
};

export const getApplicationsWithCandidatesService = async () => {
  try {
    console.log("[Service] Fetching applications with candidates and jobs");
    const applications = await Application.findAll({
      include: [
        {
          model: Candidate,
          as: "Candidate",
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle", "jobStatus"],
        },
      ],
    });
    console.log("[Service] Found applications count:", applications.length);
    return applications;
  } catch (error) {
    console.log(
      "[Service] Error in getApplicationsWithCandidatesService:",
      error
    );
    throw new Error(
      `Error fetching applications with candidates: ${error.message}`
    );
  }
};

export const getPipelineStagesService = async () => {
  try {
    console.log("[Service] Fetching pipeline stages");
    const stages = await PipelineStage.findAll();
    console.log("[Service] Found stages count:", stages.length);
    return stages;
  } catch (error) {
    console.log("[Service] Error in getPipelineStagesService:", error);
    throw new Error(`Error fetching pipeline stages: ${error.message}`);
  }
};
