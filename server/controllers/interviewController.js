import {
  createInterviewService,
  getInterviewsService,
  getInterviewByIdService,
  updateInterviewService,
  deleteInterviewService,
  getCandidateInterviewsService,
  getApplicationInterviewsService,
  getCandidatesWithApplicationsService,
  getApplicationsWithCandidatesService,
  getPipelineStagesService,
} from "../services/interviewService.js";
import { Interview } from "../models/Interview.js";
import { Candidate } from "../models/Candidate.js";
import { Application } from "../models/Application.js";
import { PipelineStage } from "../models/PipelineStage.js";
import { communicationsService } from "../services/communicationsService.js";

export const createInterview = async (req, res) => {
  try {
    console.log("[Controller] Creating interview");
    const interview = await createInterviewService(req.body);

    // Trigger automation for interview creation
    try {
      console.log(
        "[INTERVIEW][createInterview] Attempting to trigger automation"
      );
      console.log(
        "[INTERVIEW][createInterview] User:",
        req.user
          ? {
            id: req.user.id,
            clientId: req.user.clientId,
            hasAccessToken: !!req.user.accessToken,
            hasRefreshToken: !!req.user.refreshToken,
          }
          : "No user"
      );

      if (req.user) {
        const context = {
          interviewId: interview.id,
          candidateId: interview.candidateId,
          applicationId: interview.applicationId,
          senderId: req.user.id,
          customVariables: {
            interview_type: interview.interviewType,
            interview_date: interview.date,
            interview_time: interview.time,
            interview_location: interview.location,
            interview_notes: interview.notes,
          },
        };

        // Get job ID from application if available
        if (interview.applicationId) {
          const application = await Application.findByPk(
            interview.applicationId
          );
          if (application && application.jobId) {
            context.jobId = application.jobId;
            console.log(
              "[INTERVIEW][createInterview] Added jobId:",
              application.jobId
            );
          }
        }

        console.log(
          "[INTERVIEW][createInterview] Calling triggerCandidateAutomation with trigger: interview_scheduled"
        );
        await communicationsService.triggerCandidateAutomation({
          triggerType: "interview_scheduled",
          context,
          tokens: {
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken || null,
          },
          clientId: req.user.clientId,
        });
        console.log(
          "[INTERVIEW][createInterview] Automation triggered successfully"
        );
      } else {
        console.log(
          "[INTERVIEW][createInterview] No user found, skipping automation"
        );
      }
    } catch (automationError) {
      console.log(
        "[INTERVIEW][createInterview] Automation error:",
        automationError
      );
      // Don't fail the main request if automation fails
    }

    res.status(201).json(interview);
  } catch (error) {
    console.log("[Controller] Error in createInterview:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res
        .status(400)
        .json({ error: "Client ID is required for interview queries" });
    }
    console.log(
      "[Controller] Fetching all interviews for clientId:",
      req.user.clientId
    );
    const interviews = await getInterviewsService({
      clientId: req.user.clientId,
    });
    res.json(interviews);
  } catch (error) {
    console.log("[Controller] Error in getInterviews:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    console.log("[Controller] Fetching interview by id:", req.params.id);
    const interview = await getInterviewByIdService(req.params.id);
    res.json(interview);
  } catch (error) {
    console.log("[Controller] Error in getInterviewById:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateInterview = async (req, res) => {
  try {
    console.log("[Controller] Updating interview:", req.params.id);

    // Get the old interview data for comparison
    const oldInterview = await Interview.findByPk(req.params.id);
    const interview = await updateInterviewService(req.params.id, req.body);

    // Trigger automation based on what was updated
    try {
      if (req.user) {
        const context = {
          interviewId: interview.id,
          candidateId: interview.candidateId,
          applicationId: interview.applicationId,
          senderId: req.user.id,
          customVariables: {
            interview_type: interview.interviewType,
            interview_date: interview.date,
            interview_time: interview.time,
            interview_location: interview.location,
            interview_notes: interview.notes,
            previous_status: oldInterview.status,
            new_status: interview.status,
            previous_date: oldInterview.date,
            new_date: interview.date,
          },
        };

        // Get job ID from application if available
        if (interview.applicationId) {
          const application = await Application.findByPk(
            interview.applicationId
          );
          if (application && application.jobId) {
            context.jobId = application.jobId;
          }
        }

        // Determine what type of update occurred
        let triggerType = "interview_updated";
        if (
          oldInterview.status !== interview.status &&
          interview.status &&
          interview.status.toLowerCase() === "completed"
        ) {
          triggerType = "interview_completed";
        } else if (
          oldInterview.status !== interview.status &&
          interview.status &&
          interview.status.toLowerCase() === "canceled"
        ) {
          triggerType = "interview_cancelled";
        } else if (
          oldInterview.status !== interview.status &&
          interview.status &&
          interview.status.toLowerCase() === "rescheduled"
        ) {
          triggerType = "interview_rescheduled";
        } else if (oldInterview.date !== interview.date) {
          triggerType = "interview_rescheduled";
        }

        await communicationsService.triggerCandidateAutomation({
          triggerType,
          context,
          tokens: {
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
          },
          clientId: req.user.clientId,
        });
      }
    } catch (automationError) {
      console.log(
        "[INTERVIEW][updateInterview] Automation error:",
        automationError
      );
      // Don't fail the main request if automation fails
    }

    res.json(interview);
  } catch (error) {
    console.log("[Controller] Error in updateInterview:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    console.log("[Controller] Deleting interview:", req.params.id);

    // Get the interview data before deletion for automation
    const interview = await Interview.findByPk(req.params.id);

    await deleteInterviewService(req.params.id);

    // Trigger automation for interview deletion
    try {
      if (req.user && interview) {
        const context = {
          interviewId: interview.id,
          candidateId: interview.candidateId,
          applicationId: interview.applicationId,
          senderId: req.user.id,
          customVariables: {
            interview_type: interview.interviewType,
            interview_date: interview.date,
            interview_time: interview.time,
            interview_location: interview.location,
            interview_notes: interview.notes,
            deletion_reason: req.body.reason || "Interview cancelled",
          },
        };

        // Get job ID from application if available
        if (interview.applicationId) {
          const application = await Application.findByPk(
            interview.applicationId
          );
          if (application && application.jobId) {
            context.jobId = application.jobId;
          }
        }

        await communicationsService.triggerCandidateAutomation({
          triggerType: "interview_cancelled",
          context,
          tokens: {
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
          },
          clientId: req.user.clientId,
        });
      }
    } catch (automationError) {
      console.log(
        "[INTERVIEW][deleteInterview] Automation error:",
        automationError
      );
      // Don't fail the main request if automation fails
    }

    res.status(204).send();
  } catch (error) {
    console.log("[Controller] Error in deleteInterview:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCandidateInterviews = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res
        .status(400)
        .json({ error: "Client ID is required for interview queries" });
    }
    console.log(
      "[Controller] Fetching interviews for candidate:",
      req.params.candidateId,
      "clientId:",
      req.user.clientId
    );
    const interviews = await getCandidateInterviewsService(
      req.params.candidateId,
      req.user.clientId
    );
    res.json(interviews);
  } catch (error) {
    console.log("[Controller] Error in getCandidateInterviews:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getApplicationInterviews = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res
        .status(400)
        .json({ error: "Client ID is required for interview queries" });
    }
    console.log(
      "[Controller] Fetching interviews for application:",
      req.params.applicationId,
      "clientId:",
      req.user.clientId
    );
    const interviews = await getApplicationInterviewsService(
      req.params.applicationId,
      req.user.clientId
    );
    res.json(interviews);
  } catch (error) {
    console.log("[Controller] Error in getApplicationInterviews:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCandidatesWithApplications = async (req, res) => {
  try {
    console.log("[Controller] Fetching candidates with applications");
    const candidates = await getCandidatesWithApplicationsService();
    res.json(candidates);
  } catch (error) {
    console.log(
      "[Controller] Error in getCandidatesWithApplications:",
      error
    );
    res.status(500).json({ error: error.message });
  }
};

export const getApplicationsWithCandidates = async (req, res) => {
  try {
    console.log("[Controller] Fetching applications with candidates");
    const applications = await getApplicationsWithCandidatesService();
    res.json(applications);
  } catch (error) {
    console.log(
      "[Controller] Error in getApplicationsWithCandidates:",
      error
    );
    res.status(500).json({ error: error.message });
  }
};

export const getPipelineStages = async (req, res) => {
  try {
    console.log("[Controller] Fetching pipeline stages");
    const stages = await getPipelineStagesService();
    res.json(stages);
  } catch (error) {
    console.log("[Controller] Error in getPipelineStages:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCandidateWithDetails = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.candidateId, {
      include: [
        {
          model: Application,
          as: "Applications",
        },
      ],
    });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(candidate);
  } catch (error) {
    console.log("Error in getCandidateWithDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getApplicationWithDetails = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.applicationId, {
      include: [
        {
          model: Candidate,
          as: "candidate",
        },
      ],
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    console.log("Error in getApplicationWithDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getCandidateInterviewsWithDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res
        .status(400)
        .json({ error: "Client ID is required for interview queries" });
    }
    const interviews = await Interview.findAll({
      where: { candidateId: req.params.candidateId },
      include: [
        {
          model: Candidate,
          as: "Candidate",
          where: { clientId: req.user.clientId },
        },
        {
          model: Application,
          as: "Application",
        },
      ],
    });
    res.json(interviews);
  } catch (error) {
    console.log("Error in getCandidateInterviewsWithDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getApplicationInterviewsWithDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res
        .status(400)
        .json({ error: "Client ID is required for interview queries" });
    }
    const interviews = await Interview.findAll({
      where: { applicationId: req.params.applicationId },
      include: [
        {
          model: Candidate,
          as: "Candidate",
          where: { clientId: req.user.clientId },
        },
        {
          model: Application,
          as: "Application",
        },
      ],
    });
    res.json(interviews);
  } catch (error) {
    console.log("Error in getApplicationInterviewsWithDetails:", error);
    res.status(500).json({ message: error.message });
  }
};
