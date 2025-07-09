"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, Phone, MapPin, MoreHorizontal, Eye } from "lucide-react";
import { AllInterviewsDialog } from "./all-interviews-dialog";
import { useInterviews } from "@/contexts/interviews-context";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UpcomingInterviews() {
  const { interviews = [], loading } = useInterviews();
  const [isAllInterviewsDialogOpen, setIsAllInterviewsDialogOpen] =
    useState(false);

  useEffect(() => {
    console.log("[UpcomingInterviews] Component mounted");
    console.log("[UpcomingInterviews] Initial interviews:", interviews);
    console.log("[UpcomingInterviews] Loading state:", loading);
  }, []);

  useEffect(() => {
    console.log("[UpcomingInterviews] Interviews updated:", interviews);
  }, [interviews]);

  // Get icon based on interview type
  const getTypeIcon = (interviewType) => {
    console.log(
      "[UpcomingInterviews] Getting icon for interview type:",
      interviewType
    );
    switch (interviewType) {
      case "video":
        return <Video className="h-3 w-3" />;
      case "phone":
        return <Phone className="h-3 w-3" />;
      case "in-person":
        return <MapPin className="h-3 w-3" />;
      default:
        console.warn(
          "[UpcomingInterviews] Unknown interview type:",
          interviewType
        );
        return <Video className="h-3 w-3" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    console.log("[UpcomingInterviews] Formatting date:", dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = new Date(dateString);
    console.log("[UpcomingInterviews] Parsed date:", date);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      console.log("[UpcomingInterviews] Formatted date:", formattedDate);
      return formattedDate;
    }
  };

  // Check if interview was created in the last hour
  const isNewInterview = (createdAt) => {
    console.log(
      "[UpcomingInterviews] Checking if interview is new. Created at:",
      createdAt
    );
    const isNew = Date.now() - createdAt < 3600000; // 1 hour in milliseconds
    console.log("[UpcomingInterviews] Is new interview:", isNew);
    return isNew;
  };

  // Filter and sort upcoming interviews
  const upcomingInterviews = interviews
    ?.filter((interview) => {
      console.log("[UpcomingInterviews] Filtering interview:", interview);
      return interview?.interviewStatus === "Scheduled";
    })
    .sort((a, b) => {
      console.log("[UpcomingInterviews] Sorting interviews:", { a, b });
      return new Date(a.date) - new Date(b.date);
    });

  console.log(
    "[UpcomingInterviews] Filtered and sorted interviews:",
    upcomingInterviews
  );

  if (loading) {
    console.log("[UpcomingInterviews] Rendering loading state");
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-900">Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl animate-pulse bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("[UpcomingInterviews] Rendering main component");

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 max-h-[90vh] overflow-hidden flex flex-col">
      <CardHeader className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Upcoming Interviews</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAllInterviewsDialogOpen(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        {upcomingInterviews?.length > 0 ? (
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => {
              console.log(
                "[UpcomingInterviews] Rendering interview:",
                interview
              );
              return (
                <div
                  key={interview.id}
                  className={`p-4 border rounded-xl transition-all duration-300 hover:shadow-md ${isNewInterview(interview.createdAt)
                    ? "border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 hover:from-blue-100/50 hover:to-indigo-100/30"
                    : "border-gray-100 bg-white/60 hover:bg-white/80"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage
                          src={interview.Candidate?.avatar}
                          alt={interview.Candidate?.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                          {interview.Candidate?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {interview.Candidate?.name}
                          </h3>
                          {isNewInterview(interview.createdAt) && (
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] h-4 px-2"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {interview.position}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(interview.date)}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {interview.time}
                      </div>
                    </div>
                    {(interview.interviewType || interview.type) === "video" &&
                      interview.meetingLink ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        onClick={() => window.open(interview.meetingLink, "_blank")}
                      >
                        Join
                      </Button>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        {getTypeIcon(interview.interviewType || interview.type)}
                        <span className="ml-1 capitalize">
                          {interview.interviewType || interview.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-50/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming interviews</h3>
            <p className="text-gray-500 mb-4">Schedule your first interview to get started</p>
            <Button
              variant="outline"
              className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        )}
      </CardContent>

      <AllInterviewsDialog
        open={isAllInterviewsDialogOpen}
        onOpenChange={setIsAllInterviewsDialogOpen}
      />
    </Card>
  );
}
