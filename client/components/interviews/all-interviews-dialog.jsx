"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Download,
  Search,
  Video,
  Phone,
  MapPin,
  FileText,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Users,
} from "lucide-react";
import { useInterviews } from "@/contexts/interviews-context";
import { RescheduleInterviewDialog } from "./reschedule-interview-dialog";
import { CancelInterviewDialog } from "./cancel-interview-dialog";
import { ViewNotesDialog } from "./view-notes-dialog";
import { DeleteInterviewDialog } from "./delete-interview-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AllInterviewsDialog({ open, onOpenChange }) {
  const { interviews, deleteInterview, updateInterview } = useInterviews();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [viewNotesDialogOpen, setViewNotesDialogOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter interviews based on tab and search query
  const filteredInterviews = interviews.filter((interview) => {
    // Filter by tab
    if (activeTab === "upcoming" && interview.interviewStatus !== "Scheduled")
      return false;
    if (activeTab === "completed" && interview.interviewStatus !== "Completed")
      return false;
    if (activeTab === "canceled" && interview.interviewStatus !== "Canceled")
      return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        interview.Candidate?.name.toLowerCase().includes(query) ||
        interview.position.toLowerCase().includes(query) ||
        interview.interviewer.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Get icon based on interview type
  const getTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "phone":
        return <Phone className="h-4 w-4 text-green-500" />;
      case "in-person":
        return <MapPin className="h-4 w-4 text-purple-500" />;
      default:
        return <Video className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Scheduled":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            Upcoming
          </Badge>
        );
      case "Completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Completed
          </Badge>
        );
      case "Canceled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Canceled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Handle reschedule button click
  const handleReschedule = (id) => {
    setSelectedInterviewId(id);
    setRescheduleDialogOpen(true);
  };

  // Handle cancel button click
  const handleCancel = (id) => {
    setSelectedInterviewId(id);
    setCancelDialogOpen(true);
  };

  // Handle view notes button click
  const handleViewNotes = (id) => {
    setSelectedInterviewId(id);
    setViewNotesDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id) => {
    setSelectedInterviewId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async (id) => {
    await deleteInterview(id);
    setDeleteDialogOpen(false);
    setSelectedInterviewId(null);
  };

  // Handle mark as complete button click
  const handleMarkAsComplete = async (id) => {
    await updateInterview(id, { interviewStatus: "Completed" });
  };

  // Export to CSV
  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Candidate",
      "Position",
      "Date",
      "Time",
      "Type",
      "Interviewer",
      "Status",
      "Notes",
    ];
    const rows = filteredInterviews.map((interview) => [
      interview.Candidate?.name,
      interview.position,
      new Date(interview.date).toLocaleDateString(),
      interview.time,
      interview.interviewType === "video"
        ? "Video Call"
        : interview.interviewType === "phone"
          ? "Phone"
          : "In-person",
      interview.interviewer,
      interview.interviewStatus,
      interview.notes ? `"${interview.notes.replace(/"/g, '""')}"` : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interviews-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                All Interviews
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              View and manage all scheduled interviews across your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search and Export */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search interviews by candidate, position, or interviewer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleExport}
                variant="outline"
                className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100/80">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                >
                  All ({interviews.length})
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                >
                  Upcoming ({interviews.filter(i => i.interviewStatus === "Scheduled").length})
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                >
                  Completed ({interviews.filter(i => i.interviewStatus === "Completed").length})
                </TabsTrigger>
                <TabsTrigger
                  value="canceled"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                >
                  Canceled ({interviews.filter(i => i.interviewStatus === "Canceled").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Table */}
            <div className="border border-gray-100 rounded-xl overflow-hidden bg-white/60">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50/80 to-blue-50/50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">Candidate</TableHead>
                    <TableHead className="font-semibold text-gray-900">Position</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date & Time</TableHead>
                    <TableHead className="font-semibold text-gray-900">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">Interviewer</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterviews.length > 0 ? (
                    filteredInterviews.map((interview) => (
                      <TableRow key={interview.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {interview.Candidate?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {interview.position || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              {new Date(interview.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {interview.time || "No time"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(interview.interviewType || interview.type)}
                            <span className="text-sm text-gray-700 capitalize">
                              {interview.interviewType || interview.type || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {interview.interviewer || "N/A"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(interview.interviewStatus)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewNotes(interview.id)}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Notes
                              </DropdownMenuItem>
                              {interview.interviewStatus === "Scheduled" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleReschedule(interview.id)}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Reschedule
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkAsComplete(interview.id)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCancel(interview.id)}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(interview.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-4 bg-gray-50/50 rounded-full w-16 h-16 flex items-center justify-center">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">No interviews found</h3>
                          <p className="text-gray-500">
                            {searchQuery ? "Try adjusting your search criteria" : "No interviews match the current filter"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <RescheduleInterviewDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        interviewId={selectedInterviewId}
      />

      <CancelInterviewDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        interviewId={selectedInterviewId}
      />

      <ViewNotesDialog
        open={viewNotesDialogOpen}
        onOpenChange={setViewNotesDialogOpen}
        interviewId={selectedInterviewId}
      />

      <DeleteInterviewDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        interviewId={selectedInterviewId}
        onConfirm={handleDeleteConfirmed}
      />
    </>
  );
}
