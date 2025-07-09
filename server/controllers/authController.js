import * as authService from "../services/authService.js";
import * as authRepository from "../repositories/authRepository.js";
import { config } from "../config/config.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    const { user, token } = await authService.register({
      fullName,
      email,
      password,
      phone,
      role,
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        authType: user.authType,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res
      .status(error.message === "User already exists" ? 400 : 500)
      .json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    const { user, token } = await authService.login(email, password);
    console.log("Login successful, token generated:", token ? "yes" : "no");

    // Set cookie with debug logging
    console.log("Setting cookie with token:", token);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to false for local development
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
      domain: "localhost",
    });

    // Set a separate cookie for client-side authentication check
    res.cookie("isAuthenticated", "true", {
      httpOnly: false, // Allow JavaScript access
      secure: false, // Set to false for local development
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
      domain: "localhost",
    });

    // Send response with token in both cookie and body for debugging
    res.json({
      message: "Login successful",
      token, // Include token in response for debugging
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        authType: user.authType,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(401).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required" });
    }

    const { user, token } = await authService.googleAuth(code);

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Set isAuthenticated cookie for client-side
    res.cookie("isAuthenticated", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      message: "Google authentication successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        authType: user.authType,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.log("Google auth error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const linkedinAuth = async (req, res) => {
  try {
    const { code } = req.body;
    const { user, token } = await authService.linkedinAuth(code);

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Set isAuthenticated cookie for client-side
    res.cookie("isAuthenticated", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      message: "LinkedIn authentication successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        authType: user.authType,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    console.log("Cookies received:", req.cookies);
    const token = req.cookies.token;
    console.log("Token from cookie:", token);

    const user = await authService.verifyToken(token);
    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        authType: user.authType,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        clientId: user.clientId,
      },
    });
  } catch (error) {
    console.log("Get profile error:", error);
    res.status(401).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    console.log("Change password request received:", {
      body: req.body,
      cookies: req.cookies,
    });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }

    const user = await authService.verifyToken(req.cookies.token);
    console.log("User verified:", { id: user.id, email: user.email });

    await authService.changePassword(user.id, currentPassword, newPassword);
    console.log("Password changed successfully for user:", user.id);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("Change password error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await authService.verifyToken(req.cookies.token);
    const updatedUser = await authService.updateProfile(user.id, req.body);
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        isVerified: updatedUser.isVerified,
        authType: updatedUser.authType,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Attempting to delete user:", userId);
    console.log("Current user:", req.user);

    const result = await authService.deleteUser(userId, req.user.id);
    console.log("Delete result:", result);

    res.json({
      message: "User deactivated successfully",
      note: "The user has been deactivated and can be reactivated later if needed",
    });
  } catch (error) {
    console.log("Delete user error:", error);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      message: error.message,
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page, limit, role, isActive, search } = req.query;

    const options = {
      page,
      limit,
      role,
      // Only include isActive if it's explicitly provided
      ...(isActive !== undefined && { isActive: isActive === "true" }),
      search,
    };

    const result = await authService.getUsers(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const getLinkedInAuthUrl = async (req, res) => {
  try {
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.linkedin.clientId}&redirect_uri=${config.linkedin.redirectUri}&scope=openid%20profile%20email`;
    res.json({ url: linkedinAuthUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoogleAuthUrl = (req, res) => {
  const url = authService.getGoogleAuthUrl();
  res.json({ url });
};

export const checkAuthType = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const authType = await authService.checkAuthType(email);
    res.json({ authType });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Allow development bypass - accept static OTP for dev
    const isDev = process.env.NODE_ENV !== "production";
    let verified = false;

    if (isDev && otp === "123456") {
      console.log("Development mode: Static OTP accepted");
      verified = true;
      await authRepository.verifyUserOtp(email, "123456");
    } else {
      verified = await authService.verifyOTP(email, otp);
    }

    if (verified) {
      res.json({ message: "OTP verified successfully" });
    } else {
      res.status(401).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.log("Verify OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await authService.resendOTP(email);
    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add controller for requesting OTP before signup
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("OTP requested for email:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Allow development bypass - always generate the same OTP for dev
    const isDev = process.env.NODE_ENV !== "production";
    const otp = isDev ? "123456" : await authService.requestOtp(email);

    if (isDev) {
      console.log("Development mode: Using static OTP 123456");

      // In development, we'll automatically create the user with the OTP to simplify testing
      const existingUser = await authService.checkAuthType(email);

      if (!existingUser) {
        // Create a user with the OTP already set
        const user = await authRepository.setUserOtp(email, "123456", 60); // Longer expiry for dev
        console.log("Dev mode: Created user with OTP:", user.id);
      } else {
        console.log("Dev mode: User already exists, setting OTP");
        await authRepository.setUserOtp(email, "123456", 60);
      }
    }

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.log("Request OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const result = await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      data: result,
    });
  } catch (error) {
    console.log("Reset password error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      // Update user with reset token
      await user.update({
        resetToken,
        resetTokenExpiry,
      });

      // Send reset email
      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(user.email, user.fullName, resetLink);

      res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset link",
      });
    } catch (updateError) {
      console.log("Error updating user or sending email:", updateError);
      throw new Error("Failed to process password reset request");
    }
  } catch (error) {
    console.log("Forgot password error:", error);
    res.status(500).json({
      message: error.message || "Failed to process password reset request",
    });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole, email } = req.body;

    if (!newRole) {
      return res.status(400).json({ message: "New role is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email to verify the request
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify that the email matches the user ID
    if (user.id !== parseInt(userId)) {
      return res
        .status(400)
        .json({ message: "Email does not match the user ID" });
    }

    const updatedUser = await authService.changeUserRole(userId, newRole);

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Change role error:", error);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      message: error.message,
    });
  }
};

export const getUserCountsByRole = async (req, res) => {
  try {
    // Get the current user's clientId from the request
    const currentUser = await authService.verifyToken(req.cookies.token);
    if (!currentUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const roleCounts = await authService.getUserCountsByRole(
      currentUser.clientId
    );
    res.json(roleCounts);
  } catch (error) {
    console.log("Get user counts error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const changeUserClientId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const updatedUser = await authService.changeUserClientId(userId, clientId);

    res.json({
      message: "User client ID updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Change client ID error:", error);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      message: error.message,
    });
  }
};
