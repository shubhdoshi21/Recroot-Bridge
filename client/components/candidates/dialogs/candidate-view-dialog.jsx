"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Briefcase,
  Building2,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Clock,
  User,
  UserCheck,
  Calendar,
  Star,
  Award,
  GraduationCap,
  Activity,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useCandidates } from "@/contexts/candidates-context";
import { cn } from "@/lib/utils";
import { statusColorMap } from "@/lib/constants";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/config/api";

export function CandidateViewDialog({
  isOpen,
  onOpenChange,
  candidate,
  onEditJobs,
}) {
  const [activeTab, setActiveTab] = useState("details");
  const { getCandidateJobs } = useCandidates();
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [resumeMeta, setResumeMeta] = useState(null);
  const [freshCandidate, setFreshCandidate] = useState(candidate);

  // Fetch latest candidate data by ID when dialog opens
  useEffect(() => {
    if (isOpen && candidate?.id) {
      fetch(api.candidates.getById(candidate.id), { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setFreshCandidate(data);
        });
    } else {
      setFreshCandidate(candidate);
    }
  }, [isOpen, candidate?.id]);

  // Fetch jobs when jobs tab is selected
  useEffect(() => {
    const fetchJobs = async () => {
      if (activeTab === "jobs" && candidate?.id) {
        try {
          setIsLoadingJobs(true);
          const jobs = await getCandidateJobs(candidate.id);
          setAssignedJobs(jobs);
        } catch (error) {
          console.log("Error fetching candidate jobs:", error);
        } finally {
          setIsLoadingJobs(false);
        }
      }
    };

    fetchJobs();
  }, [activeTab, candidate?.id, getCandidateJobs]);

  useEffect(() => {
    if (isOpen && candidate?.id) {
      fetch(api.candidates.getResume(candidate.id), { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setResumeMeta(data))
        .catch(() => setResumeMeta(null));
    } else {
      setResumeMeta(null);
    }
  }, [isOpen, candidate]);

  if (!freshCandidate) return null;

  // Find the earliest application date
  const earliestDate =
    freshCandidate.CandidateJobMaps &&
      freshCandidate.CandidateJobMaps.some(
        (jobMap) => jobMap.status === "applicant"
      )
      ? new Date(
        Math.min(
          ...freshCandidate.CandidateJobMaps.filter(
            (jobMap) => jobMap.status === "applicant"
          ).map((jobMap) => new Date(jobMap.assignedDate))
        )
      )
      : null;

  // Determine candidate status for Application tab
  const candidateStatus =
    freshCandidate.CandidateJobMaps &&
      freshCandidate.CandidateJobMaps.some(
        (jobMap) => jobMap.status === "applicant"
      )
      ? "Applicant"
      : "Candidate";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-blue-100 shadow-lg">
              <AvatarImage
                src={freshCandidate.avatar || "/placeholder.svg"}
                alt={freshCandidate.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                {freshCandidate.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {freshCandidate.name}
              </DialogTitle>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span className="text-lg font-semibold text-gray-700">
                    {freshCandidate.position}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border-2
                    ${candidateStatus === "Applicant"
                      ? "bg-green-50 text-green-700 border-green-300 shadow-sm"
                      : "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                    }
                  `}
                >
                  {candidateStatus === "Applicant" ? (
                    <UserCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                  {candidateStatus}
                </Badge>
              </div>
              <DialogDescription className="text-gray-600">
                Detailed information about the candidate's profile, skills, and application status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <Tabs
            defaultValue="details"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-6 p-1 bg-gray-100/50 rounded-xl">
              <TabsTrigger
                value="details"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Details</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Skills</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="application"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Application</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="resume"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Resume</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Jobs</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="source"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">Source</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/30 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Mail className="h-5 w-5 text-blue-500" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                        <p className="text-sm font-medium text-gray-900">{freshCandidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <Phone className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {freshCandidate.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {freshCandidate.location || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50/30 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Briefcase className="h-5 w-5 text-green-500" />
                      Professional Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <Briefcase className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Position</p>
                        <p className="text-sm font-medium text-gray-900">{freshCandidate.position}</p>
                      </div>
                    </div>
                    {freshCandidate.currentCompany && (
                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Company</p>
                          <p className="text-sm font-medium text-gray-900">{freshCandidate.currentCompany}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Experience</p>
                        <p className="text-sm font-medium text-gray-900">
                          {typeof freshCandidate.totalExperience === "number"
                            ? `${Math.floor(freshCandidate.totalExperience / 12)} years, ${freshCandidate.totalExperience % 12} months`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                    {earliestDate && (
                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Application</p>
                          <p className="text-sm font-medium text-gray-900">
                            {earliestDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Information */}
              {(freshCandidate.education || freshCandidate.certifications || freshCandidate.extraCurricularActivities) && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50/30 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Award className="h-5 w-5 text-purple-500" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {freshCandidate.education && (
                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Education</p>
                          <p className="text-sm font-medium text-gray-900">Available</p>
                        </div>
                      </div>
                    )}
                    {freshCandidate.certifications && (
                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Certifications</p>
                          <p className="text-sm font-medium text-gray-900">Available</p>
                        </div>
                      </div>
                    )}
                    {freshCandidate.extraCurricularActivities && (
                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                        <Activity className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activities</p>
                          <p className="text-sm font-medium text-gray-900">Available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="skills" className="space-y-4 mt-4">
              <div>
                <Label className="text-sm text-gray-500">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(() => {
                    // Get skills from multiple possible sources
                    const skills = [];

                    // From Skills association (many-to-many)
                    if (
                      freshCandidate.Skills &&
                      Array.isArray(freshCandidate.Skills)
                    ) {
                      skills.push(
                        ...freshCandidate.Skills.map((skill) => skill.title)
                      );
                    }

                    // From CandidateSkillMaps (with Skill object)
                    if (
                      freshCandidate.CandidateSkillMaps &&
                      Array.isArray(freshCandidate.CandidateSkillMaps)
                    ) {
                      freshCandidate.CandidateSkillMaps.forEach((skillMap) => {
                        if (skillMap.Skill && skillMap.Skill.title) {
                          skills.push(skillMap.Skill.title);
                        }
                      });
                    }

                    // Remove duplicates
                    const uniqueSkills = [...new Set(skills)];

                    return uniqueSkills.length > 0 ? (
                      uniqueSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill.charAt(0).toUpperCase() + skill.slice(1)}
                        </Badge>
                      ))
                    ) : (
                      <p>No skills listed</p>
                    );
                  })()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="application" className="space-y-4 mt-4">
              <TooltipProvider>
                <Card className="bg-gray-50 border-none shadow-none mb-2">
                  <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                        Application Date
                      </span>
                      <span className="text-lg font-medium text-gray-900">
                        {earliestDate ? earliestDate.toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                        Current Status
                      </span>
                      <Badge
                        variant="outline"
                        className="text-base px-3 py-1 rounded-full border-blue-200 bg-blue-50 text-blue-700 font-semibold"
                      >
                        {candidateStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-4 mt-2">
                  {freshCandidate.CandidateJobMaps &&
                    freshCandidate.CandidateJobMaps.length > 0 ? (
                    freshCandidate.CandidateJobMaps.map((jobMap) => {
                      let scores = null;
                      if (jobMap.scores) {
                        try {
                          scores =
                            typeof jobMap.scores === "string"
                              ? JSON.parse(jobMap.scores)
                              : jobMap.scores;
                        } catch (e) {
                          scores = null;
                        }
                      }
                      let stages = [];
                      try {
                        if (typeof jobMap.applicationStages === "string") {
                          stages = JSON.parse(jobMap.applicationStages);
                        } else if (Array.isArray(jobMap.applicationStages)) {
                          stages = jobMap.applicationStages;
                        }
                      } catch (e) { }
                      return (
                        <Card
                          key={jobMap.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex items-center gap-2 text-base font-medium truncate">
                                <Briefcase className="h-4 w-4 text-blue-500" />
                                <span className="truncate">
                                  {jobMap.job?.jobTitle ||
                                    jobMap.Job?.jobTitle ||
                                    jobMap.jobTitle ||
                                    "Untitled Job"}
                                </span>
                              </div>
                              {jobMap.job?.company?.name && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Building2 className="h-4 w-4 text-gray-400" />
                                  <span>{jobMap.job.company.name}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                              <Badge
                                variant="outline"
                                className={
                                  jobMap.status === "Rejected"
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : jobMap.status === "Hired"
                                      ? "bg-green-50 text-green-600 border-green-200"
                                      : "bg-blue-50 text-blue-600 border-blue-200"
                                }
                              >
                                {jobMap.status}
                              </Badge>
                              {stages && stages.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  Stage {jobMap.currentStage || 1} of{" "}
                                  {stages.length}
                                </span>
                              )}
                              {scores && Object.keys(scores).length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="flex items-center gap-1 cursor-pointer"
                                    >
                                      <BarChart3 className="h-3 w-3 text-gray-500" />{" "}
                                      Scores
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    align="end"
                                    sideOffset={8}
                                    className="max-w-xs break-words"
                                  >
                                    <div className="text-left">
                                      <span className="font-semibold">
                                        Scores:
                                      </span>
                                      <ul className="list-disc ml-4 mb-1">
                                        {Object.entries(scores).map(
                                          ([key, value]) =>
                                            key !== "atsAnalysis" ? (
                                              <li key={key}>
                                                {key}:{" "}
                                                <span className="font-mono">
                                                  {value}
                                                </span>
                                              </li>
                                            ) : null
                                        )}
                                      </ul>
                                      {scores.atsAnalysis && (
                                        <div className="mt-2">
                                          <span className="font-semibold">
                                            ATS Analysis:
                                          </span>
                                          <div className="text-xs text-gray-700 whitespace-pre-line mt-1 break-words">
                                            {scores.atsAnalysis}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No job applications
                    </p>
                  )}
                </div>
              </TooltipProvider>
            </TabsContent>

            <TabsContent value="resume" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4 h-[500px] flex items-center justify-center">
                  {resumeMeta ? (
                    resumeMeta.mimeType?.includes("pdf") ? (
                      <div className="w-full flex flex-col items-center">
                        <div className="h-[420px] w-full rounded-md overflow-hidden border mb-4">
                          <iframe
                            src={resumeMeta.url}
                            className="w-full h-full"
                            title={`${freshCandidate.name}'s Resume`}
                          />
                        </div>
                        <div className="w-full flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(resumeMeta.downloadUrl, "_blank")
                            }
                          >
                            <FileText className="h-4 w-4" /> Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center w-full">
                        <div className="mb-2">{resumeMeta.originalName}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(resumeMeta.downloadUrl, "_blank")
                          }
                        >
                          <FileText className="h-4 w-4" /> Download/View
                        </Button>
                        <div className="w-full text-center text-gray-500 mt-2">
                          Preview not available for this file type. Please
                          download to view.
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="w-full text-center text-gray-500">
                      No resume uploaded for this candidate.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                      Assigned Jobs
                    </span>
                  </div>
                  <div className="min-h-[100px]">
                    {isLoadingJobs ? (
                      <p className="text-center text-muted-foreground py-4">
                        Loading jobs...
                      </p>
                    ) : !assignedJobs || assignedJobs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No jobs assigned
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {assignedJobs.map((job) => {
                          if (!job || typeof job !== "object" || !job.id) {
                            console.warn("Invalid job data:", job);
                            return null;
                          }
                          return (
                            <Card key={`job-${job.id}`} className="mb-2">
                              <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex-1 space-y-1">
                                  <div className="font-medium">
                                    {job.jobTitle || "Untitled Job"}
                                  </div>
                                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                                    {job.jobDepartment && (
                                      <span>
                                        Department: {job.jobDepartment}
                                      </span>
                                    )}
                                    {job.jobType && (
                                      <span>Type: {job.jobType}</span>
                                    )}
                                    {job.jobLocation && (
                                      <span>Location: {job.jobLocation}</span>
                                    )}
                                    {job.assignedDate && (
                                      <span>
                                        Assigned:{" "}
                                        {new Date(
                                          job.assignedDate
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                    {job.assignedBy && (
                                      <span>Assigned By: {job.assignedBy}</span>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`ml-2 whitespace-nowrap ${job.jobStatus === "Active"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : job.jobStatus === "On Hold"
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                                    }`}
                                >
                                  {job.jobStatus || "Unknown"}
                                </Badge>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="source" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                      Source
                    </span>
                    <div className="text-base text-gray-900 mt-1">
                      {freshCandidate.source || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                      Social Media Profiles
                    </span>
                    <div className="mt-2 space-y-2">
                      {freshCandidate.linkedInProfile && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">LinkedIn:</span>
                          <a
                            href={freshCandidate.linkedInProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            {freshCandidate.linkedInProfile}
                          </a>
                        </div>
                      )}
                      {freshCandidate.githubProfile && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">GitHub:</span>
                          <a
                            href={freshCandidate.githubProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            {freshCandidate.githubProfile}
                          </a>
                        </div>
                      )}
                      {freshCandidate.twitterProfile && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Twitter:</span>
                          <a
                            href={freshCandidate.twitterProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            {freshCandidate.twitterProfile}
                          </a>
                        </div>
                      )}
                      {freshCandidate.portfolioUrl && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Portfolio:</span>
                          <a
                            href={freshCandidate.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            {freshCandidate.portfolioUrl}
                          </a>
                        </div>
                      )}
                      {!freshCandidate.linkedInProfile &&
                        !freshCandidate.githubProfile &&
                        !freshCandidate.twitterProfile &&
                        !freshCandidate.portfolioUrl && (
                          <p className="text-gray-500">
                            No social media profiles provided
                          </p>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
