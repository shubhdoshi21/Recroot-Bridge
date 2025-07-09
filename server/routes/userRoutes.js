import express from "express";
import * as userController from "../controllers/userController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all users (requires settings.manage_users permission)
router.get("", checkPermission("settings.manage_users"), userController.getUsers);

// Get users for super admin (requires settings.manage_users permission)
router.get("/super-admin", checkPermission("settings.manage_users"), userController.getUsersForSuperAdmin);

// Get user counts by role (requires settings.manage_users permission)
router.get("/counts/role", checkPermission("settings.manage_users"), userController.getUserCountsByRole);

// Get user by ID (requires settings.manage_users permission)
router.get("/:userId", checkPermission("settings.manage_users"), userController.getUserById);

// Create user (requires settings.manage_users permission)
router.post("", checkPermission("settings.manage_users"), userController.createUser);

// Update user (requires settings.manage_users permission)
router.put("/:userId", checkPermission("settings.manage_users"), userController.updateUser);

// Delete user (requires settings.manage_users permission)
router.delete("/:userId", checkPermission("settings.manage_users"), userController.deleteUser);

// Update user role (requires settings.manage_users permission)
router.patch(
  "/:userId/role",
  checkPermission("settings.manage_users"),
  userController.updateUserRole
);

// Update user client (requires settings.manage_users permission)
router.patch(
  "/:userId/client",
  checkPermission("settings.manage_users"),
  userController.updateUserClient
);

export default router;
