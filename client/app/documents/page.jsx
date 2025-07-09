"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentLibrary from "@/components/documents/document-library";
import { DocumentTemplates } from "@/components/documents/document-templates";
import { DocumentSharing } from "@/components/documents/document-sharing";
import { DocumentsProvider, useDocuments } from "@/contexts/documents-context";
import { DocumentFilters } from "@/components/documents/document-filters";
import { TeamsProvider } from "@/contexts/teams-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Filter, Search, Upload } from "lucide-react";

export default function DocumentsPage() {
  const { user } = useAuth();
  const { uploaders, selectedCandidateId } = useDocuments();
  const isPrivileged =
    user && (user.user.role === "admin" || user.user.role === "manager");
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    documentType: "all",
    dateRange: { from: undefined, to: undefined },
    categories: [],
    tags: [],
    uploadedBy: [],
    candidateId: undefined,
  });

  // Set uploadedBy to current user by default when user is loaded
  useEffect(() => {
    if (user && user.id && !isPrivileged) {
      setActiveFilters((prev) => ({
        ...prev,
        uploadedBy: [user.id],
      }));
    }
  }, [user, isPrivileged]);

  const handleFilterChange = (filters) => {
    if (!isPrivileged && user && user.id) {
      setActiveFilters({ ...filters, uploadedBy: [user.id] });
    } else {
      // Map uploadedBy ids to names for privileged users
      let uploadedByNames = filters.uploadedBy;
      if (
        Array.isArray(filters.uploadedBy) &&
        filters.uploadedBy.length > 0 &&
        uploaders &&
        uploaders.length > 0
      ) {
        uploadedByNames = filters.uploadedBy.map((id) => {
          const found = uploaders.find(
            (u) => u.id === id || u.uploaderId === id
          );
          return found ? found.fullName || found.name : id;
        });
      }
      setActiveFilters({ ...filters, uploadedBy: uploadedByNames });
    }
  };

  return (
    <TeamsProvider>
      <DocumentsProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Documents
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Manage and organize your document library
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Documents</p>
                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-gray-900">89</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-4">
              <Tabs defaultValue="library" className="w-full">
                <TabsList className="grid w-full md:w-auto grid-cols-2 h-auto bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200">
                  <TabsTrigger
                    value="library"
                    className="py-3 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Document Library
                  </TabsTrigger>
                  {/* <TabsTrigger
                    value="templates"
                    className="py-3 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </TabsTrigger> */}
                  <TabsTrigger
                    value="shared"
                    className="py-3 px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Shared Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="mt-6">
                  <div className="flex gap-6">
                    <DocumentFilters
                      onFilterChange={handleFilterChange}
                      className="h-[calc(100vh-220px)]"
                      isPrivileged={isPrivileged}
                    />

                    <div
                      className={`flex-1 transition-all duration-300 ${isFilterCollapsed ? "ml-0" : "ml-0"
                        }`}
                    >
                      <DocumentLibrary
                        filters={activeFilters}
                        selectedCandidateId={selectedCandidateId}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                  <DocumentTemplates />
                </TabsContent>

                <TabsContent value="shared" className="mt-6">
                  <DocumentSharing />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </DocumentsProvider>
    </TeamsProvider>
  );
}
