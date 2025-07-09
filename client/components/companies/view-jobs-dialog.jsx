"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Trash,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddJobToCompanyDialog } from "./add-job-to-company-dialog";
import { DeleteJobDialog } from "./delete-job-dialog";
import { companyService } from "@/services/companyService";
import { Skeleton } from "@/components/ui/skeleton";

export function ViewJobsDialog({
  open,
  onOpenChange,
  company,
  loading: companyLoading,
}) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addJobDialogOpen, setAddJobDialogOpen] = useState(false);
  const [deleteJobDialogOpen, setDeleteJobDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Load jobs when dialog opens or company changes
  useEffect(() => {
    if (open && company && !companyLoading) {
      setLoading(true);
      companyService
        .getCompanyJobs(company.id)
        .then((response) => {
          console.log("[ViewJobsDialog] API response:", response);
          if (response && response.jobs) {
            console.log("[ViewJobsDialog] Jobs array:", response.jobs);
            console.log(
              "[ViewJobsDialog] First job applicants:",
              response.jobs[0]?.applicants
            );
            setJobs(response.jobs);
          }
        })
        .catch((error) => {
          console.log("[ViewJobsDialog] Error fetching jobs:", error);
          toast({
            title: "Error",
            description: "Failed to load jobs. Please try again.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, company, companyLoading, toast]);

  const handleDeleteJob = async (jobId) => {
    try {
      await companyService.deleteJob(jobId);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      toast({
        title: "Job Deleted",
        description: "The job has been removed successfully",
      });
      setDeleteJobDialogOpen(false);
    } catch (error) {
      console.log("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(
    (job) =>
      (job.jobTitle || job.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (job.department &&
        job.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.location &&
        job.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // If no company is selected or company is still loading, show loading state
  if ((!company && open) || companyLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Company Jobs</DialogTitle>
            <DialogDescription>
              {companyLoading
                ? "Loading company information..."
                : "No company selected. Please select a company to view its jobs."}
            </DialogDescription>
          </DialogHeader>
          {companyLoading && (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">{company?.name} - Jobs</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View and manage job listings for {company?.name}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={() => setAddJobDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Job
            </Button>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-8 text-center border rounded-lg">
              <p className="text-muted-foreground mb-2">No jobs found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : `${company?.name} doesn't have any job listings yet`}
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Location
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Salary
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Posted
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Applicants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => {
                    console.log("[ViewJobsDialog] Rendering job:", {
                      id: job.id,
                      jobTitle: job.jobTitle,
                      applicants: job.applicants,
                      applications: job.applications,
                    });
                    return (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {job.jobTitle || job.title || "Untitled Job"}
                            </div>
                            <div className="text-sm text-muted-foreground hidden sm:block">
                              {job.jobType || job.type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {job.location}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            {job.salaryMin && job.salaryMax
                              ? `$${job.salaryMin} - $${job.salaryMax}`
                              : job.salaryMin
                                ? `From $${job.salaryMin}`
                                : job.salaryMax
                                  ? `Up to $${job.salaryMax}`
                                  : "Not specified"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {job.postedDate
                              ? new Date(job.postedDate).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${job.jobStatus === "Active" ||
                              job.status === "Active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : job.jobStatus === "On Hold" ||
                                job.status === "On Hold"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                          >
                            {job.jobStatus || job.status || "Open"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {job.applicants !== undefined &&
                              job.applicants !== null
                              ? job.applicants
                              : job.applications || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setDeleteJobDialogOpen(true);
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete job</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Job Dialog */}
      <AddJobToCompanyDialog
        open={addJobDialogOpen}
        onOpenChange={setAddJobDialogOpen}
        company={company}
      />

      {/* Delete Job Dialog */}
      <DeleteJobDialog
        open={deleteJobDialogOpen}
        onOpenChange={setDeleteJobDialogOpen}
        onDeleteJob={() => selectedJobId && handleDeleteJob(selectedJobId)}
        jobId={selectedJobId}
      />
    </>
  );
}
