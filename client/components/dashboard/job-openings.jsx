"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Users, ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useJobs } from "@/contexts/jobs-context";
import { useState } from "react";

export function JobOpenings() {
  const router = useRouter();
  const { jobs = [], filters = {} } = useJobs();
  console.log(jobs);

  // Filtering logic copied from jobs-list.jsx
  const normalizeForComparison = (value) => {
    if (!value) return "";
    return value.toLowerCase().replace(/\s+/g, "-");
  };

  const filteredJobs = jobs.filter((job) => {
    if (!job) return false;
    // Status filter
    if (filters.status && filters.status !== "all") {
      const jobStatus =
        job.jobStatus?.toLowerCase() || job.status?.toLowerCase();
      if (filters.status === "active" && jobStatus !== "active") return false;
      if (filters.status === "draft" && jobStatus !== "draft") return false;
      if (filters.status === "closed" && jobStatus !== "closed") return false;
      if (filters.status === "new" && jobStatus !== "new") return false;
      if (filters.status === "closing-soon" && jobStatus !== "closing-soon")
        return false;
    }
    // Department filter
    if (filters.departments?.length > 0) {
      const normalizedDepartment = normalizeForComparison(job.department);
      if (!filters.departments.includes(normalizedDepartment)) return false;
    }
    // Location filter
    if (filters.locations?.length > 0) {
      const normalizedLocation = normalizeForComparison(job.location);
      if (!filters.locations.includes(normalizedLocation)) return false;
    }
    // Job type filter
    if (filters.types?.length > 0) {
      const jobType = job.type || job.jobType;
      const normalizedType = normalizeForComparison(jobType);
      if (!jobType || !filters.types.includes(normalizedType)) {
        return false;
      }
    }
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        (job.title || job.jobTitle || "")?.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        (job.type || job.jobType || "")?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Map jobs to the UI format (limit to 4 for dashboard)
  const displayJobs = filteredJobs.slice(0, 4).map((job) => {
    // Status color mapping (copied from jobs-list.jsx and jobUtils)
    const statusColorMap = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      "closing soon": "bg-amber-50 text-amber-700 border-amber-200",
      "closing-soon": "bg-amber-50 text-amber-700 border-amber-200",
      new: "bg-blue-50 text-blue-700 border-blue-200",
      closed: "bg-gray-50 text-gray-700 border-gray-200",
      draft: "bg-gray-50 text-gray-700 border-gray-200",
    };
    const status = job.jobStatus || job.status || "Active";
    // Normalize status for color
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");
    return {
      id: job.id,
      title: job.jobTitle || job.title,
      department: job.department,
      location: job.location,
      applicants: job.applicants || job.applications || 0,
      status: status.charAt(0).toUpperCase() + status.slice(1),
      statusColor:
        statusColorMap[normalizedStatus] || "bg-gray-50 text-gray-700 border-gray-200",
    };
  });

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4 border-b border-gray-200/50">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="text-gray-900">Job Openings</div>
            <div className="text-sm font-normal text-gray-600 mt-1">
              Active positions and applications
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayJobs.length > 0 ? (
            displayJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No job openings found</p>
              <p className="text-sm">Create your first job posting to get started</p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="mt-6 w-full bg-white/80 backdrop-blur-sm border-indigo-200 hover:bg-indigo-50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          onClick={() => router.push("/jobs")}
        >
          <Briefcase className="mr-2 h-4 w-4" />
          View All Jobs
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function JobCard({ job }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative rounded-xl border-0 bg-white/60 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-indigo-700 truncate">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {job.department}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${job.statusColor} transition-all duration-300 group-hover:scale-105`}
        >
          {job.status}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1 transition-colors duration-300 group-hover:text-gray-700">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1 transition-colors duration-300 group-hover:text-gray-700">
          <Users className="h-3 w-3" />
          <span>{job.applicants} applicants</span>
        </div>
      </div>

      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 transform transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  );
}
