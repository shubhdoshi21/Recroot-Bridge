import {
  getAllRecruitersRepo,
  createRecruiterRepo,
  getRecruiterByIdRepo,
  updateRecruiterRepo,
  deleteRecruiterRepo,
  getRecruiterPerformanceRepo,
  getAllRecruitersPerformanceRepo,
  getRecruiterJobsRepo,
  assignJobToRecruiterRepo,
  removeJobFromRecruiterRepo,
  searchRecruitersRepo,
  getUnassignedJobsRepo,
  getRecruiterStatsRepo,
  getAvailableJobsForRecruiter,
} from "../repositories/recruiterRepository.js";
import { findUserById } from "../repositories/authRepository.js";
import { Recruiter } from "../models/Recruiter.js";
import { updateUser } from "../repositories/authRepository.js";

/**
 * Service to get all recruiters with filtering and pagination
 * @param {Object} options - Options for filtering and pagination
 * @returns {Object} Paginated recruiters with count
 */
export const getAllRecruitersService = async (options) => {
  const result = await getAllRecruitersRepo(options);

  // Enhance each recruiter with User data for convenience
  if (result && result.recruiters) {
    result.recruiters = result.recruiters.map((recruiter) => {
      // Convert to plain object first to avoid circular references
      const plainRecruiter = recruiter.get
        ? recruiter.get({ plain: true })
        : recruiter;

      if (plainRecruiter.User) {
        // Copy important fields from User to the top level for easier access in frontend
        return {
          ...plainRecruiter,
          email: plainRecruiter.User.email,
          phone: plainRecruiter.User.phone,
          firstName: plainRecruiter.User.firstName,
          lastName: plainRecruiter.User.lastName,
          profilePicture: plainRecruiter.User.profilePicture,
        };
      }
      return plainRecruiter;
    });
  }

  return result;
};

/**
 * Service to create a new recruiter
 * @param {Object} recruiterData - Data for creating a recruiter
 * @returns {Object} Created recruiter
 */
export const createRecruiterService = async (recruiterData) => {
  try {
    console.log("[recruiterService] Creating recruiter with data:", {
      ...recruiterData,
      userId: recruiterData.userId,
    });

    // Validate userId is provided
    if (!recruiterData.userId) {
      console.log(
        "[recruiterService] No userId provided for recruiter creation"
      );
      throw new Error("User ID is required to create a recruiter");
    }

    // Check if the user exists
    const user = await findUserById(recruiterData.userId);
    if (!user) {
      console.log(
        `[recruiterService] User with ID ${recruiterData.userId} not found`
      );
      throw new Error(`User with ID ${recruiterData.userId} not found`);
    }

    console.log(`[recruiterService] Found user for recruiter creation:`, {
      id: user.id,
      email: user.email,
      clientId: user.clientId,
    });

    // Check if a recruiter already exists for this user
    const existingRecruiter = await Recruiter.findOne({
      where: { userId: recruiterData.userId },
    });

    if (existingRecruiter) {
      console.log(
        `[recruiterService] Recruiter already exists for user ${user.id}`
      );
      throw new Error(`A recruiter profile already exists for this user`);
    }

    // Ensure the user's role is set to 'recruiter' and maintain the clientId
    await updateUser(recruiterData.userId, {
      role: "recruiter",
      clientId: user.clientId, // Ensure we maintain the clientId
    });
    console.log(
      "[recruiterService] Updated user role to recruiter and maintained clientId:",
      user.clientId
    );

    // Create the recruiter with error handling
    try {
      // Create the recruiter
      const recruiter = await createRecruiterRepo(recruiterData);
      console.log("[recruiterService] Recruiter created successfully:", {
        id: recruiter.id,
        userId: recruiter.userId,
        userClientId: user.clientId,
      });

      // If recruiter doesn't have User data or has incomplete User data, enhance it
      if (
        !recruiter.User ||
        (!recruiter.User.firstName && !recruiter.User.lastName)
      ) {
        console.log(
          "[recruiterService] Enhancing recruiter data with user information"
        );
        recruiter.User = {
          ...recruiter.User,
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          status: user.status || "active",
          clientId: user.clientId,
        };
      }

      return recruiter;
    } catch (error) {
      console.log(
        "[recruiterService] Database error creating recruiter:",
        error
      );
      throw new Error(`Failed to create recruiter record: ${error.message}`);
    }
  } catch (error) {
    console.log("[recruiterService] Error creating recruiter:", error);
    throw error;
  }
};

/**
 * Service to get a recruiter by ID
 * @param {number} id - Recruiter ID
 * @returns {Object} Recruiter with related data
 */
export const getRecruiterByIdService = async (id) => {
  const recruiter = await getRecruiterByIdRepo(id);

  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  // Convert to plain object first to avoid circular references
  const plainRecruiter = recruiter.get
    ? recruiter.get({ plain: true })
    : recruiter;

  // Enhance the recruiter object with User data for convenience
  if (plainRecruiter.User) {
    // Copy important fields from User to the top level for easier access in frontend
    plainRecruiter.email = plainRecruiter.User.email;
    plainRecruiter.phone = plainRecruiter.User.phone;
    plainRecruiter.firstName = plainRecruiter.User.firstName;
    plainRecruiter.lastName = plainRecruiter.User.lastName;
    plainRecruiter.profilePicture = plainRecruiter.User.profilePicture;
  }

  return plainRecruiter;
};

/**
 * Service to update a recruiter's information
 * @param {number} id - Recruiter ID
 * @param {Object} recruiterData - Updated recruiter data
 * @returns {Object} Updated recruiter
 */
export const updateRecruiterService = async (id, recruiterData) => {
  const updatedRecruiter = await updateRecruiterRepo(id, recruiterData);

  if (!updatedRecruiter) {
    throw new Error("Recruiter not found");
  }

  // Convert to plain object first to avoid circular references
  const plainRecruiter = updatedRecruiter.get
    ? updatedRecruiter.get({ plain: true })
    : updatedRecruiter;

  // Enhance the recruiter object with User data for convenience
  if (plainRecruiter.User) {
    plainRecruiter.email = plainRecruiter.User.email;
    plainRecruiter.phone = plainRecruiter.User.phone;
    plainRecruiter.firstName = plainRecruiter.User.firstName;
    plainRecruiter.lastName = plainRecruiter.User.lastName;
    plainRecruiter.profilePicture = plainRecruiter.User.profilePicture;
  }

  return plainRecruiter;
};

/**
 * Service to delete a recruiter
 * @param {number} id - Recruiter ID
 * @returns {boolean} Success indicator
 */
export const deleteRecruiterService = async (id) => {
  // First, get the recruiter to find the associated userId
  const recruiter = await getRecruiterByIdRepo(id);

  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  // Get the userId before deleting the recruiter
  const userId = recruiter.userId;

  // Delete the recruiter record
  const result = await deleteRecruiterRepo(id);

  if (!result) {
    throw new Error("Recruiter not found");
  }

  // Update the user role to 'user' after deleting the recruiter
  await updateUser(userId, { role: "user" });

  return result;
};

/**
 * Service to get performance metrics for a specific recruiter
 * @param {number} id - Recruiter ID
 * @param {string} timeframe - Time period for metrics
 * @param {string} metrics - Comma-separated list of specific metrics to retrieve
 * @returns {Object} Performance metrics
 */
export const getRecruiterPerformanceService = async (
  id,
  timeframe,
  metrics
) => {
  const performance = await getRecruiterPerformanceRepo(id, timeframe, metrics);

  if (!performance) {
    throw new Error("Recruiter not found or no performance data available");
  }

  return performance;
};

/**
 * Service to get aggregated performance metrics across all recruiters
 * @param {string} timeframe - Time period for metrics
 * @returns {Object} Aggregated performance metrics
 */
export const getAllRecruitersPerformanceService = async (timeframe) => {
  return await getAllRecruitersPerformanceRepo(timeframe);
};

/**
 * Service to get all jobs assigned to a specific recruiter
 * @param {number} id - Recruiter ID
 * @param {string} status - Job status filter
 * @returns {Array} Jobs assigned to the recruiter
 */
export const getRecruiterJobsService = async (id, status) => {
  // Check if recruiter exists
  const recruiter = await getRecruiterByIdRepo(id);
  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  return await getRecruiterJobsRepo(id, status);
};

/**
 * Service to assign a job to a recruiter
 * @param {number} id - Recruiter ID
 * @param {number} jobId - Job ID
 * @param {string} priorityLevel - Priority level for the assignment
 * @returns {Object} Job assignment
 */
export const assignJobToRecruiterService = async (id, jobId, priorityLevel) => {
  // Check if recruiter exists
  const recruiter = await getRecruiterByIdRepo(id);
  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  return await assignJobToRecruiterRepo(id, jobId, priorityLevel);
};

/**
 * Service to remove a job assignment from a recruiter
 * @param {number} id - Recruiter ID
 * @param {number} jobId - Job ID
 * @returns {boolean} Success indicator
 */
export const removeJobFromRecruiterService = async (id, jobId) => {
  // Check if recruiter exists
  const recruiter = await getRecruiterByIdRepo(id);
  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  const result = await removeJobFromRecruiterRepo(id, jobId);

  if (!result) {
    throw new Error("Job assignment not found");
  }

  return result;
};

/**
 * Service to search for recruiters across multiple fields
 * @param {string} query - Search query
 * @param {string} fields - Comma-separated list of fields to search in
 * @returns {Array} Matching recruiters
 */
export const searchRecruitersService = async (query, fields) => {
  if (!query) {
    throw new Error("Search query is required");
  }

  const recruiters = await searchRecruitersRepo(query, fields);

  // Convert Sequelize models to plain objects and enhance with User data
  const enhancedRecruiters = recruiters.map((recruiter) => {
    // Convert to plain object first to avoid circular references
    const plainRecruiter = recruiter.get
      ? recruiter.get({ plain: true })
      : recruiter;

    // Then enhance with User data if available
    if (plainRecruiter.User) {
      return {
        ...plainRecruiter,
        email: plainRecruiter.User.email,
        phone: plainRecruiter.User.phone,
        firstName: plainRecruiter.User.firstName,
        lastName: plainRecruiter.User.lastName,
        profilePicture: plainRecruiter.User.profilePicture,
      };
    }
    return plainRecruiter;
  });

  return enhancedRecruiters;
};

/**
 * Service to get jobs that aren't assigned to any recruiter
 * @returns {Array} Unassigned jobs
 */
export const getUnassignedJobsService = async () => {
  return await getUnassignedJobsRepo();
};

/**
 * Service to get summary statistics about recruiters
 * @returns {Object} Recruiter statistics
 */
export const getRecruiterStatsService = async () => {
  return await getRecruiterStatsRepo();
};

/**
 * Service to get jobs available for assignment to a recruiter
 * @param {number} recruiterId
 * @returns {Array} Available jobs
 */
export const getAvailableJobsForRecruiterService = async (recruiterId) => {
  return await getAvailableJobsForRecruiter(recruiterId);
};
