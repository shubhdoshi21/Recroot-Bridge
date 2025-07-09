"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useJobs } from "@/contexts/jobs-context"
import { TrendingUp, Eye, Users, Percent, Clock } from "lucide-react"

export function JobPerformance({ jobId }) {
  const [performance, setPerformance] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getJobPerformance } = useJobs()

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!jobId) return
      try {
        setIsLoading(true)
        const data = await getJobPerformance(jobId)
        setPerformance(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerformance()
  }, [jobId, getJobPerformance])

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading job performance: {error}</p>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </Card>
    )
  }

  if (!performance) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-600">
          <p>No performance data available</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-7 w-7 text-blue-600" />
          <h2 className="text-2xl font-bold">Job Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-4 flex flex-col items-center justify-center">
            <Eye className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="text-sm text-gray-500 mb-1">Total Views</h3>
            <p className="text-2xl font-bold">{performance.totalViews || 0}</p>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center">
            <Users className="h-6 w-6 text-green-500 mb-2" />
            <h3 className="text-sm text-gray-500 mb-1">Total Applications</h3>
            <p className="text-2xl font-bold">{performance.totalApplications || 0}</p>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center">
            <Percent className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="text-sm text-gray-500 mb-1">Conversion Rate</h3>
            <p className="text-2xl font-bold">
              {performance.conversionRate ? `${performance.conversionRate}%` : "0%"}
            </p>
          </Card>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-500" />
          <h3 className="text-xl font-semibold">Application Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500">New</span>
            <span className="text-xl font-bold">{performance.newApplications || 0}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500">In Review</span>
            <span className="text-xl font-bold">{performance.inReviewApplications || 0}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Shortlisted</span>
            <span className="text-xl font-bold">{performance.shortlistedApplications || 0}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Rejected</span>
            <span className="text-xl font-bold">{performance.rejectedApplications || 0}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-orange-500" />
          <h3 className="text-xl font-semibold">Time Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Average Time to Fill</span>
            <span className="text-xl font-bold">
              {performance.averageTimeToFill ? `${performance.averageTimeToFill} days` : "N/A"}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Average Time in Stage</span>
            <span className="text-xl font-bold">
              {performance.averageTimeInStage ? `${performance.averageTimeInStage} days` : "N/A"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
} 