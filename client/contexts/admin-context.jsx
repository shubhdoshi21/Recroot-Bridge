"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { clientService } from "@/services/clientService";
import { useToast } from "@/hooks/use-toast";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [subscriptionModels, setSubscriptionModels] = useState([
    {
      id: 1,
      subscriptionPlan: "Basic Plan",
      maxUsersAllowed: 5,
      maxJobPostsAllowed: 10,
      billingCycle: "monthly",
      paymentStatus: "active",
      isActive: true,
      isTrial: false,
    },
    {
      id: 2,
      subscriptionPlan: "Professional Plan",
      maxUsersAllowed: 20,
      maxJobPostsAllowed: 50,
      billingCycle: "monthly",
      paymentStatus: "active",
      isActive: true,
      isTrial: false,
    },
    {
      id: 3,
      subscriptionPlan: "Enterprise Plan",
      maxUsersAllowed: 100,
      maxJobPostsAllowed: 200,
      billingCycle: "monthly",
      paymentStatus: "active",
      isActive: true,
      isTrial: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("[adminContext] Fetching users...");
      const data = await adminService.getAllUsers();
      console.log("[adminContext] Received users data:", data);

      // Ensure we have valid user data
      const validUsers = (data.users || []).map((user) => ({
        ...user,
        id: user.id,
        role: user.role || "user",
        clientId: user.clientId || null,
        fullName: user.fullName || "",
        email: user.email || "",
        isActive: user.isActive ?? true,
      }));

      console.log("[adminContext] Processed users:", validUsers);
      setUsers(validUsers);
    } catch (error) {
      console.log("[adminContext] Error fetching users:", error);
      setError(error.message || "Failed to fetch users");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientService.getAllClients();

      // Ensure we have valid client data
      const validClients = (data.clients || []).map((client) => {
        return {
          ...client,
          // Ensure required fields have default values
          status: client.status || "inactive",
          industry: client.industry || "",
          companySize: client.companySize || "",
          location: client.location || "",
          city: client.city || "",
          country: client.country || "",
          companyEmail: client.companyEmail || "",
          companyPhone: client.companyPhone || "",
          // Add admin assignment information
          assignedToAdmin: client.assignedToAdmin || false,
          assignedAdminId: client.assignedAdminId || null,
          assignedAdminName: client.assignedAdminName || null,
          // Find the subscription model from our local state
          subscriptionModel: client.subscriptionModelId
            ? subscriptionModels.find(
                (sm) => sm.id === parseInt(client.subscriptionModelId)
              ) || {
                subscriptionPlan: "",
                billingCycle: "",
              }
            : {
                subscriptionPlan: "",
                billingCycle: "",
              },
        };
      });

      console.log("[adminContext] Processed clients:", validClients);
      setClients(validClients);
    } catch (error) {
      console.log("Error fetching clients:", error);
      setError(error.message || "Failed to fetch clients");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // User Management
  const createAdmin = async (userData) => {
    try {
      const newAdmin = await adminService.createAdmin(userData);
      await fetchUsers();
      toast({
        title: "Success",
        description: "Admin added successfully",
      });
      return newAdmin;
    } catch (error) {
      console.log("Error creating admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      await fetchUsers();
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      console.log("Error updating user role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserClient = async (userId, clientId) => {
    try {
      // Get the user being updated
      const userToUpdate = users.find((user) => user.id === userId);
      if (!userToUpdate) {
        throw new Error("User not found");
      }

      // If assigning a client and the user is an admin
      if (clientId !== null && userToUpdate.role === "admin") {
        // Check if the client is already assigned to another admin
        const existingAdmin = users.find(
          (user) =>
            user.clientId === clientId &&
            user.id !== userId &&
            user.role === "admin"
        );
        if (existingAdmin) {
          throw new Error(
            `This client is already assigned to admin ${existingAdmin.fullName}`
          );
        }
      }

      await adminService.updateUserClient(userId, clientId);
      await fetchUsers();
      toast({
        title: "Success",
        description: clientId
          ? "Client assigned successfully"
          : "Client assignment removed successfully",
      });
    } catch (error) {
      console.log("Error updating user client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client assignment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      // Validate user data
      if (!userData || typeof userData !== "object") {
        throw new Error("Invalid user data provided");
      }

      // Validate required fields
      if (!userData.fullName) {
        throw new Error("Full name cannot be empty");
      }
      if (!userData.email) {
        throw new Error("Email cannot be empty");
      }
      if (!userData.role) {
        throw new Error("Role cannot be empty");
      }

      const response = await adminService.updateUser(userId, userData);

      if (!response || !response.user) {
        throw new Error("Invalid response from server");
      }

      // Update the users list with the updated user data
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? response.user : user))
      );

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      return response.user;
    } catch (error) {
      console.log("Error updating user:", error);
      const errorMessage = error.message || "Failed to update user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      console.log("[adminContext] deleteUser called with:", userId);
      const response = await adminService.deleteUser(userId);
      console.log("[adminContext] deleteUser response:", response);

      // Update the users list by removing the deleted user
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      return response;
    } catch (error) {
      console.log("[adminContext] Error in deleteUser:", error);
      throw error;
    }
  };

  // Client Management
  const createClient = async (clientData) => {
    try {
      // Validate client data
      if (!clientData || typeof clientData !== "object") {
        throw new Error("Invalid client data provided");
      }

      // Validate required fields based on the Client model
      const requiredFields = ["companyName"];
      const missingFields = requiredFields.filter(
        (field) => !clientData[field]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Create the client with the provided data
      const newClient = await clientService.createClient({
        companyName: clientData.companyName,
        industry: clientData.industry || null,
        companySize: clientData.companySize || null,
        location: clientData.location || null,
        website: clientData.website || null,
        status: clientData.status || "active",
        GSTIN: clientData.GSTIN || null,
        PAN: clientData.PAN || null,
        taxID: clientData.taxID || null,
        registrationNumber: clientData.registrationNumber || null,
        addressLine1: clientData.addressLine1 || null,
        addressLine2: clientData.addressLine2 || null,
        city: clientData.city || null,
        stateProvince: clientData.stateProvince || null,
        postalCode: clientData.postalCode || null,
        country: clientData.country || null,
        companyPhone: clientData.companyPhone || null,
        companyEmail: clientData.companyEmail || null,
        subscriptionModelId: clientData.subscriptionModelId || null,
      });

      await fetchClients();
      toast({
        title: "Success",
        description: "Client added successfully",
      });
      return newClient;
    } catch (error) {
      console.log("Error creating client:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add client";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateClientStatus = async (clientId, newStatus) => {
    try {
      if (newStatus === "active") {
        await clientService.reactivateClient(clientId);
      } else {
        await clientService.deactivateClient(clientId);
      }
      await fetchClients();
      toast({
        title: "Success",
        description: `Client ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error) {
      console.log("Error updating client status:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update client status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteClient = async (clientId) => {
    try {
      // Check if client is assigned to any admin
      const assignedAdmin = users.find((user) => user.clientId === clientId);
      if (assignedAdmin) {
        throw new Error(
          `Cannot delete client as it is assigned to ${assignedAdmin.fullName}`
        );
      }

      await clientService.deleteClient(clientId);
      await fetchClients();
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    } catch (error) {
      console.log("Error deleting client:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete client";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateClient = async (clientId, clientData) => {
    try {
      // Validate client data
      if (!clientData || typeof clientData !== "object") {
        throw new Error("Invalid client data provided");
      }

      // Validate required fields
      if (clientData.companyName === "") {
        throw new Error("Company name cannot be empty");
      }

      const updatedClient = await clientService.updateClient(
        clientId,
        clientData
      );
      await fetchClients();
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      return updatedClient;
    } catch (error) {
      console.log("Error updating client:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update client";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Context value
  const value = {
    users,
    clients,
    subscriptionModels,
    isLoading,
    error,
    fetchUsers,
    fetchClients,
    createAdmin,
    updateUserRole,
    updateUserClient,
    updateUser,
    deleteUser,
    createClient,
    updateClientStatus,
    deleteClient,
    updateClient,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

// Custom hook to use the admin context
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
