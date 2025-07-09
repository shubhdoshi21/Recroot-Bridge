import {
    checkUserPermission,
    getUserPermissions
} from "../services/permissionService.js";
import { canManageNewHireDocuments } from "../utils/permissions.js";

const sendErrorResponse = (res, statusCode, message, error = null) => {
    const response = {
        success: false,
        message,
        ...(error && { error: error.message }),
    };
    return res.status(statusCode).json(response);
};

/**
 * Middleware to check if user has a specific permission
 * @param {string} permissionName - The permission to check
 * @returns {Function} Express middleware function
 */
export const checkPermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            console.log("[permissionMiddleware] checkPermission called for:", permissionName);

            if (!req.user) {
                return sendErrorResponse(res, 401, "Authentication required");
            }

            const hasPermission = await checkUserPermission(
                req.user.id,
                permissionName
            );

            if (!hasPermission) {
                console.log("[permissionMiddleware] Permission denied:", {
                    userId: req.user.id,
                    permission: permissionName
                });
                return sendErrorResponse(res, 403, "Insufficient permissions", {
                    required: permissionName,
                    userId: req.user.id
                });
            }

            console.log("[permissionMiddleware] Permission granted:", permissionName);
            next();
        } catch (error) {
            console.log("[permissionMiddleware] Error checking permission:", error);
            return sendErrorResponse(res, 500, "Error checking permissions");
        }
    };
};

/**
 * Middleware to check if user has any of the specified permissions
 * @param {string[]} permissionNames - Array of permissions to check
 * @returns {Function} Express middleware function
 */
export const checkAnyPermission = (permissionNames) => {
    return async (req, res, next) => {
        try {
            console.log("[permissionMiddleware] checkAnyPermission called for:", permissionNames);

            if (!req.user) {
                return sendErrorResponse(res, 401, "Authentication required");
            }

            const permissions = Array.isArray(permissionNames) ? permissionNames : [permissionNames];

            for (const permissionName of permissions) {
                const hasPermission = await checkUserPermission(
                    req.user.id,
                    permissionName
                );

                if (hasPermission) {
                    console.log("[permissionMiddleware] Permission granted:", permissionName);
                    return next();
                }
            }

            console.log("[permissionMiddleware] No permissions granted:", permissions);
            return sendErrorResponse(res, 403, "Insufficient permissions", {
                required: permissions,
                userId: req.user.id
            });
        } catch (error) {
            console.log("[permissionMiddleware] Error checking permissions:", error);
            return sendErrorResponse(res, 500, "Error checking permissions");
        }
    };
};

/**
 * Middleware to check if user has all of the specified permissions
 * @param {string[]} permissionNames - Array of permissions to check
 * @returns {Function} Express middleware function
 */
export const checkAllPermissions = (permissionNames) => {
    return async (req, res, next) => {
        try {
            console.log("[permissionMiddleware] checkAllPermissions called for:", permissionNames);

            if (!req.user) {
                return sendErrorResponse(res, 401, "Authentication required");
            }

            const permissions = Array.isArray(permissionNames) ? permissionNames : [permissionNames];

            for (const permissionName of permissions) {
                const hasPermission = await checkUserPermission(
                    req.user.id,
                    permissionName
                );

                if (!hasPermission) {
                    console.log("[permissionMiddleware] Permission denied:", permissionName);
                    return sendErrorResponse(res, 403, "Insufficient permissions", {
                        required: permissions,
                        missing: permissionName,
                        userId: req.user.id
                    });
                }
            }

            console.log("[permissionMiddleware] All permissions granted:", permissions);
            next();
        } catch (error) {
            console.log("[permissionMiddleware] Error checking permissions:", error);
            return sendErrorResponse(res, 500, "Error checking permissions");
        }
    };
};

// Middleware to check resource ownership or permission
export const checkResourcePermission = (resourceType, resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            console.log("[permissionMiddleware] checkResourcePermission called for:", resourceType);

            if (!req.user) {
                return sendErrorResponse(res, 401, "Authentication required");
            }

            const resourceId = req.params[resourceIdParam];
            if (!resourceId) {
                return sendErrorResponse(res, 400, "Resource ID is required");
            }

            // Check if user has general permission for this resource type
            const generalPermission = `${resourceType}.view`;
            const hasGeneralPermission = await checkUserPermission(
                req.user.id,
                generalPermission
            );

            if (hasGeneralPermission) {
                console.log("[permissionMiddleware] General permission granted:", generalPermission);
                return next();
            }

            // Check if user owns the resource (for resources that have ownership)
            // This would need to be implemented based on the specific resource type
            // For now, we'll just check general permissions

            console.log("[permissionMiddleware] Resource permission denied");
            return sendErrorResponse(res, 403, "Insufficient permissions for this resource", {
                resourceType,
                resourceId,
                userId: req.user.id
            });
        } catch (error) {
            console.log("[permissionMiddleware] Error checking resource permission:", error);
            return sendErrorResponse(res, 500, "Error checking resource permissions");
        }
    };
};

// Helper function to get user permissions for frontend
export const getUserPermissionsForFrontend = async (userId) => {
    try {
        const permissions = await getUserPermissions(userId);
        return permissions;
    } catch (error) {
        console.log("[permissionMiddleware] Error getting user permissions for frontend:", error);
        return [];
    }
};

/**
 * Middleware to check onboarding document access (special logic)
 * Requires: req.user, req.params.newHireId (or req.body.newHireId)
 */
export const checkOnboardingDocumentAccess = async (req, res, next) => {
    try {
        const user = req.user;
        const newHireId = req.params.id;
        if (!user || !newHireId) {
            return res.status(403).json({ message: "Access denied" });
        }
        const allowed = await canManageNewHireDocuments({ user, newHireId });
        if (!allowed) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Error checking onboarding document access" });
    }
}; 