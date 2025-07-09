"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  PlusCircle,
  Users,
  Heart,
  Calendar,
  X,
  ExternalLink,
  Eye,
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ExtracurricularActivitiesDialog({
  isOpen,
  onOpenChange,
  candidate,
}) {
  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-orange-50 to-red-50/50 border-b border-orange-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Extracurricular Activities</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {candidate.name}'s activities, volunteering, and interests outside of work.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {candidate.CandidateExtraCurriculars &&
            candidate.CandidateExtraCurriculars.length > 0 ? (
            <div className="space-y-4">
              {candidate.CandidateExtraCurriculars.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group relative bg-gradient-to-r from-white to-orange-50/30 border-2 border-gray-200 rounded-xl p-6 space-y-4 hover:border-orange-300 hover:shadow-lg transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-900 transition-colors">
                          {activity.activityTitle}
                        </h3>
                        <p className="text-gray-600 font-medium flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          {activity.organization}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg">
                    <Activity className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</Label>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                        {activity.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  {/* Document Actions */}
                  {activity.Document && (
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(activity.Document.url, "_blank")}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(activity.Document.downloadUrl, "_blank")}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(activity.Document.url, "_blank")}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
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
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Extracurricular Activities</h3>
              <p className="text-gray-600 mb-4">
                No extracurricular activities have been added to this candidate's profile yet.
              </p>
              <p className="text-sm text-gray-500">
                Activities, volunteering, and interests will appear here when added to the candidate's profile.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-orange-50/30 border-t border-gray-100 px-6 py-4">
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
