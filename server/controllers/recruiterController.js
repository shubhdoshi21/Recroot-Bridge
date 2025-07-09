import {
  getAllRecruitersService,
  createRecruiterService,
  getRecruiterByIdService,
  updateRecruiterService,
  deleteRecruiterService,
  getRecruiterPerformanceService,
  getAllRecruitersPerformanceService,
  getRecruiterJobsService,
  assignJobToRecruiterService,
  removeJobFromRecruiterService,
  searchRecruitersService,
  getUnassignedJobsService,
  getRecruiterStatsService,
  getAvailableJobsForRecruiterService,
} from "../services/recruiterService.js";
import { register as createUserService } from "../services/authService.js";
import {
  sendOAuthWelcomeEmail,
  generateTempPassword,
} from "../services/emailService.js";
import * as authRepository from "../repositories/authRepository.js";
import { Recruiter } from "../models/Recruiter.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Get all recruiters with filtering and pagination
 * @param {Object} req - Request object with query parameters
 * @param {Object} res - Response object
 */
export const getAllRecruiters = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res
        .status(400)
        .json({ message: "Client ID is required for recruiter queries" });
    }
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "DESC",
      status,
    } = req.query;

    const result = await getAllRecruitersService({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      order,
      status,
      clientId: req.user.clientId,
    });

    // Convert Sequelize models to plain objects to avoid circular references
    const response = {
      totalItems: result.totalItems,
      recruiters: result.recruiters.map((recruiter) => {
        const plainRecruiter = recruiter.get
          ? recruiter.get({ plain: true })
          : recruiter;
        return plainRecruiter;
      }),
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error fetching recruiters:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch recruiters", error: error.message });
  }
};

/**
 * Create a new recruiter
 * @param {Object} req - Request object with recruiter data
 * @param {Object} res - Response object
 */
export const createRecruiter = async (req, res) => {
  try {
    const recruiterData = req.body;
    console.log("[recruiterController] Creating recruiter with data:", {
      ...recruiterData,
      email: recruiterData.email,
      creatorClientId: req.user.clientId,
    });

    // First check if the user already exists
    const existingUser = await authRepository.findUserByEmail(
      recruiterData.email
    );

    let user;
    let resetToken = null;
    let tempPassword = null;

    if (existingUser) {
      console.log(
        "[recruiterController] User already exists with ID:",
        existingUser.id
      );

      // Check if a recruiter profile already exists
      const existingRecruiter = await Recruiter.findOne({
        where: { userId: existingUser.id },
      });

      if (existingRecruiter) {
        console.log("[recruiterController] Recruiter profile already exists");
        return res.status(400).json({
          message: "A recruiter profile already exists for this user",
        });
      }

      // If user exists but is not verified, we can update their details
      if (!existingUser.isVerified) {
        // Generate temporary password and reset token for the existing user
        tempPassword = generateTempPassword();
        resetToken = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Update existing user with new details
        await authRepository.updateUser(existingUser.id, {
          fullName:
            recruiterData.fullName ||
            `${recruiterData.firstName || ""} ${
              recruiterData.lastName || ""
            }`.trim(),
          firstName: recruiterData.firstName || null,
          lastName: recruiterData.lastName || null,
          role: "recruiter",
          password: hashedPassword,
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
          clientId: req.user.clientId,
          phone: recruiterData.phone || null,
          passwordLastChanged: new Date(),
        });

        user = await authRepository.findUserById(existingUser.id);
      } else {
        // If user exists and is verified, just update their role and clientId
        await authRepository.updateUser(existingUser.id, {
          role: "recruiter",
          clientId: req.user.clientId,
        });
        user = existingUser;
      }

      console.log("[recruiterController] Updated existing user:", {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
        isVerified: user.isVerified,
      });
    } else {
      // Generate temporary password and reset token for new user
      tempPassword = generateTempPassword();
      resetToken = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create new user with recruiter role and creator's clientId
      const userData = {
        email: recruiterData.email,
        password: hashedPassword,
        fullName:
          recruiterData.fullName ||
          `${recruiterData.firstName || ""} ${
            recruiterData.lastName || ""
          }`.trim(),
        firstName: recruiterData.firstName || null,
        lastName: recruiterData.lastName || null,
        role: "recruiter",
        isVerified: false,
        isActive: true,
        authType: "local",
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        clientId: req.user.clientId, // Set the clientId from the authenticated user
        phone: recruiterData.phone || null,
        passwordLastChanged: new Date(),
      };

      // Validate fullName
      if (!userData.fullName) {
        throw new Error("Full name is required");
      }

      // Validate email
      if (!userData.email) {
        throw new Error("Email is required");
      }

      // Validate clientId
      if (!userData.clientId) {
        throw new Error("Client ID is required");
      }

      console.log("[recruiterController] Creating new user with data:", {
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        clientId: userData.clientId,
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        authType: userData.authType,
      });

      user = await authRepository.createUser(userData);
      console.log("[recruiterController] Created new user with ID:", user.id);
    }

    // Create recruiter profile
    const recruiter = await Recruiter.create({
      userId: user.id,
      department: recruiterData.department || null,
      specialization: recruiterData.specialization || null,
      status: "active",
    });

    console.log("[recruiterController] Created recruiter profile:", {
      id: recruiter.id,
      userId: recruiter.userId,
      clientId: user.clientId,
    });

    // Prepare user data without sensitive information
    const safeUserData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      clientId: user.clientId,
      isActive: user.isActive,
      isVerified: user.isVerified,
    };

    // Prepare recruiter data
    const recruiterResponse =
      recruiter instanceof Recruiter ? recruiter.toJSON() : recruiter;

    // Send response
    res.status(201).json({
      message: "Recruiter created successfully",
      recruiter: {
        ...recruiterResponse,
        User: safeUserData,
      },
      ...(tempPassword && resetToken
        ? {
            tempPassword,
            resetToken,
          }
        : {}),
    });
  } catch (error) {
    console.log("[recruiterController] Error creating recruiter:", error);
    res.status(400).json({
      message: error.message || "Failed to create recruiter",
    });
  }
};

/**
 * Get a specific recruiter by ID
 * @param {Object} req - Request object with recruiter ID
 * @param {Object} res - Response object
 */
export const getRecruiterById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await getRecruiterByIdService(id);

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json(recruiter);
  } catch (error) {
    console.log("Error fetching recruiter:", error);
    if (error.message === "Recruiter not found") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Failed to fetch recruiter", error: error.message });
  }
};

/**
 * Update a recruiter's information
 * @param {Object} req - Request object with recruiter ID and updated data
 * @param {Object} res - Response object
 */
export const updateRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterData = req.body;

    console.log(
      "Updating recruiter:",
      id,
      "with data:",
      JSON.stringify(recruiterData)
    );

    const updatedRecruiter = await updateRecruiterService(id, recruiterData);

    if (!updatedRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    // The service already returns a plain object with enhanced user data
    return res.status(200).json(updatedRecruiter);
  } catch (error) {
    console.log("Error updating recruiter:", error);
    if (error.message === "Recruiter not found") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Failed to update recruiter", error: error.message });
  }
};

/**
 * Delete a recruiter
 * @param {Object} req - Request object with recruiter ID
 * @param {Object} res - Response object
 */
export const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRecruiterService(id);

    return res.status(200).json({ message: "Recruiter deleted successfully" });
  } catch (error) {
    console.log("Error deleting recruiter:", error);
    if (error.message === "Recruiter not found") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Failed to delete recruiter", error: error.message });
  }
};

/**
 * Get performance metrics for a specific recruiter
 * @param {Object} req - Request object with recruiter ID and query parameters
 * @param {Object} res - Response object
 */
export const getRecruiterPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe, metrics } = req.query;

    const performance = await getRecruiterPerformanceService(
      id,
      timeframe,
      metrics
    );

    if (!performance) {
      return res.status(404).json({
        message: "Recruiter not found or no performance data available",
      });
    }

    return res.status(200).json(performance);
  } catch (error) {
    console.log("Error fetching recruiter performance:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Failed to fetch recruiter performance",
      error: error.message,
    });
  }
};

/**
 * Get aggregated performance metrics across all recruiters
 * @param {Object} req - Request object with query parameters
 * @param {Object} res - Response object
 */
export const getAllRecruitersPerformance = async (req, res) => {
  try {
    const { timeframe } = req.query;

    const performance = await getAllRecruitersPerformanceService(timeframe);

    return res.status(200).json(performance);
  } catch (error) {
    console.log("Error fetching recruiters performance:", error);
    return res.status(500).json({
      message: "Failed to fetch recruiters performance",
      error: error.message,
    });
  }
};

/**
 * Get all jobs assigned to a specific recruiter
 * @param {Object} req - Request object with recruiter ID and query parameters
 * @param {Object} res - Response object
 */
export const getRecruiterJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const jobs = await getRecruiterJobsService(id, status);

    return res.status(200).json(jobs);
  } catch (error) {
    console.log("Error fetching recruiter jobs:", error);
    if (error.message === "Recruiter not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Failed to fetch recruiter jobs",
      error: error.message,
    });
  }
};

/**
 * Assign a job to a recruiter
 * @param {Object} req - Request object with recruiter ID and job data
 * @param {Object} res - Response object
 */
export const assignJobToRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, priorityLevel } = req.body;

    const assignment = await assignJobToRecruiterService(
      id,
      jobId,
      priorityLevel
    );

    return res.status(201).json(assignment);
  } catch (error) {
    console.log("Error assigning job to recruiter:", error);
    if (error.message === "Recruiter not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Failed to assign job to recruiter",
      error: error.message,
    });
  }
};

/**
 * Remove a job assignment from a recruiter
 * @param {Object} req - Request object with recruiter ID and job ID
 * @param {Object} res - Response object
 */
export const removeJobFromRecruiter = async (req, res) => {
  try {
    const { id, jobId } = req.params;

    await removeJobFromRecruiterService(id, jobId);

    return res
      .status(200)
      .json({ message: "Job removed from recruiter successfully" });
  } catch (error) {
    console.log("Error removing job from recruiter:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Failed to remove job from recruiter",
      error: error.message,
    });
  }
};

/**
 * Search for recruiters across multiple fields
 * @param {Object} req - Request object with query parameters
 * @param {Object} res - Response object
 */
export const searchRecruiters = async (req, res) => {
  try {
    const { query, fields, page = 1, limit = 10 } = req.query;

    const recruiters = await searchRecruitersService(query, fields);

    // Convert Sequelize models to plain objects to avoid circular references
    const plainRecruiters = recruiters.map((recruiter) =>
      recruiter.get ? recruiter.get({ plain: true }) : recruiter
    );

    // Format response to match getAllRecruiters format for consistency
    const response = {
      recruiters: plainRecruiters,
      totalItems: plainRecruiters.length,
      totalPages: Math.ceil(plainRecruiters.length / parseInt(limit)),
      currentPage: parseInt(page),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error searching recruiters:", error);
    if (error.message === "Search query is required") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Failed to search recruiters", error: error.message });
  }
};

/**
 * Get jobs that aren't assigned to any recruiter
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getUnassignedJobs = async (req, res) => {
  try {
    const jobs = await getUnassignedJobsService();

    return res.status(200).json(jobs);
  } catch (error) {
    console.log("Error fetching unassigned jobs:", error);
    return res.status(500).json({
      message: "Failed to fetch unassigned jobs",
      error: error.message,
    });
  }
};

/**
 * Get summary statistics about recruiters
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getRecruiterStats = async (req, res) => {
  try {
    const stats = await getRecruiterStatsService();

    return res.status(200).json(stats);
  } catch (error) {
    console.log("Error fetching recruiter stats:", error);
    return res.status(500).json({
      message: "Failed to fetch recruiter stats",
      error: error.message,
    });
  }
};

/**
 * Get jobs available for assignment to a recruiter
 * @param {Object} req - Request object with recruiter ID
 * @param {Object} res - Response object
 */
export const getAvailableJobsForRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await getAvailableJobsForRecruiterService(id);
    return res.status(200).json(jobs);
  } catch (error) {
    console.log("Error fetching available jobs for recruiter:", error);
    return res.status(500).json({
      message: "Failed to fetch available jobs for recruiter",
      error: error.message,
    });
  }
};
