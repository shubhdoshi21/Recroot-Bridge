"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const isAuth = Cookies.get("isAuthenticated");

    return isAuth === "true";
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.log("Authentication error:", error);
      setUser(null);
      setIsAuthenticated(false);
      // Clear token if auth check fails
      Cookies.remove("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      // Set isAuthenticated cookie
      Cookies.set("isAuthenticated", "true", {
        expires: rememberMe ? 7 : 1,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      console.log(
        "isAuthenticated cookie set:",
        Cookies.get("isAuthenticated")
      );
      toast({
        title: "Login Successful",
        description: "Welcome back! You have been logged in successfully.",
        duration: 3000,
      });
      return userData;
    } catch (error) {
      if (error.message?.toLowerCase().includes("user not found")) {
        toast({
          title: "Account Not Found",
          description:
            "No account found with this email. Please sign up to create an account.",
          variant: "destructive",
          duration: 4000,
        });
      } else if (error.message?.toLowerCase().includes("invalid password")) {
        toast({
          title: "Invalid Password",
          description:
            "The password you entered is incorrect. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: "Login Failed",
          description:
            error.message ||
            "An error occurred during login. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
      return null;
    }
  };

  const signup = async (fullName, email, password, phone) => {
    try {
      const userData = await authService.register({
        fullName,
        email,
        password,
        phone,
        role: "user",
      });

      console.log("Signup successful, received user data:", userData);
      setUser(userData);
      setIsAuthenticated(true);
      toast({
        title: "Account Created",
        description:
          "Your account has been created successfully. Welcome to RecrootBridge!",
        duration: 3000,
      });
      return userData;
    } catch (error) {
      if (error.message?.toLowerCase().includes("email already exists")) {
        toast({
          title: "Email Already Registered",
          description:
            "An account with this email already exists. Please try logging in instead.",
          variant: "destructive",
          duration: 4000,
        });
      } else {
        toast({
          title: "Signup Failed",
          description:
            error.message || "Error creating account. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
      return null;
    }
  };
  const router = useRouter();

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      // Clear isAuthenticated cookie
      Cookies.remove("isAuthenticated", { path: "/" });
      console.log(
        "isAuthenticated cookie removed:",
        Cookies.get("isAuthenticated")
      );
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        duration: 3000,
      });
      router.push("/landing");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userData = await authService.loginWithGoogle();
      setUser(userData);
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome! You have been logged in with Google.",
        duration: 3000,
      });
      return userData;
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description:
          error.message || "Failed to login with Google. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return null;
    }
  };

  const loginWithLinkedIn = async () => {
    try {
      const userData = await authService.loginWithLinkedIn();
      setUser(userData);
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome! You have been logged in with LinkedIn.",
        duration: 3000,
      });
      return userData;
    } catch (error) {
      toast({
        title: "LinkedIn Login Failed",
        description:
          error.message || "Failed to login with LinkedIn. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return null;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        duration: 3000,
      });
      return updatedUser;
    } catch (error) {
      toast({
        title: "Profile Update Failed",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return null;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const result = await authService.changePassword(
        currentPassword,
        newPassword
      );
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
        duration: 3000,
      });
      return result;
    } catch (error) {
      if (error.message?.toLowerCase().includes("current password")) {
        toast({
          title: "Current Password Incorrect",
          description:
            "The current password you entered is incorrect. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: "Password Change Failed",
          description:
            error.message || "Failed to change password. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
      return {
        success: false,
        message: error.message || "Failed to change password",
      };
    }
  };
  console.log("user :");
  console.log(user);

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithLinkedIn,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
