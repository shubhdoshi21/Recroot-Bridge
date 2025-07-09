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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { teamService } from "@/services/teamService";
import { Plus, Minus, Users, Target, Building, Edit } from "lucide-react";
import { GOAL_CATEGORIES, defaultGoal } from "@/constants/goals";

const getDefaultFieldValues = (category) => {
  const fields = GOAL_CATEGORIES[category]?.fields || {};
  return Object.entries(fields).reduce((acc, [key, field]) => {
    acc[key] = field.default;
    return acc;
  }, {});
};

export function EditTeamDialog({
  isOpen,
  onOpenChange,
  onTeamUpdated,
  team,
  teamId,
  recruiters = [],
  isLoadingRecruiters = false,
  parentTeams = [],
  isLoadingParentTeams = false,
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [goals, setGoals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Initialize form data when team changes
  useEffect(() => {
    if (team && teamId) {
      console.log(
        "[EditTeamDialog] Initializing form data with team:",
        team,
        "and teamId:",
        teamId
      );

      // Parse goals first if needed
      let parsedGoals = [];
      try {
        parsedGoals =
          typeof team.goals === "string"
            ? JSON.parse(team.goals)
            : team.goals || [];
      } catch (error) {
        console.log("Error parsing goals:", error);
      }

      // Set form data with team values first, then apply defaults for missing values
      setFormData({
        id: parseInt(teamId), // Ensure ID is always set and is a number
        name: team.name || "",
        department: team.department || "engineering",
        status: team.status || "active",
        location: team.location || "remote",
        size: team.size || "small",
        leadId: team.leadId?.toString() || "none",
        parentTeamId: team.parentTeamId?.toString() || "none",
        description: team.description || "",
      });

      // Set goals
      setGoals(parsedGoals);

      // Load team members
      const loadTeamMembers = async () => {
        setIsLoadingMembers(true);
        try {
          const response = await teamService.getTeamMembers(teamId);
          if (response && response.members) {
            setTeamMembers(response.members);
          }
        } catch (error) {
          console.log("Error loading team members:", error);
          toast({
            title: "Error",
            description: "Failed to load team members",
            variant: "destructive",
          });
        } finally {
          setIsLoadingMembers(false);
        }
      };

      loadTeamMembers();
    }
  }, [team, teamId]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field === "leadId") {
      if (value === "none") {
        // Just update form data, don't make API call
        setFormData((prev) => ({
          ...prev,
          leadId: null,
          leadEmail: null,
          leadPhone: null,
          lead: null,
        }));
      } else {
        const selectedRecruiter = recruiters.find(
          (r) => r.id === parseInt(value)
        );
        if (selectedRecruiter) {
          const firstName =
            selectedRecruiter.firstName ||
            selectedRecruiter.User?.firstName ||
            "";
          const lastName =
            selectedRecruiter.lastName ||
            selectedRecruiter.User?.lastName ||
            "";
          const email =
            selectedRecruiter.email || selectedRecruiter.User?.email || "";
          const phone =
            selectedRecruiter.phone || selectedRecruiter.User?.phone || "";

          // Just update form data, don't make API call
          setFormData((prev) => ({
            ...prev,
            leadId: parseInt(value),
            leadEmail: email,
            leadPhone: phone,
            lead: `${firstName} ${lastName}`.trim(),
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddGoal = () => {
    setGoals((prev) => [...prev, { ...defaultGoal }]);
  };

  const handleRemoveGoal = (index) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGoalChange = (index, field, value) => {
    setGoals((prev) => {
      const newGoals = [...prev];
      if (field === "title") {
        // When category changes, initialize with defaults for the new category
        const defaultValues = getDefaultFieldValues(value);
        newGoals[index] = {
          title: value,
          ...defaultValues,
        };
      } else {
        const category = GOAL_CATEGORIES[newGoals[index].title];
        const fieldConfig = category?.fields[field];

        if (fieldConfig) {
          let processedValue = value;

          // Handle empty values
          if (value === "") {
            processedValue = fieldConfig.default;
          } else if (fieldConfig.type === "number") {
            // Convert to number and validate
            const numValue = parseFloat(value) || 0;
            if (fieldConfig.max !== undefined) {
              processedValue = Math.min(
                fieldConfig.max,
                Math.max(fieldConfig.min || 0, numValue)
              );
            } else {
              processedValue = Math.max(fieldConfig.min || 0, numValue);
            }
          }

          newGoals[index] = {
            ...newGoals[index],
            [field]: processedValue,
          };
        }
      }
      return newGoals;
    });
  };

  // Validation for required fields
  const isValid =
    formData.name &&
    formData.department &&
    formData.status &&
    formData.location &&
    formData.leadId;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate teamId first
      if (!teamId) {
        throw new Error("Team ID is required");
      }

      const validTeamId = parseInt(teamId);
      if (isNaN(validTeamId)) {
        throw new Error("Invalid Team ID");
      }

      console.log("[EditTeamDialog] Submitting form with data:", {
        formData,
        teamId: validTeamId,
      });

      // Check if team lead has changed
      if (formData.leadId !== team.leadId?.toString()) {
        try {
          // Ensure we have valid IDs
          const validNewLeadId =
            formData.leadId === "none" ? null : parseInt(formData.leadId);
          const validOldLeadId = team.leadId ? parseInt(team.leadId) : null;

          console.log("[EditTeamDialog] Updating team lead:", {
            teamId: validTeamId,
            newLeadId: validNewLeadId,
            oldLeadId: validOldLeadId,
          });

          // If we're setting a new lead (not removing the lead)
          if (validNewLeadId) {
            // Find the recruiter data
            const selectedRecruiter = recruiters.find(
              (r) => r.id === validNewLeadId
            );
            if (selectedRecruiter) {
              // First, find and update the current team lead's role
              const currentLeadMember = teamMembers.find(
                (member) =>
                  member.role === "Team Lead" ||
                  member.id === validOldLeadId ||
                  member.recruiterId === validOldLeadId
              );

              if (currentLeadMember) {
                console.log(
                  "[EditTeamDialog] Updating current team lead role:",
                  currentLeadMember
                );
                try {
                  // Update the current lead's role to 'Member'
                  const updatedMember = {
                    ...currentLeadMember,
                    role: "Member",
                  };
                  await teamService.updateTeamMember(
                    validTeamId,
                    currentLeadMember.id,
                    updatedMember
                  );

                  // Update local state
                  setTeamMembers((prev) =>
                    prev.map((member) =>
                      member.id === currentLeadMember.id
                        ? { ...member, role: "Member" }
                        : member
                    )
                  );
                } catch (error) {
                  console.log(
                    "[EditTeamDialog] Error updating current team lead role:",
                    error
                  );
                  throw new Error("Failed to update current team lead role");
                }
              }

              // Check if the new lead is already a team member
              const isExistingMember = teamMembers.some(
                (member) =>
                  member.id === validNewLeadId ||
                  member.recruiterId === validNewLeadId
              );

              if (!isExistingMember) {
                // Create team member object for the lead
                const firstName =
                  selectedRecruiter.firstName ||
                  selectedRecruiter.User?.firstName ||
                  "";
                const lastName =
                  selectedRecruiter.lastName ||
                  selectedRecruiter.User?.lastName ||
                  "";
                const email =
                  selectedRecruiter.email ||
                  selectedRecruiter.User?.email ||
                  "";
                const phone =
                  selectedRecruiter.phone ||
                  selectedRecruiter.User?.phone ||
                  "";
                const profilePicture =
                  selectedRecruiter.profilePicture ||
                  selectedRecruiter.User?.profilePicture ||
                  "/placeholder.svg";

                const recruiterName = `${firstName} ${lastName}`.trim();

                // Add the new lead as a team member
                try {
                  const memberData = {
                    recruiterId: validNewLeadId,
                    name: recruiterName,
                    email: email,
                    phone: phone,
                    avatar: profilePicture,
                    role: "Team Lead",
                    joinDate: new Date().toISOString(),
                  };

                  console.log(
                    "[EditTeamDialog] Adding new lead as team member:",
                    memberData
                  );

                  const response = await teamService.addTeamMember(
                    validTeamId,
                    memberData
                  );
                  if (response) {
                    setTeamMembers((prev) => [...prev, response]);
                  }
                } catch (error) {
                  console.log(
                    "[EditTeamDialog] Error adding team lead as member:",
                    error
                  );
                  throw new Error("Failed to add team lead as team member");
                }
              } else {
                // If the new lead is already a member, update their role to Team Lead
                const existingMember = teamMembers.find(
                  (member) =>
                    member.id === validNewLeadId ||
                    member.recruiterId === validNewLeadId
                );

                if (existingMember) {
                  try {
                    const updatedMember = {
                      ...existingMember,
                      role: "Team Lead",
                    };
                    await teamService.updateTeamMember(
                      validTeamId,
                      existingMember.id,
                      updatedMember
                    );

                    // Update local state
                    setTeamMembers((prev) =>
                      prev.map((member) =>
                        member.id === existingMember.id
                          ? { ...member, role: "Team Lead" }
                          : member
                      )
                    );
                  } catch (error) {
                    console.log(
                      "[EditTeamDialog] Error updating new team lead role:",
                      error
                    );
                    throw new Error("Failed to update new team lead role");
                  }
                }
              }
            }
          }

          // Update team lead
          await teamService.updateTeamLead(
            validTeamId,
            validNewLeadId,
            validOldLeadId
          );
        } catch (error) {
          console.log("[EditTeamDialog] Error updating team lead:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to update team lead",
            variant: "destructive",
          });
          return;
        }
      }

      // Format goals to store all fields for each goal type
      const formattedGoals = goals.map((goal) => {
        // Keep all original fields from the form
        const formattedGoal = {
          title: goal.title,
        };

        // Add required fields based on goal type
        const category = GOAL_CATEGORIES[goal.title];
        if (category && category.fields) {
          Object.keys(category.fields).forEach((field) => {
            formattedGoal[field] = goal[field];
          });
        }

        return formattedGoal;
      });

      // Prepare the update data - exclude leadId since it's handled separately
      const updateData = {
        ...formData,
        id: validTeamId,
        goals: JSON.stringify(formattedGoals),
        teamMembers: teamMembers,
        parentTeamId:
          formData.parentTeamId === "none"
            ? null
            : parseInt(formData.parentTeamId),
      };

      // Remove lead-related fields since they're handled separately
      delete updateData.leadId;
      delete updateData.leadEmail;
      delete updateData.leadPhone;
      delete updateData.lead;

      // Log the update data for debugging
      console.log("[EditTeamDialog] Submitting update with data:", updateData);

      // Update the team through the parent's callback
      if (onTeamUpdated) {
        await onTeamUpdated(updateData);
      }

      // Show success message
      toast({
        title: "Success",
        description: "Team updated successfully",
      });

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.log("[EditTeamDialog] Error updating team:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Edit Team</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Update team information, goals, and settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Team Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                autoComplete="off"
                autoFocus={false}
                    className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    placeholder="Enter team name"
              />
            </div>

                <div className="space-y-3">
                  <Label htmlFor="department" className="text-sm font-semibold text-gray-700">Department</Label>
              <Select
                value={formData.department ?? "engineering"}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="entry-level">Entry Level</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>

                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
              <Select
                value={formData.status || "active"}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
              <Select
                value={formData.location || "remote"}
                onValueChange={(value) => handleInputChange("location", value)}
              >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="san-francisco">San Francisco</SelectItem>
                  <SelectItem value="new-york">New York</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="austin">Austin</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="multiple">Multiple Locations</SelectItem>
                </SelectContent>
              </Select>
            </div>

                <div className="space-y-3">
                  <Label htmlFor="size" className="text-sm font-semibold text-gray-700">Team Size</Label>
              <Select
                value={formData.size || "small"}
                onValueChange={(value) => handleInputChange("size", value)}
              >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="small">Small (1-5)</SelectItem>
                  <SelectItem value="medium">Medium (6-15)</SelectItem>
                  <SelectItem value="large">Large (16-30)</SelectItem>
                  <SelectItem value="xlarge">X-Large (31+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

                <div className="space-y-3">
                  <Label htmlFor="leadId" className="text-sm font-semibold text-gray-700">Team Lead</Label>
              <Select
                value={formData.leadId?.toString() || "none"}
                onValueChange={(value) => handleInputChange("leadId", value)}
              >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="none">No Lead</SelectItem>
                  {recruiters.map((recruiter) => (
                    <SelectItem
                      key={recruiter.id}
                      value={recruiter.id.toString()}
                    >
                      {recruiter.User?.firstName} {recruiter.User?.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

                <div className="space-y-3">
                  <Label htmlFor="parentTeamId" className="text-sm font-semibold text-gray-700">Parent Team</Label>
              <Select
                value={formData.parentTeamId?.toString() || "none"}
                onValueChange={(value) =>
                  handleInputChange("parentTeamId", value)
                }
              >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="none">No Parent Team</SelectItem>
                  {parentTeams
                    .filter((pt) => pt.id !== team?.id) // Exclude current team
                    .map((parentTeam) => (
                      <SelectItem
                        key={parentTeam.id}
                        value={parentTeam.id.toString()}
                      >
                        {parentTeam.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
                  className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  placeholder="Describe the team's purpose and responsibilities"
            />
          </div>
            </CardContent>
          </Card>

          {/* Team Goals */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50/30 border-b border-gray-100">
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Team Goals
                </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGoal}
                  className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 hover:text-green-800"
              >
                  <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No goals added yet. Click "Add Goal" to get started.</p>
                </div>
              ) : (
                goals.map((goal, index) => (
                  <div key={index} className="p-4 border border-green-200 rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                  <Select
                    value={goal.title}
                    onValueChange={(value) =>
                      handleGoalChange(index, "title", value)
                    }
                  >
                        <SelectTrigger className="w-[250px] bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400">
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                      {Object.entries(GOAL_CATEGORIES).map(
                        ([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveGoal(index)}
                        className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700 hover:text-red-800"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>

                    {goal.title && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(GOAL_CATEGORIES[goal.title].fields).map(
                      ([key, field]) => (
                        <div key={key} className="space-y-2">
                              <Label htmlFor={`${index}-${key}`} className="text-sm font-medium text-gray-700">
                            {field.label}
                          </Label>
                          <Input
                            id={`${index}-${key}`}
                            type={field.type}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={goal[key] ?? field.default}
                            onChange={(e) =>
                              handleGoalChange(index, key, e.target.value)
                            }
                                className="bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400"
                          />
                        </div>
                      )
                    )}
                </div>
                    )}
              </div>
                ))
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
                disabled={!isValid || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
              {isSubmitting ? "Updating..." : "Update Team"}
            </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
