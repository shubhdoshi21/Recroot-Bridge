import { Interview } from "../models/index.js";
import { Application } from "../models/index.js";
import { Candidate } from "../models/index.js";
import { PipelineStage } from "../models/index.js";

export const createInterview = async (interviewData) => {
  try {
    console.log("[Repository] Creating interview with data:", interviewData);
    const result = await Interview.create(interviewData);
    console.log("[Repository] Interview created successfully:", result.id);
    return result;
  } catch (error) {
    console.log("[Repository] Error creating interview:", error);
    throw new Error(`Error creating interview: ${error.message}`);
  }
};

export const findAllInterviews = async ({ clientId }) => {
  if (!clientId) throw new Error("clientId is required for interview queries");
  try {
    console.log("[Repository] Fetching all interviews for clientId:", clientId);
    const interviews = await Interview.findAll({
      include: [
        {
          model: Candidate,
          as: "Candidate",
          attributes: ["id", "name", "email", "clientId"],
          where: { clientId },
          required: true,
        },
        {
          model: Application,
          as: "Application",
          attributes: ["id", "status"],
        },
      ],
    });
    console.log("[Repository] Alias used for Candidate include:", "Candidate");
    console.log(
      "[Repository] Number of interviews returned:",
      interviews.length
    );
    return interviews;
  } catch (error) {
    console.log("[Repository] Error fetching interviews:", error);
    console.log("[Repository] Original error:", error.original);
    throw new Error("Error fetching interviews: " + error.message);
  }
};

export const findInterviewById = async (id) => {
  try {
    console.log("[Repository] Fetching interview by id:", id);
    const interview = await Interview.findByPk(id, {
      include: [
        {
          model: Candidate,
          as: "Candidate",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Application,
          as: "Application",
          attributes: ["id", "status"],
        },
      ],
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    return interview;
  } catch (error) {
    console.log("[Repository] Error fetching interview:", error);
    throw new Error(`Error fetching interview: ${error.message}`);
  }
};

export const updateInterview = async (id, interviewData) => {
  try {
    console.log(
      "[Repository] Updating interview:",
      id,
      "with data:",
      interviewData
    );
    const interview = await Interview.findByPk(id);
    if (!interview) {
      console.log("[Repository] Interview not found for update:", id);
      throw new Error("Interview not found");
    }
    const result = await interview.update(interviewData);
    console.log("[Repository] Interview updated successfully:", id);
    return result;
  } catch (error) {
    console.log("[Repository] Error updating interview:", error);
    throw new Error(`Error updating interview: ${error.message}`);
  }
};

export const deleteInterview = async (id) => {
  try {
    console.log("[Repository] Deleting interview:", id);
    const interview = await Interview.findByPk(id);
    if (!interview) {
      console.log("[Repository] Interview not found for deletion:", id);
      throw new Error("Interview not found");
    }
    await interview.destroy();
    console.log("[Repository] Interview deleted successfully:", id);
    return true;
  } catch (error) {
    console.log("[Repository] Error deleting interview:", error);
    throw new Error(`Error deleting interview: ${error.message}`);
  }
};

export const findInterviewsByCandidateId = async (candidateId, clientId) => {
  if (!clientId) throw new Error("clientId is required for interview queries");
  try {
    console.log(
      "[Repository] Fetching interviews for candidate:",
      candidateId,
      "clientId:",
      clientId
    );
    const interviews = await Interview.findAll({
      where: { candidateId },
      include: [
        {
          model: Candidate,
          as: "Candidate",
          attributes: ["id", "firstName", "lastName", "email", "clientId"],
          where: { clientId },
          required: true,
        },
        {
          model: Application,
          as: "Application",
          attributes: ["id", "status"],
        },
      ],
    });
    console.log("[Repository] Alias used for Candidate include:", "Candidate");
    console.log(
      "[Repository] Number of interviews returned:",
      interviews.length
    );
    return interviews;
  } catch (error) {
    console.log("[Repository] Error fetching candidate interviews:", error);
    throw new Error(`Error fetching candidate interviews: ${error.message}`);
  }
};

export const findInterviewsByApplicationId = async (
  applicationId,
  clientId
) => {
  if (!clientId) throw new Error("clientId is required for interview queries");
  try {
    console.log(
      "[Repository] Fetching interviews for application:",
      applicationId,
      "clientId:",
      clientId
    );
    const interviews = await Interview.findAll({
      where: { applicationId },
      include: [
        {
          model: Candidate,
          as: "Candidate",
          attributes: ["id", "firstName", "lastName", "email", "clientId"],
          where: { clientId },
          required: true,
        },
        {
          model: Application,
          as: "Application",
          attributes: ["id", "status"],
        },
      ],
    });
    console.log("[Repository] Alias used for Candidate include:", "Candidate");
    console.log(
      "[Repository] Number of interviews returned:",
      interviews.length
    );
    return interviews;
  } catch (error) {
    console.log("[Repository] Error fetching application interviews:", error);
    throw new Error(`Error fetching application interviews: ${error.message}`);
  }
};
