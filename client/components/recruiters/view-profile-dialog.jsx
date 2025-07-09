"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  Building,
  Briefcase,
  Award,
  Calendar,
  Clock,
  Users,
  BarChart,
  Eye,
  Loader2,
  UserCheck,
  Target,
  Star,
} from "lucide-react";
import {
  getRecruiterById,
  getRecruiterJobs,
  getRecruiterPerformance,
} from "@/services/recruiterService";

export function ViewProfileDialog({
  open,
  onOpenChange,
  recruiter: initialData,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [recruiter, setRecruiter] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    if (open && initialData?.id) {
      console.log("ViewProfile dialog received initial data:", initialData);
      fetchRecruiterDetails(initialData.id);
    }
  }, [open, initialData?.id]);

  // Fetch detailed recruiter information
  const fetchRecruiterDetails = async (id) => {
    setLoading(true);
    try {
      const data = await getRecruiterById(id);
      setRecruiter(data);

      // Fetch performance data
      fetchRecruiterPerformance(id);

      // Fetch job assignments
      fetchRecruiterJobs(id);
    } catch (error) {
      console.log("Error fetching recruiter details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance metrics
  const fetchRecruiterPerformance = async (id) => {
    try {
      const data = await getRecruiterPerformance(id);
      setPerformance(data);
    } catch (error) {
      console.log("Error fetching recruiter performance:", error);
    }
  };

  // Fetch job assignments
  const fetchRecruiterJobs = async (id) => {
    setJobsLoading(true);
    try {
      const data = await getRecruiterJobs(id);
      console.log("[ViewProfileDialog] Fetched recruiter jobs:", {
        recruiterId: id,
        jobs: data.map((job) => ({
          id: job.jobId,
          title: job.Job?.jobTitle || job.Job?.title,
          status: job.Job?.jobStatus || job.Job?.status,
          department: job.Job?.department,
          type: job.Job?.jobType,
          location: job.Job?.location,
          candidatesReviewed: job.candidatesReviewed,
          assignedDate: job.assignedDate,
          assignedBy: job.assignedBy,
        })),
      });
      setJobs(data);
    } catch (error) {
      console.log("[ViewProfileDialog] Error fetching recruiter jobs:", error);
    } finally {
      setJobsLoading(false);
    }
  };

  if (!recruiter) return null;

  // Calculate performance metrics from backend data or use defaults
  const hireRate = performance
    ? ((performance.hires / performance.candidatesReviewed) * 100).toFixed(1)
    : ((recruiter.hires / (recruiter.candidates || 1)) * 100).toFixed(1);

  const avgTimeToHire = performance
    ? performance.timeToHire.toFixed(1)
    : "18.5"; // Default value if not available

  const candidatesSatisfaction = performance
    ? `${(performance.candidateSatisfactionRate * 100).toFixed(0)}%`
    : "92%"; // Default value if not available

  // Handle status display with enhanced styling
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-300 shadow-sm";
      case "on_leave":
      case "on leave":
        return "bg-amber-50 text-amber-700 border-amber-300 shadow-sm";
      case "inactive":
        return "bg-red-50 text-red-700 border-red-300 shadow-sm";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300 shadow-sm";
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    // Handle snake_case to title case
    if (status.includes("_")) {
      return status
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }

    // Handle camelCase or lowercase
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Add helper functions to get contact information
  const getEmail = (recruiter) => {
    return recruiter.email || recruiter.User?.email || "No email provided";
  };

  const getPhone = (recruiter) => {
    return recruiter.phone || recruiter.User?.phone || "No phone provided";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-6 -m-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Recruiter Profile</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Detailed information about {recruiter.firstName || recruiter.User?.firstName || ""}{" "}
                {recruiter.lastName || recruiter.User?.lastName || ""}'s profile and performance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">Loading recruiter details...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch the information</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 ring-4 ring-blue-100 shadow-lg">
                  <AvatarImage
                    src={
                      recruiter.profilePicture ||
                      `/placeholder.svg?height=128&width=128&text=${(
                        recruiter.firstName ||
                        recruiter.User?.firstName ||
                        "?"
                      ).charAt(0)}`
                    }
                    alt={`${recruiter.firstName || recruiter.User?.firstName || ""
                      } ${recruiter.lastName || recruiter.User?.lastName || ""
                      }`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-3xl">
                    {(
                      recruiter.firstName ||
                      recruiter.User?.firstName ||
                      "?"
                    ).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">
                  {recruiter.firstName || recruiter.User?.firstName || ""}{" "}
                  {recruiter.lastName || recruiter.User?.lastName || ""}
                </h2>
                <Badge
                  variant="outline"
                  className={`mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105 ${getStatusColor(recruiter.status)}`}
                >
                  <UserCheck className="h-4 w-4" />
                  {formatStatus(recruiter.status)}
                </Badge>
              </div>

              <div className="flex-1 space-y-6">
                {/* Contact Information */}
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-gray-900">{getEmail(recruiter)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50">
                        <Phone className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Phone</p>
                          <p className="text-gray-900">{getPhone(recruiter)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50">
                        <Building className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Department</p>
                          <p className="text-gray-900">{recruiter.department || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50/50">
                        <Target className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Specialization</p>
                          <p className="text-gray-900">{recruiter.specialization || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-blue-500 rounded-full">
                          <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">Active Jobs</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {recruiter.activeJobs || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-green-500 rounded-full">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">Candidates</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {recruiter.candidates || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-purple-500 rounded-full">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">Hires</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {recruiter.hires || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1 rounded-lg">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md transition-all duration-200"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 rounded-md transition-all duration-200"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="assignments"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 rounded-md transition-all duration-200"
                >
                  Assignments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {recruiter.firstName || recruiter.User?.firstName || ""}{" "}
                      {recruiter.lastName || recruiter.User?.lastName || ""} is
                      a {recruiter.specialization} specialist in the{" "}
                      {recruiter.department} department. They are currently
                      managing {recruiter.activeJobs || 0} active job openings
                      with {recruiter.candidates || 0} candidates in the
                      pipeline and have successfully hired{" "}
                      {recruiter.hires || 0} candidates.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50/50">
                        <Calendar className="h-6 w-6 text-blue-500 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">Scheduled 3 interviews</p>
                          <p className="text-sm text-gray-600">
                            Yesterday at 2:30 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50/50">
                        <Users className="h-6 w-6 text-green-500 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">Added 5 new candidates</p>
                          <p className="text-sm text-gray-600">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50/50">
                        <Briefcase className="h-6 w-6 text-purple-500 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Posted 2 new job openings
                          </p>
                          <p className="text-sm text-gray-600">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-blue-500 rounded-full">
                          <BarChart className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">Hire Rate</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {hireRate}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-green-500 rounded-full">
                          <Clock className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          Avg. Time to Hire
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          {avgTimeToHire} days
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-purple-500 rounded-full">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          Candidate Satisfaction
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          {candidatesSatisfaction}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-blue-500" />
                      Performance Trends
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">Performance chart would be displayed here</p>
                        <p className="text-sm text-gray-400">Interactive analytics coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignments" className="mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-purple-500" />
                      Current Job Assignments
                    </h3>
                    {jobsLoading ? (
                      <div className="flex flex-col items-center justify-center p-8 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <div className="text-center">
                          <p className="text-lg font-medium text-gray-700">Loading assignments...</p>
                          <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
                        </div>
                      </div>
                    ) : jobs.length > 0 ? (
                      <div className="space-y-4">
                        {jobs.map((job, index) => (
                          <div
                            key={job.jobId || index}
                            className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {job.Job?.jobTitle ||
                                  job.Job?.title ||
                                  "Untitled Job"}
                              </p>
                              <div className="text-sm text-gray-600 space-y-1 mt-1">
                                <div className="flex items-center gap-4 flex-wrap">
                                  {job.Job?.department && (
                                    <span className="inline-flex items-center gap-1">
                                      <Building className="h-3 w-3" />
                                      <span className="font-medium">{job.Job.department}</span>
                                    </span>
                                  )}
                                  {job.Job?.jobType && (
                                    <span className="inline-flex items-center gap-1">
                                      <Briefcase className="h-3 w-3" />
                                      <span>{job.Job.jobType}</span>
                                    </span>
                                  )}
                                  {job.Job?.location && (
                                    <span className="inline-flex items-center gap-1">
                                      <span>📍</span>
                                      <span>{job.Job.location}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {job.candidatesReviewed || 0} candidates
                              </div>
                              <div className="text-xs text-gray-500">
                                Assigned {job.assignedDate ? new Date(job.assignedDate).toLocaleDateString() : "Recently"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 gap-3">
                        <Briefcase className="h-12 w-12 text-gray-300" />
                        <div className="text-center">
                          <p className="text-lg font-medium text-gray-700">No job assignments</p>
                          <p className="text-sm text-gray-500">This recruiter hasn't been assigned to any jobs yet</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
