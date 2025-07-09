"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { MatchingDashboard } from "@/components/matching/matching-dashboard";
import { MatchingFilters } from "@/components/matching/matching-filters";
import { useMatching } from "@/contexts/matching-context";
import { useCandidates } from "@/contexts/candidates-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Target, Filter, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MatchingPage() {
  const { toast } = useToast();
  const { filters, setFilters, refreshJobs, matchedCandidates, selectedJob, jobs } =
    useMatching();
  const { setOnCandidateAdded } = useCandidates();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [showRefreshAlert, setShowRefreshAlert] = useState(true);

  // Use a ref to track if we're in the middle of updating
  const isUpdating = useRef(false);

  // Show notification to refresh jobs when component mounts
  useEffect(() => {
    // Show toast notification when the page loads
    toast({
      title: "Refresh Jobs List",
      description: "Click the refresh button to see the latest jobs in the dropdown.",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refreshJobs();
            toast({
              title: "Jobs Refreshed",
              description: "The jobs list has been updated with the latest jobs.",
              duration: 3000,
            });
          }}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      ),
      duration: 10000,
    });
  }, [toast, refreshJobs]);

  // Helper function to get a readable job title
  const getJobTitle = useCallback((position) => {
    const titles = {
      frontend: "Frontend Developer",
      ux: "UX Designer",
      product: "Product Manager",
      backend: "Backend Developer",
      devops: "DevOps Engineer",
      fullstack: "Full Stack Developer",
    };
    return titles[position] || position;
  }, []);

  // Set up listener for new candidates
  useEffect(() => {
    // Create a stable callback function that won't change on every render
    const handleNewCandidate = (newCandidate) => {
      if (filters.autoMatch && newCandidate) {
        try {
          // For now, just show a notification that auto-match is enabled
          // The actual matching logic would need to be implemented in the context
          toast({
            title: "New Candidate Detected",
            description: `Auto-match is enabled. ${newCandidate.name} will be processed for matching.`,
            duration: 3000,
          });
        } catch (error) {
          console.log("Error processing new candidate:", error);
          toast({
            title: "Matching Error",
            description: "There was an error matching the new candidate.",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    };

    // Register the callback with the candidates context
    setOnCandidateAdded(handleNewCandidate);

    // Cleanup
    return () => {
      setOnCandidateAdded(() => { }); // Empty function instead of null/undefined
    };
  }, [filters.autoMatch, setOnCandidateAdded, toast]);

  // Handle filter changes from the matching filters component
  const handleFiltersChange = useCallback(
    (newFilters) => {
      // Prevent infinite loops by checking if we're already updating
      if (isUpdating.current) return;

      isUpdating.current = true;

      setFilters(newFilters);

      // Reset the updating flag after the state update is processed
      setTimeout(() => {
        isUpdating.current = false;
      }, 0);
    },
    [setFilters]
  );

  // Calculate stats for the cards
  const totalCandidates = selectedJob && matchedCandidates[selectedJob.id]
    ? matchedCandidates[selectedJob.id].length
    : 0;

  const highMatchCandidates = selectedJob && matchedCandidates[selectedJob.id]
    ? matchedCandidates[selectedJob.id].filter(c => c.matchPercentage >= 80).length
    : 0;

  const activeFiltersCount = [
    filters.skillsWeight !== 40 ? 1 : 0,
    filters.experienceWeight !== 35 ? 1 : 0,
    filters.educationWeight !== 25 ? 1 : 0,
    filters.minMatchPercentage !== 75 ? 1 : 0,
    !filters.autoMatch ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  ATS Matching
                </h1>
                <p className="text-gray-600 mt-1">
                  AI-powered candidate-job matching and scoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
              onClick={() => {
                refreshJobs();
                toast({
                  title: "Jobs Refreshed",
                  description: "The jobs list has been updated with the latest jobs.",
                  duration: 3000,
                });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Jobs
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCandidates}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Match (80%+)</p>
                  <p className="text-2xl font-bold text-gray-900">{highMatchCandidates}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Filters</p>
                  <p className="text-2xl font-bold text-gray-900">{activeFiltersCount}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Filter className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showRefreshAlert && (
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Keep your job list updated</AlertTitle>
          <AlertDescription className="text-blue-700 flex items-center justify-between">
            <span>Click the refresh button to see the latest jobs in the dropdown.</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refreshJobs();
                  toast({
                    title: "Jobs Refreshed",
                    description: "The jobs list has been updated with the latest jobs.",
                    duration: 3000,
                  });
                }}
                className="bg-white"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Refresh Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRefreshAlert(false)}
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-6 transition-all duration-500 ease-in-out">
        {/* Filters Section */}
        {isFilterPanelOpen && (
          <div className="xl:flex-shrink-0 transition-all duration-500 ease-in-out">
            <div className="sticky top-6">
              <MatchingFilters onFiltersChange={handleFiltersChange} />
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full border shadow-sm z-10 bg-white"
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        >
          {isFilterPanelOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* Dashboard Section */}
        <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
          <MatchingDashboard />
        </div>
      </div>
    </div>
  );
}
