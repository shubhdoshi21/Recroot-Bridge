"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  X,
  ExternalLink,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function WorkExperienceDialog({ isOpen, onOpenChange, candidate }) {
  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Work Experience</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {candidate.name}'s professional work history and experience.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {candidate.CandidateExperiences &&
            candidate.CandidateExperiences.length > 0 ? (
            <div className="space-y-4">
              {candidate.CandidateExperiences.map((work, index) => (
                <div
                  key={work.id}
                  className="group relative bg-gradient-to-r from-white to-gray-50/50 border-2 border-gray-200 rounded-xl p-6 space-y-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-900 transition-colors">
                          {work.jobTitle}
                        </h3>
                        <p className="text-gray-600 font-medium">{work.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                        <Calendar className="h-3 w-3 mr-1" />
                        {work.startDate} - {work.isCurrentRole ? "Present" : work.endDate}
                      </Badge>
                      {work.isCurrentRole && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium">
                          <Clock className="h-3 w-3 mr-1" />
                          Current Role
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {work.location && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</Label>
                          <p className="text-sm font-medium text-gray-900">{work.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</Label>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-line leading-relaxed">
                          {work.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Actions */}
                  {work.Document && (
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(work.Document.url, "_blank")}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(work.Document.downloadUrl, "_blank")}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(work.Document.url, "_blank")}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-6 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Work Experience</h3>
              <p className="text-gray-600 mb-4">
                No work experience has been added to this candidate's profile yet.
              </p>
              <p className="text-sm text-gray-500">
                Work history details will appear here when added to the candidate's profile.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
