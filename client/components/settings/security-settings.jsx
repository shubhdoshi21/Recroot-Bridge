"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Lock as LockIcon } from "lucide-react";

export default function SecuritySettings() {
  const { toast } = useToast();
  const { changePassword } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
  });

  const handleSaveSecurity = async () => {
    // Validate inputs
    if (!securityForm.currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!securityForm.newPassword) {
      toast({
        title: "Error",
        description: "New password is required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (securityForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (securityForm.newPassword === securityForm.currentPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setIsSaving(true);
      const result = await changePassword(
        securityForm.currentPassword,
        securityForm.newPassword
      );

      if (result.success) {
        // Clear form after successful update
        setSecurityForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          twoFactor: securityForm.twoFactor,
        });
        toast({
          title: "Success",
          description: result.message || "Password updated successfully",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update password",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
      <div className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100 rounded-t-xl p-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <LockIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">Security Settings</h2>
          <p className="text-gray-600 mt-1">Manage your account's security settings</p>
        </div>
      </div>
      <div className="p-6 space-y-8">
        {/* Change Password Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Change Password</h3>
          <div className="space-y-3">
            <Label htmlFor="current-password" className="text-sm font-medium text-gray-700">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={securityForm.currentPassword}
              onChange={(e) =>
                setSecurityForm({
                  ...securityForm,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter your current password"
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={securityForm.newPassword}
              onChange={(e) =>
                setSecurityForm({
                  ...securityForm,
                  newPassword: e.target.value,
                })
              }
              placeholder="Enter your new password"
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={securityForm.confirmPassword}
              onChange={(e) =>
                setSecurityForm({
                  ...securityForm,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Confirm your new password"
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
            />
          </div>
        </div>
        {/* Two-Factor Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Two-Factor Authentication</h3>
          <div className="flex items-center space-x-3">
            <Switch
              id="two-factor"
              checked={securityForm.twoFactor}
              onCheckedChange={(checked) =>
                setSecurityForm({ ...securityForm, twoFactor: checked })
              }
            />
            <Label htmlFor="two-factor" className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</Label>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 rounded-b-xl p-6 flex justify-end">
        <Button
          onClick={handleSaveSecurity}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Security Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
