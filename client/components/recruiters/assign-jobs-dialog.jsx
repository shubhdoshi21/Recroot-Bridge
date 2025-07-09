"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecruiters } from "@/contexts/recruiters-context";
import { useToast } from "@/hooks/use-toast";
import { getAvailableJobsForRecruiter } from "@/services/recruiterService";
import {
  Loader2,
  Search,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  UserCheck,
  CheckCircle,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function AssignJobsDialog({ open, onOpenChange, recruiter }) {
  const { updateRecruiterJobs, getRecruiterAssignedJobs } = useRecruiters();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);

  // Update selectedJobs when dialog opens
  useEffect(() => {
    if (open && recruiter?.id) {
      console.log("[AssignJobsDialog] Effect: Dialog opened", {
        recruiterId: recruiter.id,
        open,
      });
      fetchJobs(recruiter.id);
    }
  }, [open, recruiter?.id]);

  // Reset selection when dialog closes
  useEffect(() => {
    if (!open) {
      console.log("[AssignJobsDialog] Dialog closed, resetting selection");
      setSelectedJobs([]);
      setSearchQuery("");
    }
  }, [open]);

  // Fetch both assigned and unassigned jobs
  const fetchJobs = async (recruiterId) => {
    setIsLoading(true);
    try {
      // Get jobs already assigned to this recruiter
      const assignedJobs = await getRecruiterAssignedJobs(recruiterId);
      const assignedJobIds = assignedJobs.map((job) => job.jobId);
      setSelectedJobs(assignedJobIds);

      // Get available jobs for this recruiter
      const availableJobsForRecruiter = await getAvailableJobsForRecruiter(recruiterId);

      // Combine all jobs with proper data mapping
      const allJobs = [
        ...assignedJobs.map((job) => ({
          id: job.jobId,
          title: job.Job?.jobTitle || job.Job?.title || "Untitled Job",
          department: job.Job?.department || "N/A",
          location: job.Job?.location || "N/A",
          status: job.Job?.jobStatus || job.Job?.status || "Open",
          type: job.Job?.jobType || "N/A",
          assignedDate: job.assignedDate,
          assignedBy: job.assignedBy,
        })),
        ...availableJobsForRecruiter.map((job) => ({
          id: job.id,
          title: job.jobTitle || job.title || "Untitled Job",
          department: job.department || "N/A",
          location: job.location || "N/A",
          status: job.jobStatus || job.status || "Open",
          type: job.jobType || "N/A",
        })),
      ];

      console.log("[AssignJobsDialog] Fetched jobs:", {
        assignedJobs: assignedJobs.map((job) => ({
          id: job.jobId,
          title: job.Job?.jobTitle || job.Job?.title,
          status: job.Job?.jobStatus || job.Job?.status,
        })),
        availableJobsForRecruiter: availableJobsForRecruiter.map((job) => ({
          id: job.id,
          title: job.jobTitle || job.title,
          status: job.jobStatus || job.status,
        })),
      });

      setAvailableJobs(allJobs);
      setFilteredJobs(allJobs);
    } catch (error) {
      console.log("[AssignJobsDialog] Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter jobs based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredJobs(availableJobs);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredJobs(
        availableJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(query) ||
            job.department.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, availableJobs]);

  const handleToggle = (jobId) => {
    console.log("[AssignJobsDialog] handleToggle called", {
      jobId,
      currentlySelected: selectedJobs.includes(jobId),
      currentSelection: selectedJobs,
    });

    setSelectedJobs((prev) => {
      const newSelected = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];

      console.log("[AssignJobsDialog] handleToggle: Selection updated", {
        jobId,
        previousSelection: prev,
        newSelection: newSelected,
        action: prev.includes(jobId) ? "removed" : "added",
      });

      return newSelected;
    });
  };

  const handleSave = async () => {
    if (!recruiter?.id) {
      console.log("[AssignJobsDialog] handleSave: Missing recruiterId");
      toast({
        title: "Error",
        description: "Recruiter ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("[AssignJobsDialog] handleSave: Updating jobs", {
        recruiterId: recruiter.id,
        selectedJobs,
      });

      await updateRecruiterJobs(recruiter.id, selectedJobs);

      toast({
        title: "Success",
        description: "Job assignments updated successfully",
      });

      onOpenChange(false);
    } catch (error) {
      console.log("[AssignJobsDialog] handleSave: Error", {
        error,
        errorMessage: error.message,
        recruiterId: recruiter.id,
        selectedJobs,
      });

      toast({
        title: "Error",
        description: error.message || "Failed to update job assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderJobItem = (job) => {
    const isChecked = selectedJobs.includes(job.id);
    const isAssigned = job.assignedDate;

    return (
      <div
        key={job.id}
        className={`flex items-start space-x-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${isChecked
            ? "bg-blue-50 border-blue-200"
            : "bg-white border-gray-200 hover:border-gray-300"
          }`}
      >
        <Checkbox
          id={`job-${job.id}`}
          checked={isChecked}
          onCheckedChange={() => handleToggle(job.id)}
          disabled={isLoading}
          className="mt-1 text-blue-600"
        />
        <div className="flex-1 min-w-0">
          <Label
            htmlFor={`job-${job.id}`}
            className="cursor-pointer font-semibold text-gray-900 flex items-center gap-2"
            onClick={() => handleToggle(job.id)}
          >
            <Briefcase className="h-4 w-4 text-blue-500" />
            {job.title}
            {isAssigned && (
              <CheckCircle className="h-4 w-4 text-green-500" title="Already assigned" />
            )}
          </Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600">
              {job.department && (
                <span className="inline-flex items-center gap-1">
                  <Building className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">{job.department}</span>
                </span>
              )}
              {job.type && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-green-500" />
                  <span>{job.type}</span>
                </span>
              )}
              {job.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-orange-500" />
                  <span>{job.location}</span>
                </span>
              )}
            </div>
            {job.assignedDate && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Assigned:</span>
                <span>{new Date(job.assignedDate).toLocaleDateString()}</span>
                {job.assignedBy && (
                  <>
                    <span>by</span>
                    <span className="font-medium">{job.assignedBy}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Badge
          variant="outline"
          className={`ml-2 whitespace-nowrap flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105 ${job.status === "Active"
              ? "bg-green-50 text-green-700 border-green-300 shadow-sm"
              : job.status === "On Hold"
                ? "bg-yellow-50 text-yellow-700 border-yellow-300 shadow-sm"
                : "bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
            }`}
        >
          <Clock className="h-3 w-3" />
          {job.status}
        </Badge>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-6 -m-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Assign Jobs</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Select jobs to assign to {recruiter?.firstName} {recruiter?.lastName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search jobs by title, department, or location..."
              className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700">Loading jobs...</p>
                  <p className="text-sm text-gray-500">Please wait while we fetch available positions</p>
                </div>
              </div>
            ) : !filteredJobs || filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Briefcase className="h-12 w-12 text-gray-300" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700">No jobs available</p>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? "Try adjusting your search terms" : "All jobs have been assigned or are not available"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Available Jobs ({filteredJobs.filter(job => job.status !== "Closed" && job.status !== "Draft").length})
                  </h3>
                  {selectedJobs.length > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold">
                      {selectedJobs.length} selected
                    </Badge>
                  )}
                </div>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {filteredJobs
                      .filter(
                        (job) => job.status !== "Closed" && job.status !== "Draft"
                      )
                      .map(renderJobItem)}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 p-6 -m-6 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Jobs
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
