"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Briefcase, Users, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { teamService } from "@/services/teamService"

/**
 * Dialog for assigning jobs to a team
 */
export function AssignJobDialog({ open, onOpenChange, onAssignJobs, teamId, currentAssignedJobIds = [] }) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobs, setSelectedJobs] = useState([])
  const [availableJobs, setAvailableJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available jobs when dialog opens
  useEffect(() => {
    if (open) {
      fetchAvailableJobs()
    }
  }, [open])

  // Fetch available jobs that can be assigned to the team
  const fetchAvailableJobs = async () => {
    try {
      setIsLoading(true)
      const response = await teamService.getUnassignedJobs()
      setAvailableJobs(response?.jobs || [])
    } catch (error) {
      console.log("Error fetching available jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load available jobs",
        variant: "destructive",
      })
      setAvailableJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter jobs based on search query
  const filteredJobs = availableJobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle checkbox changes
  const handleCheckboxChange = (jobId, checked) => {
    setSelectedJobs((prev) =>
      checked ? [...prev, jobId] : prev.filter((id) => id !== jobId),
    )
  }

  // Handle form submission
  const handleSubmit = () => {
    if (selectedJobs.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one job to assign",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const selectedJobObjects = availableJobs.filter((job) => selectedJobs.includes(job.id))

    onAssignJobs(selectedJobObjects)
      .then(() => {
        toast({
          title: "Success",
          description: "Jobs assigned successfully",
        })
        onOpenChange(false)
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to assign jobs",
          variant: "destructive",
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Assign Jobs to Team</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Select jobs to assign to your recruitment team
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Search & Select Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search jobs by title or department..."
                  className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading available jobs...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 mb-2">No jobs available to assign</p>
                  <p className="text-sm text-gray-500">All jobs may already be assigned to teams</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
                    </span>
                    {selectedJobs.length > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {selectedJobs.length} selected
                      </Badge>
                    )}
                  </div>

                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {filteredJobs.map((job) => (
                        <div
                          key={job.id}
                          className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-200 ${selectedJobs.includes(job.id)
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md'
                              : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50/80 hover:border-gray-300'
                            }`}
                        >
                          <Checkbox
                            id={`job-${job.id}`}
                            checked={selectedJobs.includes(job.id)}
                            onCheckedChange={(checked) => handleCheckboxChange(job.id, checked)}
                            disabled={currentAssignedJobIds.includes(job.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={`job-${job.id}`}
                                className="text-sm font-semibold text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {job.title}
                              </label>
                              {currentAssignedJobIds.includes(job.id) && (
                                <Badge variant="outline" className="text-xs">
                                  Already Assigned
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                {job.department}
                              </Badge>
                              {job.location && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  {job.location}
                                </Badge>
                              )}
                            </div>
                            {job.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {job.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 p-6 -m-6 mt-6">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedJobs.length === 0 || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Assign Selected Jobs ({selectedJobs.length})
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 