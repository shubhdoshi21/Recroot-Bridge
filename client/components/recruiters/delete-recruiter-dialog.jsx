"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, Loader2, UserX, AlertTriangle, Users, Briefcase, Target } from "lucide-react";
import { useRecruiters } from "@/contexts/recruiters-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export function DeleteRecruiterDialog({ open, onOpenChange, recruiter }) {
  const { deleteRecruiter } = useRecruiters();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!recruiter) return null;

  // Get full name from first and last name
  const getFullName = (recruiter) => {
    if (!recruiter) return "";
    return `${recruiter.firstName || ""} ${recruiter.lastName || ""}`.trim();
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteRecruiter(recruiter.id);

      toast({
        title: "Success",
        description: `${getFullName(
          recruiter
        )} has been successfully removed from the system.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem deleting the recruiter: " +
          (error.response?.data?.message || error.message),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100/50 p-6 -m-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
              <UserX className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Delete Recruiter</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                This action cannot be undone. Please review the details below.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Alert */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg">⚠️ Irreversible Action</h4>
                  <p className="text-gray-700 leading-relaxed">
                    You are about to permanently delete this recruiter from the system. 
                    This will remove all their assignments, records, and associated data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recruiter Details */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Recruiter to be Deleted
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {getFullName(recruiter).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{getFullName(recruiter)}</p>
                    <p className="text-sm text-gray-600">{recruiter.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Department</p>
                      <p className="text-gray-900">{recruiter.department || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50">
                    <Target className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Specialization</p>
                      <p className="text-gray-900">{recruiter.specialization || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-blue-50/50">
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-blue-600">{recruiter.activeJobs || 0}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50/50">
                    <p className="text-sm font-medium text-gray-600">Candidates</p>
                    <p className="text-2xl font-bold text-green-600">{recruiter.candidates || 0}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-50/50">
                    <p className="text-sm font-medium text-gray-600">Hires</p>
                    <p className="text-2xl font-bold text-purple-600">{recruiter.hires || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Warning */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">What will be affected:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• All job assignments will be unassigned</li>
                    <li>• Candidate relationships will be removed</li>
                    <li>• Performance metrics will be deleted</li>
                    <li>• User account will be permanently disabled</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-red-50/30 border-t border-gray-100 p-6 -m-6 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Recruiter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
