"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";

const defaultSettings = {
  avatar:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
  fullName: "Dollar Singh",
  email: "dollar.singh@example.com",
  phone: "+1 (555) 123-4567",
  language: "en",
  currency: "usd",
  dateFormat: "mm-dd-yyyy",
  fontSize: 16,
  theme: "system",
  layout: "default",
  notifications: {
    email: true,
    push: true,
    sms: false,
    accountActivity: true,
    newFeatures: true,
    marketing: false,
    frequency: "real-time",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  },
  privacy: {
    analyticsSharing: true,
    personalizedAds: false,
    visibility: "public",
    dataRetention: "1-year",
  },
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (user) {
          return {
            ...parsedSettings,
            fullName:
              user.fullName ||
              parsedSettings.fullName ||
              defaultSettings.fullName,
            email: user.email || parsedSettings.email,
            avatar: parsedSettings.avatar || defaultSettings.avatar,
          };
        }
        return parsedSettings;
      }
    }

    if (user) {
      return {
        ...defaultSettings,
        fullName: user.fullName || defaultSettings.fullName,
        email: user.email,
      };
    }

    return defaultSettings;
  });

  // Add user management states
  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({
    admin: 0,
    manager: 0,
    recruiter: 0,
    user: 0,
    guest: 0,
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRoleCounts, setIsLoadingRoleCounts] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await userService.getUsers();
      if (response.error) {
        throw new Error(response.error);
      }
      setUsers(response.users || []);
    } catch (error) {
      console.log("Error fetching users:", error);
      if (error.message !== "User not found") {
        throw error;
      }
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch role counts
  const fetchRoleCounts = async () => {
    try {
      setIsLoadingRoleCounts(true);
      const data = await authService.getUserCountsByRole();
      setRoleCounts(data);
    } catch (error) {
      console.log("Error fetching role counts:", error);
      throw error;
    } finally {
      setIsLoadingRoleCounts(false);
    }
  };

  // Add new user
  const addUser = async (userData) => {
    try {
      const response = await userService.createUser(userData);
      await fetchUsers(); // Refresh users list
      await fetchRoleCounts(); // Refresh role counts
      return response;
    } catch (error) {
      console.log("Error adding user:", error);
      throw error;
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      await fetchUsers(); // Refresh users list
      await fetchRoleCounts(); // Refresh role counts
    } catch (error) {
      console.log("Error updating user role:", error);
      throw error;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchRoleCounts();
  }, []);

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updatedSettings = { ...prev, ...newSettings };
      if (typeof window !== "undefined") {
        localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
      }
      return updatedSettings;
    });
  };

  const updateNotificationSettings = (notificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notificationSettings },
    }));
  };

  const updatePrivacySettings = (privacySettings) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...privacySettings },
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNotificationSettings,
        updatePrivacySettings,
        // Add user management values
        users,
        roleCounts,
        isLoadingUsers,
        isLoadingRoleCounts,
        addUser,
        updateUserRole,
        fetchUsers,
        fetchRoleCounts,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
