import { api } from "../config/api";

class PermissionService {
    // Get all permissions
    async getPermissions() {
        try {
            const response = await fetch(api.permissions.getAll(), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Get permissions by role
    async getPermissionsByRole(role) {
        try {
            const response = await fetch(api.permissions.getByRole(role), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch role permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Update role permissions
    async updateRolePermissions(role, permissions) {
        try {
            const response = await fetch(api.permissions.updateRole(role), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ permissions }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update role permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Get user permissions
    async getUserPermissions(userId) {
        try {
            const response = await fetch(api.permissions.getUserPermissions(userId), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch user permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Check user permission
    async checkUserPermission(userId, permissionName) {
        try {
            const response = await fetch(api.permissions.checkUserPermission(userId, permissionName), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to check user permission");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Grant permission to user
    async grantUserPermission(userId, permissionName) {
        try {
            const response = await fetch(api.permissions.grantUserPermission(userId), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ permissionName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to grant permission");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Revoke permission from user
    async revokeUserPermission(userId, permissionName) {
        try {
            const response = await fetch(api.permissions.revokeUserPermission(userId, permissionName), {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to revoke permission");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Get permissions with categories
    async getPermissionsWithCategories() {
        try {
            const response = await fetch(api.permissions.getCategories(), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch categorized permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Get current user's permissions
    async getMyPermissions() {
        try {
            const response = await fetch(api.permissions.getMyPermissions(), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch my permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Check current user's permission
    async checkMyPermission(permissionName) {
        try {
            const response = await fetch(api.permissions.checkMyPermission(permissionName), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to check my permission");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Get settings permissions
    async getSettingsPermissions() {
        try {
            const response = await fetch(api.permissions.getSettingsPermissions(), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch settings permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Update settings permissions
    async updateSettingsPermissions(rolePermissions) {
        try {
            const response = await fetch(api.permissions.updateSettingsPermissions(), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ rolePermissions }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update settings permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Seed default permissions
    async seedPermissions() {
        try {
            const response = await fetch(api.permissions.seedPermissions(), {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to seed permissions");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
}

export const permissionService = new PermissionService(); 