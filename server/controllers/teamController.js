import {
  getAllTeamsService,
  createTeamService,
  getTeamByIdService,
  updateTeamService,
  deleteTeamService,
  getTeamMembersService,
  addTeamMemberService,
  getTeamMemberByIdService,
  updateTeamMemberService,
  removeTeamMemberService,
  getTeamJobsService,
  assignJobToTeamService,
  getTeamJobByIdService,
  removeJobFromTeamService,
  getTeamPerformanceService,
  getTeamHiringMetricsService,
  getTeamMonthlyHiresService,
  getTeamTimeToHireService,
  getTeamOfferAcceptanceService,
  getTeamCandidateSourcesService,
  getTeamMemberPerformanceService,
  getTeamActivityService,
  getDepartmentsService,
  addDepartmentService,
  getLocationsService,
  addLocationService,
  getTeamStatsService,
  searchTeamsService,
  getSubteamsService,
  addSubteamService,
  removeSubteamService,
  updateTeamLeadService,
} from "../services/teamService.js";

/**
 * Get all teams with filtering and pagination
 * @param {Object} req - Request object with query parameters
 * @param {Object} res - Response object
 */
export const getAllTeams = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res
        .status(400)
        .json({ message: "Client ID is required for team queries" });
    }
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "DESC",
      status,
      department,
      location,
      size,
    } = req.query;

    const result = await getAllTeamsService({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      order,
      status,
      department,
      location,
      size,
      clientId: req.user.clientId,
    });

    const response = {
      totalItems: result.totalItems,
      teams: result.teams,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error fetching teams:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch teams", error: error.message });
  }
};

/**
 * Create a new team
 * @param {Object} req - Request object with team data
 * @param {Object} res - Response object
 */
export const createTeam = async (req, res) => {
  try {
    const teamData = req.body;
    // Always set clientId for downstream logic
    teamData.clientId = req.user.clientId;
    console.log("Creating team with data:", JSON.stringify(teamData, null, 2));

    // Validate required fields
    if (
      !teamData.name ||
      !teamData.department ||
      !teamData.status ||
      !teamData.location
    ) {
      console.log("Missing required fields:", {
        name: !teamData.name,
        department: !teamData.department,
        status: !teamData.status,
        location: !teamData.location,
      });
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          name: !teamData.name ? "Team name is required" : null,
          department: !teamData.department ? "Department is required" : null,
          status: !teamData.status ? "Status is required" : null,
          location: !teamData.location ? "Location is required" : null,
        },
      });
    }

    const newTeam = await createTeamService(teamData);
    console.log("Team created successfully:", JSON.stringify(newTeam, null, 2));
    return res.status(201).json({
      team: newTeam,
      message: "Team created successfully",
    });
  } catch (error) {
    console.log("Error creating team:", error);
    console.log("Error stack:", error.stack);
    return res.status(500).json({
      message: "Failed to create team",
      error: error.message,
      details: error.errors?.map((e) => e.message) || [],
    });
  }
};

/**
 * Get a specific team by ID
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await getTeamByIdService(id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json(team);
  } catch (error) {
    console.log("Error fetching team:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch team", error: error.message });
  }
};

/**
 * Update a team's information
 * @param {Object} req - Request object with team ID and updated data
 * @param {Object} res - Response object
 */
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const teamData = req.body;
    const updatedTeam = await updateTeamService(id, teamData);

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({ team: updatedTeam });
  } catch (error) {
    console.log("Error updating team:", error);
    return res
      .status(500)
      .json({ message: "Failed to update team", error: error.message });
  }
};

/**
 * Delete a team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTeamService(id);
    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.log("Error deleting team:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete team", error: error.message });
  }
};

/**
 * Get all members of a specific team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamMembers = async (req, res) => {
  try {
    console.log(
      `[TeamController] Fetching members for team ID: ${req.params.id}`
    );
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    const members = await getTeamMembersService(id);

    if (!Array.isArray(members)) {
      console.log(
        "[TeamController] Invalid response format from service:",
        members
      );
      return res
        .status(500)
        .json({ message: "Invalid response format from service" });
    }

    console.log(
      `[TeamController] Successfully fetched ${members.length} members for team ID: ${id}`
    );
    return res.status(200).json({ members }); // Return object with members property
  } catch (error) {
    console.log("[TeamController] Error fetching team members:", error);
    console.log("[TeamController] Error details:", {
      teamId: req.params.id,
      error: error.message,
      stack: error.stack,
    });

    if (error.message === "Team not found") {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(500).json({
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
};

/**
 * Add a new member to a team
 * @param {Object} req - Request object with team ID and member data
 * @param {Object} res - Response object
 */
export const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const memberData = req.body;

    console.log(`[TeamController] Adding new member to team ID: ${id}`);
    console.log(
      "[TeamController] Member data:",
      JSON.stringify(memberData, null, 2)
    );

    const newMember = await addTeamMemberService(id, memberData);

    console.log(
      "[TeamController] Successfully added new member:",
      JSON.stringify(newMember, null, 2)
    );
    return res.status(201).json(newMember);
  } catch (error) {
    console.log("[TeamController] Error adding team member:", error);
    console.log("[TeamController] Error details:", {
      teamId: req.params.id,
      memberData: req.body,
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json({ message: "Failed to add team member", error: error.message });
  }
};

/**
 * Get a specific team member by ID
 * @param {Object} req - Request object with team ID and member ID
 * @param {Object} res - Response object
 */
export const getTeamMemberById = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const member = await getTeamMemberByIdService(id, memberId);

    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    return res.status(200).json(member);
  } catch (error) {
    console.log("Error fetching team member:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch team member", error: error.message });
  }
};

/**
 * Update a team member's information
 * @param {Object} req - Request object with team ID, member ID, and updated data
 * @param {Object} res - Response object
 */
export const updateTeamMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const memberData = req.body;
    const updatedMember = await updateTeamMemberService(
      id,
      memberId,
      memberData
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    return res.status(200).json(updatedMember);
  } catch (error) {
    console.log("Error updating team member:", error);
    return res
      .status(500)
      .json({ message: "Failed to update team member", error: error.message });
  }
};

/**
 * Remove a member from a team
 * @param {Object} req - Request object with team ID and member ID
 * @param {Object} res - Response object
 */
export const removeTeamMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    await removeTeamMemberService(id, memberId);
    return res
      .status(200)
      .json({ message: "Team member removed successfully" });
  } catch (error) {
    console.log("Error removing team member:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove team member", error: error.message });
  }
};

/**
 * Get all jobs assigned to a specific team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamJobs = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[TeamController] Fetching jobs for team:", id);

    const result = await getTeamJobsService(id);
    console.log("[TeamController] Service result:", result);

    if (!result) {
      console.log("[TeamController] No result from service");
      return res.status(404).json({
        success: false,
        message: "Team not found",
        error: "Team not found",
      });
    }

    const response = {
      success: true,
      data: {
        jobs: result.jobs || [],
      },
    };

    console.log("[TeamController] Sending response:", response);
    return res.status(200).json(response);
  } catch (error) {
    console.log("[TeamController] Error in getTeamJobs:", {
      error,
      message: error.message,
      stack: error.stack,
      teamId: req.params.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team jobs",
      error: error.message,
    });
  }
};

/**
 * Assign jobs to a team
 * @param {Object} req - Request object with team ID and job IDs
 * @param {Object} res - Response object
 */
export const assignJobToTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobIds } = req.body;
    const assignments = await assignJobToTeamService(id, jobIds);
    return res.status(201).json(assignments);
  } catch (error) {
    console.log("Error assigning jobs to team:", error);
    return res
      .status(500)
      .json({ message: "Failed to assign jobs to team", error: error.message });
  }
};

/**
 * Get a specific job assigned to a team
 * @param {Object} req - Request object with team ID and job ID
 * @param {Object} res - Response object
 */
export const getTeamJobById = async (req, res) => {
  try {
    const { id, jobId } = req.params;
    const job = await getTeamJobByIdService(id, jobId);

    if (!job) {
      return res.status(404).json({ message: "Team job not found" });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.log("Error fetching team job:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch team job", error: error.message });
  }
};

/**
 * Remove a job assignment from a team
 * @param {Object} req - Request object with team ID and job ID
 * @param {Object} res - Response object
 */
export const removeJobFromTeam = async (req, res) => {
  try {
    const { id, jobId } = req.params;
    await removeJobFromTeamService(id, jobId);
    return res
      .status(200)
      .json({ message: "Job removed from team successfully" });
  } catch (error) {
    console.log("Error removing job from team:", error);
    return res.status(500).json({
      message: "Failed to remove job from team",
      error: error.message,
    });
  }
};

/**
 * Get performance metrics for a specific team
 * @param {Object} req - Request object with team ID and query parameters
 * @param {Object} res - Response object
 */
export const getTeamPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe } = req.query;
    const performance = await getTeamPerformanceService(id, timeframe);
    return res.status(200).json(performance);
  } catch (error) {
    console.log("Error fetching team performance:", error);
    return res.status(500).json({
      message: "Failed to fetch team performance",
      error: error.message,
    });
  }
};

/**
 * Get hiring metrics for a team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamHiringMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = await getTeamHiringMetricsService(id);
    return res.status(200).json(metrics);
  } catch (error) {
    console.log("Error fetching team hiring metrics:", error);
    return res.status(500).json({
      message: "Failed to fetch team hiring metrics",
      error: error.message,
    });
  }
};

/**
 * Get monthly hiring data for a team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamMonthlyHires = async (req, res) => {
  try {
    const { id } = req.params;
    const monthlyHires = await getTeamMonthlyHiresService(id);
    return res.status(200).json(monthlyHires);
  } catch (error) {
    console.log("Error fetching team monthly hires:", error);
    return res.status(500).json({
      message: "Failed to fetch team monthly hires",
      error: error.message,
    });
  }
};

/**
 * Get time-to-hire trend data for a team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamTimeToHire = async (req, res) => {
  try {
    const { id } = req.params;
    const timeToHire = await getTeamTimeToHireService(id);
    return res.status(200).json(timeToHire);
  } catch (error) {
    console.log("Error fetching team time to hire:", error);
    return res.status(500).json({
      message: "Failed to fetch team time to hire",
      error: error.message,
    });
  }
};

/**
 * Get offer acceptance rate trend data for a team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamOfferAcceptance = async (req, res) => {
  try {
    const { id } = req.params;
    const offerAcceptance = await getTeamOfferAcceptanceService(id);
    return res.status(200).json(offerAcceptance);
  } catch (error) {
    console.log("Error fetching team offer acceptance:", error);
    return res.status(500).json({
      message: "Failed to fetch team offer acceptance",
      error: error.message,
    });
  }
};

/**
 * Get candidate source distribution data for a team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamCandidateSources = async (req, res) => {
  try {
    const { id } = req.params;
    const sources = await getTeamCandidateSourcesService(id);
    return res.status(200).json(sources);
  } catch (error) {
    console.log("Error fetching team candidate sources:", error);
    return res.status(500).json({
      message: "Failed to fetch team candidate sources",
      error: error.message,
    });
  }
};

/**
 * Get performance metrics for individual team members
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamMemberPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const performance = await getTeamMemberPerformanceService(id);
    return res.status(200).json(performance);
  } catch (error) {
    console.log("Error fetching team member performance:", error);
    return res.status(500).json({
      message: "Failed to fetch team member performance",
      error: error.message,
    });
  }
};

/**
 * Get recent activity for a specific team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getTeamActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await getTeamActivityService(id);
    return res.status(200).json(activity);
  } catch (error) {
    console.log("Error fetching team activity:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch team activity", error: error.message });
  }
};

/**
 * Get list of available departments
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getDepartments = async (req, res) => {
  try {
    const departments = await getDepartmentsService();
    return res.status(200).json(departments);
  } catch (error) {
    console.log("Error fetching departments:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch departments", error: error.message });
  }
};

/**
 * Add a new department
 * @param {Object} req - Request object with department data
 * @param {Object} res - Response object
 */
export const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const department = await addDepartmentService(name);
    return res.status(201).json(department);
  } catch (error) {
    console.log("Error adding department:", error);
    return res
      .status(500)
      .json({ message: "Failed to add department", error: error.message });
  }
};

/**
 * Get list of available locations
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getLocations = async (req, res) => {
  try {
    const locations = await getLocationsService();
    return res.status(200).json(locations);
  } catch (error) {
    console.log("Error fetching locations:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch locations", error: error.message });
  }
};

/**
 * Add a new location
 * @param {Object} req - Request object with location data
 * @param {Object} res - Response object
 */
export const addLocation = async (req, res) => {
  try {
    const { name } = req.body;
    const location = await addLocationService(name);
    return res.status(201).json(location);
  } catch (error) {
    console.log("Error adding location:", error);
    return res
      .status(500)
      .json({ message: "Failed to add location", error: error.message });
  }
};

/**
 * Get summary statistics about teams
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getTeamStats = async (req, res) => {
  try {
    const stats = await getTeamStatsService();
    return res.status(200).json(stats);
  } catch (error) {
    console.log("Error fetching team stats:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch team stats", error: error.message });
  }
};

/**
 * Search for teams across multiple fields
 * @param {Object} req - Request object with query parameters
 * @param {Object} res - Response object
 */
export const searchTeams = async (req, res) => {
  try {
    const { query, fields } = req.query;
    const teams = await searchTeamsService(query, fields);
    return res.status(200).json(teams);
  } catch (error) {
    console.log("Error searching teams:", error);
    return res
      .status(500)
      .json({ message: "Failed to search teams", error: error.message });
  }
};

/**
 * Get subteams of a team
 * @param {Object} req - Request object with team ID
 * @param {Object} res - Response object
 */
export const getSubteams = async (req, res) => {
  try {
    const { id } = req.params;
    const subteams = await getSubteamsService(id);
    return res.status(200).json(subteams);
  } catch (error) {
    console.log("Error fetching subteams:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch subteams", error: error.message });
  }
};

/**
 * Add a subteam to a team
 * @param {Object} req - Request object with team ID and subteam data
 * @param {Object} res - Response object
 */
export const addSubteam = async (req, res) => {
  try {
    const { id } = req.params;
    const subteamData = req.body;
    const subteam = await addSubteamService(id, subteamData);
    return res.status(201).json(subteam);
  } catch (error) {
    console.log("Error adding subteam:", error);
    return res
      .status(500)
      .json({ message: "Failed to add subteam", error: error.message });
  }
};

/**
 * Remove a subteam from a team
 * @param {Object} req - Request object with team ID and subteam ID
 * @param {Object} res - Response object
 */
export const removeSubteam = async (req, res) => {
  try {
    const { id, subteamId } = req.params;
    await removeSubteamService(id, subteamId);
    return res.status(200).json({ message: "Subteam removed successfully" });
  } catch (error) {
    console.log("Error removing subteam:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove subteam", error: error.message });
  }
};

/**
 * Update team lead
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<void>}
 */
export const updateTeamLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { leadId, oldLeadId } = req.body;

    console.log(
      `[TeamController] Updating team lead - Team ID: ${id}, Old Lead ID: ${oldLeadId}, New Lead ID: ${leadId}`
    );

    if (!id) {
      console.log("[TeamController] Missing team ID");
      return res.status(400).json({ message: "Team ID is required" });
    }

    // Convert IDs to integers and handle null/undefined cases
    const teamId = parseInt(id);
    const newLeadId = leadId ? parseInt(leadId) : null;
    const currentLeadId = oldLeadId ? parseInt(oldLeadId) : null;

    const result = await updateTeamLeadService(
      teamId,
      currentLeadId,
      newLeadId
    );

    console.log(
      `[TeamController] Successfully updated team lead. New lead ID: ${newLeadId}`
    );

    return res.status(200).json({
      message: "Team lead updated successfully",
      team: result.team,
      members: result.members,
    });
  } catch (error) {
    console.log("[TeamController] Error in updateTeamLead:", error);
    return res.status(500).json({ message: error.message });
  }
};
