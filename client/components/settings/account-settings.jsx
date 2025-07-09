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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";

export default function AccountSettings() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // Debug log to check user data
  console.log("Current user data:", user);

  useEffect(() => {
    // Debug log to check when useEffect runs
    console.log("useEffect triggered with user:", user);

    if (user?.user) {
      const newFormData = {
        fullName: user.user.fullName || "",
        email: user.user.email || "",
        phone: user.user.phone || "",
        avatar: user.user.avatar || "",
      };
      console.log("Setting form data to:", newFormData);
      setFormData(newFormData);
    }
  }, [user]);

  const handleSaveAccount = async () => {
    try {
      setIsSaving(true);
      // Include phone in update data
      const updateData = {
        fullName: formData.fullName,
        avatar: formData.avatar,
        phone: formData.phone,
      };

      // Validate phone number before saving
      if (formData.phone && formData.phone.length !== 10) {
        toast.error("Phone number must be exactly 10 digits");
        return;
      }

      await updateProfile(updateData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "phone") {
      // Only allow digits and limit to 10 characters
      const phoneValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [field]: phoneValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  if (!user?.user) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
        <div className="p-6">
          <p className="text-center text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Debug log to check form data before render
  console.log("Current form data:", formData);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
      <div className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100 rounded-t-xl p-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <UserIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">Account Settings</h2>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
      </div>
      <div className="p-6 space-y-8">
        {/* Avatar Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Avatar</h3>
          <div className="flex items-center space-x-6">
            <div className="rounded-full border-4 border-blue-100 bg-white/80 shadow-md p-1">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={formData.avatar || "/placeholder.svg"}
                  alt={formData.fullName}
                />
                <AvatarFallback>
                  {formData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <Label htmlFor="custom-avatar" className="text-sm font-medium text-gray-700">Upload a custom avatar</Label>
              <Input
                id="custom-avatar"
                type="file"
                accept="image/*"
                className="mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleInputChange("avatar", reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>
        </div>
        {/* Account Info Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Account Info</h3>
          <div className="space-y-3">
            <Label htmlFor="full-name" className="text-sm font-medium text-gray-700">Full Name</Label>
            <Input
              id="full-name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Enter your full name"
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              readOnly
              className="bg-gray-50 cursor-not-allowed rounded-md"
              aria-label="Email address (read-only)"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              pattern="[0-9]*"
              inputMode="numeric"
              className={
                "bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md" +
                (formData.phone && formData.phone.length !== 10 ? " border-red-500" : "")
              }
            />
            {formData.phone && formData.phone.length !== 10 && (
              <p className="text-sm text-red-500 mt-1">
                Phone number must be exactly 10 digits
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 rounded-b-xl p-6 flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() =>
            setFormData({
              fullName: user?.user?.fullName || "",
              email: user?.user?.email || "",
              phone: user?.user?.phone || "",
              avatar: user?.user?.avatar || "",
            })
          }
          className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveAccount}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={isSaving}
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
            "Save Account Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
