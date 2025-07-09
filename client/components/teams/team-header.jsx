"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users, MapPin, Briefcase, Edit, Mail, Phone, Award, Building, UserCheck, Trash2 } from "lucide-react"

// Helper function to capitalize first letter safely
const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to format location
const formatLocation = (location) => {
  if (!location) return "No location set";
  return location
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function TeamHeader({ team, onEditClick, onDeleteClick }) {
  if (!team) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-blue-100 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                TM
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
              <p className="text-gray-500">Please wait while we load the team details.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 ring-2 ring-blue-100 shadow-lg">
              <AvatarImage src={team.icon || "/placeholder.svg"} alt={team.name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                {team.name ? team.name.charAt(0).toUpperCase() : "T"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900">{team.name}</h2>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105
                    ${team.status === "active"
                      ? "bg-green-50 text-green-700 border-green-300 shadow-sm"
                      : team.status === "archived"
                        ? "bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                        : "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                    }
                  `}
                >
                  {team.status === "active" ? (
                    <UserCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <Building className="h-4 w-4 text-gray-600" />
                  )}
                  {capitalizeFirst(team.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-lg font-semibold text-gray-900">{team.members || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors">
                  <div className="p-2 bg-green-100 rounded-full">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{formatLocation(team?.location)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50/50 hover:bg-orange-50 transition-colors">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Briefcase className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Department</p>
                    <p className="text-lg font-semibold text-gray-900">{capitalizeFirst(team?.department) || "No department"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 hover:bg-purple-50 transition-colors">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hires This Year</p>
                    <p className="text-lg font-semibold text-gray-900">{team.hires || 0}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Lead</h3>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-100/50">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-100 shadow-md">
                    <AvatarImage src={team.leadAvatar || "/placeholder.svg"} alt={team.lead} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                      {team.lead ? team.lead.charAt(0).toUpperCase() : 'TL'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">{team.lead || "No lead assigned"}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {team.leadEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <a href={`mailto:${team.leadEmail}`} className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                            {team.leadEmail}
                          </a>
                        </div>
                      )}
                      {team.leadPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span>{team.leadPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onEditClick}
              className="h-12 w-12 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-md"
            >
              <Edit className="h-5 w-5" />
              <span className="sr-only">Edit team</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 