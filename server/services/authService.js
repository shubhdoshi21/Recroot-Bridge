import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import * as authRepository from "../repositories/authRepository.js";
import {
  authenticateGoogle,
  SCOPES as GOOGLE_SCOPES,
} from "./googleService.js";
import { authenticateLinkedin } from "./linkedinService.js";
import {
  sendVerificationEmail,
  sendOAuthWelcomeEmail,
  generateTempPassword,
} from "./emailService.js";

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (userData) => {
  console.log("Starting registration process with data:", {
    ...userData,
    password: "[REDACTED]",
  });

  const {
    fullName,
    email,
    password,
    phone,
    role,
    isVerified = false,
  } = userData;

  // Check if a user already exists
  console.log("Checking for existing user:", email);
  const existingUser = await authRepository.findUserByEmail(email);
  console.log("Existing user check result:", {
    userFound: !!existingUser,
    isVerified: existingUser?.isVerified,
    email: existingUser?.email,
    id: existingUser?.id,
  });

  // If user exists and is verified, don't allow registration
  if (existingUser && existingUser.isVerified) {
    console.log("Registration failed: User already exists and is verified");
    throw new Error("User already exists");
  }

  // Define valid roles
  const validRoles = ["admin", "manager", "recruiter", "user", "guest"];

  // Set default role if not provided or if provided role is invalid
  const finalRole = validRoles.includes(role?.toLowerCase())
    ? role.toLowerCase()
    : "user";

  console.log("Processing registration with role:", finalRole);

  const hashedPassword = await authRepository.hashPassword(password);
  console.log("Password hashed successfully");

  try {
    let user;

    // Create a new user or update existing unverified user
    if (!existingUser) {
      console.log("Creating new user");
      user = await authRepository.createUser({
        fullName,
        email,
        password: hashedPassword,
        phone,
        role: finalRole,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        passwordLastChanged: new Date(),
        isVerified: isVerified || process.env.NODE_ENV !== "production", // Auto-verify in development
        otp: null,
        otpExpiry: null,
        authType: "local",
        accessToken: null,
      });
    } else {
      console.log("Updating existing unverified user");
      user = await authRepository.updateUser(existingUser.id, {
        fullName,
        email,
        password: hashedPassword,
        phone,
        role: finalRole,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        passwordLastChanged: new Date(),
        isVerified: isVerified || process.env.NODE_ENV !== "production", // Auto-verify in development
        otp: null,
        otpExpiry: null,
        authType: "local",
        accessToken: null,
      });
    }

    console.log("User record created/updated successfully:", {
      userId: user.id,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    });

    const token = generateToken(user);
    console.log("Registration completed successfully");
    return { user, token };
  } catch (error) {
    console.log("Error in registration process:", error);
    throw new Error("Failed to complete registration: " + error.message);
  }
};

export const login = async (email, password) => {
  console.log("[authService] Login attempt for email:", email);

  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    console.log("[authService] User not found:", email);
    throw new Error("Invalid credentials");
  }

  console.log("[authService] User found:", {
    id: user.id,
    email: user.email,
    hasPassword: !!user.password,
    authType: user.authType,
    isActive: user.isActive,
  });

  // Check if user has no password (OAuth account)
  if (!user.password) {
    console.log("[authService] User has no password (OAuth account)");
    throw new Error(
      `You have an account with ${user.authType} authentication. Please login with ${user.authType}.`
    );
  }

  const isValidPassword = await authRepository.comparePassword(
    password,
    user.password
  );

  console.log("[authService] Password validation result:", isValidPassword);

  if (!isValidPassword) {
    console.log("[authService] Invalid password for user:", email);
    throw new Error("Invalid credentials");
  }

  // If this is the first login (user is inactive), activate the account
  if (!user.isActive) {
    console.log("[authService] First login detected, activating user account");
    await authRepository.updateUser(user.id, { isActive: true });
    user.isActive = true;
  }

  await authRepository.updateLastLogin(user.id);
  const token = generateToken(user);

  console.log("[authService] Login successful for user:", email);
  return { user, token };
};

export const googleAuth = async (code) => {
  try {
    console.log("Starting Google authentication with code:", code);
    const { profile: googleProfile, accessToken, refreshToken } = await authenticateGoogle(
      code
    );
    console.log("Google profile received:", googleProfile);

    // Check if user exists
    let user = await authRepository.findUserByEmail(googleProfile.email);
    console.log("Existing user found:", user ? "yes" : "no");

    if (!user) {
      // Generate temporary password
      const tempPassword = generateTempPassword();

      // Create new user
      user = await authRepository.createUser({
        fullName: `${googleProfile.firstName} ${googleProfile.lastName}`.trim(),
        email: googleProfile.email,
        password: tempPassword, // Will be hashed in createUser
        role: "user",
        isActive: true,
        isVerified: true, // Google emails are verified
        profilePicture: googleProfile.picture,
        authType: "google",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      // Set temporary password and get reset token
      const { resetToken } = await authRepository.setTempPassword(
        user.id,
        tempPassword
      );

      // Send welcome email with temporary password and reset link
      await sendOAuthWelcomeEmail(
        user.email,
        user.fullName,
        tempPassword,
        resetToken
      );

      console.log("New user created:", user.id);
    } else {
      // Update existing user's Google info but preserve the name
      user.profilePicture = googleProfile.picture;
      user.authType = "google";
      user.accessToken = accessToken;
      // Only update refreshToken if present (Google only sends it on first consent)
      if (refreshToken) {
        user.refreshToken = refreshToken;
      }
      await authRepository.updateUser(user.id, user);
      console.log("Existing user updated:", user.id);
    }

    // Generate JWT token
    const token = generateToken(user);

    return { user, token };
  } catch (error) {
    console.log("Google auth service error:", error);
    throw new Error("Google authentication failed: " + error.message);
  }
};

export const linkedinAuth = async (code) => {
  try {
    const { profile: linkedinUser, accessToken } = await authenticateLinkedin(
      code
    );
    let user = await authRepository.findUserByEmail(linkedinUser.email);

    if (!user) {
      // Generate temporary password
      const tempPassword = generateTempPassword();

      // Create new user
      user = await authRepository.createUser({
        fullName: `${linkedinUser.firstName} ${linkedinUser.lastName}`,
        email: linkedinUser.email,
        password: tempPassword,
        role: "user",
        isActive: true,
        passwordLastChanged: new Date(),
        authType: "linkedin",
        isVerified: true,
        accessToken: accessToken,
      });

      // Set temporary password and get reset token
      const { resetToken } = await authRepository.setTempPassword(
        user.id,
        tempPassword
      );

      // Send welcome email with temporary password and reset link
      await sendOAuthWelcomeEmail(
        user.email,
        user.fullName,
        tempPassword,
        resetToken
      );
    } else {
      // Update existing user's LinkedIn info but preserve the name
      user.authType = "linkedin";
      user.accessToken = accessToken;
      await authRepository.updateUser(user.id, user);
    }

    if (!user.isActive) {
      throw new Error("Account is inactive");
    }

    const token = generateToken(user);
    return { user, token };
  } catch (error) {
    console.log("LinkedIn auth service error:", error);
    throw new Error("LinkedIn authentication failed: " + error.message);
  }
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      clientId: user.clientId,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export const verifyToken = async (token) => {
  try {
    console.log("Verifying token:", token);
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    console.log("Decoded token:", decoded);

    const user = await authRepository.findUserById(decoded.id);
    console.log("Found user:", user ? "yes" : "no");

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    return user;
  } catch (error) {
    console.log("Token verification error:", error);
    throw new Error("Invalid token");
  }
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await authRepository.findUserById(userId, true);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("Account is inactive");
  }

  const isValidPassword = await authRepository.comparePassword(
    currentPassword,
    user.password
  );
  if (!isValidPassword) {
    throw new Error("Current password is incorrect");
  }

  // Check if new password is same as current password
  const isSamePassword = await authRepository.comparePassword(
    newPassword,
    user.password
  );
  if (isSamePassword) {
    throw new Error("New password must be different from current password");
  }

  const hashedPassword = await authRepository.hashPassword(newPassword);
  await authRepository.updatePassword(userId, hashedPassword);
  return true;
};

export const updateProfile = async (userId, profileData) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("Account is inactive");
  }

  return await authRepository.updateUser(userId, profileData);
};

export const deleteUser = async (userId, currentUserId) => {
  console.log("Service: Deleting user:", userId);
  console.log("Service: Current admin ID:", currentUserId);

  const user = await authRepository.findUserById(userId);
  console.log("Service: Found user to delete:", user ? "yes" : "no");

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent self-deletion
  if (parseInt(userId) === parseInt(currentUserId)) {
    throw new Error("Cannot delete your own account");
  }

  // Get current user to check role
  const currentUser = await authRepository.findUserById(currentUserId);
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Only administrators can delete users");
  }

  // Soft delete by deactivating the user
  const result = await authRepository.deactivateUser(userId);
  console.log("Service: Deactivation result:", result);

  return result;
};

export const getUsers = async (options) => {
  // Remove the admin check since it's handled by middleware
  return await authRepository.getUsers(options);
};

export const getGoogleAuthUrl = () => {
  // Use all needed scopes for Gmail
  const scopeParam = encodeURIComponent(GOOGLE_SCOPES.join(" "));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    config.google.clientId
  }&redirect_uri=${encodeURIComponent(
    config.google.redirectUri
  )}&response_type=code&scope=${scopeParam}&access_type=offline&prompt=consent`;
};

export const checkAuthType = async (email) => {
  console.log("checkAuthType called with email:", email);
  try {
    const user = await authRepository.findUserByEmail(email);
    console.log("User found in database:", user ? "yes" : "no");

    if (!user) {
      // If user doesn't exist, default to local auth (for signup flow)
      console.log("User not found!");
      return "none";
    }

    const authType = user.authType || "local";
    console.log("Returning auth type:", authType);
    return authType;
  } catch (error) {
    console.log("Error in checkAuthType:", error);
    // Default to local auth in case of error
    return "local";
  }
};

export const verifyOTP = async (email, otp) => {
  console.log("Starting OTP verification for:", email);
  try {
    if (!email || !otp) {
      console.log("Missing email or OTP");
      throw new Error("Email and OTP are required for verification.");
    }

    console.log("Verifying OTP");
    const isValid = await authRepository.verifyUserOtp(email, otp);
    if (!isValid) {
      console.log("Invalid OTP verification attempt");
      throw new Error("Invalid or expired verification code.");
    }

    console.log("OTP verified successfully for:", email);
    return { message: "OTP verified successfully" };
  } catch (error) {
    console.log("Error in verifyOTP service:", error);
    throw error;
  }
};

export const resendOTP = async (email) => {
  // Check if a verified user already exists
  const existingVerifiedUser = await authRepository.findUserByEmail(email);
  if (existingVerifiedUser && existingVerifiedUser.isVerified) {
    throw new Error("Email is already verified.");
  }

  // Generate new OTP and send email
  const otp = generateOTP();

  // Store OTP in database
  const user = await authRepository.setUserOtp(email, otp);

  await sendVerificationEmail(email, user?.fullName || email, otp);

  return { message: "OTP resent successfully" };
};

export const requestOtp = async (email) => {
  console.log("Requesting OTP for:", email);
  try {
    // Check if a verified user already exists
    console.log("Checking for existing verified user");
    const existingVerifiedUser = await authRepository.findUserByEmail(email);

    // Check if user exists, is verified, and has no pending OTP
    if (
      existingVerifiedUser &&
      existingVerifiedUser.isVerified &&
      !existingVerifiedUser.otp
    ) {
      console.log(
        "Found existing verified user with no pending OTP, OTP request rejected"
      );
      throw new Error("Email is already verified.");
    }

    // Generate new OTP and send email
    const otp = generateOTP();
    console.log("Generated new OTP");

    // Store OTP in database
    console.log("Storing OTP in database");
    const user = await authRepository.setUserOtp(email, otp);

    console.log("Sending verification email");
    await sendVerificationEmail(email, user?.fullName || email, otp);

    console.log("OTP request completed successfully");
    return { message: "OTP sent successfully" };
  } catch (error) {
    console.log("Error in requestOtp service:", error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const result = await authRepository.resetPassword(token, newPassword);
    return result;
  } catch (error) {
    console.log("Reset password error:", error);
    throw new Error("Failed to reset password: " + error.message);
  }
};

export const changeUserRole = async (userId, newRole) => {
  try {
    // Change the role
    const updatedUser = await authRepository.changeUserRole(userId, newRole);
    return updatedUser;
  } catch (error) {
    console.log("Error in changeUserRole service:", error);
    throw error;
  }
};

export const getUserCountsByRole = async (clientId) => {
  try {
    console.log(
      "[authService] Getting user counts by role for clientId:",
      clientId
    );

    if (!clientId) {
      throw new Error("Client ID is required to get user counts");
    }

    const roleCounts = await authRepository.getUserCountsByRole(clientId);
    console.log("[authService] Retrieved role counts:", roleCounts);

    return roleCounts;
  } catch (error) {
    console.log("[authService] Error in getUserCountsByRole:", error);
    throw error;
  }
};

export const changeUserClientId = async (userId, clientId) => {
  try {
    // Change the client ID
    const updatedUser = await authRepository.changeUserClientId(
      userId,
      clientId
    );
    return updatedUser;
  } catch (error) {
    console.log("Error in changeUserClientId service:", error);
    throw error;
  }
};
