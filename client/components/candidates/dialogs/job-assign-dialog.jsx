"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCandidates } from "@/contexts/candidates-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Clock,
  X,
  Save,
  Loader2,
  AlertCircle
} from "lucide-react";

export function JobAssignDialog({
  isOpen,
  onOpenChange,
  jobs,
  selectedJobs: initialSelectedJobs,
  candidateId,
  onSave,
}) {
  const { updateCandidateJobs } = useCandidates();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);

  // Update selectedJobs when initialSelectedJobs changes
  useEffect(() => {
    console.log("[JobAssignDialog] Effect: initialSelectedJobs changed", {
      isOpen,
      candidateId,
      initialSelectedJobs,
      currentSelectedJobs: selectedJobs,
      jobsCount: jobs?.length,
    });

    if (initialSelectedJobs) {
      console.log("[JobAssignDialog] Setting selected jobs from props", {
        initialSelectedJobs,
        previousSelectedJobs: selectedJobs,
      });
      setSelectedJobs(initialSelectedJobs);
    }
  }, [initialSelectedJobs, isOpen]);

  // Reset selection when dialog opens/closes
  useEffect(() => {
    console.log("[JobAssignDialog] Effect: Dialog open state changed", {
      isOpen,
      candidateId,
      initialSelectedJobs,
      selectedJobs,
    });

    if (!isOpen) {
      console.log("[JobAssignDialog] Dialog closed, resetting selection");
      setSelectedJobs([]);
    }
  }, [isOpen]);

  // Log initial props and state
  useEffect(() => {
    console.log("[JobAssignDialog] Component mounted/updated", {
      isOpen,
      candidateId,
      initialSelectedJobs,
      selectedJobs,
      jobsCount: jobs?.length,
      jobs: jobs?.map((job) => ({
        id: job.id,
        title: job.jobTitle,
        department: job.department,
        type: job.jobType,
        location: job.location,
        status: job.jobStatus,
        assignedDate: job.assignedDate,
        assignedBy: job.assignedBy,
      })),
    });
  }, [isOpen, candidateId, initialSelectedJobs, jobs, selectedJobs]);

  const handleToggle = (jobId) => {
    console.log("[JobAssignDialog] handleToggle called", {
      jobId,
      currentlySelected: selectedJobs.includes(jobId),
      currentSelection: selectedJobs,
      job: jobs.find((j) => j.id === jobId),
    });

    setSelectedJobs((prevSelected) => {
      const newSelected = prevSelected.includes(jobId)
        ? prevSelected.filter((id) => id !== jobId)
        : [...prevSelected, jobId];

      console.log("[JobAssignDialog] handleToggle: Selection updated", {
        jobId,
        previousSelection: prevSelected,
        newSelection: newSelected,
        action: prevSelected.includes(jobId) ? "removed" : "added",
      });

      return newSelected;
    });
  };

  const handleSave = async () => {
    console.log("[JobAssignDialog] handleSave called", {
      candidateId,
      selectedJobs,
      selectedJobsCount: selectedJobs.length,
      isLoading,
      hasOnSave: !!onSave,
    });

    if (!candidateId) {
      console.log("[JobAssignDialog] handleSave: Missing candidateId");
      toast({
        title: "Error",
        description: "Candidate ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (onSave) {
        console.log(
          "[JobAssignDialog] handleSave: Using provided onSave callback"
        );
        await onSave(selectedJobs);
      } else {
        console.log(
          "[JobAssignDialog] handleSave: Using updateCandidateJobs directly"
        );
        await updateCandidateJobs(candidateId, selectedJobs);
      }

      console.log("[JobAssignDialog] handleSave: Success", {
        candidateId,
        selectedJobs,
      });

      toast({
        title: "Success",
        description: "Job assignments updated successfully",
      });

      onOpenChange(false);
    } catch (error) {
      console.log("[JobAssignDialog] handleSave: Error", {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        candidateId,
        selectedJobs,
      });

      toast({
        title: "Error",
        description: error.message || "Failed to update job assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("[JobAssignDialog] handleSave: Operation completed", {
        candidateId,
        selectedJobs,
        isLoading: false,
      });
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      "Active": {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        bgColor: "bg-green-50/50"
      },
      "On Hold": {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        bgColor: "bg-yellow-50/50"
      },
      "Closed": {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: X,
        bgColor: "bg-gray-50/50"
      },
      "Draft": {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
        bgColor: "bg-blue-50/50"
      }
    };
    return configs[status] || configs["Active"];
  };

  // Log render data for each job
  const renderJobItem = (job) => {
    const isChecked = selectedJobs.includes(job.id);
    const statusConfig = getStatusConfig(job.jobStatus);
    const StatusIcon = statusConfig.icon;

    console.log("[JobAssignDialog] Rendering job item", {
      jobId: job.id,
      jobTitle: job.jobTitle,
      jobDepartment: job.department,
      jobType: job.jobType,
      jobLocation: job.location,
      jobStatus: job.jobStatus,
      jobAssignedDate: job.assignedDate,
      jobAssignedBy: job.assignedBy,
      isSelected: isChecked,
    });

    return (
      <div
        key={job.id}
        className={`group relative flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isChecked
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg'
            : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30'
          }`}
        onClick={() => handleToggle(job.id)}
      >
        <div className="flex items-center justify-center w-6 h-6 mt-1">
          <Checkbox
            id={`job-${job.id}`}
            checked={isChecked}
            onCheckedChange={() => handleToggle(job.id)}
            disabled={isLoading}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Label
                htmlFor={`job-${job.id}`}
                className="cursor-pointer font-semibold text-lg text-gray-900 group-hover:text-blue-900 transition-colors"
              >
                {job.jobTitle}
              </Label>
            </div>
            <Badge className={`${statusConfig.color} font-medium flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {job.jobStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {job.department && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Department:</span>
                <span>{job.department}</span>
              </div>
            )}
            {job.jobType && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Type:</span>
                <span>{job.jobType}</span>
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Location:</span>
                <span>{job.location}</span>
              </div>
            )}
          </div>

          {job.assignedDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 rounded-lg p-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Assigned:</span>
              <span>{new Date(job.assignedDate).toLocaleDateString()}</span>
              {job.assignedBy && (
                <div className="flex items-center gap-1 ml-2">
                  <User className="h-3 w-3 text-gray-500" />
                  <span>by {job.assignedBy}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const availableJobs = jobs?.filter(
    (job) => job.jobStatus !== "Closed" && job.jobStatus !== "Draft"
  ) || [];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log("[JobAssignDialog] Dialog onOpenChange", {
          open,
          candidateId,
          selectedJobs,
          initialSelectedJobs,
        });
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[700px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Assign Jobs</DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-1">
                Select jobs to assign to this candidate. You can select multiple jobs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {!jobs || jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No jobs available</p>
              <p className="text-sm text-gray-500 mt-2">Please add some jobs first</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Available Jobs</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedJobs.length} selected
                </Badge>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {console.log("[JobAssignDialog] Rendering jobs list:", {
                    jobsCount: availableJobs.length,
                    jobs: availableJobs.map((job) => ({
                      id: job.id,
                      title: job.jobTitle,
                      status: job.jobStatus,
                    })),
                  })}
                  {availableJobs.map(renderJobItem)}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => {
                console.log("[JobAssignDialog] Cancel button clicked");
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className={`flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
