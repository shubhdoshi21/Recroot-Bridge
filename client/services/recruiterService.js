import axios from "axios";
import { api } from "../config/api";

/**
 * Get all recruiters
 * @returns {Promise} Promise with recruiters data
 */
export const getAllRecruiters = async () => {
  try {
    console.log("Fetching all recruiters");
    const response = await axios.get(api.recruiters.getAll(), {
      withCredentials: true,
    });
    console.log("Recruiters fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Error fetching recruiters:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get a specific recruiter by ID
 * @param {number} id - Recruiter ID
 * @returns {Promise} Promise with recruiter data
 */
export const getRecruiterById = async (id) => {
  try {
    const response = await axios.get(api.recruiters.getById(id), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(`Error fetching recruiter ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new recruiter
 * @param {Object} recruiterData - Recruiter data to create
 * @returns {Promise} Promise with created recruiter
 */
export const createRecruiter = async (recruiterData) => {
  try {
    console.log("Creating recruiter with data:", JSON.stringify(recruiterData));

    // Send combined data to create both user and recruiter
    const response = await axios.post(api.recruiters.create(), recruiterData, {
      withCredentials: true,
    });
    console.log("Recruiter created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.log("Error creating recruiter:", error);
    console.log("Error details:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update an existing recruiter
 * @param {number} id - Recruiter ID
 * @param {Object} recruiterData - Updated recruiter data
 * @returns {Promise} Promise with updated recruiter
 */
export const updateRecruiter = async (id, recruiterData) => {
  try {
    const response = await axios.put(api.recruiters.update(id), recruiterData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(`Error updating recruiter ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a recruiter
 * @param {number} id - Recruiter ID to delete
 * @returns {Promise} Promise with delete confirmation
 */
export const deleteRecruiter = async (id) => {
  try {
    const response = await axios.delete(api.recruiters.delete(id), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(`Error deleting recruiter ${id}:`, error);
    throw error;
  }
};

/**
 * Get performance metrics for a specific recruiter
 * @param {number} id - Recruiter ID
 * @param {Object} params - Query parameters for timeframe and metrics
 * @returns {Promise} Promise with performance data
 */
export const getRecruiterPerformance = async (id, params = {}) => {
  try {
    const response = await axios.get(api.recruiters.getPerformance(id), {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(`Error fetching performance for recruiter ${id}:`, error);
    throw error;
  }
};

/**
 * Get aggregated performance metrics across all recruiters
 * @param {Object} params - Query parameters for timeframe
 * @returns {Promise} Promise with aggregated performance data
 */
export const getAllRecruitersPerformance = async (params = {}) => {
  try {
    const response = await axios.get(api.recruiters.getAllPerformance(), {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error fetching recruiters performance:", error);
    throw error;
  }
};

/**
 * Get all jobs assigned to a specific recruiter
 * @param {number} id - Recruiter ID
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} Promise with assigned jobs
 */
export const getRecruiterJobs = async (id, params = {}) => {
  try {
    const response = await axios.get(api.recruiters.getJobs(id), {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(`Error fetching jobs for recruiter ${id}:`, error);
    throw error;
  }
};

/**
 * Assign a job to a recruiter
 * @param {number} id - Recruiter ID
 * @param {Object} jobData - Job assignment data
 * @returns {Promise} Promise with assignment data
 */
export const assignJobToRecruiter = async (id, jobData) => {
  try {
    const response = await axios.post(api.recruiters.assignJob(id), jobData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(`Error assigning job to recruiter ${id}:`, error);
    throw error;
  }
};

/**
 * Remove a job assignment from a recruiter
 * @param {number} id - Recruiter ID
 * @param {number} jobId - Job ID to remove
 * @returns {Promise} Promise with removal confirmation
 */
export const removeJobFromRecruiter = async (id, jobId) => {
  try {
    const response = await axios.delete(api.recruiters.removeJob(id, jobId), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(`Error removing job ${jobId} from recruiter ${id}:`, error);
    throw error;
  }
};

/**
 * Search for recruiters across multiple fields
 * @param {Object} params - Query parameters for search
 * @returns {Promise} Promise with matching recruiters
 */
export const searchRecruiters = async (params = {}) => {
  try {
    const response = await axios.get(api.recruiters.search(), {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error searching recruiters:", error);
    throw error;
  }
};

/**
 * Get jobs that aren't assigned to any recruiter
 * @returns {Promise} Promise with unassigned jobs
 */
export const getUnassignedJobs = async () => {
  try {
    const response = await axios.get(api.jobs.getUnassigned(), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error fetching unassigned jobs:", error);
    throw error;
  }
};

/**
 * Get summary statistics about recruiters
 * @returns {Promise} Promise with recruiter statistics
 */
export const getRecruiterStats = async () => {
  try {
    const response = await axios.get(api.recruiters.getStats(), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error fetching recruiter stats:", error);
    throw error;
  }
};

/**
 * Get jobs available for assignment to a specific recruiter
 * @param {number} recruiterId - Recruiter ID
 * @returns {Promise} Promise with available jobs
 */
export const getAvailableJobsForRecruiter = async (recruiterId) => {
  try {
    const response = await axios.get(api.recruiters.getAvailableJobs(recruiterId), {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(`Error fetching available jobs for recruiter ${recruiterId}:`, error);
    throw error;
  }
};
