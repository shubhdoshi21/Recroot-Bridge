"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useJobs } from "@/contexts/jobs-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Briefcase, FileText, Users, MapPin, Building, Clock, DollarSign } from "lucide-react"
import { EditJobDialog } from "./edit-job-dialog"
import { DeleteJobDialog } from "./delete-job-dialog"

export function JobDetails({ jobId, isNewJob = false }) {
  const [job, setJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { getJobById } = useJobs()

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return
      try {
        setIsLoading(true)
        const jobData = await getJobById(jobId)
        setJob(jobData)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId, getJobById])

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading job details: {error}</p>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
    )
  }

  if (!job) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-600">
          <p>No job details found</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">{job.title}</h2>
              <p className="text-gray-600">{job.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2">
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{job.department || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{job.location || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{job.type || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                variant="outline"
                className={
                  job.status === "active"
                    ? "bg-green-100 text-green-800"
                    : job.status === "draft"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-100 text-gray-800"
                }
              >
                {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : "Unknown"}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Requirements
            </TabsTrigger>
            <TabsTrigger value="applicants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Applicants
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Description
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{job.description || "No description available"}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-green-500" />
                Responsibilities
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{job.responsibilities || "No responsibilities specified"}</p>
            </div>
          </TabsContent>
          <TabsContent value="requirements" className="space-y-6 mt-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                Required Skills
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{job.requiredSkills || "No required skills specified"}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Experience
              </h3>
              <p className="text-gray-600">{job.experience || "No experience requirements specified"}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-pink-500" />
                Education
              </h3>
              <p className="text-gray-600">{job.education || "No education requirements specified"}</p>
            </div>
          </TabsContent>
          <TabsContent value="applicants" className="space-y-6 mt-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Total Applicants
              </h3>
              <p className="text-gray-600">{job.applicants || 0}</p>
            </div>
            {/* Add applicant list/table here */}
          </TabsContent>
        </Tabs>
      </Card>

      <EditJobDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        job={job}
      />

      <DeleteJobDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        job={job}
      />
    </div>
  )
} 