"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  UserCheck,
  Clock,
  FileText,
  Users,
  Gift,
  CheckCircle,
  XCircle,
  ArrowRight,
  X,
  Save
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function CandidateStatusDialog({ isOpen, onOpenChange, candidate, onSave }) {
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    if (candidate) {
      setNewStatus(candidate.status)
    }
  }, [candidate])

  const handleSave = () => {
    onSave(newStatus)
  }

  const getStatusConfig = (status) => {
    const configs = {
      "Applied": {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
        description: "Candidate has submitted their application"
      },
      "Screening": {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: FileText,
        description: "Application is being reviewed"
      },
      "Assessment": {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: FileText,
        description: "Candidate is completing assessments"
      },
      "Interview": {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: Users,
        description: "Interview process is ongoing"
      },
      "Offer": {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Gift,
        description: "Offer has been extended"
      },
      "Hired": {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle,
        description: "Candidate has been hired"
      },
      "Rejected": {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        description: "Application has been rejected"
      }
    }
    return configs[status] || configs["Applied"]
  }

  if (!candidate) return null

  const currentStatusConfig = getStatusConfig(candidate.status)
  const newStatusConfig = getStatusConfig(newStatus)
  const CurrentStatusIcon = currentStatusConfig.icon
  const NewStatusIcon = newStatusConfig.icon

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Update Candidate Status</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Change the application status for this candidate.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Candidate Info */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-200">
            <Avatar className="h-12 w-12 ring-2 ring-blue-200">
              <AvatarImage
                src={candidate.avatar || "/placeholder.svg"}
                alt={candidate.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                {candidate.name ? candidate.name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{candidate.name}</p>
              <p className="text-sm text-gray-600">{candidate.email}</p>
              {candidate.position && (
                <p className="text-sm text-gray-500 mt-1">{candidate.position}</p>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Current Status</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-gray-200 rounded-lg">
                <CurrentStatusIcon className="h-4 w-4 text-gray-600" />
              </div>
              <Badge className={`${currentStatusConfig.color} font-medium`}>
                {candidate.status}
              </Badge>
              <p className="text-sm text-gray-600 ml-2">{currentStatusConfig.description}</p>
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-3">
            <Label htmlFor="status" className="text-sm font-semibold text-gray-700">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder="Select a new status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="Applied" className="hover:bg-blue-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Applied</span>
                  </div>
                </SelectItem>
                <SelectItem value="Screening" className="hover:bg-yellow-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-yellow-600" />
                    <span>Screening</span>
                  </div>
                </SelectItem>
                <SelectItem value="Assessment" className="hover:bg-purple-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span>Assessment</span>
                  </div>
                </SelectItem>
                <SelectItem value="Interview" className="hover:bg-orange-50">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span>Interview</span>
                  </div>
                </SelectItem>
                <SelectItem value="Offer" className="hover:bg-green-50">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span>Offer</span>
                  </div>
                </SelectItem>
                <SelectItem value="Hired" className="hover:bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Hired</span>
                  </div>
                </SelectItem>
                <SelectItem value="Rejected" className="hover:bg-red-50">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Rejected</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Preview */}
          {newStatus && newStatus !== candidate.status && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge className={`${currentStatusConfig.color} font-medium`}>
                    {candidate.status}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <Badge className={`${newStatusConfig.color} font-medium`}>
                    {newStatus}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{newStatusConfig.description}</p>
            </div>
          )}
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!newStatus || newStatus === candidate.status}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
