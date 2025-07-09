"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { teamService } from "@/services/teamService"
import { Plus, Minus, Users, Target, Building } from "lucide-react"
import { GOAL_CATEGORIES, defaultGoal } from "@/constants/goals"

const getDefaultFieldValues = (category) => {
  const fields = GOAL_CATEGORIES[category]?.fields || {};
  return Object.entries(fields).reduce((acc, [key, field]) => {
    acc[key] = field.default;
    return acc;
  }, {});
};

const defaultTeam = {
  name: "",
  department: "engineering",
  status: "active",
  location: "remote",
  size: "small",
  leadId: null,
  description: "",
  parentTeamId: null,
  activeJobs: 0,
  goals: "[]"
}

export function AddTeamDialog({ 
  isOpen, 
  onOpenChange, 
  onTeamCreated,
  team,
  recruiters = [],
  isLoadingRecruiters = false,
  parentTeams = [],
  isLoadingParentTeams = false,
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    department: "engineering",
    status: "active",
    location: "remote",
    size: "small",
    leadId: null,
    description: "",
    parentTeamId: null,
  })
  const [goals, setGoals] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        department: "engineering",
        status: "active",
        location: "remote",
        size: "small",
        leadId: null,
        description: "",
        parentTeamId: null,
      })
      setGoals([])
      setTeamMembers([])
    }
  }, [isOpen])

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field === "leadId") {
      if (value === "none") {
        setFormData(prev => ({
          ...prev,
          leadId: null,
          leadEmail: null,
          leadPhone: null,
          lead: null
        }));
      } else {
        const selectedRecruiter = recruiters.find(r => r.id === parseInt(value));
        if (selectedRecruiter) {
          const firstName = selectedRecruiter.firstName || selectedRecruiter.User?.firstName || '';
          const lastName = selectedRecruiter.lastName || selectedRecruiter.User?.lastName || '';
          const email = selectedRecruiter.email || selectedRecruiter.User?.email || '';
          const phone = selectedRecruiter.phone || selectedRecruiter.User?.phone || '';
          
          setFormData(prev => ({
            ...prev,
            leadId: parseInt(value),
            leadEmail: email,
            leadPhone: phone,
            lead: `${firstName} ${lastName}`.trim()
          }));
        }
      }
    } else if (field === "parentTeamId") {
      setFormData(prev => ({
        ...prev,
        parentTeamId: value === "none" ? null : parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddGoal = () => {
    setGoals(prev => [...prev, { ...defaultGoal }])
  }

  const handleRemoveGoal = (index) => {
    setGoals(prev => prev.filter((_, i) => i !== index))
  }

  const handleGoalChange = (index, field, value) => {
    setGoals(prev => {
      const newGoals = [...prev];
      if (field === "title") {
        // When category changes, reset all fields to defaults for new category
        newGoals[index] = {
          title: value,
          ...getDefaultFieldValues(value)
        };
      } else {
        const category = GOAL_CATEGORIES[newGoals[index].title];
        const fieldConfig = category?.fields[field];
        
        if (fieldConfig) {
          let processedValue = value;
          
          if (fieldConfig.type === "number") {
            if (value === "") {
              processedValue = fieldConfig.default;
            } else {
              const numValue = parseInt(value) || 0;
              if (fieldConfig.max !== undefined) {
                processedValue = Math.min(fieldConfig.max, Math.max(fieldConfig.min || 0, numValue));
              } else {
                processedValue = Math.max(fieldConfig.min || 0, numValue);
              }
            }
          }

          newGoals[index] = {
            ...newGoals[index],
            [field]: processedValue
          };
        }
      }
      return newGoals;
    });
  }

  // Validation for required fields
  const isValid = formData.name && 
                 formData.department && 
                 formData.status && 
                 formData.location && 
                 formData.leadId;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format goals to store all fields for each goal type
      const formattedGoals = goals.map(goal => {
        const formattedGoal = {
          title: goal.title
        };

        // Add required fields based on goal type
        const fields = GOAL_CATEGORIES[goal.title]?.fields || {};
        Object.entries(fields).forEach(([key, field]) => {
          formattedGoal[key] = Number(goal[key]) || field.default || 0;
        });

        return formattedGoal;
      });

      // Clean up formData before sending
      const submissionData = {
        ...formData,
        leadId: formData.leadId === "none" ? null : Number(formData.leadId),
        parentTeamId: formData.parentTeamId === "none" ? null : Number(formData.parentTeamId),
        goals: JSON.stringify(formattedGoals),
        teamMembers: teamMembers
      };

      const response = await teamService.createTeam(submissionData);
      if (!response || !response.team) {
        throw new Error("Invalid response format from server");
      }
      
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      
      // Pass the created team to the callback
      onTeamCreated(response.team);
      onOpenChange(false);
    } catch (error) {
      console.log("Error creating team:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create team. Please try again.",
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
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Create New Team</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Set up a new recruitment team with goals and members
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
                onValueChange={(value) => handleInputChange("department", value)}
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
                  {recruiters?.map((recruiter) => (
                    <SelectItem key={recruiter.id} value={recruiter.id.toString()}>
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
                onValueChange={(value) => handleInputChange("parentTeamId", value)}
              >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="none">No Parent Team</SelectItem>
                  {parentTeams?.map((parentTeam) => (
                    <SelectItem key={parentTeam.id} value={parentTeam.id.toString()}>
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
                    onValueChange={(value) => handleGoalChange(index, "title", value)}
                  >
                        <SelectTrigger className="w-[250px] bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400">
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                      {Object.entries(GOAL_CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.label}
                        </SelectItem>
                      ))}
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
                        {Object.entries(GOAL_CATEGORIES[goal.title].fields).map(([key, field]) => (
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
                        onChange={(e) => handleGoalChange(index, key, e.target.value)}
                              className="bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400"
                      />
                    </div>
                  ))}
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
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 