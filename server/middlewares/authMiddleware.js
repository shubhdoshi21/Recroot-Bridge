import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import * as authRepository from "../repositories/authRepository.js";

const sendErrorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
    ...(error && { error: error.message }),
  };
  return res.status(statusCode).json(response);
};

export const verifyToken = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    console.log("[authMiddleware] Token found:", token ? "yes" : "no");

    if (!token) {
      console.log("[authMiddleware] No token found in cookies or headers");
      return sendErrorResponse(res, 401, "Authentication required");
    }

    try {
      console.log("[authMiddleware] Verifying token with JWT secret");
      const decoded = jwt.verify(token, config.jwt.secret);
      console.log("[authMiddleware] Decoded token:", {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        clientId: decoded.clientId
      });

      const user = await authRepository.findUserById(decoded.id);
      console.log("[authMiddleware] User found:", user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.clientId
      } : "no");

      if (!user) {
        console.log("[authMiddleware] User not found in database");
        return sendErrorResponse(res, 401, "User not found");
      }

      if (!user.isActive) {
        console.log("[authMiddleware] User account is inactive");
        return sendErrorResponse(res, 401, "User account is inactive");
      }

      // Ensure we're attaching the complete user object to the request
      req.user = user;
      console.log("[authMiddleware] Attached user to request:", {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        clientId: req.user.clientId
      });

      next();
    } catch (jwtError) {
      console.log("[authMiddleware] JWT verification error:", jwtError);
      return sendErrorResponse(res, 401, "Invalid token", jwtError);
    }
  } catch (error) {
    console.log("[authMiddleware] Middleware error:", error);
    return sendErrorResponse(res, 401, "Authentication failed", error);
  }
};

// Alias for verifyToken - used in routes
export const protect = verifyToken;

// Define role hierarchy
const ROLE_HIERARCHY = {
  user: 1,
  recruiter: 2,
  manager: 3,
  admin: 4,
};

export const checkRole = (allowedRoles) => {
  // Convert single role to array for consistent handling
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(res, 401, "Authentication required");
    }

    const userRole = req.user.role;
    const userRoleLevel = ROLE_HIERARCHY[userRole];

    // Check if user's role is in allowed roles or higher in hierarchy
    const hasPermission = roles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role];
      return userRoleLevel >= requiredLevel;
    });

    if (!hasPermission) {
      return sendErrorResponse(res, 403, "Insufficient permissions", {
        required: roles,
        current: userRole,
      });
    }

    next();
  };
};

// Admin check is now a specific case of role check
export const checkAdmin = async (req, res, next) => {
  return checkRole("admin")(req, res, next);
};
