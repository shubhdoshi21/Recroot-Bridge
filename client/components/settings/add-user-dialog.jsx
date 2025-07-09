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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";
import { UserPlus as UserPlusIcon } from "lucide-react";

export default function AddUserDialog({
  showAddUserDialog,
  setShowAddUserDialog,
  isRole,
}) {
  const { toast } = useToast();
  const { addUser } = useSettings();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
  });

  const handleAddUser = async () => {
    try {
      setIsAddingUser(true);
      console.log("[AddUserDialog] Adding new user:", newUser);

      // Validate required fields
      if (!newUser.name || !newUser.email || !newUser.role) {
        throw new Error("Please fill in all required fields");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate role
      const validRoles = ["manager", "recruiter", "user"];
      if (!validRoles.includes(newUser.role.toLowerCase())) {
        throw new Error("Please select a valid role");
      }

      // Call the API to create the user
      await addUser({
        fullName: newUser.name,
        email: newUser.email,
        role: newUser.role.toLowerCase(),
        password: "Welcome123!", // Default password that user will change
        authType: "local", // Required field
        isVerified: true, // Auto-verify in development
        isActive: false, // Set to false initially
      });

      console.log("[AddUserDialog] User created successfully");

      // Show success message
      toast({
        title: "Success",
        description: "User added successfully",
      });

      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        role: "",
      });
      setShowAddUserDialog(false);
    } catch (error) {
      console.log("[AddUserDialog] Error adding user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-md border-0 shadow-2xl rounded-xl p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <UserPlusIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">Add New User</DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">Create a new user account and assign them a role.</DialogDescription>
          </div>
        </DialogHeader>
        <div className="grid gap-6 p-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-sm font-medium text-gray-700">Name</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="col-span-3 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
              placeholder="Enter full name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="col-span-3 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
              placeholder="Enter email address"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right text-sm font-medium text-gray-700">Role</Label>
            <Select
              value={newUser.role}
              onValueChange={(value) => {
                setNewUser({ ...newUser, role: value.toLowerCase() });
              }}
            >
              <SelectTrigger className="col-span-3 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 rounded-b-xl p-6 flex gap-3 justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleAddUser} disabled={isAddingUser} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            {isAddingUser ? (
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
                Adding...
              </>
            ) : (
              "Add User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
