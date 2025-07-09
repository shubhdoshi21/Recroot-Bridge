"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Video, ArrowRight, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInterviews } from "@/contexts/interviews-context";
import { useState } from "react";

export function UpcomingInterviews() {
  const router = useRouter();
  const { interviews = [], loading } = useInterviews();
  console.log(interviews);

  // Filter for upcoming interviews (status: 'upcoming' or interviewStatus: 'Scheduled'), limit to 4
  const displayInterviews = (Array.isArray(interviews) ? interviews : [])
    .filter(
      (interview) =>
        interview.status === "upcoming" ||
        interview.interviewStatus === "Scheduled"
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)
    .map((interview) => ({
      id: interview.id,
      candidate:
        interview.candidate ||
        interview.Candidate?.name ||
        (interview.Candidate &&
          (interview.Candidate.name || interview.Candidate.fullName)),
      position: interview.position,
      date: (() => {
        // Format date as 'Today', 'Tomorrow', or dd/mm/yyyy
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dateObj = new Date(interview.date);
        if (dateObj.toDateString() === today.toDateString()) return "Today";
        if (dateObj.toDateString() === tomorrow.toDateString())
          return "Tomorrow";
        return dateObj.toLocaleDateString();
      })(),
      time: interview.time,
      type: interview.type || "video",
      avatar:
        interview.avatar ||
        interview.Candidate?.avatar ||
        "/placeholder.svg?height=40&width=40",
      meetingLink: interview.meetingLink,
    }));

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4 border-b border-gray-200/50">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-gray-900">Upcoming Interviews</div>
            <div className="text-sm font-normal text-gray-600 mt-1">
              Scheduled meetings and calls
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayInterviews.length > 0 ? (
            displayInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming interviews</p>
              <p className="text-sm">Schedule interviews to see them here</p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="mt-6 w-full bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          onClick={() => router.push("/interviews")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          View All Interviews
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function InterviewCard({ interview }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative rounded-xl border-0 bg-white/60 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 transition-transform duration-300 group-hover:scale-110">
            <AvatarImage
              src={interview.avatar}
              alt={interview.candidate}
            />
            <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
              {interview.candidate?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-700 truncate">
              {interview.candidate}
            </h3>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {interview.position}
            </p>
          </div>
          {interview.type === "video" && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-200">
              <Video className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
              <CalendarIcon className="h-3 w-3" />
              <span className="font-medium">{interview.date}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
              <Clock className="h-3 w-3" />
              <span>{interview.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 transform transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  );
}
