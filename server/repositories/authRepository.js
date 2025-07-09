import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import crypto from "crypto";
import { sequelize } from "../config/sequelize.js";
import { Client } from "../models/Client.js";

export const findUserByEmail = async (email) => {
  console.log("Finding user by email:", email);
  try {
    const user = await User.findOne({
      where: { email },
    });
    console.log("User lookup result:", {
      found: !!user,
      id: user?.id,
      isVerified: user?.isVerified,
      hasOtp: !!user?.otp,
      otpExpiry: user?.otpExpiry,
      role: user?.role,
    });
    return user;
  } catch (error) {
    console.log("Error finding user by email:", error);
    throw new Error("Error finding user by email: " + error.message);
  }
};

export const findUserById = async (id, includePassword = false) => {
  try {
    console.log("[authRepository] Finding user by ID:", id);
    const attributes = includePassword ? undefined : { exclude: ["password"] };
    const user = await User.findByPk(id, {
      attributes,
      include: [
        {
          model: Client,
          attributes: ["id", "companyName"],
        },
      ],
    });

    if (user) {
      console.log("[authRepository] Found user:", {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
      });
    } else {
      console.log("[authRepository] No user found with ID:", id);
    }

    return user;
  } catch (error) {
    console.log("[authRepository] Error finding user by id:", error);
    throw new Error("Error finding user by id: " + error.message);
  }
};

export const createUser = async (userData) => {
  try {
    console.log("[authRepository] Creating user with data:", {
      ...userData,
      password: userData.password ? "[REDACTED]" : undefined,
      clientId: userData.clientId,
    });

    // Define valid roles
    const validRoles = ["admin", "manager", "recruiter", "user", "guest"];

    // Set default role if not provided or if provided role is invalid
    const role = validRoles.includes(userData.role?.toLowerCase())
      ? userData.role.toLowerCase()
      : "user";

    const user = await User.create({
      fullName: userData.fullName,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: role,
      isActive: userData.isActive ?? true,
      passwordLastChanged: userData.passwordLastChanged || new Date(),
      authType: userData.authType || "local",
      isVerified: userData.isVerified ?? false,
      accessToken: userData.accessToken || null,
      refreshToken: userData.refreshToken || null,
      otp: userData.otp || null,
      otpExpiry: userData.otpExpiry || null,
      status: userData.status || "active",
      clientId: userData.clientId,
      resetToken: userData.resetToken || null,
      resetTokenExpiry: userData.resetTokenExpiry || null,
    }).catch((error) => {
      console.log("[authRepository] Validation error details:", {
        name: error.name,
        message: error.message,
        errors: error.errors?.map((e) => ({
          message: e.message,
          type: e.type,
          path: e.path,
          value: e.value,
        })),
      });
      throw error;
    });

    console.log("[authRepository] User created successfully:", {
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    });

    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    console.log("[authRepository] Error creating user:", error.message);
    throw new Error("Error creating user: " + error.message);
  }
};

export const updateUser = async (id, userData) => {
  console.log("Updating user:", id);
  console.log("Update data:", {
    ...userData,
    password: userData.password ? "[REDACTED]" : undefined,
  });
  try {
    const user = await User.findByPk(id);
    if (!user) {
      console.log("User not found for update");
      throw new Error("User not found");
    }

    console.log("Current user state:", {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
      hasOtp: !!user.otp,
      role: user.role,
      clientId: user.clientId,
    });

    // Only allow updating specific fields
    const allowedFields = [
      "fullName",
      "firstName",
      "lastName",
      "phone",
      "role",
      "isActive",
      "isVerified",
      "authType",
      "accessToken",
      "refreshToken",
      "otp",
      "otpExpiry",
      "password",
      "passwordLastChanged",
      "profilePicture",
      "clientId",
    ];
    const updateData = {};

    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    }

    console.log("Applying updates to user");
    await user.update(updateData);
    const { password, ...userWithoutPassword } = user.toJSON();
    console.log("User updated successfully:", {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      isVerified: userWithoutPassword.isVerified,
      role: userWithoutPassword.role,
    });
    return userWithoutPassword;
  } catch (error) {
    console.log("Error in updateUser:", error);
    throw new Error("Error updating user: " + error.message);
  }
};

export const deleteUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }

    await user.destroy();
    return true;
  } catch (error) {
    throw new Error("Error deleting user: " + error.message);
  }
};

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    console.log("[authRepository] Comparing passwords");
    const result = await bcrypt.compare(password, hashedPassword);
    console.log("[authRepository] Password comparison result:", result);
    return result;
  } catch (error) {
    console.log("[authRepository] Error comparing passwords:", error);
    throw new Error("Error comparing passwords: " + error.message);
  }
};

export const updateLastLogin = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }

    await user.update({ lastLogin: new Date() });
    return true;
  } catch (error) {
    throw new Error("Error updating last login: " + error.message);
  }
};

export const deactivateUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }

    await user.update({ isActive: false });
    return true;
  } catch (error) {
    throw new Error("Error deactivating user: " + error.message);
  }
};

export const reactivateUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }

    await user.update({ isActive: true });
    return true;
  } catch (error) {
    throw new Error("Error reactivating user: " + error.message);
  }
};

export const updatePassword = async (id, hashedPassword) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }

    await user.update({
      password: hashedPassword,
      passwordLastChanged: new Date(),
    });
    return true;
  } catch (error) {
    throw new Error("Error updating password: " + error.message);
  }
};

export const getUsers = async (options = {}) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = options;

    console.log("Fetching users with options:", options);

    const offset = (page - 1) * limit;
    const where = {};

    // Add filters if provided
    if (role) where.role = role;
    // Only add isActive filter if explicitly provided
    if (isActive !== undefined && isActive !== null) {
      where.isActive = isActive;
    }
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    console.log("Query where clause:", where);

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    console.log("Found users:", count);

    return {
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.log("Error in getUsers:", error);
    throw new Error("Error fetching users: " + error.message);
  }
};

export const setUserOtp = async (email, otp, expiryMinutes = 2) => {
  console.log("Setting OTP for user:", email);
  try {
    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
    console.log("OTP expiry time:", expiryTime);

    const user = await User.findOne({ where: { email } });
    console.log("Existing user found:", !!user);

    // If user exists and is verified with no pending OTP, don't allow new OTP
    if (user && user.isVerified && !user.otp) {
      console.log("User is already verified with no pending OTP");
      throw new Error("Email is already verified.");
    }

    if (!user) {
      console.log("Creating new user record for OTP");
      // Create a temporary record just for OTP
      const newUser = await User.create({
        email,
        fullName: email.split("@")[0], // Temporary name
        otp,
        otpExpiry: expiryTime,
        isVerified: false,
        authType: "local",
        isActive: true,
        role: "user",
        passwordLastChanged: new Date(),
      });
      console.log("New user record created:", { userId: newUser.id });
      return newUser;
    }

    console.log("Updating existing user OTP");
    // Update existing user's OTP
    await user.update({
      otp,
      otpExpiry: expiryTime,
      isVerified: false, // Reset verification status when requesting new OTP
    });

    console.log("User OTP updated successfully");
    return user;
  } catch (error) {
    console.log("Error in setUserOtp:", error);
    throw new Error("Error setting user OTP: " + error.message);
  }
};

export const verifyUserOtp = async (email, otp) => {
  console.log("Verifying OTP for user:", email);
  try {
    const user = await User.findOne({ where: { email } });
    console.log("User found:", !!user);

    if (!user) {
      console.log("User not found for OTP verification");
      throw new Error("User not found");
    }

    if (!user.otp || !user.otpExpiry) {
      console.log("No OTP found for user");
      throw new Error("No OTP found for this user");
    }

    if (Date.now() > user.otpExpiry) {
      console.log("OTP has expired");
      throw new Error("OTP has expired");
    }

    if (user.otp !== otp) {
      console.log("Invalid OTP provided");
      throw new Error("Invalid OTP");
    }

    console.log("OTP is valid, marking email as verified");
    // Mark email as verified but don't clear OTP yet
    await user.update({
      isVerified: true,
    });

    console.log("Email marked as verified successfully");
    return true;
  } catch (error) {
    console.log("Error in verifyUserOtp:", error);
    throw new Error("Error verifying user OTP: " + error.message);
  }
};

export const clearUserOtp = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    await user.update({
      otp: null,
      otpExpiry: null,
    });

    return true;
  } catch (error) {
    throw new Error("Error clearing user OTP: " + error.message);
  }
};

export const setTempPassword = async (userId, tempPassword) => {
  try {
    const hashedPassword = await hashPassword(tempPassword);
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await User.update(
      {
        password: hashedPassword,
        resetToken,
        resetTokenExpiry,
        passwordLastChanged: new Date(),
      },
      { where: { id: userId } }
    );

    return { resetToken };
  } catch (error) {
    console.log("Error setting temporary password:", error);
    throw new Error("Failed to set temporary password");
  }
};

export const verifyResetToken = async (token) => {
  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      // Check if token exists but is expired
      const expiredToken = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: { [Op.lte]: new Date() },
        },
      });

      if (expiredToken) {
        throw new Error(
          "This password reset link has expired. Please request a new one."
        );
      }

      // Check if token was already used
      const usedToken = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: null,
        },
      });

      if (usedToken) {
        throw new Error(
          "This password reset link has already been used. Please request a new one."
        );
      }

      throw new Error("Invalid password reset link. Please request a new one.");
    }

    return user;
  } catch (error) {
    console.log("Error verifying reset token:", error);
    throw error; // Pass through the specific error message
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const user = await verifyResetToken(token);
    const hashedPassword = await hashPassword(newPassword);

    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      passwordLastChanged: new Date(),
      authType: "local",
    });

    return true;
  } catch (error) {
    console.log("Error resetting password:", error);
    throw error; // Pass through the specific error message
  }
};

export const changeUserRole = async (userId, newRole) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Define valid roles
    const validRoles = ["admin", "manager", "recruiter", "user", "guest"];

    // Validate the new role
    if (!validRoles.includes(newRole.toLowerCase())) {
      throw new Error("Invalid role specified");
    }

    await user.update({ role: newRole.toLowerCase() });
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    throw new Error("Error changing user role: " + error.message);
  }
};

export const getUserCountsByRole = async (clientId) => {
  try {
    console.log(
      "[authRepository] Getting user counts by role for clientId:",
      clientId
    );

    // Get all users for the client
    const users = await User.findAll({
      where: {
        clientId: clientId,
        isActive: true,
      },
      attributes: ["role"],
    });

    // Initialize counts for all roles
    const roleCounts = {
      admin: 0,
      manager: 0,
      recruiter: 0,
      user: 0,
    };

    // Count users by role
    users.forEach((user) => {
      const role = user.role.toLowerCase();
      if (roleCounts.hasOwnProperty(role)) {
        roleCounts[role]++;
      }
    });

    console.log("[authRepository] Role counts:", roleCounts);
    return roleCounts;
  } catch (error) {
    console.log("[authRepository] Error in getUserCountsByRole:", error);
    throw new Error("Failed to get user counts by role");
  }
};

export const changeUserClientId = async (userId, clientId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate that the client ID exists in the clients table
    const client = await sequelize.query(
      "SELECT id FROM clients WHERE id = :clientId",
      {
        replacements: { clientId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!client || client.length === 0) {
      throw new Error("Invalid client ID - client does not exist");
    }

    await user.update({ clientId });
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    throw new Error("Error changing user client ID: " + error.message);
  }
};
