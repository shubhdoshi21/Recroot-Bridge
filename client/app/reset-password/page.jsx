"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Info, Eye, EyeOff, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidationErrors, setPasswordValidationErrors] = useState([]);
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

  // Check individual password requirements
  const checkPasswordRequirement = (password, requirement) => {
    switch (requirement) {
      case "length":
        return password.length >= 8;
      case "uppercase":
        return /[A-Z]/.test(password);
      case "lowercase":
        return /[a-z]/.test(password);
      case "number":
        return /[0-9]/.test(password);
      case "special":
        return /[!@#$%^&*(),.?":{}|<>]/.test(password);
      default:
        return false;
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("Reset Password Page - Token from URL:", token);

    if (!token) {
      console.log("No token found in URL, redirecting to login");
      toast({
        title: "Invalid Reset Link",
        description: "Please request a new password reset link.",
        variant: "destructive",
        duration: 5000,
      });
      router.push("/landing");
    } else {
      console.log("Token found in URL, showing reset password form");
      setIsLoading(false);
    }
  }, [searchParams, router, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPasswordMatchError(false);
    console.log("Reset password form submitted");

    try {
      const token = searchParams.get("token");

      console.log("Form submission - Token:", token);
      console.log(
        "Form submission - New Password length:",
        newPassword?.length
      );

      if (!token) {
        console.log("No token found in URL during form submission");
        throw new Error(
          "Invalid reset link. Please request a new password reset link."
        );
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        console.log("Password mismatch");
        setPasswordMatchError(true);
        return;
      }

      // Validate password requirements
      const errors = validatePassword(newPassword);
      if (errors.length > 0) {
        setPasswordValidationErrors(errors);
        return;
      }

      console.log("Making API call to reset password");
      const response = await fetch(api.auth.resetPassword(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        console.log("API error:", data);
        if (
          data.message?.toLowerCase().includes("invalid") ||
          data.message?.toLowerCase().includes("expired") ||
          data.message?.toLowerCase().includes("already used")
        ) {
          setIsTokenValid(false);
          return;
        }
        throw new Error(data.message || "Failed to reset password");
      }

      console.log("Password reset successful");
      toast({
        title: "Password Reset Successful",
        description:
          "Your password has been reset successfully. Please login with your new password.",
        duration: 5000,
      });

      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // Redirect to landing page with dialog open
      router.push("/landing?showLogin=true");
    } catch (error) {
      console.log("Reset password error:", error);
      if (isTokenValid) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This password reset link has already been used or has expired.
            </p>
          </div>
          <div className="mt-8">
            <Button onClick={() => router.push("/landing")} className="w-full">
              Return to Landing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your new password
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-transparent"
                      >
                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">
                          Password Requirements
                        </h4>
                        <div className="space-y-2">
                          {[
                            {
                              text: "At least 8 characters long",
                              requirement: "length",
                            },
                            {
                              text: "At least one uppercase letter",
                              requirement: "uppercase",
                            },
                            {
                              text: "At least one lowercase letter",
                              requirement: "lowercase",
                            },
                            {
                              text: "At least one number",
                              requirement: "number",
                            },
                            {
                              text: "At least one special character",
                              requirement: "special",
                            },
                          ].map((req, index) => {
                            const isSatisfied = checkPasswordRequirement(
                              newPassword,
                              req.requirement
                            );
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                {isSatisfied ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                )}
                                <span
                                  className={`text-sm ${isSatisfied
                                    ? "text-green-600"
                                    : "text-gray-600"
                                    }`}
                                >
                                  {req.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-xs"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewPassword(value);
                    setPasswordValidationErrors(validatePassword(value));
                  }}
                  required
                  minLength={8}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-xs"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordMatchError(false);
                  }}
                  required
                  minLength={8}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>
              {passwordMatchError && (
                <div className="mt-2 text-sm text-red-600">
                  Passwords do not match
                </div>
              )}
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
