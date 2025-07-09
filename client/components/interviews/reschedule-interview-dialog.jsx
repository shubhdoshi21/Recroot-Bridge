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
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useInterviews } from "@/contexts/interviews-context";
import { useToast } from "@/hooks/use-toast";

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

export function RescheduleInterviewDialog({ open, onOpenChange, interviewId }) {
  const { interviews, rescheduleInterview } = useInterviews();
  const { toast } = useToast();
  const [date, setDate] = useState();
  const [interview, setInterview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Load interview data when dialog opens
  useEffect(() => {
    if (open && interviewId) {
      const interviewData = interviews.find((i) => i.id === interviewId);
      if (interviewData) {
        setInterview(interviewData);
        // Parse the date string to Date object
        if (interviewData.date) {
          // Try both ISO and yyyy-MM-dd formats
          let parsedDate;
          try {
            parsedDate = parse(interviewData.date, "yyyy-MM-dd", new Date());
            if (isNaN(parsedDate)) {
              parsedDate = new Date(interviewData.date);
            }
          } catch {
            parsedDate = new Date(interviewData.date);
          }
          setDate(parsedDate);
        }
        setMeetingLink(interviewData.meetingLink || "");
        setLocation(interviewData.location || "");
        setInterviewType(
          interviewData.interviewType || interviewData.type || ""
        );
      }
    } else {
      // Reset form when dialog closes
      setInterview(null);
      setDate(undefined);
      setFormErrors({});
      setMeetingLink("");
      setLocation("");
      setInterviewType("");
    }
  }, [open, interviewId, interviews]);

  useEffect(() => {
    if (calendarOpen) {
      const handleClickOutside = (e) => {
        const target = e.target;
        if (!target.closest(".react-calendar") && !target.closest("button")) {
          setCalendarOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!interview || !interviewId) return;

    // Get form data
    const formData = new FormData(e.target);
    const time = formData.get("time");
    const type = formData.get("type");
    const duration = formData.get("duration");
    const interviewer = formData.get("interviewer");

    // Validate form
    const errors = {};
    if (!date) errors.date = "Date is required";
    if (!time) errors.time = "Time is required";
    if (!interviewType) errors.type = "Interview type is required";
    if (!interviewer) errors.interviewer = "Interviewer is required";
    if (interviewType === "in-person" && !location)
      errors.location = "Location is required for in-person interviews";
    if (interviewType === "video" && !meetingLink)
      errors.meetingLink = "Meeting link is required for video interviews";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    // Format date as YYYY-MM-DD
    const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

    try {
      await rescheduleInterview(interviewId, {
        date: formattedDate,
        time,
        interviewType,
        duration,
        interviewer,
        meetingLink: interviewType === "video" ? meetingLink : undefined,
        location: interviewType === "in-person" ? location : undefined,
      });
      toast({
        title: "Interview Rescheduled",
        description: `Interview with ${interview.Candidate?.name || interview.candidate
          } has been rescheduled for ${formattedDate} at ${time}.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reschedule interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!interview) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Reschedule Interview
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Update the details to reschedule this interview with{' '}
            <span className="font-semibold text-gray-900">{interview.Candidate?.name || interview.candidate}</span>.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form
            id="reschedule-interview-form"
            onSubmit={handleSubmit}
            className="space-y-6 py-2"
          >
            <div className="space-y-6">
              {/* Interview Details Section */}
              <div className="bg-gray-50/50 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Candidate</Label>
                    <div className="p-2 border rounded-md bg-white/80 text-gray-900 font-semibold">
                      {interview.Candidate?.name || interview.candidate}
                    </div>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <div className="p-2 border rounded-md bg-white/80 text-gray-900 font-semibold">
                      {interview.position}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reschedule Form Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">
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
                  <Label htmlFor="time">
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    defaultValue={interview.time}
                    className={cn(
                      "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full px-3 py-2",
                      formErrors.time && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {formErrors.time && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">
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
                      <SelectItem value="video">Video Interview</SelectItem>
                      <SelectItem value="phone">Phone Interview</SelectItem>
                      <SelectItem value="in-person">In-Person Interview</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.type && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select name="duration" defaultValue={interview.duration || "60"}>
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
                  <Label htmlFor="meetingLink">
                    Meeting Link <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="url"
                    id="meetingLink"
                    name="meetingLink"
                    value={meetingLink}
                    onChange={e => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className={cn(
                      "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full px-3 py-2",
                      formErrors.meetingLink && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {formErrors.meetingLink && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.meetingLink}</p>
                  )}
                </div>
              )}

              {interviewType === "in-person" && (
                <div>
                  <Label htmlFor="location">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Office address or meeting room"
                    className={cn(
                      "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full px-3 py-2",
                      formErrors.location && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {formErrors.location && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="interviewer">
                  Interviewer <span className="text-red-500">*</span>
                </Label>
                <input
                  type="text"
                  id="interviewer"
                  name="interviewer"
                  defaultValue={interview.interviewer}
                  placeholder="Interviewer name"
                  className={cn(
                    "mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full px-3 py-2",
                    formErrors.interviewer && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {formErrors.interviewer && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.interviewer}</p>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="reschedule-interview-form"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? "Rescheduling..." : "Reschedule Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
