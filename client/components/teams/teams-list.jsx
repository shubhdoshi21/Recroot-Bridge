"use client"
import { useState, useEffect, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  Building,
  MapPin,
  Calendar,
  Star,
  Clock,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  BarChart3,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { useTeams } from "@/contexts/teams-context"
import { useToast } from "@/hooks/use-toast"

export function TeamsList({ onSelectTeam }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [error, setError] = useState(null)
  const [teamToDelete, setTeamToDelete] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { filteredTeams = [], isLoading, error: teamsError, deleteTeam } = useTeams()
  const { toast } = useToast()

  // Apply search filter on top of the context filters
  const filteredTeamsWithSearch = useMemo(() => {
    return (filteredTeams || []).filter(
      (team) =>
        team &&
        (team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (team.lead && team.lead.toLowerCase().includes(searchQuery.toLowerCase())) ||
          team.department?.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [filteredTeams, searchQuery])

  const totalPages = Math.ceil(filteredTeamsWithSearch.length / itemsPerPage)
  const paginatedTeams = filteredTeamsWithSearch.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  // Reset pagination when search query changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  // Handle error state
  useEffect(() => {
    if (teamsError) {
      setError(teamsError)
    } else {
      setError(null)
    }
  }, [teamsError])

  const handleView = (team) => {
    if (onSelectTeam) {
      onSelectTeam(team.id)
    }
  }

  const handleEdit = (team) => {
    // TODO: Implement edit functionality
    toast({
      title: "Edit Team",
      description: "Edit functionality will be implemented soon.",
    })
  }

  const handleDelete = (team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
    if (!teamToDelete) return;

    try {
      await deleteTeam(teamToDelete.id);
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
    } catch (error) {
      console.log("Error deleting team:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  }

  const handleManageMembers = (team) => {
    // TODO: Implement manage members functionality
    toast({
      title: "Manage Members",
      description: "Member management will be implemented soon.",
    })
  }

  const handleViewPerformance = (team) => {
    // TODO: Implement performance view functionality
    toast({
      title: "Team Performance",
      description: "Performance view will be implemented soon.",
    })
  }

  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Teams List</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Loading teams...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

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
                  Teams List
                  {filteredTeamsWithSearch.length !== filteredTeams.length && (
                    <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {filteredTeamsWithSearch.length} of {filteredTeams.length}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTeamsWithSearch.length} team{filteredTeamsWithSearch.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search teams..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

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
                  <TableHead className="font-semibold text-gray-700 py-4">Team</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Lead</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Members</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Active Jobs</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="w-[80px] py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeams.length > 0 ? (
                  paginatedTeams.map((team, index) => (
                    <TableRow
                      key={team.id || index}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-blue-100 shadow-md">
                            <AvatarImage
                              src={team.icon || "/placeholder.svg"}
                              alt={team.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {team.name ? team.name.charAt(0).toUpperCase() : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{team.name}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{team.department || "No department"}</span>
                            </div>
                            {team.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>{team.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-gray-800">{team.lead || "No lead"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-800">{team.members || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-gray-800">{team.activeJobs || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105
                                  ${team.status === "active"
                                    ? "bg-green-50 text-green-700 border-green-300 shadow-sm"
                                    : team.status === "archived"
                                      ? "bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                                      : "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                                  }
                                `}
                              >
                                {team.status === "active" ? (
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                ) : team.status === "archived" ? (
                                  <Clock className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <Users className="h-4 w-4 text-blue-600" />
                                )}
                                {team.status ? team.status.charAt(0).toUpperCase() + team.status.slice(1) : "Unknown"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white">
                              {team.status === "active"
                                ? "This team is currently active and operational."
                                : team.status === "archived"
                                  ? "This team has been archived and is not active."
                                  : "Team status is unknown or not set."}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                              onClick={() => handleView(team)}
                              className="flex items-center gap-2 hover:bg-blue-50 cursor-pointer"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(team)}
                              className="flex items-center gap-2 hover:bg-red-50 cursor-pointer text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Team
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
                          <p className="text-lg font-medium">No teams found</p>
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
            <span className="font-semibold text-gray-900">{paginatedTeams.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{filteredTeamsWithSearch.length}</span>{" "}
            teams
            {filteredTeamsWithSearch.length !== filteredTeams.length && (
              <span className="text-gray-500"> (filtered from {filteredTeams.length} total)</span>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl p-0 overflow-hidden max-w-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-100 to-pink-100 p-6 flex items-center gap-4 border-b border-red-200">
            <div className="rounded-full bg-white p-3 shadow-md">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-2xl font-bold text-gray-900">Delete Team</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700 mt-1">
                Are you sure you want to delete <span className="font-semibold text-red-600">{teamToDelete?.name}</span>? This action cannot be undone and will remove all associated data including team members and assigned jobs.
              </AlertDialogDescription>
            </div>
          </div>
          {/* Warning Box */}
          <div className="bg-white border border-red-200 rounded-lg mx-6 mt-6 mb-0 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-600 font-semibold mb-1">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z' /></svg>
              Warning:
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 pl-2">
              <li>All team information will be permanently deleted</li>
              <li>All team members will be removed</li>
              <li>All assigned jobs will be unlinked</li>
            </ul>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3 bg-gradient-to-r from-gray-50 to-red-50 border-t border-gray-100 rounded-b-xl p-6 mt-6">
            <AlertDialogCancel className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition-all duration-200"
            >
              <Trash2 className="h-5 w-5" /> Delete Team
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
