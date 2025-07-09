import * as userRepository from "../repositories/userRepository.js";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import {
  sendOAuthWelcomeEmail,
  generateTempPassword,
  sendRoleChangeEmail,
} from "./emailService.js";
import crypto from "crypto";
import * as authRepository from "../repositories/authRepository.js";

export const getUsers = async (options) => {
  try {
    console.log("[userService] getUsers called with options:", options);
    const result = await userRepository.getUsers(options);
    console.log("[userService] getUsers result:", {
      totalUsers: result.users.length,
    });
    return result;
  } catch (error) {
    console.log("[userService] Error in getUsers service:", error);
    throw new Error("Failed to fetch users");
  }
};

export const getUserById = async (userId) => {
  try {
    console.log("[userService] getUserById called with userId:", userId);
    const user = await userRepository.getUserById(userId);
    if (!user) {
      console.log("[userService] User not found for id:", userId);
      throw new Error("User not found");
    }
    console.log("[userService] Found user:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return user;
  } catch (error) {
    console.log("[userService] Error in getUserById service:", error);
    throw error;
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    console.log("[userService] updateUserRole called with:", {
      userId,
      newRole,
    });
    const validRoles = ["admin", "manager", "recruiter", "user", "guest"];

    if (!validRoles.includes(newRole.toLowerCase())) {
      console.log("[userService] Invalid role specified:", newRole);
      throw new Error("Invalid role specified");
    }

    // Get the user's current role before updating
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const oldRole = user.role;

    const updatedUser = await userRepository.updateUserRole(userId, newRole);
    console.log("[userService] Role updated successfully:", {
      userId,
      oldRole: updatedUser.role,
      newRole,
    });

    // Send email notification about role change
    try {
      await sendRoleChangeEmail(
        updatedUser.email,
        updatedUser.fullName,
        oldRole,
        newRole
      );
      console.log(
        "[userService] Role change notification email sent successfully"
      );
    } catch (emailError) {
      // Log the error but don't fail the role update
      console.log(
        "[userService] Failed to send role change notification email:",
        emailError
      );
    }

    return updatedUser;
  } catch (error) {
    console.log("[userService] Error in updateUserRole service:", error);
    throw error;
  }
};

export const updateUserClient = async (userId, clientId) => {
  try {
    console.log("[userService] updateUserClient called with:", {
      userId,
      clientId,
    });
    const updatedUser = await userRepository.updateUserClient(userId, clientId);
    console.log("[userService] Client updated successfully:", {
      userId,
      oldClientId: updatedUser.clientId,
      newClientId: clientId,
    });
    return updatedUser;
  } catch (error) {
    console.log("[userService] Error in updateUserClient service:", error);
    throw error;
  }
};

export const getUserCountsByRole = async (clientId) => {
  try {
    console.log(
      "[userService] getUserCountsByRole called with clientId:",
      clientId
    );
    const roleCounts = await userRepository.getUserCountsByRole(clientId);
    console.log("[userService] Role counts retrieved:", roleCounts);
    return roleCounts;
  } catch (error) {
    console.log("[userService] Error in getUserCountsByRole service:", error);
    throw new Error("Failed to get user counts by role");
  }
};

export const createUser = async (userData) => {
  try {
    const { fullName, email, role, clientId, isVerified, isActive, authType } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate role
    const validRoles = ["admin", "manager", "recruiter", "user"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role specified");
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    console.log("[userService] Generated temporary password for:", email);

    // Hash password using the same method as authService
    const hashedPassword = await authRepository.hashPassword(tempPassword);
    console.log("[userService] Password hashed successfully");

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user data object
    const userDataToCreate = {
      fullName,
      email,
      role,
      password: hashedPassword,
      clientId,
      isVerified: isVerified || false,
      isActive: false, // Set to false initially
      authType: authType || "local",
      resetToken,
      resetTokenExpiry,
      passwordLastChanged: new Date(),
    };

    console.log("[userService] Creating user with data:", {
      ...userDataToCreate,
      password: "[REDACTED]",
      clientId: userDataToCreate.clientId
    });

    // Create user using repository
    const user = await userRepository.createUser(userDataToCreate);
    console.log("[userService] User created successfully:", {
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId
    });

    // Send welcome email with temporary password and reset link
    await sendOAuthWelcomeEmail(
      email,
      fullName,
      tempPassword,
      resetToken
    );
    console.log(
      "[userService] Welcome email sent with temporary password and reset link"
    );

    return user;
  } catch (error) {
    console.log("[userService] Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    console.log("[userService] updateUser called with:", {
      userId,
      userData: {
        ...userData,
        password: userData.password ? "[REDACTED]" : undefined,
      },
    });

    // Validate required fields
    if (!userData.fullName) {
      throw new Error("Full name is required");
    }
    if (!userData.email) {
      throw new Error("Email is required");
    }
    if (!userData.role) {
      throw new Error("Role is required");
    }

    const updatedUser = await userRepository.updateUser(userId, userData);
    console.log("[userService] User updated successfully:", {
      userId,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    return updatedUser;
  } catch (error) {
    console.log("[userService] Error in updateUser service:", error);
    throw error;
  }
};

export const getUsersForSuperAdmin = async () => {
  try {
    console.log("[userService] getUsersForSuperAdmin called");
    const result = await userRepository.getUsersForSuperAdmin();
    console.log("[userService] getUsersForSuperAdmin result:", {
      totalUsers: result.users.length,
      totalClients: result.clients.length,
    });
    return result;
  } catch (error) {
    console.log("[userService] Error in getUsersForSuperAdmin service:", error);
    console.log("[userService] Error stack:", error.stack);
    throw new Error("Failed to fetch users for super admin: " + error.message);
  }
};
