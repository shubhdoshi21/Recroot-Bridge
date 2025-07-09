import * as permissionService from "../services/permissionService.js";
import * as permissionRepository from "../repositories/permissionRepository.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private (Admin)
export const getPermissions = asyncHandler(async (req, res) => {
    console.log("[permissionController] getPermissions called");

    const permissions = await permissionService.getPermissions();

    res.json({
        success: true,
        data: permissions,
        count: permissions.length
    });
});

// @desc    Get permissions by role
// @route   GET /api/permissions/role/:role
// @access  Private (Admin)
export const getPermissionsByRole = asyncHandler(async (req, res) => {
    const { role } = req.params;
    console.log("[permissionController] getPermissionsByRole called with role:", role);
    const permissions = await permissionRepository.getRolePermissions(role);
    res.json({
        success: true,
        data: permissions,
        role,
        count: permissions.length
    });
});

// @desc    Update role permissions
// @route   PUT /api/permissions/role/:role
// @access  Private (Admin)
export const updateRolePermissions = asyncHandler(async (req, res) => {
    const { role } = req.params;
    const { permissions } = req.body;
    const grantedBy = req.user.id;
    console.log("[permissionController] updateRolePermissions called with:", { role, permissions });

    if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
            success: false,
            message: "Permissions array is required"
        });
    }

    const result = await permissionService.setRolePermissions(role, permissions, grantedBy);

    res.json({
        success: true,
        message: "Role permissions updated successfully",
        data: result
    });
});

// @desc    Get user permissions
// @route   GET /api/permissions/user/:userId
// @access  Private (Admin)
export const getUserPermissions = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    console.log("[permissionController] getUserPermissions called with userId:", userId);

    const permissions = await permissionService.getUserPermissions(userId);

    res.json({
        success: true,
        data: permissions,
        userId,
        count: permissions.length
    });
});

// @desc    Check user permission
// @route   GET /api/permissions/user/:userId/check/:permissionName
// @access  Private
export const checkUserPermission = asyncHandler(async (req, res) => {
    const { userId, permissionName } = req.params;
    console.log("[permissionController] checkUserPermission called with:", { userId, permissionName });

    const hasPermission = await permissionService.checkUserPermission(userId, permissionName);

    res.json({
        success: true,
        data: {
            userId,
            permissionName,
            hasPermission
        }
    });
});

// @desc    Grant permission to user
// @route   POST /api/permissions/user/:userId/grant
// @access  Private (Admin)
export const grantUserPermission = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { permissionName } = req.body;
    const grantedBy = req.user.id;

    console.log("[permissionController] grantUserPermission called with:", { userId, permissionName, grantedBy });

    if (!permissionName) {
        return res.status(400).json({
            success: false,
            message: "Permission name is required"
        });
    }

    const result = await permissionService.grantPermission(userId, permissionName, grantedBy);

    res.status(201).json({
        success: true,
        message: "Permission granted successfully",
        data: result
    });
});

// @desc    Revoke permission from user
// @route   DELETE /api/permissions/user/:userId/revoke/:permissionName
// @access  Private (Admin)
export const revokeUserPermission = asyncHandler(async (req, res) => {
    const { userId, permissionName } = req.params;
    console.log("[permissionController] revokeUserPermission called with:", { userId, permissionName });

    const result = await permissionService.revokePermission(userId, permissionName);

    res.json({
        success: true,
        message: "Permission revoked successfully",
        data: result
    });
});

// @desc    Get permissions with categories for frontend
// @route   GET /api/permissions/categories
// @access  Private (Admin)
export const getPermissionsWithCategories = asyncHandler(async (req, res) => {
    console.log("[permissionController] getPermissionsWithCategories called");

    const categorizedPermissions = await permissionService.getPermissionsWithCategories();

    res.json({
        success: true,
        data: categorizedPermissions
    });
});

// @desc    Get current user's permissions
// @route   GET /api/permissions/me
// @access  Private
export const getMyPermissions = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log("[permissionController] getMyPermissions called for userId:", userId);

    const permissions = await permissionService.getUserPermissions(userId);

    res.json({
        success: true,
        data: permissions,
        count: permissions.length
    });
});

// @desc    Check current user's permission
// @route   GET /api/permissions/me/check/:permissionName
// @access  Private
export const checkMyPermission = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { permissionName } = req.params;

    console.log("[permissionController] checkMyPermission called with:", { userId, permissionName });

    const hasPermission = await permissionService.checkUserPermission(userId, permissionName);

    res.json({
        success: true,
        data: {
            permissionName,
            hasPermission
        }
    });
});

// @desc    Seed default permissions
// @route   POST /api/permissions/seed
// @access  Private (Admin)
export const seedPermissions = asyncHandler(async (req, res) => {
    console.log("[permissionController] seedPermissions called");

    const result = await permissionService.seedDefaultPermissions();

    res.status(201).json({
        success: true,
        message: "Default permissions seeded successfully",
        data: result
    });
});

// @desc    Get role permissions for settings page
// @route   GET /api/permissions/settings
// @access  Private (Admin)
export const getSettingsPermissions = asyncHandler(async (req, res) => {
    console.log("[permissionController] getSettingsPermissions called");

    const roles = ['admin', 'manager', 'recruiter', 'user', 'guest'];
    const rolePermissions = {};

    for (const role of roles) {
        const permissions = await permissionService.getPermissionsByRole(role);
        rolePermissions[role] = permissions;
    }
    // console.log('role permissions', rolePermissions)
    res.json({
        success: true,
        data: rolePermissions
    });
});

// @desc    Update settings permissions
// @route   PUT /api/permissions/settings
// @access  Private (Admin)
export const updateSettingsPermissions = asyncHandler(async (req, res) => {
    const { rolePermissions } = req.body;
    console.log("[permissionController] updateSettingsPermissions called");

    if (!rolePermissions || typeof rolePermissions !== 'object') {
        return res.status(400).json({
            success: false,
            message: "Role permissions object is required"
        });
    }

    const results = {};

    for (const [role, permissions] of Object.entries(rolePermissions)) {
        try {
            const result = await permissionService.updateRolePermissions(role, permissions);
            results[role] = result;
        } catch (error) {
            results[role] = { error: error.message };
        }
    }

    res.json({
        success: true,
        message: "Settings permissions updated",
        data: results
    });
}); 