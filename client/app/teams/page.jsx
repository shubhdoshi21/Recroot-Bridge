"use client";

import { useState, useEffect } from "react";
import { TeamsList } from "@/components/teams/teams-list";
import { TeamDetails } from "@/components/teams/team-details";
import { TeamPerformance } from "@/components/teams/team-performance";
import { TeamFilters } from "@/components/teams/team-filters";
import { Button } from "@/components/ui/button";
import { Plus, Users, Filter, Search, Building } from "lucide-react";
import { useTeams } from "@/contexts/teams-context";
import { TeamsProvider } from "@/contexts/teams-context";
import { AddTeamDialog } from "@/components/teams/dialogs/add-team-dialog";
import { teamService } from "@/services/teamService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeamsPage() {
  console.log("[TeamsPage] Rendering TeamsPage");
  return (
    <TeamsProvider>
      <TeamsPageContent />
    </TeamsProvider>
  );
}

function TeamsPageContent() {
  console.log("[TeamsPageContent] Initial render");
  const { toast } = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [recruiters, setRecruiters] = useState([]);
  const [isLoadingRecruiters, setIsLoadingRecruiters] = useState(false);
  const [parentTeams, setParentTeams] = useState([]);
  const [isLoadingParentTeams, setIsLoadingParentTeams] = useState(false);
  const {
    teams,
    fetchTeams,
    error: teamsError,
    isLoading: isLoadingTeams,
    filters,
  } = useTeams();

  // Log state changes
  useEffect(() => {
    console.log("[TeamsPageContent] State updated:", {
      selectedTeamId,
      isAddTeamDialogOpen,
      activeTab,
      recruitersCount: recruiters.length,
      teamsCount: teams?.length,
      parentTeamsCount: parentTeams.length,
      teamsError,
      isLoadingTeams,
    });
  }, [
    selectedTeamId,
    isAddTeamDialogOpen,
    activeTab,
    recruiters,
    teams,
    parentTeams,
    teamsError,
    isLoadingTeams,
  ]);

  // Fetch recruiters and teams when needed
  useEffect(() => {
    console.log(
      "[TeamsPageContent] Effect triggered - isAddTeamDialogOpen:",
      isAddTeamDialogOpen
    );

    const fetchRecruiters = async () => {
      console.log("[TeamsPageContent] Starting to fetch recruiters");
      try {
        setIsLoadingRecruiters(true);
        const response = await teamService.getAllRecruiters();
        console.log("[TeamsPageContent] Recruiters API response:", response);

        if (response && Array.isArray(response.recruiters)) {
          console.log(
            "[TeamsPageContent] Setting recruiters:",
            response.recruiters
          );
          setRecruiters(response.recruiters);
        } else {
          console.log(
            "[TeamsPageContent] Invalid recruiters response:",
            response
          );
          setRecruiters([]);
          toast({
            title: "Error",
            description: "Failed to load recruiters. Invalid response format.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.log("[TeamsPageContent] Error fetching recruiters:", error);
        setRecruiters([]);
        toast({
          title: "Error",
          description:
            error.message || "Failed to load recruiters. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRecruiters(false);
      }
    };

    if (isAddTeamDialogOpen) {
      console.log("[TeamsPageContent] Dialog opened, fetching recruiters");
      fetchRecruiters();
      console.log("[TeamsPageContent] Current teams from context:", teams);
      setParentTeams(Array.isArray(teams) ? teams : []);
    }
  }, [isAddTeamDialogOpen, teams, toast]);

  const handleCreateTeamClick = () => {
    console.log("[TeamsPageContent] Create team clicked");
    setIsAddTeamDialogOpen(true);
  };

  const handleTeamCreated = async (team) => {
    console.log("[TeamsPageContent] Team created:", team);
    try {
      console.log("[TeamsPageContent] Fetching updated teams list");
      await fetchTeams();
      if (team && team.id) {
        console.log("[TeamsPageContent] Setting selected team:", team.id);
        setSelectedTeamId(team.id);
        setIsAddTeamDialogOpen(false);
        setActiveTab("details");
      } else {
        console.log("[TeamsPageContent] Invalid team data:", team);
        throw new Error("Invalid team data received");
      }
    } catch (error) {
      console.log("[TeamsPageContent] Error handling team creation:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to process team creation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectTeam = (teamId) => {
    console.log("[TeamsPageContent] Team selected:", teamId);
    if (teamId) {
      setSelectedTeamId(teamId);
      setActiveTab("details");
    }
  };

  const handleTabChange = (tab) => {
    console.log("[TeamsPageContent] Tab changed to:", tab);
    setActiveTab(tab);
    if (tab === "list") {
      setSelectedTeamId(null);
    }
  };

  // Calculate active filters count
  const activeFiltersCount = [
    filters?.status !== "all" ? 1 : 0,
    filters?.departments?.length || 0,
    filters?.locations?.length || 0,
    filters?.sizes?.length || 0,
  ].reduce((sum, count) => sum + count, 0);

  console.log("[TeamsPageContent] Rendering with state:", {
    activeTab,
    selectedTeamId,
    recruitersCount: recruiters.length,
    teamsCount: teams?.length,
    teamsError,
    isLoadingTeams,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Teams
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and organize your recruitment teams
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCreateTeamClick}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <Plus className="h-5 w-5" />
          Add Team
        </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Teams</p>
                  <p className="text-2xl font-bold text-gray-900">{teams?.length || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
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

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Teams</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teams?.filter(team => team.status === "active")?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Alert */}
      {teamsError && (
        <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-red-700">{teamsError}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-6 transition-all duration-500 ease-in-out">
        {/* Filters Section */}
        <div className="xl:flex-shrink-0 transition-all duration-500 ease-in-out">
          <div className="sticky top-6">
        <TeamFilters />
          </div>
        </div>

        {/* Teams Content Section */}
        <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
          {activeTab === "list" ? (
            <TeamsList onSelectTeam={handleSelectTeam} />
          ) : activeTab === "details" && selectedTeamId ? (
            <div className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden rounded-lg">
              <div className="border-b border-gray-100">
              <nav className="flex">
                <button
                  onClick={() => handleTabChange("list")}
                    className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "list"
                        ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                    }`}
                >
                  Teams List
                </button>
                  <button
                    onClick={() => handleTabChange("details")}
                    className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "details"
                        ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                      }`}
                  >
                    Team Details
                  </button>
                  <button
                    onClick={() => handleTabChange("performance")}
                    className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "performance"
                        ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                      }`}
                  >
                    Team Performance
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {isLoadingTeams ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <TeamDetails teamId={selectedTeamId} isNewTeam={false} />
                )}
              </div>
            </div>
          ) : activeTab === "performance" && selectedTeamId ? (
            <div className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden rounded-lg">
              <div className="border-b border-gray-100">
                <nav className="flex">
                  <button
                    onClick={() => handleTabChange("list")}
                    className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "list"
                        ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                      }`}
                  >
                    Teams List
                  </button>
                  <button
                    onClick={() => handleTabChange("details")}
                    className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "details"
                        ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                      }`}
                  >
                    Team Details
                  </button>
                  <button
                    onClick={() => handleTabChange("performance")}
                    className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "performance"
                        ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                      }`}
                  >
                    Team Performance
                  </button>
                </nav>
              </div>
              <div className="p-6">
              {isLoadingTeams ? (
                  <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
                ) : (
                <TeamPerformance teamId={selectedTeamId} />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Add Team Dialog */}
      <AddTeamDialog
        isOpen={isAddTeamDialogOpen}
        onOpenChange={setIsAddTeamDialogOpen}
        onTeamCreated={handleTeamCreated}
        recruiters={recruiters}
        isLoadingRecruiters={isLoadingRecruiters}
        parentTeams={parentTeams}
        isLoadingParentTeams={isLoadingParentTeams}
      />
    </div>
  );
}
