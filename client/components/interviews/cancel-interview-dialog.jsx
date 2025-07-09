"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, User, Briefcase, Calendar, Clock } from "lucide-react";
import { useInterviews } from "@/contexts/interviews-context";
import { useToast } from "@/hooks/use-toast";

export function CancelInterviewDialog({ open, onOpenChange, interviewId }) {
  const { interviews, cancelInterview } = useInterviews();
  const { toast } = useToast();
  const [interview, setInterview] = useState(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load interview data when dialog opens
  useEffect(() => {
    if (open && interviewId) {
      const interviewData = interviews.find((i) => i.id === interviewId);
      if (interviewData) {
        setInterview(interviewData);
      }
    } else {
      // Reset form when dialog closes
      setInterview(null);
      setReason("");
    }
  }, [open, interviewId, interviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!interview || !interviewId) return;

    setIsSubmitting(true);

    try {
      await cancelInterview(interviewId, reason);
      toast({
        title: "Interview Canceled",
        description: `Interview with ${interview.Candidate?.name || interview.candidate
          } has been canceled.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cancel interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!interview) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-red-800 bg-clip-text text-transparent">
              Cancel Interview
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Are you sure you want to cancel the interview with{" "}
            <span className="font-semibold text-gray-900">
              {interview.Candidate?.name || interview.candidate}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form
          id="cancel-interview-form"
          onSubmit={handleSubmit}
          className="space-y-6 py-2"
        >
          {/* Interview Details */}
          <div className="bg-gray-50/50 rounded-xl p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Candidate</p>
                  <p className="text-gray-900 font-semibold">
                    {interview.Candidate?.name || interview.candidate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Position</p>
                  <p className="text-gray-900 font-semibold">
                    {interview.position || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(interview.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Time</p>
                  <p className="text-gray-900 font-semibold">
                    {interview.time || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-3">
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason for cancellation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for canceling this interview..."
              className="bg-white/80 border-gray-200 focus:border-red-500 focus:ring-red-500 resize-none"
              rows={3}
              required
            />
            <p className="text-xs text-gray-500">
              This information will be recorded for future reference.
            </p>
          </div>
        </form>

        <DialogFooter className="pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Keep Interview
          </Button>
          <Button
            type="submit"
            form="cancel-interview-form"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? "Canceling..." : "Cancel Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
