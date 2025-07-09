"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, XCircle, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useJobs } from "@/contexts/jobs-context";

export function QuickRejectDialog({
  isOpen,
  onOpenChange,
  isLoading: isParentLoading = false,
}) {
  const {
    selectedJob: job,
    applicants: allApplicants,
    isLoadingApplicants,
    jobService,
    fetchJobApplicants,
  } = useJobs();

  const [activeApplicants, setActiveApplicants] = useState([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState("");
  const [reason, setReason] = useState("");
  const [reasonType, setReasonType] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && job) {
      const filtered = (allApplicants || []).filter(applicant =>
        applicant.status !== "Rejected" &&
        applicant.status !== "Hired" &&
        applicant.status !== "Archived"
      );
      setActiveApplicants(filtered);

      if (filtered.length > 0) {
        setSelectedApplicantId(filtered[0].id);
      } else {
        setSelectedApplicantId("");
      }
    }
  }, [isOpen, job, allApplicants]);

  const handleReject = async () => {
    if (!selectedApplicantId) {
      toast({
        title: "No Applicant Selected",
        description: "Please select an applicant to reject.",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fullReason = reasonType && reasonType !== "none" ? `${reasonType}: ${reason}` : reason;
      const applicantToReject = activeApplicants.find(app => app.id === selectedApplicantId);

      if (!applicantToReject) {
        throw new Error("Could not find the selected applicant.");
      }

      if (applicantToReject.type === 'application') {
        await jobService.rejectApplication(applicantToReject.id, fullReason);
      } else if (applicantToReject.type === 'assignment') {
        await jobService.updateAssignmentStatus(applicantToReject.jobId, applicantToReject.candidateId, 'Rejected');
      } else {
        throw new Error("Unknown applicant type. Cannot reject.");
      }

      setReason("");
      setReasonType("");
      setSelectedApplicantId("");

      toast({
        title: "Applicant Rejected",
        description: "The applicant has been rejected successfully.",
      });

      // Refresh the list
      if (job?.id) {
        fetchJobApplicants(job.id, { onlyApplicants: true });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject applicant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setReason("");
    setReasonType("");
    setSelectedApplicantId("");
    onOpenChange(false);
  };

  const selectedApplicant = activeApplicants.find(app => app.id === selectedApplicantId);

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-xl font-bold">
            <XCircle className="h-6 w-6 text-red-600" />
            Quick Reject Applicant
          </DialogTitle>
          <DialogDescription>
            Select an applicant to reject from <span className="font-semibold text-gray-900">{job.title || job.jobTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium">{job.title || job.jobTitle}</div>
              <div className="text-gray-600">{job.department || "Department not specified"}</div>
            </div>
          </div>

          {/* Applicant Selection */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <Label className="font-semibold text-gray-800">Select Applicant to Reject</Label>
            </div>
            {isLoadingApplicants ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : activeApplicants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No active applicants found for this job.</p>
                <p className="text-sm">All applicants may have been rejected, hired, or archived.</p>
              </div>
            ) : (
              <RadioGroup value={selectedApplicantId} onValueChange={setSelectedApplicantId}>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeApplicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedApplicantId === applicant.id
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-gray-200 hover:border-blue-200"
                        }`}
                      onClick={() => setSelectedApplicantId(applicant.id)}
                    >
                      <RadioGroupItem value={applicant.id} id={applicant.id} />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={applicant.avatar} alt={applicant.name} />
                        <AvatarFallback>{applicant.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{applicant.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {applicant.status || "Applied"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 truncate">{applicant.email}</div>
                      </div>
                      {selectedApplicantId === applicant.id && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Rejection Reason */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <Label className="font-semibold text-gray-800">Rejection Reason</Label>
            </div>
            <Select value={reasonType} onValueChange={setReasonType}>
              <SelectTrigger className="mb-2 w-full">
                <SelectValue placeholder="Select reason type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Type</SelectItem>
                <SelectItem value="qualification">Qualification</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="skills">Skills</SelectItem>
                <SelectItem value="culture">Culture Fit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              className="min-h-[80px] mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isParentLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={isParentLoading}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Reject Applicant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 