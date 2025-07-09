"use client";

import { useEffect } from "react";
import { useJobs } from "@/contexts/jobs-context";
import { JobsList } from "@/components/jobs/jobs-list";

export function JobsListContainer() {
  const { jobs, isLoading, fetchJobs } = useJobs();

  useEffect(() => {
    fetchJobs({ withApplicantsCount: true });
  }, [fetchJobs]);

  return <JobsList jobs={jobs} isLoading={isLoading} />;
} 