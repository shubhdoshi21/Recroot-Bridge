import { api } from "../config/api";

class UserService {
  async getUsers(options = {}) {
    try {
      const { page, limit, role, isActive, search } = options;
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (role) params.append("role", role);
      if (isActive !== undefined) params.append("isActive", isActive);
      if (search) params.append("search", search);

      const response = await fetch(
        `${api.users.getAll()}?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.message === "User not found") {
          return { users: [], total: 0 };
        }
        throw new Error(error.message || "Failed to fetch users");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const response = await fetch(api.users.getById(userId), {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      const response = await fetch(api.users.updateRole(userId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user role");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateUserClient(userId, clientId) {
    try {
      const response = await fetch(api.users.updateClient(userId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ clientId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user client");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getUserCountsByRole() {
    try {
      const response = await fetch(api.users.getCountsByRole(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user counts");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData) {
    try {
      // Add required fields with default values
      const userDataWithDefaults = {
        ...userData,
        authType: "local", // Set default auth type
        isVerified: false, // Auto-verify in development
        isActive: false,
        role: userData.role || "user", // Default role if not specified
      };

      const response = await fetch(api.users.create(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userDataWithDefaults),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }

      return await response.json();
    } catch (error) {
      console.log("[userService] Error creating user:", error);
      throw error;
    }
  }

  async getUsersForSuperAdmin() {
    try {
      const response = await fetch(api.users.getForSuperAdmin(), {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to fetch users for super admin"
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export const userService = new UserService();
