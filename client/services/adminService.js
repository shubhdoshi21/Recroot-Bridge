import { api } from "../config/api";
import axios from "axios";

export const adminService = {
  getAllUsers: async () => {
    try {
      console.log("[adminService] Fetching all users for super admin");
      const response = await axios.get(api.users.getUsersForSuperAdmin(), {
        withCredentials: true,
      });
      console.log("[adminService] Raw API response:", response);

      if (!response.data) {
        throw new Error("No data received from server");
      }

      if (!Array.isArray(response.data.users)) {
        console.log(
          "[adminService] Invalid users data format:",
          response.data
        );
        throw new Error("Invalid response format from server");
      }

      console.log("[adminService] Successfully fetched users:", response.data);
      return response.data;
    } catch (error) {
      console.log("[adminService] Error fetching users:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          "[adminService] Server error response:",
          error.response.data
        );
        throw new Error(error.response.data.message || "Failed to fetch users");
      } else if (error.request) {
        // The request was made but no response was received
        console.log("[adminService] No response received:", error.request);
        throw new Error("No response received from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("[adminService] Request setup error:", error.message);
        throw new Error(error.message || "Failed to fetch users");
      }
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axios.get(api.users.getById(userId), {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log("Error fetching user:", error);
      throw error.response?.data || error.message;
    }
  },

  createAdmin: async (userData) => {
    try {
      const response = await axios.post(
        api.users.create(),
        {
          ...userData,
          role: "admin",
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.log("Error creating admin:", error);
      throw error.response?.data || error.message;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await axios.patch(
        api.users.updateRole(userId),
        { newRole: role },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.log("Error updating user role:", error);
      throw error.response?.data || error.message;
    }
  },

  updateUserClient: async (userId, clientId) => {
    try {
      const response = await axios.patch(
        api.users.updateClient(userId),
        { clientId },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.log("Error updating user client:", error);
      throw error.response?.data || error.message;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.patch(api.users.update(userId), userData, {
        withCredentials: true,
      });

      if (!response.data) {
        throw new Error("No response data received");
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || "Failed to update user");
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response received from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || "Failed to update user");
      }
    }
  },

  getUserCountsByRole: async () => {
    try {
      const response = await axios.get(api.users.getCountsByRole(), {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log("Error fetching user counts:", error);
      throw error.response?.data || error.message;
    }
  },

  deleteUser: async (userId) => {
    try {
      console.log("[adminService] deleteUser called with:", userId);
      const response = await axios.delete(api.users.delete(userId), {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("[adminService] deleteUser response:", response.data);
      return response.data;
    } catch (error) {
      console.log("[adminService] Error in deleteUser:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to delete user");
      } else if (error.request) {
        throw new Error("No response received from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};
