import { Op } from "sequelize";
import { Team } from "../models/Team.js";
import { TeamMember } from "../models/TeamMember.js";
import { TeamMemberSkill } from "../models/TeamMemberSkill.js";
import { TeamJob } from "../models/TeamJob.js";
import { Job } from "../models/Job.js";
import { Recruiter } from "../models/Recruiter.js";
import { HiringMetrics } from "../models/HiringMetrics.js";
import { User } from "../models/User.js";
import { DocumentShare } from "../models/DocumentShare.js";
import { sequelize } from "../config/sequelize.js";

/**
 * Get all teams with filtering and pagination
 * Only returns teams where the Lead's User.clientId matches the requester's clientId.
 * Teams without a Lead or with a Lead from another client are excluded.
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Teams with pagination info
 */
export const getAllTeamsRepo = async ({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "DESC",
  status,
  department,
  location,
  size,
  clientId,
}) => {
  try {
    if (!clientId) throw new Error("clientId is required for all team queries");
    console.log("[TeamRepository] Fetching all teams with params:", {
      page,
      limit,
      sortBy,
      order,
      status,
      department,
      location,
      size,
      clientId,
    });

    // Build where clause based on filters
    const whereClause = {};
    if (status) whereClause.status = status;
    if (department) whereClause.department = department;
    if (location) whereClause.location = location;
    if (size) whereClause.size = size;

    // Always filter by Lead's User.clientId
    let leadInclude = {
      model: Recruiter,
      as: "Lead",
      required: true, // Only include teams with a Lead
      include: [
        {
          model: User,
          attributes: [
            "firstName",
            "lastName",
            "email",
            "phone",
            "profilePicture",
          ],
          where: { clientId },
          required: true, // Only include teams where Lead's User matches clientId
        },
      ],
    };

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count for pagination (must join through Lead's User)
    const totalItems = await Team.count({
      where: whereClause,
      include: [leadInclude],
    });
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch teams with basic info and lead data
    const teams = await Team.findAll({
      where: whereClause,
      include: [leadInclude],
      order: [[sortBy, order]],
      offset,
      limit,
    });

    // Then, get member counts for each team
    const memberCounts = await TeamMember.findAll({
      attributes: [
        "teamId",
        [sequelize.fn("COUNT", sequelize.col("id")), "memberCount"],
      ],
      where: {
        teamId: teams.map((team) => team.id),
      },
      group: ["teamId"],
    });

    // Create a map of team ID to member count
    const memberCountMap = memberCounts.reduce((acc, curr) => {
      acc[curr.teamId] = parseInt(curr.get("memberCount"));
      return acc;
    }, {});

    // Transform teams and add member counts
    const transformedTeams = teams.map((team) => {
      const plainTeam = team.get({ plain: true });
      return {
        ...plainTeam,
        members: memberCountMap[team.id] || 0,
      };
    });

    console.log(`[TeamRepository] Found ${teams.length} teams`);
    console.log(
      "[TeamRepository] Teams data:",
      JSON.stringify(transformedTeams, null, 2)
    );

    return {
      teams: transformedTeams,
      totalItems,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.log("[TeamRepository] Error fetching teams:", error);
    throw error;
  }
};

// Helper function to safely handle transaction rollback
const safeRollback = async (transaction) => {
  if (transaction && !transaction.finished) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.log("Error during transaction rollback:", rollbackError);
    }
  }
};

// Helper function to safely handle transaction commit
const safeCommit = async (transaction) => {
  if (transaction && !transaction.finished) {
    try {
      await transaction.commit();
    } catch (commitError) {
      console.log("Error during transaction commit:", commitError);
      await safeRollback(transaction);
      throw commitError;
    }
  }
};

/**
 * Create a new team with members
 * @param {Object} teamData - Team data including members
 * @returns {Promise<Object>} Created team with members
 */
export const createTeamRepo = async (teamData) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Check if team name already exists for this client (via Lead's User)
    const existingTeam = await Team.findOne({
      where: {
        name: teamData.name,
      },
      include: [
        {
          model: Recruiter,
          as: "Lead",
          required: true,
          include: [
            {
              model: User,
              where: { clientId: teamData.clientId },
              required: true,
            },
          ],
        },
      ],
    });

    if (existingTeam) {
      throw new Error("A team with this name already exists for this client");
    }

    // If parentTeamId is 0, set it to null since 0 is not a valid team ID
    if (teamData.parentTeamId === 0) {
      teamData.parentTeamId = null;
    }

    // Validate parentTeamId if it's being set
    if (teamData.parentTeamId) {
      const parentTeam = await Team.findByPk(teamData.parentTeamId);
      if (!parentTeam) {
        throw new Error("Parent team not found");
      }
    }

    // Create the main team record
    const team = await Team.create(teamData, { transaction });
    console.log("Team data received:", teamData);

    // Handle team members
    if (teamData.teamMembers && teamData.teamMembers.length > 0) {
      const memberPromises = teamData.teamMembers.map((member) =>
        TeamMember.create(
          {
            teamId: team.id,
            recruiterId: member.recruiterId,
            role: member.role || "Member",
            joinDate: member.joinDate || new Date(),
            hires: member.hires || 0,
            timeToHire: member.timeToHire || 0,
            offerAcceptanceRate: member.offerAcceptanceRate || 0,
          },
          { transaction }
        )
      );
      await Promise.all(memberPromises);
    }

    // If there's a team lead, automatically add them as a member if not already added
    if (teamData.leadId) {
      const isLeadMember = teamData.teamMembers?.some(
        (member) => member.recruiterId === teamData.leadId
      );

      if (!isLeadMember) {
        await TeamMember.create(
          {
            teamId: team.id,
            recruiterId: teamData.leadId,
            role: "Team Lead",
            joinDate: new Date(),
            hires: 0,
            timeToHire: 0,
            offerAcceptanceRate: 0,
          },
          { transaction }
        );
      }
    }

    // Handle initial jobs if any
    if (teamData.assignedJobs && teamData.assignedJobs.length > 0) {
      const jobAssignments = teamData.assignedJobs.map((jobId) => ({
        teamId: team.id,
        jobId,
        assignedDate: new Date(),
      }));
      await TeamJob.bulkCreate(jobAssignments, { transaction });
    }

    // Handle initial skills for team members if any
    if (
      teamData.memberSkills &&
      Object.keys(teamData.memberSkills).length > 0
    ) {
      const skillPromises = [];
      for (const [memberId, skills] of Object.entries(teamData.memberSkills)) {
        const memberSkillPromises = skills.map((skill) =>
          TeamMemberSkill.create(
            {
              teamMemberId: memberId,
              skill: skill.name,
              proficiencyLevel: skill.level || 1,
            },
            { transaction }
          )
        );
        skillPromises.push(...memberSkillPromises);
      }
      await Promise.all(skillPromises);
    }

    // Get the complete team data with associations
    const createdTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: Recruiter,
          as: "Lead",
          include: [
            {
              model: User,
              attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "phone",
                "profilePicture",
              ],
            },
          ],
        },
      ],
      transaction,
    });

    // Commit the transaction
    await safeCommit(transaction);

    // Return the created team
    return createdTeam;
  } catch (error) {
    await safeRollback(transaction);
    console.log("Error in createTeam:", error);
    throw error;
  }
};

/**
 * Get a specific team by ID
 * @param {number} id - Team ID
 * @returns {Promise<Object>} Team data
 */
export const getTeamByIdRepo = async (id) => {
  return await Team.findByPk(id, {
    include: [
      {
        model: Recruiter,
        as: "Lead",
        include: [
          {
            model: User,
            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
              "phone",
              "profilePicture",
            ],
          },
        ],
      },
    ],
  });
};

/**
 * Update a team's information
 * @param {number} id - Team ID
 * @param {Object} teamData - Updated team data
 * @returns {Promise<Object>} Updated team
 */
export const updateTeamRepo = async (id, teamData) => {
  const team = await Team.findByPk(id);
  if (!team) return null;

  // If parentTeamId is 0, set it to null since 0 is not a valid team ID
  if (teamData.parentTeamId === 0) {
    teamData.parentTeamId = null;
  }

  // Validate parentTeamId if it's being set
  if (teamData.parentTeamId) {
    const parentTeam = await Team.findByPk(teamData.parentTeamId);
    if (!parentTeam) {
      throw new Error("Parent team not found");
    }
    // Prevent circular reference
    if (teamData.parentTeamId === id) {
      throw new Error("Team cannot be its own parent");
    }
  }

  return await team.update(teamData);
};

/**
 * Delete a team
 * @param {number} id - Team ID
 * @returns {Promise<void>}
 */
export const deleteTeamRepo = async (id) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const team = await Team.findByPk(id, { transaction });
    if (!team) throw new Error("Team not found");

    // Delete related records in the correct order
    // 1. Delete team member skills
    await TeamMemberSkill.destroy({
      where: {
        teamMemberId: {
          [Op.in]: sequelize.literal(`(SELECT id FROM team_members WHERE teamId = ${id})`)
        }
      },
      transaction
    });

    // 2. Delete team members
    await TeamMember.destroy({
      where: { teamId: id },
      transaction
    });

    // 3. Delete team jobs
    await TeamJob.destroy({
      where: { teamId: id },
      transaction
    });

    // 4. Delete document shares for this team
    await DocumentShare.destroy({
      where: { teamId: id },
      transaction
    });

    // 5. Update subteams to remove parent reference
    await Team.update(
      { parentTeamId: null },
      {
        where: { parentTeamId: id },
        transaction
      }
    );

    // 6. Finally delete the team
    await team.destroy({ transaction });

    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

/**
 * Get all members of a specific team
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} Team members
 */
export const getTeamMembersRepo = async (teamId) => {
  console.log(`[TeamRepository] Fetching members for team ID: ${teamId}`);

  const team = await Team.findByPk(teamId);
  if (!team) {
    console.log(`[TeamRepository] Team not found with ID: ${teamId}`);
    throw new Error("Team not found");
  }

  const members = await TeamMember.findAll({
    where: { teamId },
    include: [
      {
        model: Recruiter,
        required: true,
        include: [
          {
            model: User,
            required: true,
            attributes: [
              "firstName",
              "lastName",
              "email",
              "phone",
              "profilePicture",
            ],
          },
        ],
      },
    ],
    attributes: [
      "id",
      "teamId",
      "recruiterId",
      "role",
      "joinDate",
      "hires",
      "timeToHire",
      "offerAcceptanceRate",
    ],
  });

  console.log(
    `[TeamRepository] Found ${members.length} members for team ID: ${teamId}`
  );

  // Transform each member to match frontend expectations
  const transformedMembers = members.map((member) => {
    const plainMember = member.get({ plain: true });
    return {
      id: plainMember.id,
      teamId: plainMember.teamId,
      recruiterId: plainMember.recruiterId,
      role: plainMember.role || "Member",
      name: plainMember.Recruiter?.User
        ? `${plainMember.Recruiter.User.firstName || ""} ${plainMember.Recruiter.User.lastName || ""
          }`.trim()
        : "",
      email: plainMember.Recruiter?.User?.email || "",
      phone: plainMember.Recruiter?.User?.phone || "",
      avatar: plainMember.Recruiter?.User?.profilePicture || "/placeholder.svg",
      joinDate: plainMember.joinDate || new Date(),
      hires: plainMember.hires || 0,
      timeToHire: plainMember.timeToHire || 0,
      offerAcceptanceRate: plainMember.offerAcceptanceRate || 0,
      department: plainMember.Recruiter?.department || "",
      specialization: plainMember.Recruiter?.specialization || "",
      status: plainMember.Recruiter?.status || "Active",
    };
  });

  console.log(
    "[TeamRepository] Transformed members data:",
    JSON.stringify(transformedMembers, null, 2)
  );
  return { members: transformedMembers }; // Return object with members property
};

/**
 * Add a new member to a team
 * @param {number} teamId - Team ID
 * @param {Object} memberData - Member data
 * @returns {Promise<Object>} Added team member
 */
export const addTeamMemberRepo = async (teamId, memberData) => {
  const transaction = await sequelize.transaction();

  try {
    // Check if member already exists in team
    const existingMember = await TeamMember.findOne({
      where: {
        teamId: teamId,
        recruiterId: memberData.recruiterId,
      },
    });

    if (existingMember) {
      throw new Error("Recruiter is already a member of this team");
    }

    const newMember = await TeamMember.create(
      {
        teamId: teamId,
        recruiterId: memberData.recruiterId,
        role: memberData.role,
        joinDate: memberData.joinDate || new Date(),
      },
      { transaction }
    );

    await transaction.commit();
    return newMember;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get a specific team member by ID
 * @param {number} teamId - Team ID
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Team member data
 */
export const getTeamMemberByIdRepo = async (teamId, memberId) => {
  const member = await TeamMember.findOne({
    where: { id: memberId, teamId },
    include: [
      {
        model: Recruiter,
        include: [
          {
            model: User,
            attributes: [
              "firstName",
              "lastName",
              "email",
              "phone",
              "profilePicture",
            ],
          },
        ],
        attributes: ["id", "userId", "department", "specialization", "status"],
      },
    ],
  });

  if (!member) return null;

  // Transform the data to match frontend expectations
  const plainMember = member.get({ plain: true });
  return {
    id: plainMember.id,
    teamId: plainMember.teamId,
    recruiterId: plainMember.recruiterId,
    role: plainMember.role,
    name: plainMember.Recruiter?.User
      ? `${plainMember.Recruiter.User.firstName || ""} ${plainMember.Recruiter.User.lastName || ""
        }`.trim()
      : "",
    email: plainMember.Recruiter?.User?.email,
    phone: plainMember.Recruiter?.User?.phone,
    avatar: plainMember.Recruiter?.User?.profilePicture || "/placeholder.svg",
    joinDate: plainMember.joinDate,
    hires: plainMember.hires || 0,
    timeToHire: plainMember.timeToHire || 0,
    offerAcceptanceRate: plainMember.offerAcceptanceRate || 0,
  };
};

/**
 * Update a team member's information
 * @param {number} teamId - Team ID
 * @param {number} memberId - Member ID
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} Updated team member
 */
export const updateTeamMemberRepo = async (teamId, memberId, memberData) => {
  const member = await TeamMember.findOne({ where: { id: memberId, teamId } });
  if (!member) return null;
  return await member.update(memberData);
};

/**
 * Remove a member from a team
 * @param {number} teamId - Team ID
 * @param {number} memberId - Member ID
 * @returns {Promise<void>}
 */
export const removeTeamMemberRepo = async (teamId, memberId) => {
  const member = await TeamMember.findOne({ where: { id: memberId, teamId } });
  if (!member) throw new Error("Team member not found");
  await member.destroy();
};

/**
 * Get all jobs assigned to a specific team
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} Team jobs
 */
export const getTeamJobsRepo = async (teamId) => {
  return await TeamJob.findAll({
    where: { teamId },
    include: [
      {
        model: Job,
        attributes: ["id", "title", "department", "status", "location"],
      },
    ],
  });
};

/**
 * Assign jobs to a team
 * @param {number} teamId - Team ID
 * @param {Array<number>} jobIds - Job IDs to assign
 * @returns {Promise<Array>} Assigned jobs
 */
export const assignJobToTeamRepo = async (teamId, jobIds) => {
  const team = await Team.findByPk(teamId);
  if (!team) throw new Error("Team not found");

  const assignments = await Promise.all(
    jobIds.map((jobId) => TeamJob.create({ teamId, jobId }))
  );

  return assignments;
};

/**
 * Get a specific job assigned to a team
 * @param {number} teamId - Team ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Team job data
 */
export const getTeamJobByIdRepo = async (teamId, jobId) => {
  return await TeamJob.findOne({
    where: { teamId, jobId },
    include: [
      {
        model: Job,
        attributes: ["id", "title", "department", "status", "location"],
      },
    ],
  });
};

/**
 * Remove a job assignment from a team
 * @param {number} teamId - Team ID
 * @param {number} jobId - Job ID
 * @returns {Promise<void>}
 */
export const removeJobFromTeamRepo = async (teamId, jobId) => {
  const teamJob = await TeamJob.findOne({ where: { teamId, jobId } });
  if (!teamJob) throw new Error("Team job not found");
  await teamJob.destroy();
};

/**
 * Get performance metrics for a specific team
 * @param {number} teamId - Team ID
 * @param {string} timeframe - Time period for metrics
 * @returns {Promise<Object>} Team performance metrics
 */
export const getTeamPerformanceRepo = async (teamId, timeframe) => {
  const team = await Team.findByPk(teamId, {
    include: [
      {
        model: HiringMetrics,
        through: { attributes: [] },
      },
    ],
  });

  if (!team) throw new Error("Team not found");

  // Process and return performance metrics based on timeframe
  return {
    timeToHire: team.timeToHire,
    offerAcceptanceRate: team.offerAcceptanceRate,
    activeJobs: team.activeJobs,
    monthlyHires: JSON.parse(team.monthlyHires || "[]"),
    // Add more metrics as needed
  };
};

/**
 * Get hiring metrics for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Team hiring metrics
 */
export const getTeamHiringMetricsRepo = async (teamId) => {
  const team = await Team.findByPk(teamId, {
    include: [
      {
        model: HiringMetrics,
        through: { attributes: [] },
      },
    ],
  });

  if (!team) throw new Error("Team not found");

  return {
    activeJobs: team.activeJobs,
    hires: team.hires,
    // Add more metrics as needed
  };
};

/**
 * Get monthly hiring data for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Monthly hiring data
 */
export const getTeamMonthlyHiresRepo = async (teamId) => {
  const team = await Team.findByPk(teamId);
  if (!team) throw new Error("Team not found");
  return JSON.parse(team.monthlyHires || "[]");
};

/**
 * Get time-to-hire trend data for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Time-to-hire trend data
 */
export const getTeamTimeToHireRepo = async (teamId) => {
  const team = await Team.findByPk(teamId);
  if (!team) throw new Error("Team not found");
  return { timeToHire: team.timeToHire };
};

/**
 * Get offer acceptance rate trend data for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Offer acceptance rate data
 */
export const getTeamOfferAcceptanceRepo = async (teamId) => {
  const team = await Team.findByPk(teamId);
  if (!team) throw new Error("Team not found");
  return { offerAcceptanceRate: team.offerAcceptanceRate };
};

/**
 * Get candidate source distribution data for a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Object>} Candidate source distribution data
 */
export const getTeamCandidateSourcesRepo = async (teamId) => {
  // This would need to be implemented based on your data structure
  // Return mock data for now
  return {
    referrals: 30,
    jobBoards: 25,
    socialMedia: 20,
    directApplications: 15,
    other: 10,
  };
};

/**
 * Get performance metrics for individual team members
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} Team member performance metrics
 */
export const getTeamMemberPerformanceRepo = async (teamId) => {
  const members = await TeamMember.findAll({
    where: { teamId },
    attributes: [
      "id",
      "recruiterId",
      "role",
      "hires",
      "timeToHire",
      "offerAcceptanceRate",
    ],
  });

  return members;
};

/**
 * Get recent activity for a specific team
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} Team activity data
 */
export const getTeamActivityRepo = async (teamId) => {
  const team = await Team.findByPk(teamId);
  if (!team) throw new Error("Team not found");
  return JSON.parse(team.recentActivity || "[]");
};

/**
 * Get list of available departments
 * @returns {Promise<Array>} List of departments
 */
export const getDepartmentsRepo = async () => {
  const teams = await Team.findAll({
    attributes: ["department"],
    group: ["department"],
    where: {
      department: {
        [Op.not]: null,
      },
    },
  });

  return teams.map((team) => team.department);
};

/**
 * Add a new department
 * @param {string} name - Department name
 * @returns {Promise<Object>} Created department
 */
export const addDepartmentRepo = async (name) => {
  // This would typically involve creating a new department record
  // For now, just return the name
  return { name };
};

/**
 * Get list of available locations
 * @returns {Promise<Array>} List of locations
 */
export const getLocationsRepo = async () => {
  const teams = await Team.findAll({
    attributes: ["location"],
    group: ["location"],
    where: {
      location: {
        [Op.not]: null,
      },
    },
  });

  return teams.map((team) => team.location);
};

/**
 * Add a new location
 * @param {string} name - Location name
 * @returns {Promise<Object>} Created location
 */
export const addLocationRepo = async (name) => {
  // This would typically involve creating a new location record
  // For now, just return the name
  return { name };
};

/**
 * Get summary statistics about teams
 * @returns {Promise<Object>} Team statistics
 */
export const getTeamStatsRepo = async () => {
  const totalTeams = await Team.count();
  const activeTeams = await Team.count({ where: { status: "active" } });
  const inactiveTeams = await Team.count({ where: { status: "inactive" } });

  return {
    total: totalTeams,
    active: activeTeams,
    inactive: inactiveTeams,
  };
};

/**
 * Search for teams across multiple fields
 * @param {string} query - Search query
 * @param {Array<string>} fields - Fields to search in
 * @returns {Promise<Array>} Matching teams
 */
export const searchTeamsRepo = async (
  query,
  fields = ["name", "department", "location"]
) => {
  const searchConditions = fields.map((field) => ({
    [field]: {
      [Op.like]: `%${query}%`,
    },
  }));

  return await Team.findAll({
    where: {
      [Op.or]: searchConditions,
    },
    include: [
      {
        model: Recruiter,
        as: "Lead",
        attributes: ["id", "userId", "department", "specialization", "status"],
      },
    ],
  });
};

/**
 * Get subteams of a team
 * @param {number} teamId - Team ID
 * @returns {Promise<Array>} List of subteams
 */
export const getSubteamsRepo = async (teamId) => {
  return await Team.findAll({
    where: { parentTeamId: teamId },
    include: [
      {
        model: Recruiter,
        as: "Lead",
        attributes: ["id", "userId", "department", "specialization", "status"],
      },
    ],
  });
};

/**
 * Add a subteam to a team
 * @param {number} teamId - Parent team ID
 * @param {Object} subteamData - Subteam data
 * @returns {Promise<Object>} Created subteam
 */
export const addSubteamRepo = async (teamId, subteamData) => {
  const parentTeam = await Team.findByPk(teamId);
  if (!parentTeam) throw new Error("Parent team not found");

  return await Team.create({
    ...subteamData,
    parentTeamId: teamId,
  });
};

/**
 * Remove a subteam from a team
 * @param {number} teamId - Parent team ID
 * @param {number} subteamId - Subteam ID
 * @returns {Promise<void>}
 */
export const removeSubteamRepo = async (teamId, subteamId) => {
  const subteam = await Team.findOne({
    where: {
      id: subteamId,
      parentTeamId: teamId,
    },
  });

  if (!subteam) throw new Error("Subteam not found");
  await subteam.destroy();
};

/**
 * Update team lead
 * @param {number} teamId - Team ID
 * @param {number} oldLeadId - Old lead ID
 * @param {number} newLeadId - New lead ID
 * @param {string} newRole - New lead role
 * @returns {Promise<boolean>} Success status
 */
export async function updateTeamLeadRepo(
  teamId,
  oldLeadId,
  newLeadId,
  newRole
) {
  const transaction = await sequelize.transaction();

  try {
    // 1. First update the old team lead's role
    if (oldLeadId) {
      await TeamMember.update(
        { role: newRole || "Member" },
        {
          where: {
            teamId,
            recruiterId: oldLeadId,
            role: "Team Lead",
          },
          transaction,
        }
      );
    }

    // 2. Then update the new team lead
    await TeamMember.update(
      { role: "Team Lead" },
      {
        where: {
          teamId,
          recruiterId: newLeadId,
        },
        transaction,
      }
    );

    // 3. Update the team's leadId
    await Team.update(
      { leadId: newLeadId },
      {
        where: { id: teamId },
        transaction,
      }
    );

    await transaction.commit();
    return true;
  } catch (error) {
    console.log("[TeamRepository] Error in updateTeamLeadRepo:", error);
    await transaction.rollback();
    throw error;
  }
}
