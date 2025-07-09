"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Calendar, Users } from "lucide-react";
import { useCandidates } from "@/contexts/candidates-context";
import { useJobs } from "@/contexts/jobs-context";
import { useToast } from "@/hooks/use-toast";

export function ViewAssignedJobsDialog({ candidate, trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { jobs } = useJobs();
  const { removeJobFromCandidate } = useCandidates();
  const { toast } = useToast();

  // Get assigned jobs details
  const assignedJobs = candidate.assignedJobs
    ? jobs.filter((job) => candidate.assignedJobs?.includes(job.id))
    : [];

  const handleRemoveJob = async (jobId) => {
    if (!candidate?.id) return;

    try {
      setIsLoading(true);
      await removeJobFromCandidate(candidate.id, jobId);

      toast({
        title: "Success",
        description: "Job assignment removed successfully",
      });
    } catch (error) {
      console.log("Error removing job assignment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove job assignment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Briefcase className="h-4 w-4 mr-2" />
            View Assigned Jobs
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Jobs Assigned to {candidate.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {assignedJobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No jobs assigned to this candidate
            </p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {assignedJobs.map((job) => (
                  <div key={job.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{job.title}</h3>
                      <Badge variant="outline" className={job.statusColor}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Posted: {job.postedDate}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {job.applicants} applicant
                        {job.applicants !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveJob(job.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Removing..." : "Remove Assignment"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
