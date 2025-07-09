import {
  getAllTeamsRepo,
  createTeamRepo,
  getTeamByIdRepo,
  updateTeamRepo,
  deleteTeamRepo,
  getTeamMembersRepo,
  addTeamMemberRepo,
  getTeamMemberByIdRepo,
  updateTeamMemberRepo,
  removeTeamMemberRepo,
  getTeamJobsRepo,
  assignJobToTeamRepo,
  getTeamJobByIdRepo,
  removeJobFromTeamRepo,
  getTeamPerformanceRepo,
  getTeamHiringMetricsRepo,
  getTeamMonthlyHiresRepo,
  getTeamTimeToHireRepo,
  getTeamOfferAcceptanceRepo,
  getTeamCandidateSourcesRepo,
  getTeamMemberPerformanceRepo,
  getTeamActivityRepo,
  getDepartmentsRepo,
  addDepartmentRepo,
  getLocationsRepo,
  addLocationRepo,
  getTeamStatsRepo,
  searchTeamsRepo,
  getSubteamsRepo,
  addSubteamRepo,
  removeSubteamRepo,
  updateTeamLeadRepo,
} from "../repositories/teamRepository.js";

import { Team } from "../models/Team.js";
import { TeamMember } from "../models/TeamMember.js";
import { Recruiter } from "../models/Recruiter.js";
import { User } from "../models/User.js";
import { RecruiterJob } from "../models/RecruiterJob.js";
import { Job } from "../models/Job.js";
import { TeamJob } from "../models/TeamJob.js";
import { Op } from "sequelize";

/**
 * Get all teams with filtering and pagination
 * @param {Object} params - Query parameters for filtering and pagination
 * @returns {Promise<Object>} Teams data with pagination info
 */
export const getAllTeamsService = async (params) => {
  try {
    const result = await getAllTeamsRepo(params);

    // Enhance each team with formatted lead information
    if (result && result.teams) {
      result.teams = result.teams.map((team) => {
        const plainTeam = team.get ? team.get({ plain: true }) : team;

        if (plainTeam.Lead?.User) {
          const user = plainTeam.Lead.User;
          plainTeam.lead = `${user.firstName} ${user.lastName}`.trim();
          plainTeam.leadEmail = user.email;
          plainTeam.leadPhone = user.phone;
          plainTeam.leadAvatar = user.profilePicture;
        }

        return plainTeam;
      });
    }

    return result;
  } catch (error) {
    console.log("Service error - getAllTeams:", error);
    throw error;
  }
};

/**
 * Create a new team
 * @param {Object} teamData - Team data to create
 * @returns {Promise<Object>} Created team
 */
export const createTeamService = async (teamData) => {
  try {
    console.log(
      "[TeamService] Creating team with data:",
      JSON.stringify(teamData, null, 2)
    );

    // Validate goals format if present
    if (teamData.goals) {
      try {
        const goals = JSON.parse(teamData.goals);
        console.log(
          "[TeamService] Parsed goals:",
          JSON.stringify(goals, null, 2)
        );
      } catch (e) {
        console.log("[TeamService] Error parsing goals:", e);
        throw new Error("Invalid goals format: " + e.message);
      }
    }

    const result = await createTeamRepo(teamData);
    console.log(
      "[TeamService] Team created successfully:",
      JSON.stringify(result, null, 2)
    );
    return result;
  } catch (error) {
    console.log("[TeamService] Error creating team:", error);
    console.log("[TeamService] Error stack:", error.stack);
    throw error;
  }
};

/**
 * Get a specific team by ID
 * @param {number} id - Team ID
 * @returns {Promise<Object>} Team data
 */
export const getTeamByIdService = async (id) => {
  try {
    const team = await getTeamByIdRepo(id);

    if (!team) {
      throw new Error("Team not found");
    }

    // Convert to plain object and enhance with lead information
    const plainTeam = team.get ? team.get({ plain: true }) : team;

    if (plainTeam.Lead?.User) {
      const user = plainTeam.Lead.User;
      plainTeam.lead = `${user.firstName} ${user.lastName}`.trim();
      plainTeam.leadEmail = user.email;
      plainTeam.leadPhone = user.phone;
      plainTeam.leadAvatar = user.profilePicture;
    }

    return plainTeam;
  } catch (error) {
    console.log("Service error - getTeamById:", error);
    throw error;
  }
};

/**
 * Update a team's information
 * @param {number} id - Team ID
 * @param {Object} teamData - Updated team data
 * @returns {Promise<Object>} Updated team
 */
export const updateTeamService = async (id, teamData) => {
  try {
    return await updateTeamRepo(id, teamData);
  } catch (error) {
    console.log("Service error - updateTeam:", error);
    throw error;
  }
};

/**
 * Delete a team
 * @param {number} id - Team ID
 * @returns {Promise<void>}
 */
export const deleteTeamService = async (id) => {
  try {
    await deleteTeamRepo(id);
  } catch (error) {
    console.log("Service error - deleteTeam:", error);
    throw error;
  }
};

/**
 * Get all members of a specific team
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} Team members
 */
export const getTeamMembersService = async (teamId) => {
  try {
    console.log("[TeamService] Fetching members for team:", teamId);
    const response = await getTeamMembersRepo(teamId);
    console.log("[TeamService] Successfully fetched members:", response);

    if (!response || !response.members) {
      throw new Error("Invalid response format from repository");
    }

    // Return the members array directly
    return response.members;
  } catch (error) {
    console.log("[TeamService] Error fetching team members:", error);
    throw error;
  }
};

/**
 * Add a new member to a team
 * @param {number} teamId - Team ID
 * @param {Object} memberData - Member data to add
 * @returns {Promise<Object>} Added team member
 */
export const addTeamMemberService = async (teamId, memberData) => {
  try {
    // If adding as Team Lead, first demote existing Team Lead if any
    if (memberData.role === "Team Lead") {
      const existingLead = await TeamMember.findOne({
        where: {
          teamId: teamId,
          role: "Team Lead",
        },
      });

      if (existingLead) {
        // Demote existing lead to Member role
        await existingLead.update({
          role: "Member",
        });
      }
    }

    // Now add the new member
    const newMember = await TeamMember.create({
      teamId: teamId,
      recruiterId: memberData.recruiterId,
      role: memberData.role,
      joinDate: memberData.joinDate,
    });

    return newMember;
  } catch (error) {
    console.log("[TeamService] Error in addTeamMember:", error);
    throw error;
  }
};

/**
 * Get a specific team member by ID
 * @param {number} teamId - Team ID
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Team member data
 */
export const getTeamMemberByIdService = async (teamId, memberId) => {
  try {
    return await getTeamMemberByIdRepo(teamId, memberId);
  } catch (error) {
    console.log("Service error - getTeamMemberById:", error);
    throw error;
  }
};

/**
 * Update a team member's information
 * @param {number} teamId - Team ID
 * @param {number} memberId - Member ID
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} Updated team member
 */
export const updateTeamMemberService = async (teamId, memberId, memberData) => {
  try {
    return await updateTeamMemberRepo(teamId, memberId, memberData);
  } catch (error) {
    console.log("Service error - updateTeamMember:", error);
    throw error;
  }
};

/**
 * Remove a member from a team
 * @param {number} teamId - Team ID
 * @param {number} memberId - Member ID
 * @returns {Promise<void>}
 */
export const removeTeamMemberService = async (teamId, memberId) => {
  try {
    await removeTeamMemberRepo(teamId, memberId);
  } catch (error) {
    console.log("Service error - removeTeamMember:", error);
    throw error;
  }
};

/**
 * Get all jobs assigned to a specific team
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} Team jobs
 */
export const getTeamJobsService = async (teamId) => {
  try {
    // Get all recruiters who are members of the team
    const teamMembers = await TeamMember.findAll({
      where: { teamId },
      include: [
        {
          model: Recruiter,
          attributes: ["id", "userId"],
        },
      ],
    });
    const teamRecruiterIds = teamMembers
      .map((tm) => tm.Recruiter?.id)
      .filter((id) => !!id);

    // Get all jobs assigned to any recruiter in the team
    const recruiterJobs = await RecruiterJob.findAll({
      where: {
        recruiterId: teamRecruiterIds.length
          ? { [Op.in]: teamRecruiterIds }
          : -1,
      },
      include: [
        {
          model: Job,
          attributes: [
            "id",
            "jobTitle",
            "department",
            "location",
            "jobStatus",
            "jobType",
            "description",
            "requirements",
            "salaryMin",
            "salaryMax",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    // Unique jobs by jobId
    const jobMap = new Map();
    for (const rj of recruiterJobs) {
      const job = rj.Job;
      if (!job) continue;
      if (!jobMap.has(job.id)) {
        jobMap.set(job.id, job);
      }
    }

    // For each job, get all recruiters assigned to it
    const jobs = [];
    for (const job of jobMap.values()) {
      const allRecruiterJobs = await RecruiterJob.findAll({
        where: { jobId: job.id },
        include: [
          {
            model: Recruiter,
            include: [
              {
                model: User,
                attributes: ["firstName", "lastName", "email", "id"],
              },
            ],
          },
        ],
      });
      const recruiters = allRecruiterJobs.map((rj) => {
        const recruiter = rj.Recruiter;
        const user = recruiter?.User;
        return {
          id: recruiter?.id,
          userId: recruiter?.userId,
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
        };
      });
      jobs.push({
        id: job.id,
        title: job.jobTitle,
        department: job.department,
        location: job.location,
        status: job.jobStatus,
        type: job.jobType,
        description: job.description,
        requirements: job.requirements,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        recruiters,
      });
    }
    return { success: true, jobs };
  } catch (error) {
    console.log("[TeamService] Error in getTeamJobsService:", error);
    throw error;
  }
};

/**
 * Assign jobs to a team
 * @param {number} teamId - Team ID
 * @param {Array<number>} jobIds - Array of job IDs to assign
 * @returns {Promise<Array>} Assigned jobs
 */
export const assignJobToTeamService = async (teamId, jobIds) => {
  try {
    return await assignJobToTeamRepo(teamId, jobIds);
  } catch (error) {
    console.log("Service error - assignJobToTeam:", error);
    throw error;
  }
};

/**
 * Get a specific job assigned to a team
 * @param {number} teamId - Team ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Team job data
 */
export const getTeamJobByIdService = async (teamId, jobId) => {
  try {
    return await getTeamJobByIdRepo(teamId, jobId);
  } catch (error) {
    console.log("Service error - getTeamJobById:", error);
    throw error;
  }
};

/**
 * Remove a job assignment from a team
 * @param {number} teamId - Team ID
 * @param {number} jobId - Job ID
 * @returns {Promise<void>}
 */
export const removeJobFromTeamService = async (teamId, jobId) => {
  try {
    await removeJobFromTeamRepo(teamId, jobId);
  } catch (error) {
    console.log("Service error - removeJobFromTeam:", error);
    throw error;
  }
};

/**
 * Get performance metrics for a specific team
 * @param {number} teamId - Team ID
 * @param {string} timeframe - Time period for metrics
 * @returns {Promise<Object>} Team performance metrics
 */
export const getTeamPerformanceService = async (teamId, timeframe) => {
  try {
    return await getTeamPerformanceRepo(teamId, timeframe);
  } catch (error) {
    console.log("Service error - getTeamPerformance:", error);
    throw error;
  }
};

/**
 * Get hiring metrics for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Team hiring metrics
 */
export const getTeamHiringMetricsService = async (teamId) => {
  try {
    return await getTeamHiringMetricsRepo(teamId);
  } catch (error) {
    console.log("Service error - getTeamHiringMetrics:", error);
    throw error;
  }
};

/**
 * Get monthly hiring data for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Monthly hiring data
 */
export const getTeamMonthlyHiresService = async (teamId) => {
  try {
    return await getTeamMonthlyHiresRepo(teamId);
  } catch (error) {
    console.log("Service error - getTeamMonthlyHires:", error);
    throw error;
  }
};

/**
 * Get time-to-hire trend data for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Time-to-hire trend data
 */
export const getTeamTimeToHireService = async (teamId) => {
  try {
    return await getTeamTimeToHireRepo(teamId);
  } catch (error) {
    console.log("Service error - getTeamTimeToHire:", error);
    throw error;
  }
};

/**
 * Get offer acceptance rate trend data for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Offer acceptance rate data
 */
export const getTeamOfferAcceptanceService = async (teamId) => {
  try {
    return await getTeamOfferAcceptanceRepo(teamId);
  } catch (error) {
    console.log("Service error - getTeamOfferAcceptance:", error);
    throw error;
  }
};

/**
 * Get candidate source distribution data for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Candidate source distribution data
 */
export const getTeamCandidateSourcesService = async (teamId) => {
  try {
    return await getTeamCandidateSourcesRepo(teamId);
  } catch (error) {
    console.log("Service error - getTeamCandidateSources:", error);
    throw error;
  }
};

/**
 * Get performance metrics for individual team members
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} Team member performance metrics
 */
export const getTeamMemberPerformanceService = async (teamId) => {
  try {
    return await getTeamMemberPerformanceRepo(teamId);
  } catch (error) {
    console.log("Service error - getTeamMemberPerformance:", error);
    throw error;
  }
};

/**
 * Get recent activity for a specific team
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} Team activity data
 */
export const getTeamActivityService = async (teamId) => {
  try {
    return await getTeamActivityRepo(teamId);
  } catch (error) {
    console.log("Service error - getTeamActivity:", error);
    throw error;
  }
};

/**
 * Get list of available departments
 * @returns {Promise<Array>} List of departments
 */
export const getDepartmentsService = async () => {
  try {
    return await getDepartmentsRepo();
  } catch (error) {
    console.log("Service error - getDepartments:", error);
    throw error;
  }
};

/**
 * Add a new department
 * @param {string} name - Department name
 * @returns {Promise<Object>} Created department
 */
export const addDepartmentService = async (name) => {
  try {
    return await addDepartmentRepo(name);
  } catch (error) {
    console.log("Service error - addDepartment:", error);
    throw error;
  }
};

/**
 * Get list of available locations
 * @returns {Promise<Array>} List of locations
 */
export const getLocationsService = async () => {
  try {
    return await getLocationsRepo();
  } catch (error) {
    console.log("Service error - getLocations:", error);
    throw error;
  }
};

/**
 * Add a new location
 * @param {string} name - Location name
 * @returns {Promise<Object>} Created location
 */
export const addLocationService = async (name) => {
  try {
    return await addLocationRepo(name);
  } catch (error) {
    console.log("Service error - addLocation:", error);
    throw error;
  }
};

/**
 * Get summary statistics about teams
 * @returns {Promise<Object>} Team statistics
 */
export const getTeamStatsService = async () => {
  try {
    return await getTeamStatsRepo();
  } catch (error) {
    console.log("Service error - getTeamStats:", error);
    throw error;
  }
};

/**
 * Search for teams across multiple fields
 * @param {string} query - Search query
 * @param {Array<string>} fields - Fields to search in
 * @returns {Promise<Array>} Matching teams
 */
export const searchTeamsService = async (query, fields) => {
  try {
    return await searchTeamsRepo(query, fields);
  } catch (error) {
    console.log("Service error - searchTeams:", error);
    throw error;
  }
};

/**
 * Get subteams of a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} List of subteams
 */
export const getSubteamsService = async (teamId) => {
  try {
    return await getSubteamsRepo(teamId);
  } catch (error) {
    console.log("Service error - getSubteams:", error);
    throw error;
  }
};

/**
 * Add a subteam to a team
 * @param {number} teamId - Parent team ID
 * @param {Object} subteamData - Subteam data
 * @returns {Promise<Object>} Created subteam
 */
export const addSubteamService = async (teamId, subteamData) => {
  try {
    return await addSubteamRepo(teamId, subteamData);
  } catch (error) {
    console.log("Service error - addSubteam:", error);
    throw error;
  }
};

/**
 * Remove a subteam from a team
 * @param {number} teamId - Parent team ID
 * @param {number} subteamId - Subteam ID
 * @returns {Promise<void>}
 */
export const removeSubteamService = async (teamId, subteamId) => {
  try {
    await removeSubteamRepo(teamId, subteamId);
  } catch (error) {
    console.log("Service error - removeSubteam:", error);
    throw error;
  }
};

/**
 * Update team lead
 * @param {number} teamId - Team ID
 * @param {number} oldLeadId - Old lead ID
 * @param {number} newLeadId - New lead ID
 * @returns {Promise<Object>} Updated team with members
 */
export const updateTeamLeadService = async (teamId, oldLeadId, newLeadId) => {
  try {
    // Validate team exists
    const team = await getTeamByIdRepo(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // If new lead ID is provided, validate recruiter exists
    if (newLeadId) {
      const recruiter = await Recruiter.findByPk(newLeadId, {
        include: [
          {
            model: User,
            attributes: ["firstName", "lastName", "email"],
          },
        ],
      });
      if (!recruiter) {
        throw new Error("Recruiter not found");
      }
    }

    // Update team lead
    await updateTeamLeadRepo(teamId, oldLeadId, newLeadId);

    // Get updated team data
    const updatedTeam = await getTeamByIdRepo(teamId);
    const teamMembers = await getTeamMembersRepo(teamId);

    return {
      team: updatedTeam,
      members: teamMembers,
    };
  } catch (error) {
    console.log("[TeamService] Error in updateTeamLead:", error);
    throw error;
  }
};
