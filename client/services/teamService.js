import { api } from "../config/api";

/**
 * Configuration for API requests
 */
const API_CONFIG = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Helper function to get auth token
 * @returns {string|null} The authentication token
 */
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Helper function for making API calls
 * @param {string} url - The API endpoint URL
 * @param {string} method - HTTP method
 * @param {object} data - Request payload
 * @param {object} config - Additional configuration
 * @returns {Promise} API response
 */
const apiCall = async (url, method = "GET", data = null, config = {}) => {
  try {
    const token = getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout || 30000
    );

    const options = {
      ...API_CONFIG,
      method,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
      console.log(
        `[API] Making ${method} request to ${url} with data:`,
        JSON.stringify(data, null, 2)
      );
    }

    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    // Check content type before parsing JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const responseData = await response.json();

    if (!response.ok) {
      console.log(
        `[API] Request failed with status ${response.status}:`,
        responseData
      );
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in.");
      }
      throw new Error(
        responseData.message || responseData.error || "API call failed"
      );
    }

    console.log(
      `[API] Successful ${method} response from ${url}:`,
      responseData
    );
    return responseData;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${config.timeout || 30000}ms`);
    }
    console.log("[API] Error in API call:", error);
    console.log("[API] Error details:", {
      url,
      method,
      data,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Team Service
 * Handles all team-related API calls and data transformations
 */
export const teamService = {
  // Team Management
  getAllTeams: async () => {
    try {
      console.log("[TeamService] Fetching all teams");
      const response = await apiCall(api.teams.getAll());
      console.log("[TeamService] Teams API response:", response);

      if (!response || !response.teams) {
        console.log("[TeamService] Invalid response format:", response);
        throw new Error("Invalid response format from server");
      }

      return response;
    } catch (error) {
      console.log("[TeamService] Error in getAllTeams:", error);
      if (error.message.includes("Expected JSON response")) {
        throw new Error(
          "Server returned an invalid response. Please try again later."
        );
      }
      throw error;
    }
  },

  getAllRecruiters: async () => {
    try {
      const response = await apiCall(api.recruiters.getAll());
      if (!response || !response.recruiters) {
        throw new Error("Invalid response format from server");
      }
      return response;
    } catch (error) {
      console.log("[TeamService] Error in getAllRecruiters:", error);
      throw error;
    }
  },

  getTeamById: async (id) => {
    try {
      const response = await apiCall(api.teams.getById(id));
      if (!response) {
        throw new Error("Team not found");
      }
      return response;
    } catch (error) {
      console.log(`[TeamService] Error in getTeamById(${id}):`, error);
      throw error;
    }
  },

  createTeam: async (teamData) => {
    try {
      const response = await apiCall(api.teams.create(), "POST", teamData);
      if (!response || !response.team) {
        throw new Error("Invalid response format from server");
      }
      return response;
    } catch (error) {
      console.log("[TeamService] Error in createTeam:", error);
      throw error;
    }
  },

  updateTeam: async (id, teamData) => {
    try {
      if (!id) {
        throw new Error("Team ID is required for update");
      }

      // Ensure ID is a number
      const teamId = parseInt(id);
      if (isNaN(teamId)) {
        throw new Error("Invalid team ID format");
      }

      // Log the request details
      console.log("[TeamService] Updating team:", {
        id: teamId,
        data: teamData,
      });

      const response = await apiCall(api.teams.update(teamId), "PUT", teamData);
      if (!response) {
        throw new Error("Failed to update team");
      }

      // Log the response
      console.log("[TeamService] Team update response:", response);

      return response;
    } catch (error) {
      console.log(`[TeamService] Error in updateTeam(${id}):`, error);
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      const response = await apiCall(api.teams.delete(id), "DELETE");
      return response;
    } catch (error) {
      console.log(`[TeamService] Error in deleteTeam(${id}):`, error);
      throw error;
    }
  },

  // Team Member Management
  getTeamMembers: async (teamId) => {
    try {
      console.log("[TeamService] Fetching members for team:", teamId);
      const response = await apiCall(api.teams.getMembers(teamId));
      console.log("[TeamService] Team members response:", response);

      if (!response || !response.members) {
        console.log("[TeamService] Invalid response format:", response);
        throw new Error("Invalid response format from server");
      }

      return response;
    } catch (error) {
      console.log(`[TeamService] Error in getTeamMembers(${teamId}):`, error);
      throw error;
    }
  },

  addTeamMember: async (teamId, memberData) => {
    try {
      const response = await apiCall(
        api.teams.addMember(teamId),
        "POST",
        memberData
      );
      if (!response) {
        throw new Error("Failed to add team member");
      }
      return response;
    } catch (error) {
      console.log(`[TeamService] Error in addTeamMember(${teamId}):`, error);
      throw error;
    }
  },

  updateTeamMember: async (teamId, memberId, memberData) => {
    try {
      const response = await apiCall(
        api.teams.updateMember(teamId, memberId),
        "PUT",
        memberData
      );
      if (!response) {
        throw new Error("Failed to update team member");
      }
      return response;
    } catch (error) {
      console.log(
        `[TeamService] Error in updateTeamMember(${teamId}, ${memberId}):`,
        error
      );
      throw error;
    }
  },

  removeTeamMember: async (teamId, memberId) => {
    try {
      const response = await apiCall(
        api.teams.removeMember(teamId, memberId),
        "DELETE"
      );
      return response;
    } catch (error) {
      console.log(
        `[TeamService] Error in removeTeamMember(${teamId}, ${memberId}):`,
        error
      );
      throw error;
    }
  },

  // Team Jobs Management
  getTeamJobs: async (teamId) => {
    try {
      console.log("[TeamService] Starting getTeamJobs for teamId:", teamId);
      console.log("[TeamService] API endpoint:", api.teams.getJobs(teamId));

      const response = await apiCall(api.teams.getJobs(teamId));
      console.log("[TeamService] Raw API response:", response);

      if (!response) {
        console.log("[TeamService] No response received from API");
        throw new Error("No response received from server");
      }

      if (!response.success) {
        console.log(
          "[TeamService] API returned unsuccessful response:",
          response
        );
        throw new Error(
          response.message || "Server returned unsuccessful response"
        );
      }

      if (!response.data) {
        console.log("[TeamService] No data in response:", response);
        throw new Error("Invalid response format: missing data");
      }

      if (!Array.isArray(response.data.jobs)) {
        console.log(
          "[TeamService] Jobs is not an array:",
          response.data.jobs
        );
        throw new Error("Invalid response format: jobs is not an array");
      }

      console.log(
        "[TeamService] Successfully fetched jobs:",
        response.data.jobs
      );
      return response.data.jobs;
    } catch (error) {
      console.log("[TeamService] Error in getTeamJobs:", {
        error,
        message: error.message,
        stack: error.stack,
        teamId,
      });
      throw new Error(error.message || "Failed to fetch team jobs");
    }
  },

  assignJobToTeam: async (teamId, jobData) => {
    try {
      const response = await apiCall(
        api.teams.assignJob(teamId),
        "POST",
        jobData
      );
      if (!response) {
        throw new Error("Failed to assign job to team");
      }
      return response;
    } catch (error) {
      console.log(`[TeamService] Error in assignJobToTeam(${teamId}):`, error);
      throw error;
    }
  },

  removeJobFromTeam: async (teamId, jobId) => {
    try {
      const response = await apiCall(
        api.teams.removeJob(teamId, jobId),
        "DELETE"
      );
      return response;
    } catch (error) {
      console.log(
        `[TeamService] Error in removeJobFromTeam(${teamId}, ${jobId}):`,
        error
      );
      throw error;
    }
  },

  // Team Analytics & Statistics
  getTeamPerformance: async (teamId) => {
    try {
      const response = await apiCall(api.teams.getPerformance(teamId));
      if (!response) {
        throw new Error("Failed to get team performance");
      }
      return response;
    } catch (error) {
      console.log(
        `[TeamService] Error in getTeamPerformance(${teamId}):`,
        error
      );
      throw error;
    }
  },

  getTeamStats: async () => {
    try {
      const response = await apiCall(api.teams.stats());
      if (!response) {
        throw new Error("Failed to get team stats");
      }
      return response;
    } catch (error) {
      console.log("[TeamService] Error in getTeamStats:", error);
      throw error;
    }
  },

  // Team Metadata
  getDepartments: async () => {
    try {
      const response = await apiCall(api.teams.departments());
      return response;
    } catch (error) {
      console.log("[TeamService] Error in getDepartments:", error);
      throw error;
    }
  },

  getLocations: async () => {
    try {
      const response = await apiCall(api.teams.locations());
      return response;
    } catch (error) {
      console.log("[TeamService] Error in getLocations:", error);
      throw error;
    }
  },

  searchTeams: async (query) => {
    try {
      const response = await apiCall(api.teams.search(), "POST", { query });
      return response;
    } catch (error) {
      console.log("[TeamService] Error in searchTeams:", error);
      throw error;
    }
  },

  updateTeamLead: async (teamId, newLeadId, oldLeadId = null) => {
    try {
      // Ensure teamId is a valid number
      const validTeamId = parseInt(teamId);
      if (isNaN(validTeamId)) {
        throw new Error("Invalid Team ID");
      }

      // Log the request details
      console.log("[TeamService] Updating team lead:", {
        teamId: validTeamId,
        oldLeadId,
        newLeadId,
      });

      // Get the API endpoint URL
      const url = api.teams.updateLead(validTeamId);
      if (!url) {
        throw new Error("Failed to generate API endpoint URL");
      }

      // Make the API call
      const response = await apiCall(
        url,
        "PUT",
        {
          leadId: newLeadId,
          oldLeadId: oldLeadId,
        },
        {
          timeout: 60000,
        }
      );

      if (!response || !response.team) {
        console.log("[TeamService] Invalid response format:", response);
        throw new Error("Invalid response format from server");
      }

      console.log("[TeamService] Team lead update response:", response);
      return {
        team: response.team,
        members: response.members || [],
      };
    } catch (error) {
      console.log(`[TeamService] Error in updateTeamLead(${teamId}):`, error);
      throw error;
    }
  },
};
