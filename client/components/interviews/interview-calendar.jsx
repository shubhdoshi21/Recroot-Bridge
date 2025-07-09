"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, MapPin, Video, Calendar as CalendarIcon } from "lucide-react";
import { useInterviews } from "@/contexts/interviews-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export function InterviewCalendar() {
  const { interviews } = useInterviews();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("day");
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // Get all active interviews (upcoming and completed)
  const activeInterviews = interviews.filter(
    (interview) =>
      interview.interviewStatus === "Scheduled" ||
      interview.interviewStatus === "Completed"
  );

  // Function to safely parse a date
  const safeParseDate = (dateString) => {
    if (!dateString) return null;

    try {
      const parsedDate = new Date(dateString);
      // Check if the date is valid
      if (isNaN(parsedDate.getTime())) {
        return null;
      }
      return parsedDate;
    } catch (error) {
      console.log("Error parsing date:", error);
      return null;
    }
  };

  // Function to check if a date has interviews
  const hasInterviewsOnDate = (day) => {
    if (!day) return false;

    return activeInterviews.some((interview) => {
      const interviewDate = safeParseDate(interview.date);
      if (!interviewDate) return false;

      return (
        interviewDate.getDate() === day.getDate() &&
        interviewDate.getMonth() === day.getMonth() &&
        interviewDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Get interviews for the selected day
  const getDayInterviews = (selectedDate) => {
    if (!selectedDate) return [];

    return activeInterviews
      .filter((interview) => {
        const interviewDate = safeParseDate(interview.date);
        if (!interviewDate) return false;

        return (
          interviewDate.getDate() === selectedDate.getDate() &&
          interviewDate.getMonth() === selectedDate.getMonth() &&
          interviewDate.getFullYear() === selectedDate.getFullYear()
        );
      })
      .sort((a, b) => {
        // Sort by time, with fallback for invalid times
        try {
          const timeA = a.time ? new Date(`1970/01/01 ${a.time}`).getTime() : 0;
          const timeB = b.time ? new Date(`1970/01/01 ${b.time}`).getTime() : 0;
          return timeA - timeB;
        } catch (error) {
          return 0; // Default to no change in order if there's an error
        }
      });
  };

  // Get the interview type icon
  const getInterviewTypeIcon = (type) => {
    if (!type) return <Clock className="h-3.5 w-3.5 text-gray-500" />;
    switch (type.toLowerCase()) {
      case "video":
        return <Video className="h-3.5 w-3.5 text-blue-500" />;
      case "phone":
        return <Clock className="h-3.5 w-3.5 text-green-500" />;
      case "in-person":
        return <MapPin className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  // Custom tile content to highlight dates with interviews
  const tileContent = ({ date, view }) => {
    if (view === "month" && hasInterviewsOnDate(date)) {
      return (
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mt-1 shadow-sm"></div>
      );
    }
    return null;
  };

  // Custom class for tiles
  const tileClassName = ({ date, view }) => {
    if (view === "month" && hasInterviewsOnDate(date)) {
      return "interview-date font-semibold bg-gradient-to-r from-blue-50/50 to-indigo-50/30 hover:from-blue-100/50 hover:to-indigo-100/30";
    }
    return null;
  };

  // Handle date change
  const handleDateChange = (value) => {
    if (value instanceof Date) {
      setDate(value);
      setView("day");
      // Do not update activeStartDate here, so month navigation is independent
    }
  };

  // Navigate to previous month
  const navigatePrevMonth = () => {
    const newDate = new Date(activeStartDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setActiveStartDate(newDate);
    setView("month");
  };

  // Navigate to next month
  const navigateNextMonth = () => {
    const newDate = new Date(activeStartDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setActiveStartDate(newDate);
    setView("month");
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 max-h-[90vh] overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 w-full">
          <CardTitle className="text-xl font-semibold text-gray-900">Interview Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("day")}
              className={cn(
                view === "day"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                  : "bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
              )}
            >
              Day
            </Button>
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("month")}
              className={cn(
                view === "month"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                  : "bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
              )}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Calendar Card */}
          <div className="w-full lg:w-[370px] flex-shrink-0">
            <div className="rounded-2xl border border-gray-100 bg-white/70 shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigatePrevMonth}
                  className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeStartDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateNextMonth}
                  className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Calendar
                onChange={handleDateChange}
                value={date}
                activeStartDate={activeStartDate}
                onActiveStartDateChange={({ activeStartDate }) =>
                  setActiveStartDate(activeStartDate)
                }
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="w-full border-none rounded-xl"
                prevLabel=""
                nextLabel=""
                prev2Label=""
                next2Label=""
                navigationLabel={({ date }) =>
                  date.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                }
                formatShortWeekday={(locale, date) =>
                  date.toLocaleDateString(locale, { weekday: "short" })
                }
                tileDisabled={({ date }) => date < new Date()}
              />
            </div>
          </div>

          {/* Interview List Card */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-gray-100 bg-white/70 shadow-md p-6 h-full flex flex-col">
              {view === "day" && (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Interviews for {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    {getDayInterviews(date).length > 0 ? (
                      <div className="space-y-3">
                        {getDayInterviews(date).map((interview) => (
                          <div
                            key={interview.id}
                            className="p-4 border border-gray-100 rounded-xl bg-white/80 hover:bg-white/90 transition-all duration-200 hover:shadow-md"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                  {getInterviewTypeIcon(interview.interviewType || interview.type)}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {interview.Candidate?.name || "Unknown Candidate"}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {interview.position || "No position specified"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {interview.time || "No time specified"}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    interview.interviewStatus === "Scheduled"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : "bg-green-100 text-green-800 border-green-200"
                                  )}
                                >
                                  {interview.interviewStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 py-16">
                        <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-md">
                          <CalendarIcon className="h-10 w-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No interviews scheduled</h3>
                        <p className="text-gray-500 text-base">This day is free for scheduling new interviews</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
