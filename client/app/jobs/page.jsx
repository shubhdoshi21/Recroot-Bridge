"use client";

import { useState } from "react"
import { JobsListContainer } from "@/components/jobs/jobs-list-container"
import { JobFilters } from "@/components/jobs/job-filters"
import { Button } from "@/components/ui/button"
import { Briefcase, Upload, Sparkles, FileText, Filter, Search } from "lucide-react"
import { JobsProvider } from "@/contexts/jobs-context"
import { CompaniesProvider } from "@/contexts/companies-context"
import { AddJobDialog } from "@/components/jobs/add-job-dialog"
import { BulkUploadDialog } from "@/components/jobs/bulk-upload-dialog"
import { AIJobDialog } from "@/components/jobs/ai-job-dialog"
import { JobTemplatesModal } from "@/components/jobs/job-templates-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useJobs } from "@/contexts/jobs-context"

export default function JobsPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setIsTemplatesModalOpen(false);
    setIsAddDialogOpen(true);

    toast({
      title: "Template selected",
      description: `Using "${template.name}" template as a base for your new job.`,
    });
  };

  return (
    <CompaniesProvider>
      <JobsProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Jobs
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Manage and track your job postings
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary action button */}
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  size="lg"
                >
                  <Briefcase className="h-5 w-5" />
                  Post New Job
                </Button>

                {/* Secondary actions in dropdown for mobile */}
                <div className="block md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsTemplatesModalOpen(true)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Use Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsAIDialogOpen(true)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Generator
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Secondary actions for desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                    onClick={() => setIsTemplatesModalOpen(true)}
                  >
                    <FileText className="h-4 w-4" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                    onClick={() => setIsAIDialogOpen(true)}
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Generator
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        <JobsStats />
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Filters</p>
                      <p className="text-2xl font-bold text-gray-900">
                        <ActiveFiltersCount />
                      </p>
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
                        <SearchResultsStatus />
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
                <JobFilters />
              </div>
            </div>

            {/* Jobs List Section */}
            <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
              <JobsListContainer />
            </div>
          </div>

          <AddJobDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            initialData={selectedTemplate}
          />

          <AIJobDialog
            isOpen={isAIDialogOpen}
            onClose={() => setIsAIDialogOpen(false)}
          />

          <JobTemplatesModal
            isOpen={isTemplatesModalOpen}
            onClose={() => setIsTemplatesModalOpen(false)}
            onSelectTemplate={handleTemplateSelect}
          />
        </div>
      </JobsProvider>
    </CompaniesProvider>
  );
}

// Helper components for stats
function JobsStats() {
  const { jobs = [] } = useJobs();
  return jobs.length;
}

function ActiveFiltersCount() {
  const { filters = {} } = useJobs();
  const activeCount = [
    filters.status !== "all" ? 1 : 0,
    filters.departments?.length || 0,
    filters.locations?.length || 0,
    filters.types?.length || 0
  ].reduce((sum, count) => sum + count, 0);
  return activeCount;
}

function SearchResultsStatus() {
  const { filters = {} } = useJobs();
  return filters.searchQuery ? "Filtered" : "All";
}
