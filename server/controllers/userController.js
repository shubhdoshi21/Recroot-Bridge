import * as userService from "../services/userService.js";
import { User } from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    console.log(
      "[userController] getUsers called with query params:",
      req.query
    );
    const { role, isActive, search } = req.query;
    const options = {
      role,
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
      search,
      clientId: req.user.clientId,
    };

    console.log("[userController] Processed options:", options);
    const result = await userService.getUsers(options);
    console.log("[userController] getUsers result:", {
      totalUsers: result.users.length,
    });

    res.json(result);
  } catch (error) {
    console.log("[userController] Get users error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("[userController] getUserById called with userId:", userId);

    const user = await userService.getUserById(userId);
    console.log("[userController] Found user:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json(user);
  } catch (error) {
    console.log("[userController] Get user error:", error);
    res.status(error.message.includes("not found") ? 404 : 500).json({
      message: error.message,
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;
    console.log("[userController] updateUserRole called with:", {
      userId,
      newRole,
    });

    if (!newRole) {
      console.log("[userController] Missing newRole in request body");
      return res.status(400).json({ message: "New role is required" });
    }

    const updatedUser = await userService.updateUserRole(userId, newRole);
    console.log("[userController] Role updated successfully:", {
      userId,
      oldRole: updatedUser.role,
      newRole,
    });

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("[userController] Update role error:", error);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      message: error.message,
    });
  }
};

export const updateUserClient = async (req, res) => {
  try {
    const { userId } = req.params;
    const { clientId } = req.body;
    console.log("[userController] updateUserClient called with:", {
      userId,
      clientId,
    });

    // Allow null clientId for removing assignments
    if (clientId === undefined) {
      console.log("[userController] Missing clientId in request body");
      return res.status(400).json({ message: "Client ID is required" });
    }

    const updatedUser = await userService.updateUserClient(userId, clientId);
    console.log("[userController] Client updated successfully:", {
      userId,
      oldClientId: updatedUser.clientId,
      newClientId: clientId,
    });

    res.json({
      message: "User client updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("[userController] Update client error:", error);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      message: error.message,
    });
  }
};

export const getUserCountsByRole = async (req, res) => {
  try {
    console.log(
      "[userController] getUserCountsByRole called for clientId:",
      req.user.clientId
    );
    const roleCounts = await userService.getUserCountsByRole(req.user.clientId);
    console.log("[userController] Role counts retrieved:", roleCounts);

    res.json(roleCounts);
  } catch (error) {
    console.log("[userController] Get user counts error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const clientId = req.user.clientId; // Get client ID from authenticated user

    console.log("[userController] createUser called with data:", {
      ...userData,
      password: "[REDACTED]",
      clientId,
    });

    // Add client ID to user data
    if (userData.role !== "admin") userData.clientId = clientId;

    const user = await userService.createUser(userData);
    console.log("[userController] User created successfully:", user.id);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log("[userController] Create user error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    console.log("[userController] updateUser called with:", {
      userId,
      userData: {
        ...userData,
        password: userData.password ? "[REDACTED]" : undefined,
      },
    });

    // Validate required fields
    if (!userData.fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }
    if (!userData.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!userData.role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const updatedUser = await userService.updateUser(userId, userData);
    console.log("[userController] User updated successfully:", {
      userId,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("[userController] Update user error:", error);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    console.log("[userController] deleteUser called with:", req.params.userId);
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await user.destroy();
    console.log("[userController] User deleted successfully:", userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("[userController] Error in deleteUser:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

export const getUsersForSuperAdmin = async (req, res) => {
  try {
    console.log("[userController] getUsersForSuperAdmin called");
    const result = await userService.getUsersForSuperAdmin();
    console.log("[userController] getUsersForSuperAdmin result:", {
      totalUsers: result.users.length,
      totalClients: result.clients.length,
    });
    res.json(result);
  } catch (error) {
    console.log("[userController] Get users for super admin error:", error);
    console.log("[userController] Error stack:", error.stack);
    res.status(500).json({
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
