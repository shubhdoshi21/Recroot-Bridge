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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Video, Phone, MapPin, User, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useInterviews } from "@/contexts/interviews-context";
import { useToast } from "@/hooks/use-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { NotifyCandidateDialog } from "./notify-candidate-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const calendarStyles = `
  .react-calendar {
    width: 350px;
    max-width: 100%;
    background: white;
    border-radius: 0.75rem;
    font-family: inherit;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .react-calendar__tile--active {
    background: linear-gradient(to right, #3b82f6, #6366f1);
    color: white;
  }
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: linear-gradient(to right, #2563eb, #4f46e5);
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #f3f4f6;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f3f4f6;
  }
`;

export function ScheduleInterviewDialog({ open, onOpenChange }) {
  const { addInterview, candidates, applications, loading } = useInterviews();
  const { toast } = useToast();
  const [date, setDate] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [scheduledInterview, setScheduledInterview] = useState(null);
  const [interviewType, setInterviewType] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Filter applications based on selected candidate
  const candidateApplications = selectedCandidate
    ? applications.filter((app) => app.candidateId === selectedCandidate.id)
    : [];

  console.log(
    "[ScheduleInterviewDialog] Selected candidate:",
    selectedCandidate
  );
  console.log(
    "[ScheduleInterviewDialog] Candidate applications:",
    candidateApplications
  );
  console.log(
    "[ScheduleInterviewDialog] Selected application:",
    selectedApplication
  );
  console.log("[ScheduleInterviewDialog] All applications:", applications);
  console.log("[ScheduleInterviewDialog] All candidates:", candidates);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.target);
    const candidateValue = formData.get("candidate");
    const position = formData.get("position");
    const application = formData.get("application");
    const time = formData.get("time");
    const type = formData.get("type");
    const duration = formData.get("duration");
    const notes = formData.get("notes");
    const interviewer = formData.get("interviewer");
    const locationValue = formData.get("location");

    // Parse candidate value to get ID and name
    const [candidateId, candidate] = candidateValue.split("|");

    // Validate form
    const errors = {};
    if (!candidateValue) errors.candidate = "Candidate is required";
    if (!position) errors.position = "Position is required";
    if (!application) errors.application = "Application is required";
    if (!date) errors.date = "Date is required";
    if (!time) errors.time = "Time is required";
    if (!type) errors.type = "Interview type is required";
    if (type === "in-person" && !locationValue)
      errors.location = "Location is required for in-person interviews";
    if (type === "video" && !formData.get("meetingLink"))
      errors.meetingLink = "Meeting link is required for video interviews";
    if (!interviewer) errors.interviewer = "Interviewer is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Submit form
    setIsSubmitting(true);

    // Format date as YYYY-MM-DD
    const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

    // Create interview object
    const newInterview = {
      candidateId,
      candidate,
      applicationId: application,
      position,
      date: formattedDate,
      time,
      duration,
      interviewType: type,
      location: type === "in-person" ? locationValue : undefined,
      meetingLink: type === "video" ? formData.get("meetingLink") : undefined,
      interviewer,
      notes,
      interviewStatus: "Scheduled",
    };

    // Add interview
    await addInterview(newInterview);

    // Store the scheduled interview for the notification dialog
    setScheduledInterview(newInterview);

    // Show success message
    toast({
      title: "Interview Scheduled",
      description: `Interview with ${candidate} has been scheduled for ${formattedDate} at ${time}.`,
    });

    // Close the main dialog
    onOpenChange(false);

    // Reset form and submission state
    setIsSubmitting(false);
    setFormErrors({});

    // Open the notify dialog
    // setIsNotifyDialogOpen(true);
  };

  const handleNotifySend = () => {
    // Close both dialogs after sending notification
    setIsNotifyDialogOpen(false);
    onOpenChange(false);

    // Reset state
    setDate(undefined);
    setScheduledInterview(null);
    setSelectedCandidate(null);
    setSelectedApplication(null);
    setInterviewType("");
    setLocation("");
  };

  const handleCloseMainDialog = (isOpen) => {
    // Only allow closing if the notify dialog is not open
    if (!isNotifyDialogOpen) {
      onOpenChange(isOpen);
      setDate(undefined);
      setScheduledInterview(null);
      setSelectedCandidate(null);
      setSelectedApplication(null);
      setInterviewType("");
      setLocation("");
    }
  };

  useEffect(() => {
    if (calendarOpen) {
      const handleClickOutside = (e) => {
        const target = e.target;
        if (!target.closest(".react-calendar") && !target.closest("button")) {
          setCalendarOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [calendarOpen]);

  useEffect(() => {
    // Add the styles to the document
    const styleElement = document.createElement("style");
    styleElement.innerHTML = calendarStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={handleCloseMainDialog}>
        <DialogContent className="sm:max-w-[700px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Schedule Interview
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              Loading candidate and application data...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseMainDialog}>
        <DialogContent className="sm:max-w-[700px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Schedule Interview
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              Fill out the form below to schedule a new interview with a candidate.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <form
              id="schedule-interview-form"
              onSubmit={handleSubmit}
              className="space-y-6 py-2"
            >
              <div className="space-y-6">
                {/* Candidate and Application Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Candidate Information</h3>
                  </div>

                  <div>
                    <Label htmlFor="candidate" className="text-sm font-medium text-gray-700">
                      Candidate <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="candidate"
                      onValueChange={(value) => {
                        const [id, name] = value.split("|");
                        setSelectedCandidate(
                          candidates.find((c) => c.id === parseInt(id))
                        );
                      }}
                    >
                      <SelectTrigger
                        id="candidate"
                        className={cn(
                          "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                          formErrors.candidate && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select a candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates?.map((candidate) => (
                          <SelectItem
                            key={`candidate-${candidate.id}`}
                            value={`${candidate.id}|${candidate.name}`}
                          >
                            {candidate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.candidate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.candidate}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="application" className="text-sm font-medium text-gray-700">
                      Application <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="application"
                      disabled={!selectedCandidate}
                      onValueChange={(value) => {
                        setSelectedApplication(
                          applications.find((a) => a.id === parseInt(value))
                        );
                      }}
                    >
                      <SelectTrigger
                        id="application"
                        className={cn(
                          "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                          formErrors.application && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select job application" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidateApplications?.map((application) => (
                          <SelectItem
                            key={`application-${application.id}`}
                            value={application.id.toString()}
                          >
                            {application.job?.jobTitle || "Untitled Job"} -{" "}
                            {application.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.application && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.application}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                      Position <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="position"
                      disabled={!selectedCandidate}
                      value={
                        selectedApplication?.job?.jobTitle ||
                        selectedCandidate?.position ||
                        ""
                      }
                    >
                      <SelectTrigger
                        id="position"
                        className={cn(
                          "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                          formErrors.position && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedApplication?.job?.jobTitle && (
                          <SelectItem
                            key={`position-${selectedApplication.id}`}
                            value={selectedApplication.job.jobTitle}
                          >
                            {selectedApplication.job.jobTitle}
                          </SelectItem>
                        )}
                        {selectedCandidate?.position &&
                          !selectedApplication?.job?.jobTitle && (
                            <SelectItem
                              key={`position-${selectedCandidate.id}`}
                              value={selectedCandidate.position}
                            >
                              {selectedCandidate.position}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                    {formErrors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.position}
                      </p>
                    )}
                  </div>
                </div>

                {/* Interview Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Interview Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCalendarOpen(!calendarOpen)}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/80 border-gray-200 hover:bg-white/90",
                            !date && "text-gray-500",
                            formErrors.date && "border-red-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        {calendarOpen && (
                          <div className="absolute z-50 mt-1">
                            <Calendar
                              onChange={setDate}
                              value={date}
                              minDate={new Date()}
                              locale="en-IN"
                            />
                          </div>
                        )}
                      </div>
                      {formErrors.date && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.date}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                        Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="time"
                        id="time"
                        name="time"
                        className={cn(
                          "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                          formErrors.time && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                      {formErrors.time && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.time}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                        Interview Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        name="type"
                        onValueChange={setInterviewType}
                        value={interviewType}
                      >
                        <SelectTrigger
                          id="type"
                          className={cn(
                            "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                            formErrors.type && "border-red-500 focus:border-red-500 focus:ring-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select interview type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-blue-500" />
                              Video Interview
                            </div>
                          </SelectItem>
                          <SelectItem value="phone">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-500" />
                              Phone Interview
                            </div>
                          </SelectItem>
                          <SelectItem value="in-person">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-purple-500" />
                              In-Person Interview
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.type && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.type}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                        Duration (minutes)
                      </Label>
                      <Select name="duration" defaultValue="60">
                        <SelectTrigger
                          id="duration"
                          className="mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {interviewType === "video" && (
                    <div>
                      <Label htmlFor="meetingLink" className="text-sm font-medium text-gray-700">
                        Meeting Link <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="url"
                        id="meetingLink"
                        name="meetingLink"
                        placeholder="https://meet.google.com/..."
                        className={cn(
                          "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                          formErrors.meetingLink && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                      {formErrors.meetingLink && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.meetingLink}
                        </p>
                      )}
                    </div>
                  )}

                  {interviewType === "in-person" && (
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="location"
                        name="location"
                        placeholder="Office address or meeting room"
                        className={cn(
                          "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                          formErrors.location && "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                      {formErrors.location && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.location}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="interviewer" className="text-sm font-medium text-gray-700">
                      Interviewer <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="interviewer"
                      name="interviewer"
                      placeholder="Interviewer name"
                      className={cn(
                        "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                        formErrors.interviewer && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                    {formErrors.interviewer && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.interviewer}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Additional notes or instructions for the interview..."
                      className="mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DialogFooter className="pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCloseMainDialog(false)}
              className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="schedule-interview-form"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NotifyCandidateDialog
        open={isNotifyDialogOpen}
        onOpenChange={setIsNotifyDialogOpen}
        interview={scheduledInterview}
        onSend={handleNotifySend}
      />
    </>
  );
}
