"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  UserCheck,
  Users,
  Filter,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  Briefcase,
  Award,
  Activity,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Clock,
  Building2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";
import { useCandidates } from "@/contexts/candidates-context";
import { useJobs } from "@/contexts/jobs-context";
import { CandidateViewDialog } from "./dialogs/candidate-view-dialog";
import { CandidateEditDialog } from "./dialogs/candidate-edit-dialog";
import { CandidateDeleteDialog } from "./dialogs/candidate-delete-dialog";
import { JobAssignDialog } from "./dialogs/job-assign-dialog";
import { EducationHistoryDialog } from "./dialogs/education-history-dialog";
import { WorkExperienceDialog } from "./dialogs/work-experience-dialog";
import { ExtracurricularActivitiesDialog } from "./dialogs/extracurricular-activities-dialog";
import { CertificationsDialog } from "./dialogs/certifications-dialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { statusColorMap } from "@/lib/constants";
import { candidateService } from "@/services/candidateService";
import { calculateTotalExperience, formatExperience } from "@/lib/utils";

export function CandidatesList() {
  const {
    candidates,
    filters,
    setSearchQuery,
    hasSkillsData,
    fetchCandidatesWithSkills,
    fetchCandidates,
    setCandidates,
    updateCandidateJobs,
  } = useCandidates();
  const { jobs = [] } = useJobs();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [activeFilters, setActiveFilters] = useState([]);
  const [error, setError] = useState(null);

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isJobAssignDialogOpen, setIsJobAssignDialogOpen] = useState(false);
  const [isEducationHistoryDialogOpen, setIsEducationHistoryDialogOpen] =
    useState(false);
  const [isWorkExperienceDialogOpen, setIsWorkExperienceDialogOpen] =
    useState(false);
  const [
    isExtracurricularActivitiesDialogOpen,
    setIsExtracurricularActivitiesDialogOpen,
  ] = useState(false);
  const [isCertificationsDialogOpen, setIsCertificationsDialogOpen] =
    useState(false);

  const [editedJobs, setEditedJobs] = useState([]);
  const { toast } = useToast();

  // Initial fetch of candidates - only run once on mount
  useEffect(() => {
    const loadInitialCandidates = async () => {
      try {
        await fetchCandidates();
      } catch (error) {
        console.log("Error fetching initial candidates:", error);
        setError("Failed to fetch candidates. Please try again.");
      }
    };

    loadInitialCandidates();
  }, []); // Empty dependency array since we only want this to run once

  // Handle skills filter changes - only run when skills array length changes
  useEffect(() => {
    const loadCandidatesWithSkills = async () => {
      if (filters.skills.length > 0) {
        try {
          await fetchCandidatesWithSkills();
        } catch (error) {
          setError("Failed to fetch candidates with skills. Please try again.");
        }
      }
    };

    loadCandidatesWithSkills();
  }, [filters.skills.length]); // Only depend on skills array length

  // Update active filters when filters change
  useEffect(() => {
    const newActiveFilters = [];

    if (!filters.status.includes("all")) {
      newActiveFilters.push(`Status: ${filters.status}`);
    }

    if (filters.positions.length > 0) {
      newActiveFilters.push(`Positions: ${filters.positions.join(", ")}`);
    }

    if (filters.skills.length > 0) {
      newActiveFilters.push(`Skills: ${filters.skills.join(", ")}`);
    }

    if (filters.experience.length > 0) {
      newActiveFilters.push(`Experience: ${filters.experience.join(", ")}`);
    }

    setActiveFilters(newActiveFilters);
  }, [filters.status, filters.positions, filters.skills, filters.experience]); // Only depend on specific filter properties

  // Apply filters to candidates
  const filteredCandidates = useMemo(() => {
    try {
      const filtered = candidates.filter((candidate) => {
        // Text search filter
        const matchesSearch =
          filters.searchQuery === "" ||
          candidate.name
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          candidate.position
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          candidate.email
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase());

        // Status filter
        const filterStatus =
          typeof filters?.status === "string"
            ? filters.status.toLowerCase()
            : "all";
        const candidateStatus =
          candidate.CandidateJobMaps &&
            candidate.CandidateJobMaps.some(
              (jobMap) => jobMap.status === "applicant"
            )
            ? "applicant"
            : "candidate";
        const matchesStatus =
          filterStatus === "all" || candidateStatus === filterStatus;

        // Position filter
        const matchesPosition =
          filters.positions.length === 0 ||
          filters.positions.some((position) =>
            candidate.position?.toLowerCase().includes(position.toLowerCase())
          );

        // Filter by skills (if we have skills data)
        // Show candidate if they have ANY of the selected skills
        const matchesSkills =
          !hasSkillsData ||
          filters.skills.length === 0 ||
          filters.skills.some((skill) => {
            const hasSkill = candidate.CandidateSkillMaps?.some(
              (skillMap) =>
                skillMap.CandidateSkill.title.toLowerCase() ===
                skill.toLowerCase()
            );
            return hasSkill;
          });

        // Experience filter
        const matchesExperience =
          filters.experience.length === 0 ||
          filters.experience.some((exp) => {
            const candidateExp = candidate.totalExperience || 0;
            const expMonths = parseInt(exp);
            return candidateExp >= expMonths;
          });

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPosition &&
          matchesSkills &&
          matchesExperience
        );
      });

      return filtered;
    } catch (error) {
      console.log("Error filtering candidates:", error);
      return candidates;
    }
  }, [candidates, filters, hasSkillsData]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Handle view profile
  const handleView = async (candidate) => {
    try {
      // Use optimized method for better performance
      const response = await candidateService.getCandidateProfileOptimized(candidate.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set the optimized profile data
      setSelectedCandidate({
        ...candidate,
        ...response.data,
      });
      setIsViewDialogOpen(true);
    } catch (error) {
      console.log("Error fetching candidate profile:", error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle edit
  const handleEdit = async (candidate) => {
    try {
      // Fetch complete candidate data
      const response = await candidateService.getCandidateById(candidate.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set the complete candidate data
      setSelectedCandidate(response.data);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.log("Error fetching candidate data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle edit jobs
  const handleEditJobs = async (candidate) => {
    try {
      // Fetch complete candidate data
      const response = await candidateService.getCandidateById(candidate.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set the complete candidate data
      setSelectedCandidate(response.data);
      setIsJobAssignDialogOpen(true);
    } catch (error) {
      console.log("Error fetching candidate data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle delete
  const handleDelete = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };

  // Save edited candidate
  const saveEditedCandidate = async (id, formData) => {
    try {
      const response = await candidateService.updateCandidate(
        id,
        formData
      );

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }

      // Fetch the latest candidate data after update
      const { data: updatedCandidate } = await candidateService.getCandidateById(id);
      if (updatedCandidate) {
        setCandidates((prevCandidates) =>
          prevCandidates.map((candidate) =>
            candidate.id === id
              ? { ...candidate, ...updatedCandidate }
              : candidate
          )
        );
      }

      toast({
        title: "Success",
        description: "Candidate updated successfully!",
        variant: "default",
        duration: 3000,
      });

      setIsEditDialogOpen(false);
      return true;
    } catch (error) {
      console.log("Error updating candidate:", error);
      toast({
        title: "Error",
        description: "Failed to update candidate. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
  };

  // Handler to update candidate in state after dialog uploads
  const handleCandidateUpdated = (latestCandidate) => {
    setCandidates((prevCandidates) =>
      prevCandidates.map((candidate) =>
        candidate.id === latestCandidate.id
          ? { ...candidate, ...latestCandidate }
          : candidate
      )
    );
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedCandidate) return;

    try {
      const response = await candidateService.deleteCandidate(
        selectedCandidate.id
      );

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Remove the candidate from the local state
      setCandidates((prevCandidates) =>
        prevCandidates.filter(
          (candidate) => candidate.id !== selectedCandidate.id
        )
      );

      toast({
        title: "Success",
        description: "Candidate deleted successfully!",
        variant: "default",
        duration: 3000,
      });

      setIsDeleteDialogOpen(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.log("Error deleting candidate:", error);
      toast({
        title: "Error",
        description: "Failed to delete candidate. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Update job assignments
  const updateJobAssignments = async (jobs) => {
    if (!selectedCandidate) return;

    try {
      const response = await candidateService.updateCandidateJobs(
        selectedCandidate.id,
        jobs
      );

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Update the candidate in the local state
      setCandidates((prevCandidates) =>
        prevCandidates.map((candidate) =>
          candidate.id === selectedCandidate.id
            ? { ...candidate, CandidateJobMaps: response.data }
            : candidate
        )
      );

      toast({
        title: "Success",
        description: "Job assignments updated successfully!",
        variant: "default",
        duration: 3000,
      });

      setIsJobAssignDialogOpen(false);
      setEditedJobs([]);
    } catch (error) {
      console.log("Error updating job assignments:", error);
      toast({
        title: "Error",
        description: "Failed to update job assignments. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Get job by ID
  const getJobById = (jobId) => {
    return jobs.find((job) => job.id === jobId);
  };

  // Handle education history
  const handleEducationHistory = async (candidate) => {
    try {
      // Use optimized method for better performance
      const response = await candidateService.getCandidateEducationOptimized(candidate.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set the education data directly
      setSelectedCandidate({
        ...candidate,
        CandidateEducations: response.data,
      });
      setIsEducationHistoryDialogOpen(true);
    } catch (error) {
      console.log("Error fetching education data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch education data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle work experience
  const handleWorkExperience = async (candidate) => {
    try {
      // Use optimized method for better performance
      const response = await candidateService.getCandidateExperienceOptimized(candidate.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set the experience data directly
      setSelectedCandidate({
        ...candidate,
        CandidateExperiences: response.data,
      });
      setIsWorkExperienceDialogOpen(true);
    } catch (error) {
      console.log("Error fetching experience data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch experience data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle extracurricular activities
  const handleExtracurricularActivities = async (candidate) => {
    try {
      // Use optimized method for better performance
      const response = await candidateService.getCandidateActivitiesOptimized(candidate.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set the activities data directly
      setSelectedCandidate({
        ...candidate,
        CandidateExtraCurriculars: response.data,
      });
      setIsExtracurricularActivitiesDialogOpen(true);
    } catch (error) {
      console.log("Error fetching activities data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch activities data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle certifications
  const handleCertifications = async (candidate) => {
    try {
      // Use optimized method for better performance
      const response = await candidateService.getCandidateCertificationsOptimized(candidate.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set the certifications data directly
      setSelectedCandidate({
        ...candidate,
        CandidateCertifications: response.data,
      });
      setIsCertificationsDialogOpen(true);
    } catch (error) {
      console.log("Error fetching certifications data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch certifications data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Candidates List
                  {filteredCandidates.length !== candidates.length && (
                    <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {filteredCandidates.length} of {candidates.length}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search candidates..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                value={filters.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Filter className="h-3 w-3" />
                  {filter}
                </Badge>
              ))}
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden transition-all duration-500 ease-in-out">
            <Table className="w-full transition-all duration-500 ease-in-out">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30 hover:bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-700 py-4">Candidate</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Position</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Current Company</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Experience</TableHead>
                  <TableHead className="w-[80px] py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCandidates.length > 0 ? (
                  paginatedCandidates.map((candidate, index) => (
                    <TableRow
                      key={candidate.id || index}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-blue-100 shadow-md">
                            <AvatarImage
                              src={candidate.avatar || "/placeholder.svg"}
                              alt={candidate.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {candidate.name ? candidate.name.charAt(0).toUpperCase() : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{candidate.name}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Phone className="h-3 w-3" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-gray-800">{candidate.position}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-gray-800">
                            {candidate.currentCompany || "Not specified"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105
                                  ${candidate.CandidateJobMaps &&
                                    candidate.CandidateJobMaps.some(
                                      (jobMap) => jobMap.status === "applicant"
                                    )
                                    ? "bg-green-50 text-green-700 border-green-300 shadow-sm"
                                    : "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                                  }
                                `}
                              >
                                {candidate.CandidateJobMaps &&
                                  candidate.CandidateJobMaps.some(
                                    (jobMap) => jobMap.status === "applicant"
                                  ) ? (
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                ) : (
                                  <User className="h-4 w-4 text-blue-600" />
                                )}
                                {candidate.CandidateJobMaps &&
                                  candidate.CandidateJobMaps.some(
                                    (jobMap) => jobMap.status === "applicant"
                                  )
                                  ? "Applicant"
                                  : "Candidate"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white">
                              {candidate.CandidateJobMaps &&
                                candidate.CandidateJobMaps.some(
                                  (jobMap) => jobMap.status === "applicant"
                                )
                                ? "This person has applied to at least one job."
                                : "This person has not applied to any jobs yet."}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-gray-800">
                            {(() => {
                              // Use backend calculated totalExperience if available
                              if (candidate.totalExperience) {
                                return formatExperience(candidate.totalExperience);
                              }

                              // Calculate from work history if available
                              if (
                                candidate.CandidateExperiences &&
                                candidate.CandidateExperiences.length > 0
                              ) {
                                const totalMonths = calculateTotalExperience(
                                  candidate.CandidateExperiences
                                );
                                return formatExperience(totalMonths);
                              }

                              // Calculate from workHistory if available (for newly added candidates)
                              if (
                                candidate.workHistory &&
                                candidate.workHistory.length > 0
                              ) {
                                const totalMonths = calculateTotalExperience(
                                  candidate.workHistory
                                );
                                return formatExperience(totalMonths);
                              }

                              return "Not specified";
                            })()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                            <DropdownMenuItem
                              onClick={() => handleView(candidate)}
                              className="flex items-center gap-2 hover:bg-blue-50 cursor-pointer"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEducationHistory(candidate)}
                              className="flex items-center gap-2 hover:bg-green-50 cursor-pointer"
                            >
                              <GraduationCap className="h-4 w-4 text-green-600" />
                              Education History
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleWorkExperience(candidate)}
                              className="flex items-center gap-2 hover:bg-orange-50 cursor-pointer"
                            >
                              <Briefcase className="h-4 w-4 text-orange-600" />
                              Work Experience
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleExtracurricularActivities(candidate)
                              }
                              className="flex items-center gap-2 hover:bg-purple-50 cursor-pointer"
                            >
                              <Activity className="h-4 w-4 text-purple-600" />
                              Extracurricular Activities
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCertifications(candidate)}
                              className="flex items-center gap-2 hover:bg-yellow-50 cursor-pointer"
                            >
                              <Award className="h-4 w-4 text-yellow-600" />
                              Certifications
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEdit(candidate)}
                              className="flex items-center gap-2 hover:bg-indigo-50 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 text-indigo-600" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(candidate)}
                              className="flex items-center gap-2 hover:bg-red-50 cursor-pointer text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                        <Users className="h-12 w-12 text-gray-300" />
                        <div>
                          <p className="text-lg font-medium">No candidates found</p>
                          <p className="text-sm">Try adjusting your filters or search terms</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">{paginatedCandidates.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{filteredCandidates.length}</span>{" "}
            candidates
            {filteredCandidates.length !== candidates.length && (
              <span className="text-gray-500"> (filtered from {candidates.length} total)</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 w-9 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 p-0 ${page === pageNum
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-50 hover:border-blue-300"
                      }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="h-9 w-9 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <CandidateViewDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        candidate={selectedCandidate}
        getJobById={getJobById}
        onEditJobs={handleEditJobs}
      />

      <CandidateEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        candidate={selectedCandidate}
        onSave={saveEditedCandidate}
        editedJobs={editedJobs}
        setEditedJobs={setEditedJobs}
        onEditJobs={handleEditJobs}
        jobs={jobs}
        onCandidateUpdated={handleCandidateUpdated}
      />

      <CandidateDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        candidate={selectedCandidate}
        onConfirm={confirmDelete}
      />

      <JobAssignDialog
        isOpen={isJobAssignDialogOpen}
        onOpenChange={(open) => {
          console.log("[CandidatesList] JobAssignDialog onOpenChange:", {
            open,
            candidateId: selectedCandidate?.id,
            selectedJobs: editedJobs,
          });
          setIsJobAssignDialogOpen(open);
        }}
        jobs={jobs}
        selectedJobs={editedJobs}
        candidateId={selectedCandidate?.id}
        onSave={updateJobAssignments}
      />

      <EducationHistoryDialog
        isOpen={isEducationHistoryDialogOpen}
        onOpenChange={setIsEducationHistoryDialogOpen}
        candidate={selectedCandidate}
      />

      <WorkExperienceDialog
        isOpen={isWorkExperienceDialogOpen}
        onOpenChange={setIsWorkExperienceDialogOpen}
        candidate={selectedCandidate}
      />

      <ExtracurricularActivitiesDialog
        isOpen={isExtracurricularActivitiesDialogOpen}
        onOpenChange={setIsExtracurricularActivitiesDialogOpen}
        candidate={selectedCandidate}
      />

      <CertificationsDialog
        isOpen={isCertificationsDialogOpen}
        onOpenChange={setIsCertificationsDialogOpen}
        candidate={selectedCandidate}
      />
    </>
  );
}
