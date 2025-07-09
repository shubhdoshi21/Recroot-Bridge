"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/contexts/jobs-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, Search, UserX, Users } from "lucide-react";
import { ApplicantDetailsDialog } from "./applicant-details-dialog";
import { useCandidates } from "@/contexts/candidates-context";
import { useMatching } from "@/contexts/matching-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@/lib/jobUtils";
import { useAuth } from "@/contexts/auth-context";
import { buildAutomationContext } from "@/lib/utils";

export function ViewApplicantsDialog({ isOpen, onOpenChange }) {
  const {
    selectedJob,
    applicants,
    isLoadingApplicants,
    jobService,
    fetchJobApplicants,
  } = useJobs();
  const { toast } = useToast();
  const { candidates } = useCandidates();
  const { matchedCandidates } = useMatching();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useAuth();

  const stages = useMemo(() => {
    if (!selectedJob?.applicationStages) return [];
    try {
      if (typeof selectedJob.applicationStages === 'string') {
        return JSON.parse(selectedJob.applicationStages);
      }
      if (Array.isArray(selectedJob.applicationStages)) {
        return selectedJob.applicationStages;
      }
    } catch (e) {
      console.log("Error parsing application stages:", e);
    }
    return [];
  }, [selectedJob?.applicationStages]);

  const handleStatusChange = async (applicant, newStatus) => {
    if (!applicant || !newStatus) return;

    try {
      if (applicant.type === 'application') {
        // Build context for automation with sender details
        // console.log('currentUser', currentUser);
        const context = buildAutomationContext({
          applicant,
          selectedJob,
          currentUser,
          // Add company, interview, application, customVariables if available
        });
        // console.log('context', context);
        await jobService.updateApplicationStatus(applicant.id, newStatus, context);
      } else if (applicant.type === 'assignment') {
        await jobService.updateAssignmentStatus(applicant.jobId, applicant.candidateId, newStatus);
      } else {
        throw new Error("Unknown applicant type.");
      }

      toast({
        title: "Status Updated",
        description: `Applicant status changed to ${newStatus}.`,
      });
      fetchJobApplicants(selectedJob.id, { onlyApplicants: true });
    } catch (error) {
      toast({
        title: "Error Updating Status",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const openDetailsDialog = (applicant) => {
    setSelectedApplicant(applicant);
    setIsDetailsDialogOpen(true);
  };

  if (!selectedJob) {
    return null;
  }

  const filteredApplicants = applicants.filter((applicant) => {
    if (applicant.type !== 'application') return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        applicant.name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl p-0 bg-white/95 backdrop-blur-sm border-blue-200">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Applicants for {selectedJob.title || selectedJob.jobTitle}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Review and manage applicants for this position.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search applicants by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-base bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            {isLoadingApplicants ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-4">
                  <UserX className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-xl font-bold mt-4 text-gray-900">No Applicants Found</p>
                <p className="text-gray-600 mt-2">
                  There are currently no applicants matching your criteria.
                </p>
              </div>
            ) : (
              <Table className="rounded-xl overflow-hidden shadow-md">
                <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <TableRow>
                    <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => {
                    const statusColors = getStatusColor(
                      applicant.status,
                      selectedJob.applicationStages
                    );
                    return (
                      <TableRow
                        key={`${applicant.type}-${applicant.id}`}
                        className={cn(
                          "transition-colors hover:bg-blue-50/50",
                          statusColors.hover
                        )}
                      >
                        <TableCell className="py-3 px-4 font-medium text-gray-900">{applicant.name}</TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">{applicant.email}</TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "px-3 py-1 text-sm font-semibold border-2 transition-transform transform hover:scale-105",
                                statusColors.badge
                              )}
                            >
                              {applicant.status || "Applied"}
                            </Badge>
                            <Select
                              value={applicant.status}
                              disabled={
                                applicant.status === "Archived" ||
                                applicant.status === "Rejected"
                              }
                              onValueChange={(newStatus) =>
                                handleStatusChange(applicant, newStatus)
                              }
                            >
                              <SelectTrigger className="w-[160px] h-9 text-sm bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                                <SelectValue placeholder="Change status" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200">
                                {stages.map((stage) => (
                                  <SelectItem key={stage.name} value={stage.name}>
                                    {stage.name}
                                  </SelectItem>
                                ))}
                                {/* <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Archived">Archived</SelectItem> */}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            onClick={() => openDetailsDialog(applicant)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
        <ApplicantDetailsDialog
          isOpen={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          applicant={selectedApplicant}
        />
      </Dialog>
    </>
  );
}
