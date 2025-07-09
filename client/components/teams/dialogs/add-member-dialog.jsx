"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { teamService } from "@/services/teamService"
import { UserPlus, Users, Shield } from "lucide-react"

const TEAM_ROLES = [
  { id: "Member", label: "Member", color: "bg-gray-100 text-gray-700" },
  { id: "Senior Recruiter", label: "Senior Recruiter", color: "bg-blue-100 text-blue-700" },
  { id: "Recruiter", label: "Recruiter", color: "bg-green-100 text-green-700" },
  { id: "Junior Recruiter", label: "Junior Recruiter", color: "bg-yellow-100 text-yellow-700" },
  { id: "Recruitment Coordinator", label: "Recruitment Coordinator", color: "bg-purple-100 text-purple-700" },
  { id: "Sourcing Specialist", label: "Sourcing Specialist", color: "bg-indigo-100 text-indigo-700" },
  { id: "Talent Researcher", label: "Talent Researcher", color: "bg-pink-100 text-pink-700" },
  { id: "Intern", label: "Intern", color: "bg-orange-100 text-orange-700" }
]

export function AddMemberDialog({ isOpen, onOpenChange, onAdd, teamId, recruiters = [], isLoadingRecruiters, existingMembers = [] }) {
  const { toast } = useToast()
  const [selectedRecruiter, setSelectedRecruiter] = useState("")
  const [role, setRole] = useState("Member")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasTeamLead, setHasTeamLead] = useState(false)

  // Check if team already has a lead
  useEffect(() => {
    const checkTeamLead = async () => {
      if (!teamId) return;

      try {
        const response = await teamService.getTeamMembers(teamId);
        const members = response?.members || [];
        const hasLead = members.some(member => member.role === 'Team Lead');
        setHasTeamLead(hasLead);
      } catch (error) {
        console.log('[AddMemberDialog] Error checking team lead:', error);
        toast({
          title: "Error",
          description: "Failed to check team lead status",
          variant: "destructive",
        });
      }
    };

    checkTeamLead();
  }, [teamId, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRecruiter) {
      toast({
        title: "Error",
        description: "Please select a recruiter",
        variant: "destructive",
      })
      return
    }

    if (role === 'Team Lead' && hasTeamLead) {
      toast({
        title: "Error",
        description: "This team already has a lead. Please select a different role.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const memberData = {
        recruiterId: parseInt(selectedRecruiter),
        role: role,
        joinDate: new Date().toISOString()
      }

      await onAdd(memberData)

      toast({
        title: "Success",
        description: "Team member added successfully",
      })

      onOpenChange(false)
      setSelectedRecruiter("")
      setRole("Member")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get list of recruiter IDs that are already team members
  const existingMemberIds = existingMembers.map(member => member.recruiterId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Add Team Member</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Add a new member to your recruitment team
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Member Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="recruiter" className="text-sm font-semibold text-gray-700">Select Recruiter</Label>
                <Select
                  value={selectedRecruiter}
                  onValueChange={setSelectedRecruiter}
                  disabled={isLoadingRecruiters}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Select a recruiter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                    {recruiters.map((recruiter) => (
                      <SelectItem
                        key={recruiter.id}
                        value={recruiter.id.toString()}
                        disabled={existingMemberIds.includes(recruiter.id)}
                        className="hover:bg-blue-50"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{`${recruiter.firstName} ${recruiter.lastName}`}</span>
                          {existingMemberIds.includes(recruiter.id) && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Already a member
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                    {TEAM_ROLES.map((roleOption) => (
                      <SelectItem
                        key={roleOption.id}
                        value={roleOption.id}
                        disabled={roleOption.id === "Team Lead" && hasTeamLead}
                        className="hover:bg-blue-50"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{roleOption.label}</span>
                          {roleOption.id === "Team Lead" && hasTeamLead && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Already assigned
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {role && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Selected Role: {role}
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
                disabled={isSubmitting || !selectedRecruiter}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 