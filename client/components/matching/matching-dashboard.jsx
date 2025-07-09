"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMatching } from "@/contexts/matching-context";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  LayoutGrid,
  List,
  UserCheck,
  UserX,
  Target,
  Briefcase,
  Building2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewCandidateProfileDialog } from "./view-candidate-profile-dialog";
import { ContactCandidateDialog } from "./contact-candidate-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchingFilters } from "./matching-filters";

export function MatchingDashboard() {
  const {
    matchedCandidates,
    filters,
    updateCandidateStatus,
    jobs,
    selectedJob,
    setSelectedJob,
    loading,
    error,
    refreshJobs,
  } = useMatching();
  const [viewMode, setViewMode] = useState("grid");
  const { toast } = useToast();

  // Filter candidates based on minimum match percentage for the selected job
  const filteredCandidates = useMemo(() => {
    if (!selectedJob || !matchedCandidates[selectedJob.id]) {
      return [];
    }
    // Deduplicate by candidateId or id
    const seen = new Set();
    return matchedCandidates[selectedJob.id]
      .filter(
        (candidate) => candidate.matchPercentage >= filters.minMatchPercentage
      )
      .filter((candidate) => {
        const uniqueId = candidate.candidateId || candidate.id;
        if (seen.has(uniqueId)) return false;
        seen.add(uniqueId);
        return true;
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [selectedJob, matchedCandidates, filters.minMatchPercentage]);

  // Count total candidates for the selected job
  const totalCandidates = useMemo(() => {
    return filteredCandidates.length;
  }, [filteredCandidates]);

  // Debug log for candidates and job selection
  console.log('MatchingDashboard debug:', { filteredCandidates, matchedCandidates, selectedJob });

  // Handle status update
  const handleStatusUpdate = async (candidateId, jobId, newStatus) => {
    try {
      await updateCandidateStatus(candidateId, jobId, newStatus);
      toast({
        title: "Status updated",
        description: `Candidate status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Selection and Controls */}
      <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Job Matching</h2>
                <p className="text-sm text-gray-600">Select a job to view matched candidates</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                  >
                    {viewMode === "grid" ? (
                      <List className="h-4 w-4" />
                    ) : (
                      <LayoutGrid className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle view mode</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {viewMode === "grid" ? "list" : "grid"} view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {totalCandidates} candidates
            </Badge>
          </div>
        </div>

        {/* Job Selection Dropdown */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <Select
              onValueChange={(jobId) => {
                const job = jobs.find((j) => j.id === jobId);
                setSelectedJob(job);
              }}
              value={selectedJob?.id || ""}
            >
              <SelectTrigger className="w-[400px] bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 rounded-xl shadow-sm px-5 py-3 text-base font-medium transition-all flex items-center">
                {selectedJob ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 w-full truncate">
                          <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="font-semibold truncate max-w-[160px]">{selectedJob.jobTitle}</span>
                          <span className="text-gray-400 mx-1">·</span>
                          <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                          <span className="text-gray-600 truncate max-w-[120px]">{selectedJob.company?.name || "Unknown Company"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{selectedJob.jobTitle} @ {selectedJob.company?.name || "Unknown Company"}</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-gray-400">Select a job to view matches</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id} className="rounded-lg px-4 py-2 hover:bg-blue-50 group">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 min-h-[24px]">
                        <span className="inline-block w-5"></span>
                        <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="font-semibold truncate max-w-[180px]">{job.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 ml-10">
                        <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-gray-600 text-sm truncate max-w-[180px]">{job.company?.name || "Unknown Company"}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refreshJobs()}
              title="Refresh jobs list"
              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Alerts and Info */}
        {!filters.autoMatch && (
          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">
              Auto-match is disabled
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              New candidates will not be automatically matched. Enable
              auto-match in the criteria panel to automatically process new
              candidates.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Current Weighting</h3>
              <p className="text-sm text-blue-700">
                Skills:{" "}
                <span className="font-medium">{filters.skillsWeight}%</span> |
                Experience:{" "}
                <span className="font-medium">
                  {filters.experienceWeight}%
                </span>{" "}
                | Education:{" "}
                <span className="font-medium">
                  {filters.educationWeight}%
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matched candidates...</p>
        </div>
      )}

      {error && (
        <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Candidates Display */}
      {!loading && !error && selectedJob && (
        <>
          {filteredCandidates.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-500px)]">
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredCandidates.map((candidate) => (
                  <CandidateMatchCard
                    key={candidate.id}
                    candidate={candidate}
                    jobTitle={selectedJob.jobTitle}
                    viewMode={viewMode}
                    onStatusUpdate={handleStatusUpdate}
                    selectedJob={selectedJob}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-12 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600 mb-4">
                No candidates match the current criteria for this job. Try
                lowering the minimum match percentage.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  // Reset min match percentage to a lower value
                  // This would need to be implemented in the context
                }}
                className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
              >
                Adjust Criteria
              </Button>
            </div>
          )}
        </>
      )}

      {!loading && !error && !selectedJob && jobs.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-12 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a job</h3>
          <p className="text-gray-600">
            Please select a job from the dropdown above to view matched candidates.
          </p>
        </div>
      )}
    </div>
  );
}

function CandidateMatchCard({ candidate, jobTitle, viewMode, onStatusUpdate, selectedJob }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [cooldowns, setCooldowns] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const storedCooldowns = JSON.parse(localStorage.getItem('candidateCooldowns')) || {};
    const now = Date.now();
    const activeCooldowns = {};
    for (const id in storedCooldowns) {
      if (now < storedCooldowns[id]) {
        activeCooldowns[id] = storedCooldowns[id];
      }
    }
    setCooldowns(activeCooldowns);
  }, []);

  const handleStatusUpdate = (candidateId, jobId, newStatus) => {
    const now = Date.now();
    if (cooldowns[candidateId] && now < cooldowns[candidateId]) {
      const timeLeft = Math.ceil((cooldowns[candidateId] - now) / 1000 / 60);
      toast({
        title: "Action on Cooldown",
        description: `You can perform this action again in ${timeLeft} minutes.`,
        variant: "destructive",
      });
      return;
    }

    onStatusUpdate(candidateId, jobId, newStatus);

    const cooldownEndTime = now + 2 * 60 * 1000;
    const newCooldowns = { ...cooldowns, [candidateId]: cooldownEndTime };
    setCooldowns(newCooldowns);
    localStorage.setItem('candidateCooldowns', JSON.stringify(newCooldowns));

    setTimeout(() => {
      setCooldowns(prev => {
        const updated = { ...prev };
        delete updated[candidateId];
        // Also update localStorage to remove expired timer
        const stored = JSON.parse(localStorage.getItem('candidateCooldowns')) || {};
        delete stored[candidateId];
        localStorage.setItem('candidateCooldowns', JSON.stringify(stored));
        return updated;
      });
    }, 5 * 60 * 1000);
  };

  const personId = candidate.candidateId || candidate.id;
  const isButtonDisabled = cooldowns[personId] && Date.now() < cooldowns[personId];

  console.log("CandidateMatchCard candidate:", candidate);

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchBadgeColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 75) return "bg-blue-100 text-blue-800 border-blue-200";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <>
      <ViewCandidateProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={setIsProfileDialogOpen}
        candidate={candidate}
      />
      <ContactCandidateDialog
        isOpen={isContactDialogOpen}
        onClose={setIsContactDialogOpen}
        candidate={candidate}
      />

      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 ${viewMode === "list" ? "flex items-center p-6" : ""
        }`}>
        {viewMode === "grid" ? (
          <CardContent className="p-6">
            {/* Header with Avatar and Basic Info */}
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="w-16 h-16 border-2 border-blue-200 shadow-md">
                <AvatarImage src={candidate.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {candidate.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 truncate">{candidate.name}</h3>
                <Badge
                  variant="outline"
                  className={`mt-2 text-xs font-medium ${getMatchBadgeColor(candidate.matchPercentage)}`}
                >
                  Matched to {jobTitle}
                </Badge>
              </div>
            </div>

            {/* Match Score Section */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium text-gray-700">Overall Match</span>
                  <span
                    className={`font-bold text-lg ${getMatchColor(candidate.matchPercentage)}`}
                  >
                    {candidate.matchPercentage}%
                  </span>
                </div>
                <Progress
                  value={candidate.matchPercentage}
                  className="h-3 bg-gray-100"
                />
              </div>

              {isExpanded && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-medium text-gray-600">Skills Match</span>
                      <span className={`font-semibold ${getMatchColor(candidate.skillsMatch)}`}>
                        {candidate.skillsMatch}%
                      </span>
                    </div>
                    <Progress value={candidate.skillsMatch} className="h-2 bg-gray-100" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-medium text-gray-600">Experience Match</span>
                      <span className={`font-semibold ${getMatchColor(candidate.experienceMatch)}`}>
                        {candidate.experienceMatch}%
                      </span>
                    </div>
                    <Progress value={candidate.experienceMatch} className="h-2 bg-gray-100" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-medium text-gray-600">Education Match</span>
                      <span className={`font-semibold ${getMatchColor(candidate.educationMatch)}`}>
                        {candidate.educationMatch}%
                      </span>
                    </div>
                    <Progress value={candidate.educationMatch} className="h-2 bg-gray-100" />
                  </div>
                </div>
              )}
            </div>

            {/* Expand/Collapse Button */}
            <div className="flex justify-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={() => setIsProfileDialogOpen(true)}
                >
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                  onClick={() => setIsContactDialogOpen(true)}
                >
                  Contact
                </Button>
              </div>

              <div className="flex justify-center">
                {candidate.status === "applicant" ? (
                  <Button
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => {
                      const applicationId = candidate.candidateId || candidate.id;
                      console.log("Mark as Candidate clicked", { candidate, applicationId: applicationId });
                      handleStatusUpdate(applicationId, candidate.jobId || selectedJob?.id, "candidate");
                    }}
                    disabled={isButtonDisabled}
                  >
                    <UserCheck className="h-4 w-4 mr-2" /> Mark as Candidate
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      const personId = candidate.candidateId || candidate.id;
                      console.log("Convert to Applicant clicked", { candidate, candidateId: personId });
                      handleStatusUpdate(personId, candidate.jobId || selectedJob?.id, "applicant");
                    }}
                    disabled={isButtonDisabled}
                  >
                    <UserCheck className="h-4 w-4 mr-2" /> Convert to Applicant
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6 w-full">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-4 flex-grow">
              <Avatar className="w-12 h-12 border-2 border-blue-200 shadow-md">
                <AvatarImage src={candidate.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {candidate.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{candidate.name}</h3>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs font-medium ${getMatchBadgeColor(candidate.matchPercentage)}`}
                >
                  Matched to {jobTitle}
                </Badge>
              </div>
            </div>

            {/* Match Score and Actions */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700">Overall Match:</span>
                <span className={`font-bold text-lg ${getMatchColor(candidate.matchPercentage)}`}>
                  {candidate.matchPercentage}%
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={() => setIsProfileDialogOpen(true)}
                >
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                  onClick={() => setIsContactDialogOpen(true)}
                >
                  Contact
                </Button>
              </div>

              <div>
                {candidate.status === "applicant" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => {
                      const applicationId = candidate.candidateId || candidate.id;
                      console.log("Mark as Candidate clicked", { candidate, applicationId: applicationId });
                      handleStatusUpdate(applicationId, candidate.jobId || selectedJob?.id, "candidate");
                    }}
                    disabled={isButtonDisabled}
                  >
                    <UserCheck className="h-4 w-4 mr-2" /> Mark as Candidate
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      const personId = candidate.candidateId || candidate.id;
                      console.log("Convert to Applicant clicked", { candidate, candidateId: personId });
                      handleStatusUpdate(personId, candidate.jobId || selectedJob?.id, "applicant");
                    }}
                    disabled={isButtonDisabled}
                  >
                    <UserCheck className="h-4 w-4 mr-2" /> Convert to Applicant
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
}