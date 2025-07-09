"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  DollarSign,
  Briefcase,
  XCircle,
  Trash,
  Pencil,
  Lock,
} from "lucide-react";
import { useJobs } from "@/contexts/jobs-context";
import { EditJobDialog } from "./edit-job-dialog";
import { ViewApplicantsDialog } from "./view-applicants-dialog";
import { DeleteJobDialog } from "./delete-job-dialog";
import { JobDetailsDialog } from "./job-details-dialog";
import { QuickRejectDialog } from "./quick-reject-dialog";
import { useCompanies } from "@/contexts/companies-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { jobService } from "@/services/jobService";
import { getStatusColor } from "@/lib/jobUtils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function JobsList({ jobs: initialJobs, isLoading: isInitialLoading }) {
  const {
    jobService,
    setSelectedJob,
    fetchJobApplicants,
    jobs = [],
    filters = {},
    setSearchQuery,
    fetchJobs,
    selectedJob,
  } = useJobs();
  const { companies = [] } = useCompanies();
  const { toast } = useToast();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewApplicantsDialogOpen, setIsViewApplicantsDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isQuickRejectDialogOpen, setIsQuickRejectDialogOpen] = useState(false);
  const [itemsPerPage] = useState(10);

  // Add this function at the beginning of the JobsList component to normalize job types for comparison
  const normalizeForComparison = (value) => {
    if (!value) return "";
    return value.toLowerCase().replace(/\s+/g, "-");
  };

  // Then modify the filtering logic in the component to use this normalization function
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

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    await fetchJobApplicants(job.id, { onlyApplicants: true });
    setIsViewApplicantsDialogOpen(true);
  };

  const handleCloseJob = async (job) => {
    try {
      await jobService.updateJobStatus(job.id, "closed");

      // Update the job status in the local state immediately
      const updatedJobs = jobs.map((j) => {
        if (j.id === job.id) {
          return { ...j, jobStatus: "closed" };
        }
        return j;
      });

      // Trigger a full refresh to ensure consistency
      await fetchJobs();

      toast({
        title: "Success",
        description: "Job has been closed successfully",
      });
    } catch (error) {
      console.log("Error closing job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to close job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = (job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedJob?.id) {
      toast({
        title: "Error",
        description: "Invalid job selected for deletion",
        variant: "destructive",
      });
      return;
    }

    try {
      await jobService.deleteJob(selectedJob.id);
      toast({
        title: "Success",
        description: "Job has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
      await fetchJobs();
    } catch (error) {
      console.log("Error deleting job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (job) => {
    console.log("Opening job details with data:", job);
    console.log("Application stages:", job.applicationStages);
    setSelectedJob(job);
    setIsDetailsDialogOpen(true);
  };

  const handleQuickReject = async (job) => {
    setSelectedJob(job);
    // Fetching applicants is now handled within the dialog if needed
    setIsQuickRejectDialogOpen(true);
  };

  // Function to format date as "X days ago" with tooltip showing exact date
  const formatDateAgo = (dateString) => {
    if (!dateString || dateString === "null" || dateString === "undefined") {
      return {
        relativeTime: "Date not specified",
        exactDate: "Date not specified",
      };
    }

    let postedDate;
    try {
      postedDate = new Date(dateString);

      // Check if the date is valid
      if (isNaN(postedDate.getTime())) {
        return {
          relativeTime: "Date not specified",
          exactDate: "Date not specified",
        };
      }
    } catch (error) {
      return {
        relativeTime: "Date not specified",
        exactDate: "Date not specified",
      };
    }

    // Get current date in the same timezone as the posted date
    const currentDate = new Date();

    const diffTime = currentDate.getTime() - postedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    // Format the exact date for the tooltip
    const formattedDate = postedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Return relative time for display
    if (diffDays === 0) {
      if (diffHours === 0) {
        return {
          relativeTime:
            diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`,
          exactDate: formattedDate,
        };
      }
      return {
        relativeTime: `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`,
        exactDate: formattedDate,
      };
    } else if (diffDays === 1) {
      return {
        relativeTime: "Yesterday",
        exactDate: formattedDate,
      };
    } else if (diffDays < 30) {
      return {
        relativeTime: `${diffDays} days ago`,
        exactDate: formattedDate,
      };
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return {
        relativeTime: `${months} ${months === 1 ? "month" : "months"} ago`,
        exactDate: formattedDate,
      };
    } else {
      const years = Math.floor(diffDays / 365);
      return {
        relativeTime: `${years} ${years === 1 ? "year" : "years"} ago`,
        exactDate: formattedDate,
      };
    }
  };

  // Function to get company name by ID
  const getCompanyName = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    return company ? company.name : "N/A";
  };

  const renderStatus = (status) => {
    if (!status) return null;

    // Normalize status for consistent display
    const normalizedStatus = status.toLowerCase();
    let displayStatus = status;

    // Convert to proper display format
    switch (normalizedStatus) {
      case "active":
        displayStatus = "Active";
        break;
      case "draft":
        displayStatus = "Draft";
        break;
      case "closed":
        displayStatus = "Closed";
        break;
      case "new":
        displayStatus = "New";
        break;
      case "closing soon":
      case "closing-soon":
        displayStatus = "Closing Soon";
        break;
      default:
        displayStatus = status;
    }

    const statusColorClass = getStatusColor(normalizedStatus);
    return (
      <Badge
        variant="secondary"
        className={cn(
          "capitalize transition-colors hover:bg-opacity-80",
          statusColorClass
        )}
      >
        {displayStatus}
      </Badge>
    );
  };

  const jobsToRender = useMemo(() => initialJobs || [], [initialJobs]);

  if (isInitialLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Jobs List
                  {filteredJobs.length !== jobs.length && (
                    <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {filteredJobs.length} of {jobs.length}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                value={filters.searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filters.searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9 hover:bg-blue-50"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden transition-all duration-500 ease-in-out">
            {paginatedJobs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  No jobs match your current search criteria.
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {paginatedJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden group hover:scale-[1.02] hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        {/* Header section with title and status */}
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200">
                                <Briefcase className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex items-center gap-3">
                                <h3
                                  className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors duration-200"
                                  onClick={() => handleViewDetails(job)}
                                >
                                  {job.title || job.jobTitle || "Untitled Position"}
                                </h3>
                                {renderStatus(job.jobStatus || "new")}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="font-medium">{getCompanyName(job.companyId)}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <span className="ml-2">{job.department || "Department not specified"}</span>
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-blue-50 transition-colors duration-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-blue-200">
                              <DropdownMenuItem onClick={() => handleEditJob(job)}>
                                <Pencil className="h-4 w-4 mr-2 text-blue-500" />
                                Edit Job
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewApplicants(job)}>
                                <Users className="h-4 w-4 mr-2 text-purple-500" />
                                View Applicants
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickReject(job)} className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Quick Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCloseJob(job)} disabled={job.jobStatus?.toLowerCase() === "closed"}>
                                <Lock className="h-4 w-4 mr-2 text-orange-500" />
                                Close Job
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteJob(job)} className="text-red-600">
                                <Trash className="h-4 w-4 mr-2 text-red-500" />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Job details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="font-medium">{job.location || "Location not specified"}</span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200 cursor-help">
                                  <Calendar className="h-4 w-4 mr-2 text-green-500" />
                                  <span className="font-medium">
                                    Posted {formatDateAgo(job.postedDate || job.createdAt).relativeTime}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 text-white">
                                <p>
                                  Posted on {formatDateAgo(job.postedDate || job.createdAt).exactDate}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-medium">
                              {job.salaryMin && job.salaryMax
                                ? `₹${job.salaryMin.toLocaleString("en-IN")} - ₹${job.salaryMax.toLocaleString("en-IN")}`
                                : "Salary not specified"}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                            <Briefcase className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="font-medium">
                              {job.openings
                                ? `${job.openings} opening${job.openings > 1 ? "s" : ""}`
                                : "1 opening"}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                            <Users className="h-4 w-4 mr-2 text-orange-500" />
                            <span className="font-medium">
                              {job.applicants || 0} applicant{(job.applicants || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="font-medium">
                              {job.type || job.jobType || "Type not specified"}
                            </span>
                          </div>
                        </div>

                        {/* Footer section */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                            >
                              {job.type || job.jobType || "Type not specified"}
                            </Badge>
                            {job.jobStatus?.toLowerCase() === "active" && (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200">
                                Active
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(job)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {paginatedJobs.length > 0 && (
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(filteredJobs.length, startIndex + 1)}-
                  {Math.min(filteredJobs.length, startIndex + itemsPerPage)}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{filteredJobs.length}</span> jobs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-gray-700 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Dialogs */}
        <EditJobDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          job={selectedJob}
          onSubmit={async (updatedJob) => {
            try {
              if (!selectedJob) {
                throw new Error("No job selected for update.");
              }
              await jobService.updateJob(selectedJob.id, updatedJob);
              await fetchJobs();
              // Fetch the updated job details from the backend
              const freshJob = await jobService.getJobById(selectedJob.id);
              setSelectedJob(freshJob);
              setIsEditDialogOpen(false);
              setIsDetailsDialogOpen(true);
              toast({
                title: "Success",
                description: "Job updated successfully",
              });
            } catch (error) {
              console.log("Error updating job:", error);
              toast({
                title: "Error",
                description:
                  error.message || "Failed to update job. Please try again.",
                variant: "destructive",
              });
            }
          }}
        />

        <ViewApplicantsDialog
          isOpen={isViewApplicantsDialogOpen}
          onOpenChange={setIsViewApplicantsDialogOpen}
        />

        <DeleteJobDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          job={selectedJob}
          onConfirm={handleConfirmDelete}
        />

        <JobDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          job={selectedJob}
        />

        <QuickRejectDialog
          isOpen={isQuickRejectDialogOpen}
          onOpenChange={setIsQuickRejectDialogOpen}
        />
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Jobs List
                {filteredJobs.length !== jobs.length && (
                  <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {filteredJobs.length} of {jobs.length}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search jobs..."
              className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              value={filters.searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {filters.searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9 hover:bg-blue-50"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-hidden transition-all duration-500 ease-in-out">
          {paginatedJobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">
                No jobs match your current search criteria.
              </p>
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {paginatedJobs.map((job) => (
                <Card
                  key={job.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden group hover:scale-[1.02] hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      {/* Header section with title and status */}
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200">
                              <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex items-center gap-3">
                              <h3
                                className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors duration-200"
                                onClick={() => handleViewDetails(job)}
                              >
                                {job.title || job.jobTitle || "Untitled Position"}
                              </h3>
                              {renderStatus(job.jobStatus || "new")}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="font-medium">{getCompanyName(job.companyId)}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span className="ml-2">{job.department || "Department not specified"}</span>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-blue-50 transition-colors duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-blue-200">
                            <DropdownMenuItem onClick={() => handleEditJob(job)}>
                              <Pencil className="h-4 w-4 mr-2 text-blue-500" />
                              Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewApplicants(job)}>
                              <Users className="h-4 w-4 mr-2 text-purple-500" />
                              View Applicants
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickReject(job)} className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2 text-red-500" />
                              Quick Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCloseJob(job)} disabled={job.jobStatus?.toLowerCase() === "closed"}>
                              <Lock className="h-4 w-4 mr-2 text-orange-500" />
                              Close Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteJob(job)} className="text-red-600">
                              <Trash className="h-4 w-4 mr-2 text-red-500" />
                              Delete Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Job details grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">{job.location || "Location not specified"}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200 cursor-help">
                                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                                <span className="font-medium">
                                  Posted {formatDateAgo(job.postedDate || job.createdAt).relativeTime}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 text-white">
                              <p>
                                Posted on {formatDateAgo(job.postedDate || job.createdAt).exactDate}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                          <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">
                            {job.salaryMin && job.salaryMax
                              ? `₹${job.salaryMin.toLocaleString("en-IN")} - ₹${job.salaryMax.toLocaleString("en-IN")}`
                              : "Salary not specified"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                          <Briefcase className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium">
                            {job.openings
                              ? `${job.openings} opening${job.openings > 1 ? "s" : ""}`
                              : "1 opening"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                          <Users className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="font-medium">
                            {job.applicants || 0} applicant{(job.applicants || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="font-medium">
                            {job.type || job.jobType || "Type not specified"}
                          </span>
                        </div>
                      </div>

                      {/* Footer section */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                          >
                            {job.type || job.jobType || "Type not specified"}
                          </Badge>
                          {job.jobStatus?.toLowerCase() === "active" && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200">
                              Active
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(job)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {paginatedJobs.length > 0 && (
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(filteredJobs.length, startIndex + 1)}-
                {Math.min(filteredJobs.length, startIndex + itemsPerPage)}
              </span>{" "}
              of <span className="font-semibold text-gray-900">{filteredJobs.length}</span> jobs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Dialogs */}
      <EditJobDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        job={selectedJob}
        onSubmit={async (updatedJob) => {
          try {
            if (!selectedJob) {
              throw new Error("No job selected for update.");
            }
            await jobService.updateJob(selectedJob.id, updatedJob);
            await fetchJobs();
            // Fetch the updated job details from the backend
            const freshJob = await jobService.getJobById(selectedJob.id);
            setSelectedJob(freshJob);
            setIsEditDialogOpen(false);
            setIsDetailsDialogOpen(true);
            toast({
              title: "Success",
              description: "Job updated successfully",
            });
          } catch (error) {
            console.log("Error updating job:", error);
            toast({
              title: "Error",
              description:
                error.message || "Failed to update job. Please try again.",
              variant: "destructive",
            });
          }
        }}
      />

      <ViewApplicantsDialog
        isOpen={isViewApplicantsDialogOpen}
        onOpenChange={setIsViewApplicantsDialogOpen}
      />

      <DeleteJobDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        job={selectedJob}
        onConfirm={handleConfirmDelete}
      />

      <JobDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        job={selectedJob}
      />

      <QuickRejectDialog
        isOpen={isQuickRejectDialogOpen}
        onOpenChange={setIsQuickRejectDialogOpen}
      />
    </Card>
  );
}
