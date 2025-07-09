import { sequelize } from "../config/sequelize.js";
import {
  Recruiter,
  RecruiterJob,
  Job,
  User,
  HiringMetrics,
} from "../models/index.js";
import { Op } from "sequelize";
import { TeamMember } from "../models/TeamMember.js";
import { Team } from "../models/Team.js";

/**
 * Get all recruiters with filtering and pagination
 * @param {Object} options - Options for filtering and pagination
 * @returns {Object} Paginated recruiters with count
 */
export const getAllRecruitersRepo = async (options) => {
  const { page, limit, sortBy, order, status, clientId } = options;
  if (!clientId)
    throw new Error("clientId is required for all recruiter queries");
  const offset = (page - 1) * limit;

  let whereClause = {};
  if (status) {
    whereClause.status = status;
  }

  // Always filter by User.clientId
  let userWhere = { clientId };

  const result = await Recruiter.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[sortBy, order]],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "email", "profilePicture"],
        where: userWhere,
      },
    ],
  });

  return {
    totalItems: result.count,
    recruiters: result.rows,
    totalPages: Math.ceil(result.count / limit),
    currentPage: page,
  };
};

/**
 * Create a new recruiter
 * @param {Object} recruiterData - Data for creating a recruiter
 * @returns {Object} Created recruiter
 */
export const createRecruiterRepo = async (recruiterData) => {
  try {
    // Create the recruiter record
    const newRecruiter = await Recruiter.create(recruiterData);

    // Fetch the complete recruiter with associations instead of using getRecruiterByIdRepo
    if (newRecruiter) {
      try {
        // Fetch the complete recruiter record with user information
        return await Recruiter.findByPk(newRecruiter.id, {
          include: [
            {
              model: User,
              attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "profilePicture",
                "phone",
                "status",
              ],
            },
          ],
        });
      } catch (findError) {
        console.log("Error fetching newly created recruiter:", findError);
        // If we can't fetch the complete recruiter with associations, just return the basic recruiter object
        return newRecruiter;
      }
    }

    return newRecruiter;
  } catch (error) {
    console.log("Database error in createRecruiterRepo:", error);
    throw error;
  }
};

/**
 * Get a recruiter by ID
 * @param {number} id - Recruiter ID
 * @returns {Object} Recruiter with related data
 */
export const getRecruiterByIdRepo = async (id) => {
  return await Recruiter.findByPk(id, {
    include: [
      {
        model: User,
        attributes: [
          "id",
          "firstName",
          "lastName",
          "email",
          "profilePicture",
          "phone",
          "isActive",
        ],
      },
    ],
  });
};

/**
 * Update a recruiter's information
 * @param {number} id - Recruiter ID
 * @param {Object} recruiterData - Updated recruiter data
 * @returns {Object} Updated recruiter
 */
export const updateRecruiterRepo = async (id, recruiterData) => {
  const recruiter = await Recruiter.findByPk(id, {
    include: [{ model: User }],
  });

  if (!recruiter) {
    return null;
  }

  // Extract user-related fields
  const { firstName, lastName, phone, ...recruiterFields } = recruiterData;

  // Update recruiter fields
  await recruiter.update(recruiterFields);

  // Update associated user if user fields are provided
  if (recruiter.User && (firstName || lastName || phone)) {
    const userUpdateData = {};

    if (firstName) userUpdateData.firstName = firstName;
    if (lastName) userUpdateData.lastName = lastName;
    if (phone) userUpdateData.phone = phone;

    // Update fullName if both firstName and lastName are provided
    if (firstName && lastName) {
      userUpdateData.fullName = `${firstName} ${lastName}`;
    }

    await User.update(userUpdateData, {
      where: { id: recruiter.userId },
    });
  }

  return await getRecruiterByIdRepo(id);
};

/**
 * Delete a recruiter
 * @param {number} id - Recruiter ID
 * @returns {boolean} Success indicator
 */
export const deleteRecruiterRepo = async (id) => {
  const recruiter = await Recruiter.findByPk(id);

  if (!recruiter) {
    return false;
  }

  await recruiter.destroy();
  return true;
};

/**
 * Get performance metrics for a specific recruiter
 * @param {number} id - Recruiter ID
 * @param {string} timeframe - Time period for metrics (e.g., 'week', 'month', 'year')
 * @param {string} metrics - Comma-separated list of specific metrics to retrieve
 * @returns {Object} Performance metrics
 */
export const getRecruiterPerformanceRepo = async (
  id,
  timeframe = "month",
  metrics
) => {
  const recruiter = await Recruiter.findByPk(id);

  if (!recruiter) {
    return null;
  }

  let timeFilter = {};
  const now = new Date();

  switch (timeframe) {
    case "week":
      timeFilter = {
        createdAt: {
          [Op.gte]: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7
          ),
        },
      };
      break;
    case "year":
      timeFilter = {
        createdAt: {
          [Op.gte]: new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          ),
        },
      };
      break;
    case "quarter":
      timeFilter = {
        createdAt: {
          [Op.gte]: new Date(
            now.getFullYear(),
            now.getMonth() - 3,
            now.getDate()
          ),
        },
      };
      break;
    case "month":
    default:
      timeFilter = {
        createdAt: {
          [Op.gte]: new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          ),
        },
      };
  }

  // Get job assignments for this recruiter
  const jobAssignments = await RecruiterJob.findAll({
    where: {
      recruiterId: id,
      ...timeFilter,
    },
    include: [
      {
        model: Job,
        attributes: ["id", "title", "status"],
      },
    ],
  });

  // Get hiring metrics for this recruiter
  const hiringMetrics = await HiringMetrics.findAll({
    where: {
      recruiterId: id,
      ...timeFilter,
    },
  });

  // Calculate performance metrics
  const performanceData = {
    recruiterId: id,
    timeframe,
    totalJobsAssigned: jobAssignments.length,
    activeJobs: jobAssignments.filter((job) => job.Job.status === "active")
      .length,
    candidatesReviewed: jobAssignments.reduce(
      (sum, job) => sum + (job.candidatesReviewed || 0),
      0
    ),
    interviewsScheduled: jobAssignments.reduce(
      (sum, job) => sum + (job.interviewsScheduled || 0),
      0
    ),
    hires: hiringMetrics.reduce((sum, metric) => sum + (metric.hires || 0), 0),
    timeToHire:
      hiringMetrics.reduce(
        (sum, metric) => sum + (metric.averageTimeToHire || 0),
        0
      ) / (hiringMetrics.length || 1), // Average time to hire
    candidateSatisfactionRate:
      hiringMetrics.reduce(
        (sum, metric) => sum + (metric.candidateSatisfactionRate || 0),
        0
      ) / (hiringMetrics.length || 1), // Average satisfaction rate
  };

  // Filter metrics if specified
  if (metrics) {
    const metricsArray = metrics.split(",").map((metric) => metric.trim());
    const filteredData = {};

    metricsArray.forEach((metric) => {
      if (performanceData.hasOwnProperty(metric)) {
        filteredData[metric] = performanceData[metric];
      }
    });

    return filteredData;
  }

  return performanceData;
};

/**
 * Get aggregated performance metrics across all recruiters
 * @param {string} timeframe - Time period for metrics
 * @returns {Object} Aggregated performance metrics
 */
export const getAllRecruitersPerformanceRepo = async (timeframe = "month") => {
  const recruiters = await Recruiter.findAll();
  const performanceData = [];

  for (const recruiter of recruiters) {
    const recruiterPerformance = await getRecruiterPerformanceRepo(
      recruiter.id,
      timeframe
    );
    performanceData.push(recruiterPerformance);
  }

  // Calculate aggregated metrics
  const aggregatedData = {
    timeframe,
    totalRecruiters: recruiters.length,
    totalJobsAssigned: performanceData.reduce(
      (sum, perf) => sum + perf.totalJobsAssigned,
      0
    ),
    totalActiveJobs: performanceData.reduce(
      (sum, perf) => sum + perf.activeJobs,
      0
    ),
    totalCandidatesReviewed: performanceData.reduce(
      (sum, perf) => sum + perf.candidatesReviewed,
      0
    ),
    totalInterviewsScheduled: performanceData.reduce(
      (sum, perf) => sum + perf.interviewsScheduled,
      0
    ),
    totalHires: performanceData.reduce((sum, perf) => sum + perf.hires, 0),
    averageTimeToHire:
      performanceData.reduce((sum, perf) => sum + perf.timeToHire, 0) /
      (performanceData.length || 1),
    averageCandidateSatisfactionRate:
      performanceData.reduce(
        (sum, perf) => sum + perf.candidateSatisfactionRate,
        0
      ) / (performanceData.length || 1),
    recruiterPerformance: performanceData,
  };

  return aggregatedData;
};

/**
 * Get all jobs assigned to a specific recruiter
 * @param {number} id - Recruiter ID
 * @param {string} status - Job status filter
 * @returns {Array} Jobs assigned to the recruiter
 */
export const getRecruiterJobsRepo = async (id, status) => {
  let whereClause = {
    recruiterId: id,
  };

  let jobWhereClause = {};
  if (status) {
    jobWhereClause.status = status;
  }

  const recruiterJobs = await RecruiterJob.findAll({
    where: whereClause,
    include: [
      {
        model: Job,
        where: jobWhereClause,
        required: true,
      },
    ],
  });

  return recruiterJobs;
};

/**
 * Assign a job to a recruiter
 * @param {number} id - Recruiter ID
 * @param {number} jobId - Job ID
 * @param {string} priorityLevel - Priority level for the assignment
 * @returns {Object} Job assignment
 */
export const assignJobToRecruiterRepo = async (id, jobId, priorityLevel) => {
  // Check if assignment already exists
  const existingAssignment = await RecruiterJob.findOne({
    where: {
      recruiterId: id,
      jobId,
    },
  });

  if (existingAssignment) {
    return existingAssignment;
  }

  // Create new assignment
  const assignment = await RecruiterJob.create({
    recruiterId: id,
    jobId,
    assignedDate: new Date(),
    assignedBy: "System", // This could be changed to capture the current user
    priorityLevel,
  });

  // Update the recruiter's active jobs count
  const recruiter = await Recruiter.findByPk(id);
  if (recruiter) {
    await recruiter.update({
      activeJobs: (recruiter.activeJobs || 0) + 1,
    });
    // Update all teams the recruiter is a member of
    const teamMemberships = await TeamMember.findAll({
      where: { recruiterId: id },
    });
    for (const teamMember of teamMemberships) {
      const teamId = teamMember.teamId;
      // Check if any other recruiter in this team is already assigned to this job
      const otherTeamMembers = await TeamMember.findAll({ where: { teamId } });
      const otherRecruiterIds = otherTeamMembers.map((tm) => tm.recruiterId);
      const alreadyAssigned = await RecruiterJob.findOne({
        where: {
          jobId,
          recruiterId: { [Op.in]: otherRecruiterIds, [Op.ne]: id },
        },
      });
      if (!alreadyAssigned) {
        // This is the first assignment of this job to this team
        const team = await Team.findByPk(teamId);
        if (team) {
          await team.update({
            activeJobs: (team.activeJobs || 0) + 1,
          });
        }
      }
    }
  }

  return assignment;
};

/**
 * Remove a job assignment from a recruiter
 * @param {number} id - Recruiter ID
 * @param {number} jobId - Job ID
 * @returns {boolean} Success indicator
 */
export const removeJobFromRecruiterRepo = async (id, jobId) => {
  const assignment = await RecruiterJob.findOne({
    where: {
      recruiterId: id,
      jobId,
    },
  });

  if (!assignment) {
    return false;
  }

  await assignment.destroy();

  // Update the recruiter's active jobs count
  const recruiter = await Recruiter.findByPk(id);
  if (recruiter && recruiter.activeJobs > 0) {
    await recruiter.update({
      activeJobs: recruiter.activeJobs - 1,
    });
    // Update all teams the recruiter is a member of
    const teamMemberships = await TeamMember.findAll({
      where: { recruiterId: id },
    });
    for (const teamMember of teamMemberships) {
      const teamId = teamMember.teamId;
      // Check if any other recruiter in this team is still assigned to this job (after removal)
      const otherTeamMembers = await TeamMember.findAll({ where: { teamId } });
      const otherRecruiterIds = otherTeamMembers
        .map((tm) => tm.recruiterId)
        .filter((rid) => rid !== id);
      const stillAssigned = await RecruiterJob.findOne({
        where: {
          jobId,
          recruiterId: { [Op.in]: otherRecruiterIds },
        },
      });
      if (!stillAssigned) {
        // This was the last assignment of this job to this team
        const team = await Team.findByPk(teamId);
        if (team && team.activeJobs > 0) {
          await team.update({
            activeJobs: team.activeJobs - 1,
          });
        }
      }
    }
  }

  return true;
};

/**
 * Search for recruiters across multiple fields
 * @param {string} query - Search query
 * @param {string} fields - Comma-separated list of fields to search in
 * @returns {Array} Matching recruiters
 */
export const searchRecruitersRepo = async (
  query,
  fields = "department,specialization"
) => {
  const fieldsArray = fields.split(",").map((field) => field.trim());

  let userFieldsIncluded = false;
  const recruiterSearchFields = [];
  const userSearchFields = [];

  fieldsArray.forEach((field) => {
    if (["firstName", "lastName", "email"].includes(field)) {
      userFieldsIncluded = true;
      userSearchFields.push(field);
    } else {
      recruiterSearchFields.push(field);
    }
  });

  // Build the where clause for recruiter fields
  let recruiterWhere = {};
  if (recruiterSearchFields.length > 0) {
    recruiterWhere[Op.or] = recruiterSearchFields.map((field) => ({
      [field]: {
        [Op.like]: `%${query}%`,
      },
    }));
  }

  // Build the where clause for user fields
  let userWhere = {};
  if (userFieldsIncluded) {
    userWhere[Op.or] = userSearchFields.map((field) => ({
      [field]: {
        [Op.like]: `%${query}%`,
      },
    }));
  }

  const recruiters = await Recruiter.findAll({
    where: recruiterSearchFields.length > 0 ? recruiterWhere : {},
    include: [
      {
        model: User,
        where: userFieldsIncluded ? userWhere : {},
        required: userFieldsIncluded,
        attributes: ["id", "firstName", "lastName", "email", "profilePicture"],
      },
    ],
  });

  return recruiters;
};

/**
 * Get jobs that aren't assigned to any recruiter
 * @returns {Array} Unassigned jobs
 */
export const getUnassignedJobsRepo = async () => {
  const allJobs = await Job.findAll();
  const assignedJobIds = (await RecruiterJob.findAll()).map((rj) => rj.jobId);

  // Filter out the jobs that are already assigned
  const unassignedJobs = allJobs.filter(
    (job) => !assignedJobIds.includes(job.id)
  );

  return unassignedJobs;
};

/**
 * Get summary statistics about recruiters
 * @returns {Object} Recruiter statistics
 */
export const getRecruiterStatsRepo = async () => {
  const totalRecruiters = await Recruiter.count();

  // Count by status
  const activeRecruiters = await Recruiter.count({
    where: { status: "active" },
  });

  const inactiveRecruiters = await Recruiter.count({
    where: { status: "inactive" },
  });

  // Count by department
  const departmentCounts = await Recruiter.findAll({
    attributes: [
      "department",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["department"],
  });

  // Average active jobs per recruiter
  const avgActiveJobs = await Recruiter.findAll({
    attributes: [
      [sequelize.fn("AVG", sequelize.col("activeJobs")), "avgActiveJobs"],
    ],
  });

  return {
    totalRecruiters,
    activeRecruiters,
    inactiveRecruiters,
    byDepartment: departmentCounts.map((dept) => ({
      department: dept.department,
      count: dept.getDataValue("count"),
    })),
    averageActiveJobs: avgActiveJobs[0].getDataValue("avgActiveJobs") || 0,
  };
};

/**
 * Get jobs that are available for assignment to a specific recruiter
 * (i.e., jobs not assigned to any recruiter, or only assigned to this recruiter)
 * @param {number} recruiterId - Recruiter ID
 * @returns {Array} Available jobs
 */
export const getAvailableJobsForRecruiter = async (recruiterId) => {
  // Get all jobs assigned to THIS recruiter
  const assignedJobIds = (
    await RecruiterJob.findAll({
      where: { recruiterId },
      attributes: ["jobId"],
      group: ["jobId"],
    })
  ).map((rj) => rj.jobId);

  // Get all jobs NOT assigned to this recruiter
  const availableJobs = await Job.findAll({
    where: {
      id: { [Op.notIn]: assignedJobIds },
    },
  });

  return availableJobs;
};
