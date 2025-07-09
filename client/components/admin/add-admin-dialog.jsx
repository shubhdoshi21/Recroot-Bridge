"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/admin-context";
import { UserPlus, Shield } from "lucide-react";

export function AddAdminDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const { createAdmin } = useAdmin();
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
  });

  const handleAddAdmin = async () => {
    try {
      setIsAddingAdmin(true);
      console.log("[AddAdminDialog] Adding new admin:", newAdmin);

      // Validate required fields
      if (!newAdmin.name || !newAdmin.email) {
        throw new Error("Name and email are required fields");
      }

      // Validate name length and format
      if (newAdmin.name.length < 2 || newAdmin.name.length > 100) {
        throw new Error("Name must be between 2 and 100 characters");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAdmin.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate email length
      if (newAdmin.email.length > 255) {
        throw new Error("Email address is too long");
      }

      // Call the API to create the admin
      await createAdmin({
        fullName: newAdmin.name,
        email: newAdmin.email,
        password: "Welcome123!", // Default password that admin will change
        authType: "local",
        isVerified: true,
        isActive: true,
        role: "admin", // Explicitly set role as admin
      });

      console.log("[AddAdminDialog] Admin created successfully");

      // Reset form and close dialog
      setNewAdmin({
        name: "",
        email: "",
      });
      onOpenChange(false);

      toast({
        title: "Success",
        description: "Admin user created successfully",
      });
    } catch (error) {
      console.log("[AddAdminDialog] Error adding admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Add New Admin
          </DialogTitle>
          <DialogDescription className="text-base">
            Create a new admin account with full administrative privileges. The user will receive a welcome email with login credentials.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                value={newAdmin.name}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, name: e.target.value })
                }
                className="input-modern"
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
                className="input-modern"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Admin Account Details</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Default password: <code className="bg-blue-100 px-1 rounded">Welcome123!</code></li>
                  <li>• Account will be automatically verified</li>
                  <li>• User will receive welcome email with login instructions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={handleAddAdmin}
            disabled={isAddingAdmin}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isAddingAdmin ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Adding Admin...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
