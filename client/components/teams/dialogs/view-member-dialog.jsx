"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, User, Mail, Phone, Calendar, Shield } from "lucide-react"

/**
 * Dialog for viewing team member details
 */
export function ViewMemberDialog({ isOpen, onOpenChange, member, onDelete }) {
  if (!member) return null

  const getRoleColor = (role) => {
    const roleColors = {
      "Team Lead": "bg-red-100 text-red-700",
      "Senior Recruiter": "bg-blue-100 text-blue-700",
      "Recruiter": "bg-green-100 text-green-700",
      "Junior Recruiter": "bg-yellow-100 text-yellow-700",
      "Recruitment Coordinator": "bg-purple-100 text-purple-700",
      "Sourcing Specialist": "bg-indigo-100 text-indigo-700",
      "Talent Researcher": "bg-pink-100 text-pink-700",
      "Intern": "bg-orange-100 text-orange-700",
      "Member": "bg-gray-100 text-gray-700"
    };
    return roleColors[role] || "bg-gray-100 text-gray-700";
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Team Member Details</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                View detailed information about this team member
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Member Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Member Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-blue-200">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-semibold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                  <Badge className={`mt-1 ${getRoleColor(member.role)}`}>
                    {member.role}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <p className="text-sm font-medium text-gray-900">{member.email}</p>
                  </div>
                </div>

                {member.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                      <p className="text-sm font-medium text-gray-900">{member.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Join Date</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(member.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 