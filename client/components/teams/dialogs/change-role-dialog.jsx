"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserCheck, AlertCircle } from "lucide-react";

const TEAM_ROLES = [
  { id: "Member", label: "Member", color: "bg-gray-100 text-gray-700" },
  { id: "Senior Recruiter", label: "Senior Recruiter", color: "bg-blue-100 text-blue-700" },
  { id: "Recruiter", label: "Recruiter", color: "bg-green-100 text-green-700" },
  { id: "Junior Recruiter", label: "Junior Recruiter", color: "bg-yellow-100 text-yellow-700" },
  { id: "Recruitment Coordinator", label: "Recruitment Coordinator", color: "bg-purple-100 text-purple-700" },
  { id: "Sourcing Specialist", label: "Sourcing Specialist", color: "bg-indigo-100 text-indigo-700" },
  { id: "Talent Researcher", label: "Talent Researcher", color: "bg-pink-100 text-pink-700" },
  { id: "Intern", label: "Intern", color: "bg-orange-100 text-orange-700" },
];

export function ChangeRoleDialog({
  isOpen,
  onOpenChange,
  member,
  onRoleChange,
}) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState(member?.role || "Member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset selected role when member changes or dialog opens
  useEffect(() => {
    if (member?.role) {
      setSelectedRole(member.role);
    }
  }, [member, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onRoleChange(selectedRole);

      toast({
        title: "Success",
        description: "Team member role updated successfully",
      });

      onOpenChange(false);
    } catch (error) {
      console.log("[ChangeRoleDialog] Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team member role",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRole = TEAM_ROLES.find(role => role.id === member?.role);
  const newRole = TEAM_ROLES.find(role => role.id === selectedRole);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Change Team Member Role</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Update the role for {member?.firstName} {member?.lastName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Current Role Display */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Current Role</Label>
                <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <Badge className={currentRole?.color || "bg-gray-100 text-gray-700"}>
                      {member?.role || "Member"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* New Role Selection */}
              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-semibold text-gray-700">New Role</Label>
                <Select
                  id="role"
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                  disabled={isSubmitting || member?.role === "Team Lead"}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                    {TEAM_ROLES.map((role) => (
                      <SelectItem
                        key={role.id}
                        value={role.id}
                        className="hover:bg-blue-50"
                      >
                        <div className="flex items-center gap-2">
                          <span>{role.label}</span>
                          <Badge className={`text-xs ${role.color}`}>
                            {role.id}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {member?.role === "Team Lead" && (
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Team Lead role cannot be changed directly. Use the team settings to change team lead.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Role Change Preview */}
              {selectedRole !== member?.role && selectedRole && (
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Changing from {member?.role} to {selectedRole}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 p-6 -m-6 mt-6">
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  member?.role === "Team Lead" ||
                  selectedRole === member?.role
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
