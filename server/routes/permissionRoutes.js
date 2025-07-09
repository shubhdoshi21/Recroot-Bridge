import express from "express";
import {
    getPermissions,
    getPermissionsByRole,
    updateRolePermissions,
    getUserPermissions,
    checkUserPermission,
    grantUserPermission,
    revokeUserPermission,
    getPermissionsWithCategories,
    getMyPermissions,
    checkMyPermission,
    seedPermissions,
    getSettingsPermissions,
    updateSettingsPermissions
} from "../controllers/permissionController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Public permission routes (for authenticated users)
router.get("/me", getMyPermissions);
router.get("/me/check/:permissionName", checkMyPermission);

// Admin-only routes
router.get("/", checkRole("admin"), getPermissions);
router.get("/categories", checkRole("admin"), getPermissionsWithCategories);
router.get("/settings", checkRole("admin"), getSettingsPermissions);
router.put("/settings", checkRole("admin"), updateSettingsPermissions);
router.post("/seed", checkRole("admin"), seedPermissions);

// Role-based permission routes
router.get("/role/:role", checkRole("admin"), getPermissionsByRole);
router.put("/role/:role", checkRole("admin"), updateRolePermissions);

// User permission routes
router.get("/user/:userId", checkRole("admin"), getUserPermissions);
router.get("/user/:userId/check/:permissionName", checkUserPermission);
router.post("/user/:userId/grant", checkRole("admin"), grantUserPermission);
router.delete("/user/:userId/revoke/:permissionName", checkRole("admin"), revokeUserPermission);

export default router; 