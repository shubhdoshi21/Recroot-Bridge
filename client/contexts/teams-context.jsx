"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { teamService } from "@/services/teamService";

/**
 * Teams Context
 * Provides team data and operations to the component tree
 */
const TeamsContext = createContext(undefined);

/**
 * Initial state for filters
 */
const initialFilters = {
  status: "all",
  departments: [],
  locations: [],
  sizes: [],
};

// Default values for filters
const defaultFilterValues = {
  departments: [
    { id: "engineering", label: "Engineering" },
    { id: "design", label: "Design" },
    { id: "sales", label: "Sales" },
    { id: "marketing", label: "Marketing" },
    { id: "executive", label: "Executive" },
    { id: "entry-level", label: "Entry Level" },
    { id: "global", label: "Global" },
  ],
  locations: [
    { id: "san-francisco", label: "San Francisco, CA" },
    { id: "new-york", label: "New York, NY" },
    { id: "chicago", label: "Chicago, IL" },
    { id: "austin", label: "Austin, TX" },
    { id: "remote", label: "Remote" },
    { id: "multiple", label: "Multiple Locations" },
  ],
  statuses: ["active", "archived", "inactive"],
  sizes: [
    { id: "small", label: "Small (1-3 members)" },
    { id: "medium", label: "Medium (4-6 members)" },
    { id: "large", label: "Large (7+ members)" },
  ],
};

/**
 * Teams Provider Component
 * Manages teams state and provides team-related operations
 */
export function TeamsProvider({ children }) {
  // State
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const [availableDepartments, setAvailableDepartments] = useState(
    defaultFilterValues.departments
  );
  const [availableLocations, setAvailableLocations] = useState(
    defaultFilterValues.locations
  );
  const [availableStatuses, setAvailableStatuses] = useState(
    defaultFilterValues.statuses
  );
  const [availableSizes, setAvailableSizes] = useState(
    defaultFilterValues.sizes
  );

  // Fetch all teams with complete data
  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all teams first
      const response = await teamService.getAllTeams();
      if (!response || !response.teams) {
        throw new Error("Invalid response format from server");
      }

      // Fetch members for each team
      const teamsWithMembers = await Promise.all(
        response.teams.map(async (team) => {
          try {
            const membersResponse = await teamService.getTeamMembers(team.id);
            return {
              ...team,
              teamMembers: membersResponse?.members || [],
              members: membersResponse?.members?.length || 0,
              memberCount: membersResponse?.members?.length || 0,
            };
          } catch (error) {
            console.log(`Error fetching members for team ${team.id}:`, error);
            return {
              ...team,
              teamMembers: [],
              members: 0,
              memberCount: 0,
            };
          }
        })
      );

      setTeams(teamsWithMembers);

      // Set available filter values based on actual data
      const uniqueDepartments = [
        ...new Set(teamsWithMembers.map((t) => t.department).filter(Boolean)),
      ];
      const uniqueLocations = [
        ...new Set(teamsWithMembers.map((t) => t.location).filter(Boolean)),
      ];
      const uniqueStatuses = [
        ...new Set(teamsWithMembers.map((t) => t.status).filter(Boolean)),
      ];

      // Convert departments to the required format
      const formattedDepartments = uniqueDepartments.map((dept) => ({
        id: dept.toLowerCase().replace(/\s+/g, "-"),
        label: dept,
      }));

      // Convert locations to the required format
      const formattedLocations = uniqueLocations.map((loc) => ({
        id: loc.toLowerCase().replace(/\s+/g, "-"),
        label: loc,
      }));

      // Calculate available sizes based on team member counts
      const availableSizes = [];
      const hasSmallTeams = teamsWithMembers.some(
        (team) => team.members >= 1 && team.members <= 3
      );
      const hasMediumTeams = teamsWithMembers.some(
        (team) => team.members >= 4 && team.members <= 6
      );
      const hasLargeTeams = teamsWithMembers.some((team) => team.members >= 7);

      if (hasSmallTeams) {
        availableSizes.push({ id: "small", label: "Small (1-3 members)" });
      }
      if (hasMediumTeams) {
        availableSizes.push({ id: "medium", label: "Medium (4-6 members)" });
      }
      if (hasLargeTeams) {
        availableSizes.push({ id: "large", label: "Large (7+ members)" });
      }

      // Set available values, use defaults if empty
      setAvailableDepartments(
        formattedDepartments.length > 0
          ? formattedDepartments
          : defaultFilterValues.departments
      );
      setAvailableLocations(
        formattedLocations.length > 0
          ? formattedLocations
          : defaultFilterValues.locations
      );
      setAvailableStatuses(
        uniqueStatuses.length > 0
          ? uniqueStatuses
          : defaultFilterValues.statuses
      );
      setAvailableSizes(
        availableSizes.length > 0 ? availableSizes : defaultFilterValues.sizes
      );

      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching teams:", error);
      setError(error.message || "Failed to fetch teams");
      setTeams([]);
      setIsLoading(false);
    }
  }, []);

  // Fetch teams on mount and when lastFetchTime changes
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams, lastFetchTime]);

  /**
   * Team Operations
   */
  const teamOperations = {
    // Add a new team
    addTeam: async (teamData) => {
      try {
        const response = await teamService.createTeam(teamData);
        if (!response || !response.team) {
          throw new Error("Invalid response format from server");
        }

        // Add the new team to state with empty members array
        setTeams((prev) => [
          ...prev,
          {
            ...response.team,
            teamMembers: [],
            members: 0,
            memberCount: 0,
          },
        ]);

        // Trigger a refresh to ensure we have the latest data
        setLastFetchTime(Date.now());

        return response.team;
      } catch (error) {
        console.log("Error adding team:", error);
        throw error;
      }
    },

    // Update a team
    updateTeam: async (teamData) => {
      try {
        const response = await teamService.updateTeam(teamData.id, teamData);
        if (!response) {
          throw new Error("Failed to update team");
        }

        // Update the team in state while preserving member data
        setTeams((prev) =>
          prev.map((team) => {
            if (team.id === teamData.id) {
              return {
                ...response,
                teamMembers: team.teamMembers || [],
                members: team.members || 0,
                memberCount: team.memberCount || 0,
              };
            }
            return team;
          })
        );

        // Trigger a refresh to ensure we have the latest data
        setLastFetchTime(Date.now());

        return response;
      } catch (error) {
        console.log("Error updating team:", error);
        throw error;
      }
    },

    // Add a member to a team
    addTeamMember: async (teamId, memberData) => {
      try {
        const response = await teamService.addTeamMember(teamId, memberData);
        if (!response) {
          throw new Error("Failed to add team member");
        }

        // Update the team's members in state
        setTeams((prev) =>
          prev.map((team) => {
            if (team.id === teamId) {
              const updatedMembers = [...(team.teamMembers || []), response];
              return {
                ...team,
                teamMembers: updatedMembers,
                members: updatedMembers.length,
                memberCount: updatedMembers.length,
              };
            }
            return team;
          })
        );

        return response;
      } catch (error) {
        console.log("Error adding team member:", error);
        throw error;
      }
    },

    // Remove a member from a team
    removeTeamMember: async (teamId, memberId) => {
      try {
        await teamService.removeTeamMember(teamId, memberId);

        // Update the team's members in state
        setTeams((prev) =>
          prev.map((team) => {
            if (team.id === teamId) {
              const updatedMembers = (team.teamMembers || []).filter(
                (m) => m.id !== memberId
              );
              return {
                ...team,
                teamMembers: updatedMembers,
                members: updatedMembers.length,
                memberCount: updatedMembers.length,
              };
            }
            return team;
          })
        );
      } catch (error) {
        console.log("Error removing team member:", error);
        throw error;
      }
    },

    // Update a team member
    updateTeamMember: async (teamId, updatedMember) => {
      try {
        const response = await teamService.updateTeamMember(
          teamId,
          updatedMember.id,
          updatedMember
        );
        if (!response) {
          throw new Error("Failed to update team member");
        }

        // Update the member in state
        setTeams((prev) =>
          prev.map((team) => {
            if (team.id === teamId) {
              const updatedMembers = (team.teamMembers || []).map((m) =>
                m.id === updatedMember.id ? response : m
              );
              return {
                ...team,
                teamMembers: updatedMembers,
                members: updatedMembers.length,
                memberCount: updatedMembers.length,
              };
            }
            return team;
          })
        );

        return response;
      } catch (error) {
        console.log("Error updating team member:", error);
        throw error;
      }
    },

    // Assign jobs to a team
    assignJobsToTeam: async (teamId, jobs) => {
      try {
        const assignedJobs = await Promise.all(
          jobs.map((job) => teamService.assignJobToTeam(teamId, job))
        );

        // Update the local state
        setTeams((prev) =>
          prev.map((team) => {
            if (team.id === teamId) {
              const existing = team.assignedJobs?.map((job) => job.id) || [];
              const newJobs = assignedJobs.filter(
                (job) => !existing.includes(job.id)
              );
              const updated = team.assignedJobs
                ? [...team.assignedJobs, ...newJobs]
                : newJobs;
              return {
                ...team,
                assignedJobs: updated,
                activeJobs: updated.length,
              };
            }
            return team;
          })
        );

        // Trigger a refresh to ensure we have the latest data
        setLastFetchTime(Date.now());

        return assignedJobs;
      } catch (error) {
        console.log("Error assigning jobs to team:", error);
        throw error;
      }
    },

    // Remove a job from a team
    removeJobFromTeam: async (teamId, jobId) => {
      try {
        await teamService.removeJobFromTeam(teamId, jobId);

        // Update the local state
        setTeams((prev) =>
          prev.map((team) => {
            if (team.id === teamId) {
              const updatedJobs = (team.assignedJobs || []).filter(
                (job) => job.id !== jobId
              );
              return {
                ...team,
                assignedJobs: updatedJobs,
                activeJobs: updatedJobs.length,
              };
            }
            return team;
          })
        );
      } catch (error) {
        console.log("Error removing job from team:", error);
        throw error;
      }
    },

    // Delete a team
    deleteTeam: async (teamId) => {
      try {
        await teamService.deleteTeam(teamId);

        // Remove the team from state
        setTeams((prev) => prev.filter((team) => team.id !== teamId));

        // Trigger a refresh to ensure we have the latest data
        setLastFetchTime(Date.now());
      } catch (error) {
        console.log("Error deleting team:", error);
        throw error;
      }
    },
  };

  /**
   * Filter Operations
   */
  const filterOperations = {
    // Update filters
    updateFilters: (filterType, value, checked) => {
      setFilters((prev) => {
        if (filterType === "status") return { ...prev, status: value };

        const current = prev[filterType];
        const updated =
          checked !== undefined
            ? checked
              ? [...current, value]
              : current.filter((v) => v !== value)
            : current.includes(value)
              ? current.filter((v) => v !== value)
              : [...current, value];

        return { ...prev, [filterType]: updated };
      });
    },

    // Reset filters to initial state
    resetFilters: () => {
      setFilters(initialFilters);
    },
  };

  /**
   * Apply filters to teams array
   */
  const applyFilters = (teams) => {
    return teams.filter((team) => {
      // Status filter
      if (filters.status !== "all" && team.status !== filters.status) {
        return false;
      }

      // Department filter
      if (
        filters.departments.length > 0 &&
        !filters.departments.includes(team.department?.toLowerCase())
      ) {
        return false;
      }

      // Location filter
      if (
        filters.locations.length > 0 &&
        !filters.locations.includes(team.location?.toLowerCase())
      ) {
        return false;
      }

      // Size filter
      if (filters.sizes.length > 0) {
        const teamSize = team.members || 0;
        const matchesSize = filters.sizes.some((size) => {
          switch (size) {
            case "small":
              return teamSize >= 1 && teamSize <= 3;
            case "medium":
              return teamSize >= 4 && teamSize <= 6;
            case "large":
              return teamSize >= 7;
            default:
              return false;
          }
        });
        if (!matchesSize) return false;
      }

      return true;
    });
  };

  const filteredTeams = applyFilters(teams);

  // Context value
  const value = {
    // State
    teams: teams || [],
    isLoading,
    error: error ? error.toString() : null,
    filters,
    filteredTeams,
    availableDepartments,
    availableLocations,
    availableStatuses,
    availableSizes,

    // Operations
    fetchTeams,
    ...teamOperations,
    ...filterOperations,
  };

  return (
    <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
  );
}

/**
 * Hook to use teams context
 * @throws {Error} If used outside of TeamsProvider
 */
export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamsProvider");
  }
  return context;
};
