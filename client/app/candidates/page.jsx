"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, Filter, Search } from "lucide-react"
import { CandidateFilters } from "@/components/candidates/candidate-filters"
import { CandidatesList } from "@/components/candidates/candidates-list"
import { CandidateAddOptionsDialog } from "@/components/candidates/dialogs/candidate-add-options-dialog"
import { JobsProvider } from "@/contexts/jobs-context"
import { useCandidates } from "@/contexts/candidates-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CandidatesPage() {
  const [isAddOptionsDialogOpen, setIsAddOptionsDialogOpen] = useState(false)
  const { fetchCandidates, candidates, filters } = useCandidates()
  const { toast } = useToast()

  const handleAddCandidate = async (candidates) => {
    try {
      // Refresh the candidates list
      await fetchCandidates()

      // Show success message
      const candidateCount = Array.isArray(candidates) ? candidates.length : 1
      const message = candidateCount === 1
        ? "Candidate added successfully!"
        : `${candidateCount} candidates added successfully!`

      toast({
        title: "Success",
        description: message,
        variant: "default",
      })
    } catch (error) {
      console.log("Error refreshing candidates:", error)
      toast({
        title: "Warning",
        description: "Candidate(s) added but there was an issue refreshing the list.",
        variant: "default",
      })
    }
  }

  // Calculate active filters count
  const activeFiltersCount = [
    filters.status !== "all" ? 1 : 0,
    filters.positions.length,
    filters.skills.length,
    filters.experience.length
  ].reduce((sum, count) => sum + count, 0)

  return (
    <JobsProvider>
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
                    Candidates
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage and track your talent pipeline
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsAddOptionsDialogOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                <UserPlus className="h-5 w-5" />
                Add Candidate
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                    <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
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
                    <p className="text-sm font-medium text-gray-600">Search Results</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filters.searchQuery ? "Filtered" : "All"}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Search className="h-6 w-6 text-green-600" />
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
              <CandidateFilters />
            </div>
          </div>

          {/* Candidates List Section */}
          <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
            <CandidatesList />
          </div>
        </div>

        {/* Add Candidate Options Dialog */}
        <CandidateAddOptionsDialog
          isOpen={isAddOptionsDialogOpen}
          onOpenChange={setIsAddOptionsDialogOpen}
          onAdd={handleAddCandidate}
        />
      </div>
    </JobsProvider>
  )
}
