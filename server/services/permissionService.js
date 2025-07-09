import { Permission, UserPermission, User } from "../models/index.js";
import { Op } from "sequelize";
import * as permissionRepository from "../repositories/permissionRepository.js";

// Get all permissions
export const getPermissions = async () => {
    return permissionRepository.getAllPermissions();
};

// Get permissions by role (default role permissions)
export const getPermissionsByRole = async (role) => {
    return permissionRepository.getRolePermissions(role);
};

// Update role permissions (save to database)
export const updateRolePermissions = async (role, permissions) => {
    try {
        console.log("[permissionService] updateRolePermissions called with:", { role, permissions });

        // This would typically save to a role_permissions table
        // For now, we'll just validate and return success
        const validPermissions = await getPermissions();
        const validPermissionNames = validPermissions.map(p => p.name);

        const invalidPermissions = permissions.filter(p => !validPermissionNames.includes(p));
        if (invalidPermissions.length > 0) {
            throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
        }

        console.log("[permissionService] Role permissions updated successfully for:", role);
        return { success: true, role, permissions };
    } catch (error) {
        console.log("[permissionService] Error in updateRolePermissions:", error);
        throw error;
    }
};

// Get user's specific permissions
export const getUserPermissions = async (userId) => {
    try {
        console.log("[permissionService] getUserPermissions called with userId:", userId);

        const userPermissions = await UserPermission.findAll({
            where: { userId },
            include: [{
                model: Permission,
                attributes: ['id', 'name']
            }],
            order: [['grantedAt', 'DESC']]
        });

        const permissions = userPermissions.map(up => up.Permission.name);
        console.log("[permissionService] Found user permissions:", permissions.length);
        return permissions;
    } catch (error) {
        console.log("[permissionService] Error in getUserPermissions:", error);
        throw new Error("Failed to fetch user permissions");
    }
};

// Check if user has specific permission
export const checkUserPermission = async (userId, permissionName) => {
    try {
        // Get the user's role
        const user = await User.findByPk(userId);
        if (!user) return false;

        // Find the permission ID
        const permission = await Permission.findOne({ where: { name: permissionName } });
        if (!permission) return false;

        // Check if the user's role has this permission in user_permissions
        const rolePermission = await UserPermission.findOne({
            where: { role: user.role, permissionId: permission.id }
        });

        return !!rolePermission;
    } catch (error) {
        console.log("[permissionService] Error in checkUserPermission:", error);
        return false;
    }
};

// Grant permission to user
export const grantPermission = async (userId, permissionName, grantedBy) => {
    try {
        console.log("[permissionService] grantPermission called with:", { userId, permissionName, grantedBy });

        // Find or create permission
        let permission = await Permission.findOne({ where: { name: permissionName } });
        if (!permission) {
            permission = await Permission.create({ name: permissionName });
        }

        // Check if user already has this permission
        const existingPermission = await UserPermission.findOne({
            where: { userId, permissionId: permission.id }
        });

        if (existingPermission) {
            console.log("[permissionService] User already has this permission");
            return existingPermission;
        }

        // Grant permission
        const userPermission = await UserPermission.create({
            userId,
            permissionId: permission.id,
            grantedBy,
            grantedAt: new Date()
        });

        console.log("[permissionService] Permission granted successfully");
        return userPermission;
    } catch (error) {
        console.log("[permissionService] Error in grantPermission:", error);
        throw new Error("Failed to grant permission");
    }
};

// Revoke permission from user
export const revokePermission = async (userId, permissionName) => {
    try {
        console.log("[permissionService] revokePermission called with:", { userId, permissionName });

        // Find permission
        const permission = await Permission.findOne({ where: { name: permissionName } });
        if (!permission) {
            throw new Error("Permission not found");
        }

        // Remove user permission
        const deletedCount = await UserPermission.destroy({
            where: { userId, permissionId: permission.id }
        });

        console.log("[permissionService] Permission revoked successfully, deleted:", deletedCount);
        return { success: true, deletedCount };
    } catch (error) {
        console.log("[permissionService] Error in revokePermission:", error);
        throw new Error("Failed to revoke permission");
    }
};

// Get all permissions with categories for frontend
export const getPermissionsWithCategories = async () => {
    try {
        console.log("[permissionService] getPermissionsWithCategories called");

        const permissions = await getPermissions();

        // Group permissions by category
        const categorizedPermissions = {
            Dashboard: [],
            Candidates: [],
            Jobs: [],
            Settings: [],
            Companies: [],
            Recruiters: [],
            Teams: [],
            Documents: [],
            Interviews: [],
            Communications: [],
            Analytics: [],
            Onboarding: []
        };

        permissions.forEach(permission => {
            const [category, action] = permission.name.split('.');
            let categoryKey = category.charAt(0).toUpperCase() + category.slice(1);

            // Map all onboarding submodules to 'Onboarding'
            if (
                categoryKey.startsWith("onboarding") ||
                categoryKey.startsWith("new_hires") ||
                categoryKey.startsWith("task_template") ||
                categoryKey.startsWith("onboarding_task") ||
                categoryKey.startsWith("onboarding_template") ||
                categoryKey.startsWith("onboarding_document")
            ) {
                categoryKey = "Onboarding";
            }

            if (categorizedPermissions[categoryKey]) {
                categorizedPermissions[categoryKey].push({
                    name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${categoryKey}`,
                    permission: permission.name
                });
            }
        });

        console.log("[permissionService] Categorized permissions created");
        return categorizedPermissions;
    } catch (error) {
        console.log("[permissionService] Error in getPermissionsWithCategories:", error);
        throw new Error("Failed to fetch categorized permissions");
    }
};

// Seed default permissions
export const seedDefaultPermissions = async () => {
    try {
        console.log("[permissionService] seedDefaultPermissions called");

        const defaultPermissions = [
            // Dashboard permissions
            'dashboard.view', 'dashboard.edit_widgets', 'dashboard.view_analytics',

            // Candidate permissions
            'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.delete', 'candidates.bulk_upload',

            // Job permissions
            'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.delete', 'jobs.publish',

            // Settings permissions
            'settings.view', 'settings.edit_system', 'settings.manage_users', 'settings.manage_integrations',

            // Company permissions
            'companies.view', 'companies.create', 'companies.edit', 'companies.delete',

            // Recruiter permissions
            'recruiters.view', 'recruiters.create', 'recruiters.edit', 'recruiters.delete',

            // Team permissions
            'teams.view', 'teams.create', 'teams.edit', 'teams.delete',

            // Document permissions
            'documents.view', 'documents.create', 'documents.edit', 'documents.delete', 'documents.share',

            // Interview permissions
            'interviews.view', 'interviews.create', 'interviews.edit', 'interviews.delete',

            // Communication permissions
            'communications.view', 'communications.create', 'communications.edit',

            // Analytics permissions
            'analytics.view', 'analytics.export',

            // Onboarding permissions
            'onboarding.view', 'onboarding.create', 'onboarding.edit', 'onboarding.delete'
        ];

        for (const permissionName of defaultPermissions) {
            await Permission.findOrCreate({
                where: { name: permissionName }
            });
        }

        // Assign onboarding permissions to all roles
        const onboardingPermissions = [
            'onboarding_document.view',
            'onboarding_document.upload',
            'onboarding_document.download',
            'onboarding_document.delete',
            'onboarding_task.view',
            'onboarding_task.create',
            'onboarding_task.edit',
            'onboarding_task.delete',
            'onboarding_task.assign',
            'onboarding_template.view',
            'onboarding_template.create',
            'onboarding_template.edit',
            'onboarding_template.delete',
            'onboarding_template.assign',
            'task_template.view',
            'task_template.create',
            'task_template.edit',
            'task_template.delete',
            'new_hires.view',
            'new_hires.create',
            'new_hires.edit',
            'new_hires.delete'
        ];
        const roles = ['admin', 'manager', 'recruiter'];
        const grantedBy = 1; // or your super admin user id
        for (const role of roles) {
            for (const permName of onboardingPermissions) {
                const permission = await Permission.findOne({ where: { name: permName } });
                if (permission) {
                    await UserPermission.findOrCreate({
                        where: { role, permissionId: permission.id },
                        defaults: { grantedBy, grantedAt: new Date() }
                    });
                }
            }
        }

        console.log("[permissionService] Default permissions seeded successfully");
        return { success: true, count: defaultPermissions.length };
    } catch (error) {
        console.log("[permissionService] Error in seedDefaultPermissions:", error);
        throw new Error("Failed to seed default permissions");
    }
};

// Get settings permissions for frontend
export const getSettingsPermissions = async () => {
    try {
        console.log("[permissionService] getSettingsPermissions called");

        const roles = ['admin', 'manager', 'recruiter', 'user', 'guest'];
        const rolePermissions = {};

        for (const role of roles) {
            rolePermissions[role] = await getRolePermissions(role);
        }

        console.log("[permissionService] Settings permissions retrieved successfully");
        return rolePermissions;
    } catch (error) {
        console.log("[permissionService] Error in getSettingsPermissions:", error);
        throw new Error("Failed to fetch settings permissions");
    }
};

// Update settings permissions
export const updateSettingsPermissions = async (role, permissions) => {
    try {
        console.log("[permissionService] updateSettingsPermissions called with:", { role, permissions });

        // For now, we'll just validate the permissions
        // In a real implementation, this would save to a role_permissions table
        const validPermissions = await getPermissions();
        const validPermissionNames = validPermissions.map(p => p.name);

        const invalidPermissions = permissions.filter(p => !validPermissionNames.includes(p));
        if (invalidPermissions.length > 0) {
            throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
        }

        console.log("[permissionService] Settings permissions updated successfully for:", role);
        return { success: true, role, permissions };
    } catch (error) {
        console.log("[permissionService] Error in updateSettingsPermissions:", error);
        throw error;
    }
};

// Check if user has any of the specified permissions
export const checkUserAnyPermission = async (userId, permissionNames) => {
    try {
        console.log("[permissionService] checkUserAnyPermission called with:", { userId, permissionNames });

        const permissions = Array.isArray(permissionNames) ? permissionNames : [permissionNames];

        for (const permissionName of permissions) {
            const hasPermission = await checkUserPermission(userId, permissionName);
            if (hasPermission) {
                console.log("[permissionService] User has permission:", permissionName);
                return true;
            }
        }

        console.log("[permissionService] User has none of the required permissions");
        return false;
    } catch (error) {
        console.log("[permissionService] Error in checkUserAnyPermission:", error);
        return false;
    }
};

// Check if user has all of the specified permissions
export const checkUserAllPermissions = async (userId, permissionNames) => {
    try {
        console.log("[permissionService] checkUserAllPermissions called with:", { userId, permissionNames });

        const permissions = Array.isArray(permissionNames) ? permissionNames : [permissionNames];

        for (const permissionName of permissions) {
            const hasPermission = await checkUserPermission(userId, permissionName);
            if (!hasPermission) {
                console.log("[permissionService] User missing permission:", permissionName);
                return false;
            }
        }

        console.log("[permissionService] User has all required permissions");
        return true;
    } catch (error) {
        console.log("[permissionService] Error in checkUserAllPermissions:", error);
        return false;
    }
};

// Alias for seedDefaultPermissions
export const seedPermissions = seedDefaultPermissions;

// Get permissions for a role
export const getRolePermissions = async (role) => {
    return permissionRepository.getRolePermissions(role);
};

// Check if a role has a specific permission
export const checkRolePermission = async (role, permissionName) => {
    try {
        console.log("[permissionService] checkRolePermission called with:", { role, permissionName });
        const permission = await Permission.findOne({ where: { name: permissionName } });
        if (!permission) return false;
        const rolePermission = await UserPermission.findOne({ where: { role, permissionId: permission.id } });
        return !!rolePermission;
    } catch (error) {
        console.log("[permissionService] Error in checkRolePermission:", error);
        return false;
    }
};

// Grant permission to a role
export const grantRolePermission = async (role, permissionName, grantedBy) => {
    return permissionRepository.grantRolePermission(role, permissionName, grantedBy);
};

// Revoke permission from a role
export const revokeRolePermission = async (role, permissionName) => {
    return permissionRepository.revokeRolePermission(role, permissionName);
};

// Set (replace) all permissions for a role
export const setRolePermissions = async (role, permissionNames, grantedBy) => {
    return permissionRepository.setPermissionsForRole(role, permissionNames, grantedBy);
};

export const getPermissionByName = async (name) => {
    return permissionRepository.getPermissionByName(name);
}; 