"use client";

import { useState } from "react";
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
import { AlertTriangle, XCircle, User, Mail, Calendar, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobs } from "@/contexts/jobs-context";

export function RejectApplicantDialog({
  isOpen,
  onOpenChange,
  applicant,
  isLoading: isParentLoading = false,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [reasonType, setReasonType] = useState("");
  const { toast } = useToast();
  const { jobService, fetchJobApplicants, selectedJob } = useJobs();
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullReason = reasonType && reasonType !== "none" ? `${reasonType}: ${reason}` : reason;

      if (applicant.type === 'application') {
        const result = await jobService.rejectApplication(applicant.id, fullReason);
        toast({
          title: "Applicant Rejected",
          description: "The applicant has been rejected successfully.",
        });
        onSuccess(result.application);
      } else if (applicant.type === 'assignment') {
        await jobService.updateAssignmentStatus(applicant.jobId, applicant.candidateId, 'Rejected');
      } else {
        throw new Error("Unknown applicant type. Cannot reject.");
      }

      // Reset form
      setReason("");
      setReasonType("");

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject applicant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    setReasonType("");
    onOpenChange(false);
  };

  if (!applicant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-6 w-6 text-red-600" />
            <DialogTitle className="text-2xl font-bold text-red-600">
              Reject Applicant
            </DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to reject {applicant.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-sm text-gray-700">Applicant Information</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="font-medium">Name:</span>
                  <div className="text-gray-600">{applicant.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="font-medium">Position:</span>
                  <div className="text-gray-600">{applicant.position || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="font-medium">Email:</span>
                  <div className="text-gray-600">{applicant.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="font-medium">Applied:</span>
                  <div className="text-gray-600">
                    {applicant.appliedDate
                      ? new Date(applicant.appliedDate).toLocaleDateString()
                      : "N/A"
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonType">Reason Type (Optional)</Label>
            <Select value={reasonType} onValueChange={setReasonType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="Skills Mismatch">Skills Mismatch</SelectItem>
                <SelectItem value="Experience Level">Experience Level</SelectItem>
                <SelectItem value="Cultural Fit">Cultural Fit</SelectItem>
                <SelectItem value="Salary Expectations">Salary Expectations</SelectItem>
                <SelectItem value="Location Constraints">Location Constraints</SelectItem>
                <SelectItem value="Timeline Issues">Timeline Issues</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejecting this applicant..."
              className="resize-none"
              rows={4}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important:</p>
                <p>This action will mark the applicant as rejected and update their status. The rejection reason will be stored for future reference.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading || isParentLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading || isParentLoading || !reason.trim()}
            className="gap-2"
          >
            {isLoading || isParentLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Reject Applicant
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 