"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, Filter, Search, Briefcase, Target, Award } from "lucide-react"
import { RecruitersProvider } from "@/contexts/recruiters-context"
import { RecruitersList } from "@/components/recruiters/recruiters-list"
import { RecruiterFilters } from "@/components/recruiters/recruiter-filters"
import { AddRecruiterDialog } from "@/components/recruiters/add-recruiter-dialog"
import { useRecruiters } from "@/contexts/recruiters-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function RecruitersPageContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { filteredRecruiters, recruiters, filters } = useRecruiters()
  const { toast } = useToast()

  const handleAddRecruiter = async (recruiter) => {
    try {
      // Show success message
      toast({
        title: "Success",
        description: "Recruiter added successfully!",
        variant: "default",
      })
    } catch (error) {
      console.log("Error adding recruiter:", error)
      toast({
        title: "Error",
        description: "Failed to add recruiter.",
        variant: "destructive",
      })
    }
  }

  // Calculate active filters count
  const activeFiltersCount = [
    filters.status !== "all" ? 1 : 0,
    filters.departments.length,
    filters.specializations.length,
    filters.performance.length
  ].reduce((sum, count) => sum + count, 0)

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
                  Recruiters
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your recruitment team and assignments
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <UserPlus className="h-5 w-5" />
              Add Recruiter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recruiters</p>
                  <p className="text-2xl font-bold text-gray-900">{recruiters.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recruiters.reduce((sum, recruiter) => sum + (recruiter.activeJobs || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hires</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recruiters.reduce((sum, recruiter) => sum + (recruiter.hires || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-6 transition-all duration-500 ease-in-out">
        {/* Filters Section */}
        <div className="xl:flex-shrink-0 transition-all duration-500 ease-in-out">
          <div className="sticky top-6">
            <RecruiterFilters />
          </div>
        </div>

        {/* Recruiters List Section */}
        <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
          <RecruitersList />
        </div>
      </div>

      {/* Add Recruiter Dialog */}
      <AddRecruiterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  )
}

export default function RecruitersPage() {
  return (
    <RecruitersProvider>
      <RecruitersPageContent />
    </RecruitersProvider>
  )
}
