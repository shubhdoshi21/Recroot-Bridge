"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, User, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCandidates } from "@/contexts/candidates-context";
import { useState } from "react";

export function RecentCandidates() {
  const router = useRouter();
  const { candidates = [], isLoading } = useCandidates();

  // Map candidates to the UI format (limit to 4 for dashboard)
  const displayCandidates = (Array.isArray(candidates) ? candidates : [])
    .slice(0, 4)
    .map((candidate) => {
      // Status color mapping (copied from candidates-list-old.jsx)
      const statusColorMap = {
        Applied: "bg-purple-50 text-purple-700 border-purple-200",
        Screening: "bg-amber-50 text-amber-700 border-amber-200",
        Assessment: "bg-indigo-50 text-indigo-700 border-indigo-200",
        Interview: "bg-blue-50 text-blue-700 border-blue-200",
        Offer: "bg-green-50 text-green-700 border-green-200",
        Hired: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Rejected: "bg-red-50 text-red-700 border-red-200",
      };
      const status = candidate.status || "Applied";
      return {
        id: candidate.id,
        name:
          candidate.name ||
          candidate.fullName ||
          candidate.firstName + " " + candidate.lastName,
        position: candidate.position || candidate.title,
        status,
        date: candidate.createdAt
          ? new Date(candidate.createdAt).toLocaleDateString()
          : candidate.date || "-",
        avatar: candidate.avatar || "/placeholder.svg?height=40&width=40",
        statusColor: statusColorMap[status] || "bg-gray-50 text-gray-700 border-gray-200",
      };
    });

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4 border-b border-gray-200/50">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-gray-900">Recent Candidates</div>
            <div className="text-sm font-normal text-gray-600 mt-1">
              Latest applications and profiles
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayCandidates.length > 0 ? (
            displayCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No candidates found</p>
              <p className="text-sm">Add candidates to see them here</p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="mt-6 w-full bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          onClick={() => router.push("/candidates")}
        >
          <Users className="mr-2 h-4 w-4" />
          View All Candidates
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function CandidateCard({ candidate }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative rounded-xl border-0 bg-white/60 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 transition-transform duration-300 group-hover:scale-110">
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {candidate.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700 truncate">
              {candidate.name}
            </p>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {candidate.position}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${candidate.statusColor} transition-all duration-300 group-hover:scale-105`}
          >
            {candidate.status}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
            <Calendar className="h-3 w-3" />
            <span>{candidate.date}</span>
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  );
}
