"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  MapPin,
  Briefcase,
  Edit,
  UserPlus,
  Mail,
  Phone,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Save,
  Eye,
  Trash2,
  UserCog,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTeams } from "@/contexts/teams-context";
import { Textarea } from "@/components/ui/textarea";
import { AddMemberDialog } from "./dialogs/add-member-dialog";
import { ViewMemberDialog } from "./dialogs/view-member-dialog";
import { ViewJobDialog } from "./dialogs/view-job-dialog";
import { api } from "@/config/api";
import { getAllRecruiters } from "@/services/recruiterService";
import { teamService } from "@/services/teamService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChangeRoleDialog } from "./dialogs/change-role-dialog";

// Import new components
import { TeamHeader } from "./team-header";
import { TeamOverview } from "./team-overview";
import { AddTeamDialog } from "./dialogs/add-team-dialog";
import { EditTeamDialog } from "./dialogs/edit-team-dialog";

// Helper functions - moved to top of file
const capitalizeFirst = (str) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
};

const formatLocation = (location) => {
  if (!location) return "Remote";
  return `${location.city}, ${location.country}`;
};

const safeJSONParse = (jsonString, defaultValue) => {
  try {
    return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.log("Error parsing JSON:", error);
    return defaultValue;
  }
};

const defaultNewTeam = {
  name: "",
  description: "",
  leadId: "",
  lead: "",
  leadEmail: "",
  leadPhone: "",
  leadAvatar: "/placeholder.svg",
  goals: [
    {
      title: "HIRING_VELOCITY",
      monthlyHiringTarget: 10,
      currentHires: 0,
      averageTimeToClose: 30,
      targetTimeToClose: 25,
    },
  ],
  monthlyHires: [],
  recentActivity: [],
  teamMembers: [],
  assignedJobs: [],
};

export function TeamDetails({
  teamId,
  isNewTeam = false,
  onTeamCreated,
  onCancel,
}) {
  const { toast } = useToast();
  const {
    teams,
    updateTeam: contextUpdateTeam,
    addTeam: contextAddTeam,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    assignJobsToTeam,
    deleteTeam,
    fetchTeams,
  } = useTeams();
  const [recruiters, setRecruiters] = useState([]);
  const [isLoadingRecruiters, setIsLoadingRecruiters] = useState(false);
  const [isLoadingParentTeams, setIsLoadingParentTeams] = useState(false);
  const [editMode, setEditMode] = useState(isNewTeam);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [isViewMemberDialogOpen, setIsViewMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editedTeam, setEditedTeam] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewJobDialogOpen, setViewJobDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [parentTeams, setParentTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [memberToChangeRole, setMemberToChangeRole] = useState(null);
  const [teamJobs, setTeamJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Get the existing team if editing, or use a default new team template if creating
  const existingTeam = teamId ? teams.find((t) => t?.id === teamId) : null;
  const memoizedTeam = useMemo(
    () => existingTeam || defaultNewTeam,
    [existingTeam]
  );

  // Compute whether we can open the edit dialog
  const canOpenEditDialog = useMemo(() => {
    return !isLoading && memoizedTeam && teamId;
  }, [isLoading, memoizedTeam, teamId]);

  // Update local state when the team in context changes
  useEffect(() => {
    if (existingTeam && !isNewTeam) {
      console.log(
        "[TeamDetails] Team updated in context, updating local state:",
        existingTeam
      );
      // Deep clone the team to avoid reference issues
      let processedGoals = [];
      try {
        if (typeof existingTeam.goals === "string") {
          processedGoals = JSON.parse(existingTeam.goals);
        } else if (Array.isArray(existingTeam.goals)) {
          processedGoals = [...existingTeam.goals];
        } else if (
          typeof existingTeam.goals === "object" &&
          existingTeam.goals !== null
        ) {
          // Convert legacy object format to array format
          processedGoals = [
            {
              title: "HIRING_VELOCITY",
              monthlyHiringTarget: existingTeam.goals.hiring || 0,
              currentHires: existingTeam.goals.currentHires || 0,
              averageTimeToClose: existingTeam.goals.timeToHire || 0,
              targetTimeToClose: existingTeam.goals.targetTimeToHire || 0,
            },
          ];
        }
      } catch (error) {
        console.log("Error processing goals:", error);
        processedGoals = defaultNewTeam.goals;
      }

      // Safely handle arrays that might be undefined or null
      const safeArray = (arr) => (Array.isArray(arr) ? [...arr] : []);

      setEditedTeam({
        ...existingTeam,
        id: teamId, // Ensure ID is always set
        teamMembers: safeArray(existingTeam.teamMembers),
        goals: processedGoals,
        monthlyHires: safeArray(existingTeam.monthlyHires),
        recentActivity: safeArray(existingTeam.recentActivity),
      });
    }
  }, [existingTeam, isNewTeam, teamId]);

  // Fetch team data including members
  const fetchTeamData = useCallback(async () => {
    if (!teamId || isNewTeam) {
      console.log("[TeamDetails] No teamId or isNewTeam, skipping fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch fresh team data
      const teamResponse = await teamService.getTeamById(teamId);
      if (!teamResponse) {
        throw new Error("Failed to fetch team data");
      }

      // Fetch team members
      const membersResponse = await teamService.getTeamMembers(teamId);
      const members = membersResponse?.members || [];

      // Process goals data
      let processedGoals = [];
      try {
        if (typeof teamResponse.goals === "string") {
          processedGoals = JSON.parse(teamResponse.goals);
        } else if (Array.isArray(teamResponse.goals)) {
          processedGoals = [...teamResponse.goals];
        } else if (
          typeof teamResponse.goals === "object" &&
          teamResponse.goals !== null
        ) {
          // Convert legacy object format to array format
          processedGoals = [
            {
              title: "HIRING_VELOCITY",
              monthlyHiringTarget: teamResponse.goals.hiring || 0,
              currentHires: teamResponse.goals.currentHires || 0,
              averageTimeToClose: teamResponse.goals.timeToHire || 0,
              targetTimeToClose: teamResponse.goals.targetTimeToHire || 0,
            },
          ];
        }
      } catch (error) {
        console.log("Error processing goals:", error);
        processedGoals = defaultNewTeam.goals;
      }

      // Process team data
      const processedTeam = {
        ...defaultNewTeam,
        ...teamResponse,
        goals: processedGoals,
        monthlyHires: safeJSONParse(teamResponse.monthlyHires, []),
        recentActivity: safeJSONParse(teamResponse.recentActivity, []),
        teamMembers: members,
      };

      console.log("[TeamDetails] Setting processed team data:", processedTeam);
      setEditedTeam(processedTeam);
      setIsLoading(false);
    } catch (error) {
      console.log("[TeamDetails] Error fetching team data:", error);
      setError(error.message);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load team data. Please try again.",
        variant: "destructive",
      });
    }
  }, [teamId, isNewTeam, toast]);

  // Fetch team data when component mounts or teamId changes
  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // Update the edit dialog open state handler
  const handleEditDialogOpen = (open) => {
    if (open && !canOpenEditDialog) {
      toast({
        title: "Error",
        description: "Cannot edit team: team data is not loaded yet",
        variant: "destructive",
      });
      return;
    }
    setEditTeamDialogOpen(open);
  };

  // Update fetch function to use the service directly
  const fetchRecruiters = async () => {
    setIsLoadingRecruiters(true);
    try {
      const response = await getAllRecruiters();
      setRecruiters(response?.recruiters || []);
    } catch (error) {
      console.log("Error fetching recruiters:", error);
      toast({
        title: "Error",
        description: "Failed to load recruiters. Please try again.",
        variant: "destructive",
      });
      setRecruiters([]);
    }
    setIsLoadingRecruiters(false);
  };

  const fetchParentTeams = async () => {
    setIsLoadingParentTeams(true);
    try {
      const response = await teamService.getAllTeams();
      setParentTeams(response?.teams || []);
    } catch (error) {
      console.log("Error fetching parent teams:", error);
      toast({
        title: "Error",
        description: "Failed to load parent teams. Please try again.",
        variant: "destructive",
      });
      setParentTeams([]);
    } finally {
      setIsLoadingParentTeams(false);
    }
  };

  // Add useEffect for loading data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRecruiters(), fetchParentTeams()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Validation for required fields
  const isValid =
    editedTeam?.name &&
    editedTeam?.department &&
    editedTeam?.status &&
    editedTeam?.location &&
    editedTeam?.leadId;

  // Add function to normalize job data
  const normalizeJobData = (job) => {
    if (!job) return null;

    return {
      id: job.id || job.jobId,
      title: job.title || job.jobTitle || "Untitled Job",
      department: job.department || "N/A",
      location: job.location || "N/A",
      status: job.status || job.jobStatus || "Open",
      type: job.type || job.jobType || "N/A",
      assignedRecruiterId: job.assignedRecruiterId,
      assignedRecruiterName: job.assignedRecruiterName || "Unassigned",
      description: job.description || "",
      requirements: job.requirements || "",
      salary: job.salary || "N/A",
      assignedDate: job.assignedDate || new Date().toISOString(),
      createdAt: job.createdAt || new Date().toISOString(),
      updatedAt: job.updatedAt || new Date().toISOString(),
      recruiters: job.recruiters || [],
    };
  };

  // Update fetchTeamJobs to normalize the data
  const fetchTeamJobs = useCallback(async () => {
    if (!teamId || isNewTeam) return;

    try {
      setIsLoadingJobs(true);
      const response = await teamService.getTeamJobs(teamId);
      console.log("[TeamDetails] Raw team jobs response:", response);

      // The response is already an array of jobs from teamService.getTeamJobs
      const normalizedJobs = Array.isArray(response)
        ? response.map(normalizeJobData).filter(Boolean)
        : [];

      console.log("[TeamDetails] Normalized team jobs:", normalizedJobs);
      setTeamJobs(normalizedJobs);
    } catch (error) {
      console.log("[TeamDetails] Error fetching team jobs:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to load team jobs. Please try again.",
        variant: "destructive",
      });
      setTeamJobs([]);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [teamId, isNewTeam, toast]);

  // Add useEffect to fetch jobs when component mounts
  useEffect(() => {
    fetchTeamJobs();
  }, [fetchTeamJobs]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Loading...</h3>
            <p className="text-gray-500">
              Please wait while we load the team details.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!editedTeam) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Team Data</h3>
            <p className="text-gray-500">Unable to load team information.</p>
          </div>
        </div>
      </Card>
    );
  }

  // Update the handleInputChange function
  const handleInputChange = (field, value) => {
    if (field === "leadId") {
      const selectedRecruiter = recruiters.find(
        (r) => r.id === parseInt(value)
      );
      if (selectedRecruiter) {
        // Access User data either directly or through User property
        const firstName =
          selectedRecruiter.firstName ||
          selectedRecruiter.User?.firstName ||
          "";
        const lastName =
          selectedRecruiter.lastName || selectedRecruiter.User?.lastName || "";
        const email =
          selectedRecruiter.email || selectedRecruiter.User?.email || "";
        const phone =
          selectedRecruiter.phone || selectedRecruiter.User?.phone || "";
        const profilePicture =
          selectedRecruiter.profilePicture ||
          selectedRecruiter.User?.profilePicture ||
          "/placeholder.svg";

        const recruiterName = `${firstName} ${lastName}`.trim();

        // Create team member object for the lead
        const leadMember = {
          id: selectedRecruiter.id,
          name: recruiterName,
          email: email,
          phone: phone,
          avatar: profilePicture,
          role: "Team Lead",
          joinDate: new Date().toISOString(),
          hires: 0,
          timeToHire: 0,
          offerAcceptanceRate: 0,
        };

        setEditedTeam((prev) => {
          // Remove any existing team lead from members if exists
          const filteredMembers =
            prev.teamMembers?.filter((member) => member.role !== "Team Lead") ||
            [];

          return {
            ...prev,
            leadId: parseInt(value),
            lead: recruiterName,
            leadEmail: email,
            leadPhone: phone,
            leadAvatar: profilePicture,
            // Add the new lead to team members
            teamMembers: [...filteredMembers, leadMember],
            members: filteredMembers.length + 1,
          };
        });
      }
    } else {
      setEditedTeam((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Function to save team changes or create a new team
  const saveTeamChanges = async () => {
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const selectedRecruiter = recruiters.find(
        (r) => r.id === parseInt(editedTeam.leadId)
      );

      // Ensure goals, monthlyHires, and recentActivity are properly stringified
      const goalsToSave =
        typeof editedTeam.goals === "string"
          ? editedTeam.goals
          : JSON.stringify(editedTeam.goals || {});

      const monthlyHiresToSave =
        typeof editedTeam.monthlyHires === "string"
          ? editedTeam.monthlyHires
          : JSON.stringify(editedTeam.monthlyHires || []);

      const recentActivityToSave =
        typeof editedTeam.recentActivity === "string"
          ? editedTeam.recentActivity
          : JSON.stringify(editedTeam.recentActivity || []);

      // Prepare team data for API
      const teamData = {
        ...editedTeam,
        goals: goalsToSave,
        monthlyHires: monthlyHiresToSave,
        recentActivity: recentActivityToSave,
        lead: selectedRecruiter?.name || "",
        leadEmail: selectedRecruiter?.email || "",
        leadPhone: selectedRecruiter?.phone || "",
        leadAvatar: selectedRecruiter?.avatar || "/placeholder.svg",
        members: editedTeam.teamMembers?.length || 0, // Add members count
        memberCount: editedTeam.teamMembers?.length || 0, // Add alternative count field
      };

      let response;
      let savedTeamId;

      if (isNewTeam) {
        // Create new team
        response = await contextAddTeam(teamData);
        savedTeamId = response.id;

        if (response) {
          // Add team lead as a member
          const leadMemberData = {
            recruiterId: editedTeam.leadId,
            role: "Team Lead",
            joinDate: new Date().toISOString(),
            hires: 0,
            timeToHire: 0,
            offerAcceptanceRate: 0,
          };

          await teamService.addTeamMember(savedTeamId, leadMemberData);

          // Update local state with the new team data
          const newTeamData = {
            ...response,
            goals: safeJSONParse(response.goals, defaultNewTeam.goals),
            monthlyHires: safeJSONParse(response.monthlyHires, []),
            recentActivity: safeJSONParse(response.recentActivity, []),
            teamMembers: [leadMemberData],
            members: 1, // Set initial member count
            memberCount: 1, // Set alternative count field
          };
          setEditedTeam(newTeamData);

          if (onTeamCreated) {
            onTeamCreated(savedTeamId);
          }

          toast({
            title: "Team created",
            description: `${response.name} has been successfully created with team lead.`,
          });
        }
      } else {
        savedTeamId = editedTeam.id;
        response = await contextUpdateTeam(teamData);

        // For existing team, check if lead is already a member
        const isLeadMember = editedTeam.teamMembers?.some(
          (member) =>
            member.id === editedTeam.leadId && member.role === "Team Lead"
        );

        if (!isLeadMember) {
          try {
            // Add team lead as a member for existing team
            const leadMemberData = {
              recruiterId: editedTeam.leadId,
              role: "Team Lead",
              joinDate: new Date().toISOString(),
              hires: 0,
              timeToHire: 0,
              offerAcceptanceRate: 0,
            };
            await teamService.addTeamMember(savedTeamId, leadMemberData);

            // Update local state with the updated team data
            const updatedMembers = [
              ...(editedTeam.teamMembers || []),
              leadMemberData,
            ];
            const updatedTeamData = {
              ...response,
              goals: safeJSONParse(response.goals, defaultNewTeam.goals),
              monthlyHires: safeJSONParse(response.monthlyHires, []),
              recentActivity: safeJSONParse(response.recentActivity, []),
              teamMembers: updatedMembers,
              members: updatedMembers.length, // Update member count
              memberCount: updatedMembers.length, // Update alternative count field
            };
            setEditedTeam(updatedTeamData);

            toast({
              title: "Team updated",
              description:
                "The team details have been successfully updated and team lead added as member.",
            });
          } catch (memberError) {
            console.log("Error adding team lead as member:", memberError);
            toast({
              title: "Warning",
              description:
                "Team updated but failed to add team lead as member. Please add manually.",
              variant: "warning",
            });
          }
        } else {
          // Update local state with the updated team data
          const updatedTeamData = {
            ...response,
            goals: safeJSONParse(response.goals, defaultNewTeam.goals),
            monthlyHires: safeJSONParse(response.monthlyHires, []),
            recentActivity: safeJSONParse(response.recentActivity, []),
            teamMembers: editedTeam.teamMembers,
            members: editedTeam.teamMembers?.length || 0, // Update member count
            memberCount: editedTeam.teamMembers?.length || 0, // Update alternative count field
          };
          setEditedTeam(updatedTeamData);

          toast({
            title: "Team updated",
            description: "The team details have been successfully updated.",
          });
        }
      }

      // Refresh the teams list to get the latest data
      await fetchTeams();

      // Close the dialog and reset states
      setIsSaving(false);
      setEditMode(false);
      setEditTeamDialogOpen(false);
    } catch (error) {
      console.log("Error saving team:", error);
      toast({
        title: "Error",
        description: `Failed to ${isNewTeam ? "create" : "update"} team. ${error.response?.data?.message || error.message
          }`,
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  // Function to handle adding a new team member
  const handleAddMember = async (memberData) => {
    try {
      setIsLoading(true);
      console.log("[TeamDetails] Adding member with data:", memberData);

      const response = await teamService.addTeamMember(
        editedTeam.id,
        memberData
      );
      console.log("[TeamDetails] Add member response:", response);

      // Update local state with the new member
      const updatedMembers = [...(editedTeam.teamMembers || []), response];
      setEditedTeam((prev) => ({
        ...prev,
        teamMembers: updatedMembers,
        members: updatedMembers.length, // Update member count
        memberCount: updatedMembers.length, // Update alternative count field
      }));

      // Close the dialog
      setAddMemberDialogOpen(false);

      // Show success message
      toast({
        title: "Success",
        description: "Team member added successfully",
      });

      // Refresh the teams list to get the latest data
      await fetchTeams();
    } catch (error) {
      console.log("[TeamDetails] Error adding team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle viewing a team member
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setIsViewMemberDialogOpen(true);
  };

  // Function to handle removing a team member
  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete || !existingTeam?.id) return;

    setIsLoading(true);
    try {
      // Use the context's removeTeamMember function
      await removeTeamMember(existingTeam.id, memberToDelete.id);

      // Update local state by removing the deleted member
      const currentMembers = Array.isArray(editedTeam.teamMembers)
        ? editedTeam.teamMembers
        : [];
      const updatedMembers = currentMembers.filter(
        (member) => member.id !== memberToDelete.id
      );
      setEditedTeam((prev) => ({
        ...prev,
        teamMembers: updatedMembers,
        members: updatedMembers.length,
        memberCount: updatedMembers.length,
      }));

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });

      // Close dialogs and reset selection
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      setIsViewMemberDialogOpen(false);
    } catch (error) {
      console.log("[TeamDetails] Error deleting team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle viewing a job
  const handleViewJob = (job) => {
    const normalizedJob = normalizeJobData(job);
    if (normalizedJob) {
      setSelectedJob(normalizedJob);
      setViewJobDialogOpen(true);
    }
  };

  // Function to cancel team creation
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setEditMode(false);
    }
  };

  // Function to handle changing a team member's role
  const handleChangeRole = (member) => {
    setMemberToChangeRole(member);
    setIsChangeRoleDialogOpen(true);
  };

  const handleRoleChange = async (newRole) => {
    if (!memberToChangeRole || !existingTeam?.id) return;

    setIsLoading(true);
    try {
      // Update the member's role
      const updatedMember = {
        ...memberToChangeRole,
        role: newRole,
      };
      await teamService.updateTeamMember(
        existingTeam.id,
        memberToChangeRole.id,
        updatedMember
      );

      // Update local state
      setEditedTeam((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.map((member) =>
          member.id === memberToChangeRole.id
            ? { ...member, role: newRole }
            : member
        ),
      }));

      toast({
        title: "Success",
        description: "Team member role updated successfully",
      });

      // Close dialog and reset selection
      setIsChangeRoleDialogOpen(false);
      setMemberToChangeRole(null);
    } catch (error) {
      console.log("[TeamDetails] Error updating team member role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team member role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the jobs tab content
  const renderJobsTab = () => (
    <TabsContent value="jobs" className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Team Jobs</h3>
          </div>

          {isLoadingJobs ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Loading jobs...</h3>
                <p className="text-gray-500">
                  Please wait while we fetch the team jobs.
                </p>
              </div>
            </div>
          ) : teamJobs.length > 0 ? (
            <div className="responsive-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamJobs.map((job) => (
                    <TableRow key={`job-${job.id}`}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            job.status === "active"
                              ? "bg-green-100 text-green-800"
                              : job.status === "on-hold"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(job.recruiters) && job.recruiters.length > 0
                          ? job.recruiters.map((r) => r.name).join(", ")
                          : "Unassigned"}
                      </TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewJob(job)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No jobs assigned to team members.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );

  return (
    <div className="space-y-6">
      <Card className="light-mode-card">
        <CardContent className="p-6">
          <TeamHeader
            team={memoizedTeam}
            onEditClick={() => handleEditDialogOpen(true)}
            onDeleteClick={() => { }}
          />
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="jobs">Assigned Jobs</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <TeamOverview team={memoizedTeam} />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Button
                  size="sm"
                  onClick={() => setAddMemberDialogOpen(true)}
                  disabled={isLoading}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">
                      Loading team members...
                    </h3>
                    <p className="text-gray-500">
                      Please wait while we fetch the team members.
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-center text-red-500">
                    <h3 className="text-lg font-medium mb-2">
                      Error loading team members
                    </h3>
                    <p>{error}</p>
                  </div>
                </div>
              ) : !editedTeam?.teamMembers?.length ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">
                      No team members yet
                    </h3>
                    <p className="text-gray-500">
                      Click the "Add Member" button to add your first team
                      member.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedTeam.teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={member.avatar}
                                  alt={member.name}
                                />
                                <AvatarFallback>
                                  {member.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-gray-500">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>
                            {new Date(member.joinDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewMember(member)}
                                disabled={isLoading}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {member.role !== "Team Lead" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleChangeRole(member)}
                                    disabled={isLoading}
                                  >
                                    <UserCog className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(member)}
                                    disabled={isLoading}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {renderJobsTab()}

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              {Array.isArray(memoizedTeam?.recentActivity) &&
                memoizedTeam.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {memoizedTeam.recentActivity.map((activity, index) => (
                    <div
                      key={`activity-${index}-${activity.date}`}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-xs text-gray-500">
                          {activity.date}
                        </div>
                      </div>
                      <p className="text-sm">{activity.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No activity recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddTeamDialog
        isOpen={isNewTeam}
        onOpenChange={(open) => {
          if (!open && onCancel) {
            onCancel();
          }
        }}
        onTeamCreated={onTeamCreated}
        recruiters={recruiters}
        isLoadingRecruiters={isLoadingRecruiters}
        parentTeams={parentTeams}
        isLoadingParentTeams={isLoadingParentTeams}
      />

      <EditTeamDialog
        isOpen={editTeamDialogOpen}
        onOpenChange={handleEditDialogOpen}
        team={memoizedTeam}
        teamId={teamId}
        onTeamUpdated={contextUpdateTeam}
        recruiters={recruiters}
        isLoadingRecruiters={isLoadingRecruiters}
        parentTeams={parentTeams}
        isLoadingParentTeams={isLoadingParentTeams}
      />

      <AddMemberDialog
        isOpen={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        onAdd={handleAddMember}
        teamId={teamId}
        recruiters={recruiters}
        isLoadingRecruiters={isLoadingRecruiters}
        existingMembers={editedTeam?.teamMembers || []}
      />

      <ViewMemberDialog
        isOpen={isViewMemberDialogOpen}
        onOpenChange={setIsViewMemberDialogOpen}
        member={selectedMember}
        onDelete={() => {
          setIsViewMemberDialogOpen(false);
          handleDeleteClick(selectedMember);
        }}
      />

      <ViewJobDialog
        open={viewJobDialogOpen}
        onOpenChange={setViewJobDialogOpen}
        job={selectedJob}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.name} from the
              team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ChangeRoleDialog
        isOpen={isChangeRoleDialogOpen}
        onOpenChange={setIsChangeRoleDialogOpen}
        member={memberToChangeRole}
        onRoleChange={handleRoleChange}
      />
    </div>
  );
}
