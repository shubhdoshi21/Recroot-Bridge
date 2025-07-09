"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, AlertTriangle, User, X, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function CandidateDeleteDialog({ isOpen, onOpenChange, candidate, onConfirm }) {
  if (!candidate) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-red-50 to-orange-50/50 border-b border-red-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                This action cannot be undone. Please review carefully before proceeding.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50/30 rounded-lg border border-red-200">
            <Avatar className="h-12 w-12 ring-2 ring-red-200">
              <AvatarImage
                src={candidate.avatar || "/placeholder.svg"}
                alt={candidate.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white font-semibold">
                {candidate.name ? candidate.name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-red-500" />
                <p className="font-semibold text-gray-900">{candidate.name}</p>
              </div>
              <p className="text-sm text-gray-600">{candidate.email}</p>
              {candidate.position && (
                <p className="text-sm text-gray-500 mt-1">{candidate.position}</p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Warning: This action is permanent
                </p>
                <p className="text-sm text-yellow-700">
                  Deleting this candidate will permanently remove all their data including profile information,
                  education history, work experience, certifications, and any associated documents.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-red-50/30 border-t border-gray-100 px-6 py-4">
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
              variant="destructive"
              onClick={onConfirm}
              className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Candidate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
