import { api } from "../config/api.js";

// Get all interviews
export const getInterviews = async () => {
  try {
    const response = await fetch(api.interviews.getAll, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch interviews");
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getInterviews:", error);
    throw error;
  }
};

// Get interview by ID
export const getInterviewById = async (id) => {
  try {
    const response = await fetch(api.interviews.getById(id), {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch interview");
    }

    const text = await response.text();
    if (!text) {
      throw new Error("Empty response from server");
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getInterviewById:", error);
    throw error;
  }
};

// Create new interview
export const createInterview = async (interviewData) => {
  try {
    const response = await fetch(api.interviews.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(interviewData),
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = "Failed to create interview";
      if (text) {
        try {
          const error = JSON.parse(text);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in createInterview:", error);
    throw error;
  }
};

// Update interview
export const updateInterview = async (id, interviewData) => {
  try {
    const response = await fetch(api.interviews.update(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(interviewData),
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = "Failed to update interview";
      if (text) {
        try {
          const error = JSON.parse(text);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in updateInterview:", error);
    throw error;
  }
};

// Delete interview
export const deleteInterview = async (id) => {
  try {
    const response = await fetch(api.interviews.delete(id), {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete interview");
    }

    // For 204 No Content, return success without trying to parse JSON
    if (response.status === 204) {
      return { success: true };
    }

    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in deleteInterview:", error);
    throw error;
  }
};

// Get interviews by candidate ID
export const getCandidateInterviews = async (candidateId) => {
  try {
    const response = await fetch(api.interviews.getByCandidate(candidateId), {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch candidate interviews");
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getCandidateInterviews:", error);
    throw error;
  }
};

// Get interviews by application ID
export const getApplicationInterviews = async (applicationId) => {
  try {
    const response = await fetch(
      api.interviews.getByApplication(applicationId),
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch application interviews");
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getApplicationInterviews:", error);
    throw error;
  }
};

// Get candidates with their applications
export const getCandidatesWithApplications = async () => {
  try {
    console.log("[Service] Fetching candidates with applications");
    const response = await fetch(api.interviews.getCandidatesWithApplications, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch candidates with applications");
    }

    const text = await response.text();
    if (!text) {
      console.log("[Service] Empty response, returning empty array");
      return [];
    }

    const data = JSON.parse(text);
    console.log("[Service] Candidates fetched successfully:", data.length);
    return data;
  } catch (error) {
    console.log(
      "[Service] Error fetching candidates with applications:",
      error
    );
    throw error;
  }
};

// Get applications with their candidates
export const getApplicationsWithCandidates = async () => {
  try {
    const response = await fetch(api.interviews.getApplicationsWithCandidates, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch applications with candidates");
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getApplicationsWithCandidates:", error);
    throw error;
  }
};

// Get pipeline stages
export const getPipelineStages = async () => {
  try {
    const response = await fetch(api.interviews.getPipelineStages, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pipeline stages");
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getPipelineStages:", error);
    throw error;
  }
};

// Get candidate with details
export const getCandidateWithDetails = async (candidateId) => {
  try {
    const response = await fetch(
      api.interviews.getCandidateWithDetails(candidateId),
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch candidate with details");
    }

    const text = await response.text();
    if (!text) {
      throw new Error("Empty response from server");
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getCandidateWithDetails:", error);
    throw error;
  }
};

// Get application with details
export const getApplicationWithDetails = async (applicationId) => {
  try {
    const response = await fetch(
      api.interviews.getApplicationWithDetails(applicationId),
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch application with details");
    }

    const text = await response.text();
    if (!text) {
      throw new Error("Empty response from server");
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getApplicationWithDetails:", error);
    throw error;
  }
};

// Get candidate interviews with details
export const getCandidateInterviewsWithDetails = async (candidateId) => {
  try {
    const response = await fetch(
      api.interviews.getCandidateInterviewsWithDetails(candidateId),
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch candidate interviews with details");
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getCandidateInterviewsWithDetails:", error);
    throw error;
  }
};

// Get application interviews with details
export const getApplicationInterviewsWithDetails = async (applicationId) => {
  try {
    const response = await fetch(
      api.interviews.getApplicationInterviewsWithDetails(applicationId),
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch application interviews with details");
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in getApplicationInterviewsWithDetails:", error);
    throw error;
  }
};
