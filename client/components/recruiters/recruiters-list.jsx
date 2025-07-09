"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  UserPlus,
  Loader2,
  Users,
  Briefcase,
  Target,
  Award,
  Eye,
  Edit,
  Trash2,
  Filter,
  UserCheck,
  Clock,
  Star,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRecruiters } from "@/contexts/recruiters-context";
import { ViewProfileDialog } from "./view-profile-dialog";
import { EditRecruiterDialog } from "./edit-recruiter-dialog";
import { AssignJobsDialog } from "./assign-jobs-dialog";
import { DeleteRecruiterDialog } from "./delete-recruiter-dialog";
import { getRecruiterById } from "@/services/recruiterService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function RecruitersList() {
  const {
    filteredRecruiters,
    searchQuery,
    setSearchQuery,
    isFilterCollapsed,
    loading,
    error,
    currentPage,
    totalPages,
    limit,
    setCurrentPage,
    setLimit,
    filters,
  } = useRecruiters();

  const { toast } = useToast();

  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editRecruiterOpen, setEditRecruiterOpen] = useState(false);
  const [assignJobsOpen, setAssignJobsOpen] = useState(false);
  const [deleteRecruiterOpen, setDeleteRecruiterOpen] = useState(false);

  // Calculate active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];

    if (searchQuery) {
      filters.push(`Search: "${searchQuery}"`);
    }

    return filters;
  }, [searchQuery]);

  // Get status display formatting with enhanced styling
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-300 shadow-sm";
      case "on_leave":
      case "on leave":
        return "bg-amber-50 text-amber-700 border-amber-300 shadow-sm";
      case "inactive":
        return "bg-red-50 text-red-700 border-red-300 shadow-sm";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300 shadow-sm";
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    // Handle snake_case to title case
    if (status.includes("_")) {
      return status
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }

    // Handle camelCase or lowercase
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Format name from first and last name
  const getFullName = (recruiter) => {
    if (!recruiter) return "";

    // Try to get name from recruiter or from nested User object
    const firstName = recruiter.firstName || recruiter.User?.firstName || "";
    const lastName = recruiter.lastName || recruiter.User?.lastName || "";

    return `${firstName} ${lastName}`.trim() || "Unnamed Recruiter";
  };

  // Add helper to get email
  const getEmail = (recruiter) => {
    return recruiter.email || recruiter.User?.email || "";
  };

  // Add helper to get phone
  const getPhone = (recruiter) => {
    return recruiter.phone || recruiter.User?.phone || "";
  };

  const handleAction = async (action, recruiter) => {
    // For edit action, fetch the full recruiter data to ensure we have all fields including phone
    if (action === "edit") {
      try {
        const fullRecruiterData = await getRecruiterById(recruiter.id);
        setSelectedRecruiter(fullRecruiterData);
        setEditRecruiterOpen(true);
        return;
      } catch (error) {
        console.log("Error fetching full recruiter data:", error);
        toast({
          title: "Error",
          description: "Failed to load recruiter data for editing",
          variant: "destructive",
        });
        return;
      }
    }

    // For other actions, use the recruiter data from the list
    setSelectedRecruiter(recruiter);

    switch (action) {
      case "viewProfile":
        setViewProfileOpen(true);
        break;
      case "assignJobs":
        setAssignJobsOpen(true);
        break;
      case "delete":
        setDeleteRecruiterOpen(true);
        break;
      default:
        break;
    }
  };

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
                  Recruiters Directory
                  {filteredRecruiters.length !== filteredRecruiters.length && (
                    <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {filteredRecruiters.length} of {filteredRecruiters.length}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredRecruiters.length} recruiter{filteredRecruiters.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search recruiters..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Filter className="h-3 w-3" />
                  {filter}
                </Badge>
              ))}
            </div>
          )}

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
                  <TableHead className="font-semibold text-gray-700 py-4">Recruiter</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 hidden md:table-cell">Department</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 hidden lg:table-cell">Specialization</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-center">Jobs</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-center hidden sm:table-cell">Candidates</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-center hidden sm:table-cell">Hires</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="w-[80px] py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <div>
                          <p className="text-lg font-medium">Loading recruiters...</p>
                          <p className="text-sm">Please wait while we fetch the data</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-red-500">
                        <Alert className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="text-lg font-medium">Error loading recruiters</p>
                          <p className="text-sm">{error}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRecruiters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                        <Users className="h-12 w-12 text-gray-300" />
                        <div>
                          <p className="text-lg font-medium">No recruiters found</p>
                          <p className="text-sm">Try adjusting your filters or search terms</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecruiters.map((recruiter, index) => (
                    <TableRow
                      key={recruiter.id || index}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-blue-100 shadow-md">
                            <AvatarImage
                              src={recruiter.profilePicture || "/placeholder.svg"}
                              alt={getFullName(recruiter)}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {getFullName(recruiter).charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{getFullName(recruiter)}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{getEmail(recruiter)}</span>
                            </div>
                            {getPhone(recruiter) && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Phone className="h-3 w-3" />
                                <span>{getPhone(recruiter)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-gray-800">{recruiter.department || "Not specified"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-800">{recruiter.specialization || "Not specified"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-gray-800">{recruiter.activeJobs || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-gray-800">{recruiter.candidates || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-gray-800">{recruiter.hires || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105 ${getStatusColor(recruiter.status)}`}
                              >
                                <UserCheck className="h-4 w-4" />
                                {formatStatus(recruiter.status)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white">
                              {recruiter.status === "active"
                                ? "This recruiter is currently active and available for assignments."
                                : recruiter.status === "on_leave" || recruiter.status === "on leave"
                                  ? "This recruiter is currently on leave."
                                  : "This recruiter is currently inactive."}
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
                              onClick={() => handleAction("viewProfile", recruiter)}
                              className="flex items-center gap-2 hover:bg-blue-50 cursor-pointer"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleAction("edit", recruiter)}
                              className="flex items-center gap-2 hover:bg-indigo-50 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 text-indigo-600" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("assignJobs", recruiter)}
                              className="flex items-center gap-2 hover:bg-green-50 cursor-pointer"
                            >
                              <Briefcase className="h-4 w-4 text-green-600" />
                              Assign Jobs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleAction("delete", recruiter)}
                              className="flex items-center gap-2 hover:bg-red-50 cursor-pointer text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredRecruiters.length > 0 ? (currentPage - 1) * limit + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(currentPage * limit, filteredRecruiters.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">{filteredRecruiters.length}</span>{" "}
            recruiters
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="h-9 w-[80px] bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                <SelectValue>{limit}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
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
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 p-0 ${currentPage === pageNum
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="h-9 w-9 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      {selectedRecruiter && (
        <>
          <ViewProfileDialog
            open={viewProfileOpen}
            onOpenChange={setViewProfileOpen}
            recruiter={selectedRecruiter}
          />
          <EditRecruiterDialog
            open={editRecruiterOpen}
            onOpenChange={setEditRecruiterOpen}
            recruiter={selectedRecruiter}
          />
          <AssignJobsDialog
            open={assignJobsOpen}
            onOpenChange={setAssignJobsOpen}
            recruiter={selectedRecruiter}
          />
          <DeleteRecruiterDialog
            open={deleteRecruiterOpen}
            onOpenChange={setDeleteRecruiterOpen}
            recruiter={selectedRecruiter}
          />
        </>
      )}
    </>
  );
}
