"use client";

import { useState, useCallback, useEffect } from "react";
import { CompaniesList } from "@/components/companies/companies-list";
import { CompanyFilters } from "@/components/companies/company-filters";
import { CompanyDetails } from "@/components/companies/company-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Filter, Search } from "lucide-react";
import { CompaniesProvider, useCompanies } from "@/contexts/companies-context";
import { AddCompanyDialog } from "@/components/companies/add-company-dialog";
import { EditCompanyDialog } from "@/components/companies/edit-company-dialog";
import { ViewJobsDialog } from "@/components/companies/view-jobs-dialog";
import { ViewCandidatesDialog } from "@/components/companies/view-candidates-dialog";
import { DeleteCompanyDialog } from "@/components/companies/delete-company-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamsProvider } from "@/contexts/teams-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function CompaniesPageContent() {
  const {
    companies,
    loading,
    error,
    addCompany,
    updateCompany,
    getCompanyById,
    deleteCompany,
    setCompanies,
  } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    industries: [],
    locations: [],
    sizes: [],
  });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewJobsDialogOpen, setViewJobsDialogOpen] = useState(false);
  const [viewCandidatesDialogOpen, setViewCandidatesDialogOpen] =
    useState(false);
  const [deleteCompanyDialogOpen, setDeleteCompanyDialogOpen] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Reset selectedCompanyId when switching back to list view
  useEffect(() => {
    if (activeTab === "list") {
      setSelectedCompanyId(null);
      setSelectedCompany(null);
    }
  }, [activeTab]);

  // Fetch company details when selected
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (selectedCompanyId) {
        setLoadingCompany(true);
        try {
          const company = await getCompanyById(selectedCompanyId);
          setSelectedCompany(company);
          // Auto-switch to details tab when a company is selected
          setActiveTab("details");
        } catch (err) {
          console.log("Error fetching company details:", err);
        } finally {
          setLoadingCompany(false);
        }
      } else {
        setSelectedCompany(null);
      }
    };

    fetchCompanyDetails();
  }, [selectedCompanyId, getCompanyById]);

  const handleFiltersChange = useCallback((newFilters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
  }, []);

  const handleSelectCompany = (id) => {
    setSelectedCompanyId(id);
  };

  const handleEditCompany = async (id) => {
    setActiveCompanyId(id);
    setEditDialogOpen(true);
  };

  const handleViewJobs = (id) => {
    setActiveCompanyId(id);
    setViewJobsDialogOpen(true);
  };

  const handleJobDeleted = async (jobId) => {
    try {
      // Get the current company data
      const company = companies.find((c) => c.id === activeCompanyId);
      if (!company) return;

      // Update the company with decremented job count
      await updateCompany(activeCompanyId, {
        ...company,
        openJobs: Math.max(0, (company.openJobs || 0) - 1),
      });
    } catch (error) {
      console.log("Error updating company job count:", error);
    }
  };

  const handleViewCandidates = (id) => {
    setActiveCompanyId(id);
    setViewCandidatesDialogOpen(true);
  };

  const handleDeleteCompany = (id) => {
    setActiveCompanyId(id);
    setDeleteCompanyDialogOpen(true);
  };

  const confirmDeleteCompany = async (id) => {
    try {
      await deleteCompany(id);
      if (selectedCompanyId === id) {
        setSelectedCompanyId(null);
        setActiveTab("list");
      }
      // Clear the activeCompanyId to prevent fetching the deleted company
      if (activeCompanyId === id) {
        setActiveCompanyId(null);
      }
      // Close the delete dialog
      setDeleteCompanyDialogOpen(false);
    } catch (error) {
      console.log("Error deleting company:", error);
      // The company was already removed from the UI in the deleteCompany function,
      // so we still want to reset the selected company if it was the one being deleted
      if (selectedCompanyId === id) {
        setSelectedCompanyId(null);
        setActiveTab("list");
      }
      // Clear the activeCompanyId to prevent fetching the deleted company
      if (activeCompanyId === id) {
        setActiveCompanyId(null);
      }
      // Close the delete dialog
      setDeleteCompanyDialogOpen(false);
    }
  };

  // Fetch active company details for dialogs
  const [activeCompany, setActiveCompany] = useState(null);
  const [loadingActiveCompany, setLoadingActiveCompany] = useState(false);

  useEffect(() => {
    const fetchActiveCompany = async () => {
      if (activeCompanyId) {
        setLoadingActiveCompany(true);
        try {
          const company = await getCompanyById(activeCompanyId);
          setActiveCompany(company);
        } catch (err) {
          console.log("Error fetching active company:", err);
          // If the company was not found (404), clear the activeCompanyId
          if (err.message && err.message.includes("not found")) {
            setActiveCompanyId(null);
          }
        } finally {
          setLoadingActiveCompany(false);
        }
      } else {
        setActiveCompany(null);
      }
    };

    fetchActiveCompany();
  }, [activeCompanyId, getCompanyById]);

  const filteredCompanies = companies.filter((company) => {
    if (
      filters.status !== "all" &&
      company.status.toLowerCase() !== filters.status.toLowerCase()
    ) {
      return false;
    }
    if (
      filters.industries.length > 0 &&
      !filters.industries.includes(company.industry)
    ) {
      return false;
    }
    if (
      filters.locations.length > 0 &&
      !filters.locations.includes(company.location)
    ) {
      return false;
    }
    if (filters.sizes.length > 0) {
      // Extract the size range from the company's size string (e.g., "51-200 employees" -> "51-200")
      const companySizeRange = company.size.split(" ")[0];
      if (!filters.sizes.includes(companySizeRange)) {
        return false;
      }
    }
    return true;
  });

  // Calculate active filters count
  const activeFiltersCount = [
    filters.status !== "all" ? 1 : 0,
    filters.industries.length,
    filters.locations.length,
    filters.sizes.length
  ].reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="space-y-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <div className="flex flex-col lg:flex-row gap-6">
              <Skeleton className="h-96 w-64" />
              <div className="flex-1">
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="space-y-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h3 className="text-lg font-medium">Error loading companies</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Companies
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track your client companies
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building2 className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredCompanies.length}
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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger
              value="list"
              onClick={() => {
                if (activeTab === "details") {
                  setSelectedCompanyId(null);
                  setSelectedCompany(null);
                }
              }}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              Companies List
            </TabsTrigger>
            {selectedCompanyId && (
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Company Details
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col xl:flex-row gap-6 transition-all duration-500 ease-in-out">
            {/* Filters Section */}
            <div className="xl:flex-shrink-0 transition-all duration-500 ease-in-out">
              <div className="sticky top-6">
                <CompanyFiltersWrapper onFiltersChange={handleFiltersChange} />
              </div>
            </div>

            {/* Companies List Section */}
            <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
              <FilteredCompaniesList
                companies={filteredCompanies}
                onSelectCompany={handleSelectCompany}
                onEditCompany={handleEditCompany}
                onViewJobs={handleViewJobs}
                onViewCandidates={handleViewCandidates}
                onDeleteCompany={handleDeleteCompany}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {loadingCompany ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          ) : selectedCompany ? (
            <CompanyDetails company={selectedCompany} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Select a company to view details
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddCompanyDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <EditCompanyDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdateCompany={updateCompany}
        company={activeCompany || null}
        loading={loadingActiveCompany}
      />

      <ViewJobsDialog
        open={viewJobsDialogOpen}
        onOpenChange={setViewJobsDialogOpen}
        company={activeCompany || null}
        loading={loadingActiveCompany}
        onJobDeleted={handleJobDeleted}
      />

      <ViewCandidatesDialog
        open={viewCandidatesDialogOpen}
        onOpenChange={setViewCandidatesDialogOpen}
        company={activeCompany || null}
        loading={loadingActiveCompany}
      />

      <DeleteCompanyDialog
        open={deleteCompanyDialogOpen}
        onOpenChange={setDeleteCompanyDialogOpen}
        onDeleteCompany={(id) => confirmDeleteCompany(id)}
        company={activeCompany || undefined}
        loading={loadingActiveCompany}
      />
    </div>
  );
}

function FilteredCompaniesList({
  companies,
  onSelectCompany,
  onEditCompany,
  onViewJobs,
  onViewCandidates,
  onDeleteCompany,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const searchFilteredCompanies = companies.filter((company) => {
    return (
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(searchFilteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = searchFilteredCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <CompaniesList
      companies={paginatedCompanies}
      totalCompanies={searchFilteredCompanies.length}
      currentPage={currentPage}
      totalPages={totalPages}
      startIndex={startIndex}
      itemsPerPage={itemsPerPage}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onPageChange={setCurrentPage}
      onSelectCompany={onSelectCompany}
      onEditCompany={onEditCompany}
      onViewJobs={onViewJobs}
      onViewCandidates={onViewCandidates}
      onDeleteCompany={onDeleteCompany}
    />
  );
}

function CompanyFiltersWrapper({ onFiltersChange }) {
  return <CompanyFilters onFiltersChange={onFiltersChange} />;
}

export default function CompaniesPage() {
  return (
    <CompaniesProvider>
      <TeamsProvider>
        <CompaniesPageContent />
      </TeamsProvider>
    </CompaniesProvider>
  );
}
