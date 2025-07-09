"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Users, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { companyService } from "@/services/companyService"
import { Skeleton } from "@/components/ui/skeleton"

export function ViewCandidatesDialog({ open, onOpenChange, company, loading: companyLoading }) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCandidates, setTotalCandidates] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [viewCandidateOpen, setViewCandidateOpen] = useState(false)

  // Load candidates when dialog opens or company changes
  useEffect(() => {
    if (open && company && !companyLoading) {
      setIsLoading(true);

      const fetchCandidates = async () => {
        try {
          console.log(`Fetching candidates for company ID: ${company.id}`);

          if (!company.id) {
            console.log("Company ID is undefined");
            throw new Error("Invalid company ID");
          }

          const response = await companyService.getCompanyCandidates(company.id);
          console.log("API Response:", response);

          if (response && Array.isArray(response.candidates)) {
            setCandidates(response.candidates);
            setTotalCandidates(response.totalCandidates || 0);
            setTotalPages(response.totalPages || 1);
            setCurrentPage(response.currentPage || 1);
          } else {
            console.log("Invalid response format:", response);
            setCandidates([]);
            toast({
              title: "Warning",
              description: "No candidates found for this company",
              variant: "default",
            });
          }
        } catch (error) {
          console.log("Error fetching candidates:", error);
          toast({
            title: "Error",
            description: `Failed to load candidates: ${error.message || "Unknown error"}`,
            variant: "destructive",
          });

          // Fallback to empty candidates array
          setCandidates([]);
          setTotalCandidates(0);
          setTotalPages(1);
          setCurrentPage(1);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCandidates();
    } else {
      // Reset state when dialog closes
      setCandidates([]);
      setSearchQuery("");
    }
  }, [open, company, companyLoading, toast]);

  const handleDeleteCandidate = async (candidateId) => {
    try {
      setIsLoading(true);
      await companyService.removeCompanyCandidate(company.id, candidateId);

      setCandidates((prevCandidates) => prevCandidates.filter((candidate) => candidate.id !== candidateId));

      toast({
        title: "Candidate Removed",
        description: "The candidate has been removed successfully from this company",
      });

      setDeleteCandidateDialogOpen(false);
    } catch (error) {
      console.log("Error removing candidate:", error);
      toast({
        title: "Error",
        description: "Failed to remove candidate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const openDeleteCandidateDialog = (candidateId) => {
    setSelectedCandidateId(candidateId)
    setDeleteCandidateDialogOpen(true)
  }

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter((candidate) => {
    const query = searchQuery.toLowerCase()
    return (
      (candidate.name && candidate.name.toLowerCase().includes(query)) ||
      (candidate.location && candidate.location.toLowerCase().includes(query)) ||
      (candidate.email && candidate.email.toLowerCase().includes(query)) ||
      (candidate.status && candidate.status.toLowerCase().includes(query)) ||
      (candidate.jobTitle && candidate.jobTitle.toLowerCase().includes(query))
    )
  })

  // If no company is selected or company is still loading, show loading state
  if ((!company && open) || companyLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{companyLoading ? "Loading..." : "Error"}</DialogTitle>
          </DialogHeader>
          {companyLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <p>No company selected. Please select a company to view candidates.</p>
          )}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Candidates at {company?.name}</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">View and manage candidates associated with this company.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search candidates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading candidates...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-8 text-center border rounded-lg">
                <p className="text-muted-foreground mb-2">No candidates found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query" : `${company?.name} doesn't have any associated candidates yet`}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Current Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate, index) => (
                      <TableRow key={`${candidate.id}_${candidate.applicationId || index}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                              <AvatarFallback>{candidate.name?.charAt(0) || "C"}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{candidate.name || "Unknown"}</div>
                          </div>
                        </TableCell>
                        <TableCell>{candidate.location || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">{candidate.currentCompany || "Not specified"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{candidate.email}</span>
                            <span className="text-xs text-gray-500">{candidate.phone || "No phone"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{candidate.jobTitle || "N/A"}</TableCell>
                        <TableCell>{candidate.appliedDate ? new Date(candidate.appliedDate).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              candidate.status === "Hired"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : candidate.status === "Rejected"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : candidate.status === "Interview"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : candidate.status === "Screening"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {candidate.status || "Unknown"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewCandidateOpen} onOpenChange={setViewCandidateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogDescription>Detailed information about the candidate</DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCandidate.avatarUrl} alt={selectedCandidate.name} />
                  <AvatarFallback>{selectedCandidate.name?.charAt(0) || "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCandidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCandidate.position || "Applicant"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Contact Information</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">Email: {selectedCandidate.email}</p>
                    <p className="text-sm">Phone: {selectedCandidate.phone || "Not provided"}</p>
                    <p className="text-sm">Location: {selectedCandidate.location || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Application Details</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">Job: {selectedCandidate.jobTitle}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Status:</span>
                      <Badge variant="outline">{selectedCandidate.status || "Unknown"}</Badge>
                    </div>
                    <p className="text-sm">Applied: {selectedCandidate.appliedDate ? new Date(selectedCandidate.appliedDate).toLocaleDateString('en-GB') : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewCandidateOpen(false)}>
              Close
            </Button>
            <Button onClick={() => window.location.href = `/candidates/${selectedCandidate?.id}`}>
              View Full Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
