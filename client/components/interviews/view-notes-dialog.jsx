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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Edit, Save, X, User, Briefcase, Calendar, Clock } from "lucide-react";
import { useInterviews } from "@/contexts/interviews-context";
import { useToast } from "@/hooks/use-toast";

export function ViewNotesDialog({ open, onOpenChange, interviewId }) {
  // Get context functions
  const { interviews, updateInterviewNotes } = useInterviews();
  const { toast } = useToast();

  // Local state
  const [editMode, setEditMode] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [loading, setLoading] = useState(false);

  // Get the current interview
  const currentInterview =
    interviewId !== null
      ? interviews.find((interview) => interview.id === interviewId)
      : null;

  // Update notes text when interview changes
  useEffect(() => {
    if (currentInterview) {
      setNotesText(currentInterview.notes || "");
    } else {
      setNotesText("");
    }

    // Reset edit mode when dialog opens/closes
    if (!open) {
      setEditMode(false);
    }
  }, [currentInterview, open]);

  // Handle edit button click
  const handleEditClick = () => {
    setEditMode(true);
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    // Reset to original notes
    if (currentInterview) {
      setNotesText(currentInterview.notes || "");
    }
    setEditMode(false);
  };

  // Handle save button click
  const handleSaveClick = async () => {
    if (!currentInterview || interviewId === null) return;

    setLoading(true);

    try {
      await updateInterviewNotes(interviewId, notesText);

      toast({
        title: "Notes Updated",
        description: "Interview notes have been successfully updated.",
      });

      setEditMode(false);
    } catch (error) {
      console.log("Failed to update notes:", error);

      toast({
        title: "Update Failed",
        description:
          "There was a problem updating the notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle text change
  const handleTextChange = (e) => {
    setNotesText(e.target.value);
  };

  if (!currentInterview) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Interview Notes
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            View and edit notes for the interview with{" "}
            <span className="font-semibold text-gray-900">
              {currentInterview.Candidate?.name || currentInterview.candidate}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Interview Details */}
        <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Candidate</p>
                <p className="text-gray-900 font-semibold">
                  {currentInterview.Candidate?.name || currentInterview.candidate}
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
                  {currentInterview.position || "N/A"}
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
                  {new Date(currentInterview.date).toLocaleDateString()}
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
                  {currentInterview.time || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            {!editMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/80">
            <ScrollArea className="h-[300px] w-full">
              {editMode ? (
                <Textarea
                  value={notesText}
                  onChange={handleTextChange}
                  placeholder="Enter interview notes here..."
                  className="min-h-[300px] border-0 focus-visible:ring-0 resize-none p-4 bg-transparent"
                  disabled={loading}
                />
              ) : (
                <div className="p-4 whitespace-pre-wrap text-gray-700">
                  {currentInterview.notes ? (
                    currentInterview.notes
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No notes available</p>
                      <p className="text-sm">Click "Edit" to add notes for this interview</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-100">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelClick}
                disabled={loading}
                className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveClick}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Notes"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
