"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Calendar,
  Edit,
  FileText,
  Plus,
  Eye,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useCompanies } from "@/contexts/companies-context"
import { useState, useEffect } from "react"
import { EditCompanyDialog } from "./edit-company-dialog"
import { ViewJobsDialog } from "./view-jobs-dialog"
import { AddJobToCompanyDialog } from "./add-job-to-company-dialog"
import { JobDetailsDialog } from "../jobs/job-details-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { DocumentUpload } from "../documents/document-upload"
import { DocumentPreviewContent } from "../documents/document-preview-content"
import { DocumentShareDialog as UnifiedDocumentShareDialog } from "../documents/document-share-dialog"
import { DocumentDownloadHandler } from "./document-download-handler"
import { DocumentActions } from "./document-actions"
import { EditDocumentDialog } from "./edit-document-dialog"
import { DeleteDocumentDialog } from "./delete-document-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { companyService } from "@/services/companyService"
import { documentService } from "@/services/documentService"
import { getDocumentIcon, getDocumentStyles, formatFileSize } from "@/lib/documentUtils"
import { Tabs as SubTabs, TabsList as SubTabsList, TabsTrigger as SubTabsTrigger, TabsContent as SubTabsContent } from "@/components/ui/tabs"

export function CompanyDetails({ company, onEditCompany = () => { }, onDeleteCompany = () => { } }) {
  const {
    updateCompany,
    getJobsByCompanyId,
    getNotesByCompanyId,
    getDocumentsByCompanyId,
    addNote,
    addDocument,
    updateDocument,
    deleteDocument,
    addJob,
  } = useCompanies()

  const [companyJobs, setCompanyJobs] = useState([])
  const [companyNotes, setCompanyNotes] = useState([])
  const [companyDocuments, setCompanyDocuments] = useState([])
  const [loading, setLoading] = useState({
    jobs: true,
    notes: true,
    documents: true
  })
  const [dataFetched, setDataFetched] = useState({
    jobs: false,
    notes: false,
    documents: false
  })

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewJobsDialogOpen, setViewJobsDialogOpen] = useState(false)
  const [addJobDialogOpen, setAddJobDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobDetailsDialogOpen, setJobDetailsDialogOpen] = useState(false)
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false)
  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [editDocumentDialogOpen, setEditDocumentDialogOpen] = useState(false)
  const [deleteDocumentDialogOpen, setDeleteDocumentDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const [sharedDocuments, setSharedDocuments] = useState([])
  const [loadingSharedDocs, setLoadingSharedDocs] = useState(true)
  const [sharedTab, setSharedTab] = useState("shared-with-me")
  const [sharedWithMeDocs, setSharedWithMeDocs] = useState([])
  const [sharedByMeDocs, setSharedByMeDocs] = useState([])
  const [loadingSharedWithMe, setLoadingSharedWithMe] = useState(true)
  const [loadingSharedByMe, setLoadingSharedByMe] = useState(true)

  // Fetch all data on component mount
  useEffect(() => {
    if (company?.id) {
      const fetchAllData = async () => {
        // Fetch jobs data
        if (!dataFetched.jobs) {
          try {
            const jobs = await getJobsByCompanyId(company.id);
            setCompanyJobs(jobs);
            setDataFetched(prev => ({ ...prev, jobs: true }));
          } catch (err) {
            console.log("Error fetching jobs:", err);
          } finally {
            setLoading(prev => ({ ...prev, jobs: false }));
          }
        }

        // Fetch notes data
        if (!dataFetched.notes) {
          try {
            const notes = await getNotesByCompanyId(company.id);
            setCompanyNotes(notes);
            setDataFetched(prev => ({ ...prev, notes: true }));
          } catch (err) {
            console.log("Error fetching notes:", err);
          } finally {
            setLoading(prev => ({ ...prev, notes: false }));
          }
        }

        // Fetch documents data
        if (!dataFetched.documents) {
          try {
            const documents = await getDocumentsByCompanyId(company.id);
            setCompanyDocuments(documents);
            setDataFetched(prev => ({ ...prev, documents: true }));
          } catch (err) {
            console.log("Error fetching documents:", err);
          } finally {
            setLoading(prev => ({ ...prev, documents: false }));
          }
        }
      };

      fetchAllData();
    }
  }, [company?.id, getJobsByCompanyId, getNotesByCompanyId, getDocumentsByCompanyId, dataFetched]);

  useEffect(() => {
    if (company?.id) {
      setLoadingSharedDocs(true)
      documentService.getSharedDocuments({ companyId: company.id })
        .then((res) => setSharedDocuments(res.documents || []))
        .catch((err) => {
          setSharedDocuments([])
          console.log("Error fetching shared documents:", err)
        })
        .finally(() => setLoadingSharedDocs(false))
    }
  }, [company?.id])

  useEffect(() => {
    if (company?.id) {
      setLoadingSharedWithMe(true);
      setLoadingSharedByMe(true);
      documentService.getSharedDocuments({ companyId: company.id, type: "shared-with-me" })
        .then((res) => setSharedWithMeDocs(res.documents || []))
        .catch(() => setSharedWithMeDocs([]))
        .finally(() => setLoadingSharedWithMe(false));
      documentService.getSharedDocuments({ companyId: company.id, type: "shared-by-me" })
        .then((res) => setSharedByMeDocs(res.documents || []))
        .catch(() => setSharedByMeDocs([]))
        .finally(() => setLoadingSharedByMe(false));
    }
  }, [company?.id]);

  useEffect(() => {
    return () => {
      // Cleanup any potential observers
      const observers = window.ResizeObserver ? Array.from(document.querySelectorAll(".observer-target")) : []
      observers.forEach((el) => {
        el.classList.remove("observer-target")
      })
    }
  }, [])

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 rounded-lg border border-gray-200">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Company not found</p>
          <p className="text-gray-400 text-sm">Please select a company to view details</p>
        </div>
      </div>
    )
  }

  const handleViewJob = (job) => {
    setSelectedJob(job)
    setJobDetailsDialogOpen(true)
  }

  const handleUploadDocument = async (documentData) => {
    try {
      const newDocument = await addDocument(company.id, documentData)

      // Normalize uploadedBy to always show the name, not the ID
      let normalizedDoc = { ...newDocument };
      if (normalizedDoc.uploader && normalizedDoc.uploader.fullName) {
        normalizedDoc.uploadedBy = normalizedDoc.uploader.fullName;
      } else if (typeof normalizedDoc.uploadedBy === 'string') {
        // If uploadedBy is already a string (name), keep it
      } else {
        normalizedDoc.uploadedBy = "Unknown User";
      }

      // Update local state
      setCompanyDocuments(prev => [normalizedDoc, ...prev])

      setUploadDocumentDialogOpen(false)

      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewDocument = async (document) => {
    try {
      const freshDoc = await companyService.getCompanyDocumentById(company.id, document.id);
      setSelectedDocument(freshDoc);
    } catch (e) {
      setSelectedDocument(document);
    }
    setDocumentPreviewOpen(true);
  }

  const handleShareDocument = (document) => {
    setSelectedDocument(document)
    setShareDialogOpen(true)
  }

  const handleDownloadDocument = (doc) => {
    setSelectedDocument(doc)
    setDownloadDialogOpen(true)
  }

  const handleEditDocument = async (document) => {
    // Fetch latest document data from backend
    try {
      const freshDoc = await companyService.getCompanyDocumentById(company.id, document.id)
      setSelectedDocument(freshDoc)
    } catch (e) {
      setSelectedDocument(document)
    }
    setEditDocumentDialogOpen(true)
  }

  const handleDeleteDocument = (document) => {
    setSelectedDocument(document)
    setDeleteDocumentDialogOpen(true)
  }

  const handleSaveEditedDocument = async (updatedDocument) => {
    try {
      await updateDocument(company.id, updatedDocument.id, updatedDocument)

      // Update local state
      setCompanyDocuments(prev =>
        prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
      )

      setEditDocumentDialogOpen(false)

      toast({
        title: "Document Updated",
        description: "The document details have been updated successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleConfirmDeleteDocument = async (documentToDelete) => {
    try {
      await deleteDocument(company.id, documentToDelete.id)

      // Update local state
      setCompanyDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id))

      setDeleteDocumentDialogOpen(false)

      toast({
        title: "Document Deleted",
        description: "The document has been deleted successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper to group team shares
  function groupTeamShares(docs) {
    const grouped = {};
    const userShares = [];
    docs.forEach(doc => {
      if (doc.teamId) {
        const key = doc.id + '-' + doc.teamId;
        if (!grouped[key]) {
          grouped[key] = {
            ...doc,
            recipients: [],
            recipientNames: [],
            recipientAvatars: [],
          };
        }
        // Add recipient info
        grouped[key].recipients.push(doc.sharedWithId);
        grouped[key].recipientNames.push(doc.sharedWith);
        if (doc.teamMemberAvatars) {
          grouped[key].recipientAvatars.push(...doc.teamMemberAvatars);
        }
      } else {
        userShares.push(doc);
      }
    });
    return [Object.values(grouped), userShares];
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative">
                <Avatar className="h-28 w-28 ring-4 ring-blue-100 shadow-lg">
                  <AvatarImage src={company.logo || "/placeholder.svg"} alt={company.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Building2 className="h-14 w-14" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 text-xs font-medium ${company.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : company.status === 'inactive'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                  >
                    {company.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{company.name}</h2>
                  <p className="text-gray-600 mt-1">{company.industry} • {company.location}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Company
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <span className="font-medium">{company.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Company Size</p>
                    <span className="font-medium">{company.size}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Briefcase className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Open Positions</p>
                    <span className="font-medium">{company.openJobs} positions</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Primary Contact</h3>
                <div className="space-y-1">
                  <div className="text-sm">{company.contactName || "No contact information available"}</div>
                  {company.contactPosition && (
                    <div className="text-sm text-gray-500">{company.contactPosition}</div>
                  )}
                  {company.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${company.contactEmail}`} className="text-blue-600 hover:underline">
                        {company.contactEmail}
                      </a>
                    </div>
                  )}
                  {company.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{company.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{company.name}</h2>
          <p className="text-gray-500">
            {company.industry} • {company.location}
          </p>
        </div>
        <div className="flex items-center gap-2">{/* Buttons can be added here if needed */}</div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="shared-documents">Shared Documents</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">About</h3>
                <p className="text-sm text-gray-700">{company.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <h4 className="text-xs text-gray-500">Founded</h4>
                  <p className="text-sm font-medium">{company.yearFounded || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Headquarters</h4>
                  <p className="text-sm font-medium">{company.location}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Employees</h4>
                  <p className="text-sm font-medium">{company.size}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Revenue</h4>
                  <p className="text-sm font-medium">{company.revenue || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hiring Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Open Positions</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{company.openJobs || 0}</span>
                    <Briefcase className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Active Candidates</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{company.activeCandidates || 0}</span>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Hires (Last 6 Months)</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{company.recentHires || 0}</span>
                    <Calendar className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Open Positions</CardTitle>
              <Button size="sm" onClick={() => setAddJobDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px]">
                {loading.jobs ? (
                  <div className="space-y-4 py-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="w-full overflow-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyJobs.length > 0 ? (
                          companyJobs.map((job) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.department}</TableCell>
                              <TableCell>{job.location}</TableCell>
                              <TableCell>{job.applicants}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleViewJob(job)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              No jobs found for this company
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Activity content would go here */}
              <div className="text-center py-8 text-muted-foreground">
                Activity tracking will be implemented in a future update
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Documents</CardTitle>
              <Button size="sm" onClick={() => setUploadDocumentDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px]">
                {loading.documents ? (
                  <div className="space-y-4 py-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : companyDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {companyDocuments.map((doc) => {

                      const DocumentIcon = getDocumentIcon(doc.fileType);
                      const { icon: iconColor } = getDocumentStyles(doc.fileType);
                      return (
                        <Card key={doc.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <DocumentIcon className={`h-8 w-8 ${iconColor}`} />
                              </div>
                              <div className="flex-grow grid grid-cols-4 gap-4 items-center min-w-0">
                                <div className="col-span-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-sm truncate" title={doc.name}>
                                      {doc.name}
                                    </h3>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate" title={doc.description}>
                                    {doc.description || "No description"}
                                  </p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {doc.uploadedBy}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.fileSize)}
                                </div>
                              </div>
                              <DocumentActions
                                document={doc}
                                onView={() => handleViewDocument(doc)}
                                onShare={() => handleShareDocument(doc)}
                                onDownload={() => handleDownloadDocument(doc)}
                                onEdit={() => handleEditDocument(doc)}
                                onDelete={() => handleDeleteDocument(doc)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );

                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No documents found for this company</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared-documents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Shared Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px]">
                <SubTabs value={sharedTab} onValueChange={setSharedTab} className="mb-4">
                  <SubTabsList>
                    <SubTabsTrigger value="shared-with-me">Shared with Me</SubTabsTrigger>
                    <SubTabsTrigger value="shared-by-me">Shared by Me</SubTabsTrigger>
                  </SubTabsList>
                </SubTabs>
                {sharedTab === "shared-with-me" ? (
                  loadingSharedWithMe ? (
                    <div className="space-y-4 py-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    (() => {
                      const companyDocIds = new Set(companyDocuments.map(d => d.id));
                      const filteredDocs = sharedWithMeDocs.filter(doc => companyDocIds.has(doc.id));
                      const [teamShares, userShares] = groupTeamShares(filteredDocs);
                      return (
                        <div className="space-y-4">
                          {/* Team Shares */}
                          {teamShares.map((doc) => (
                            <div key={doc.id + '-' + doc.teamId + '-team'} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${doc.iconColor?.replace("text-", "bg-").replace("500", "100") || "bg-blue-100"}`}>
                                  {doc.icon ? <doc.icon className={`h-6 w-6 ${doc.iconColor}`} /> : <FileText className="h-6 w-6 text-blue-500" />}
                                </div>
                                <div>
                                  <div className="font-medium">{doc.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {doc.size} • Shared by {doc.sharedBy} • Team: {doc.teamName} • Permission: {doc.permission}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {doc.teamMemberNames && doc.teamMemberNames.length > 0 && doc.teamMemberNames.map((name, idx) => (
                                      <span key={name + idx} className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-700 mr-1">{name}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                          {/* User Shares */}
                          {userShares.map((doc) => (
                            <div key={doc.id + '-' + (doc.sharedBy || '') + '-withme'} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${doc.iconColor?.replace("text-", "bg-").replace("500", "100") || "bg-blue-100"}`}>
                                  {doc.icon ? <doc.icon className={`h-6 w-6 ${doc.iconColor}`} /> : <FileText className="h-6 w-6 text-blue-500" />}
                                </div>
                                <div>
                                  <div className="font-medium">{doc.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {doc.size} • Shared by {doc.sharedBy} • Permission: {doc.permission}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                          {teamShares.length === 0 && userShares.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">No documents shared with you for this company</div>
                          )}
                        </div>
                      );
                    })()
                  )
                ) : (
                  loadingSharedByMe ? (
                    <div className="space-y-4 py-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    (() => {
                      const companyDocIds = new Set(companyDocuments.map(d => d.id));
                      const filteredDocs = sharedByMeDocs.filter(doc => companyDocIds.has(doc.id));
                      const [teamShares, userShares] = groupTeamShares(filteredDocs);
                      return (
                        <div className="space-y-4">
                          {/* Team Shares */}
                          {teamShares.map((doc) => (
                            <div key={doc.id + '-' + doc.teamId + '-team'} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${doc.iconColor?.replace("text-", "bg-").replace("500", "100") || "bg-blue-100"}`}>
                                  {doc.icon ? <doc.icon className={`h-6 w-6 ${doc.iconColor}`} /> : <FileText className="h-6 w-6 text-blue-500" />}
                                </div>
                                <div>
                                  <div className="font-medium">{doc.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {doc.size} • Shared with team: {doc.teamName} • Permission: {doc.permission}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {doc.teamMemberNames && doc.teamMemberNames.length > 0 && doc.teamMemberNames.map((name, idx) => (
                                      <span key={name + idx} className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-700 mr-1">{name}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                          {/* User Shares */}
                          {userShares.map((doc) => (
                            <div key={doc.id + '-' + (doc.sharedWithId || '') + '-byme'} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${doc.iconColor?.replace("text-", "bg-").replace("500", "100") || "bg-blue-100"}`}>
                                  {doc.icon ? <doc.icon className={`h-6 w-6 ${doc.iconColor}`} /> : <FileText className="h-6 w-6 text-blue-500" />}
                                </div>
                                <div>
                                  <div className="font-medium">{doc.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {doc.size} • Shared with {doc.sharedWith} • Permission: {doc.permission}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                          {teamShares.length === 0 && userShares.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">No documents shared by you for this company</div>
                          )}
                        </div>
                      );
                    })()
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditCompanyDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdateCompany={(id, data) => updateCompany(id, data)}
        company={company}
      />

      <ViewJobsDialog open={viewJobsDialogOpen} onOpenChange={setViewJobsDialogOpen} company={company} />

      <AddJobToCompanyDialog
        open={addJobDialogOpen}
        onOpenChange={setAddJobDialogOpen}
        onAddJob={(jobData) => addJob(company.id, jobData)}
        company={company}
      />

      <JobDetailsDialog
        open={jobDetailsDialogOpen}
        onOpenChange={setJobDetailsDialogOpen}
        job={selectedJob}
        company={company}
      />

      <Dialog open={uploadDocumentDialogOpen} onOpenChange={setUploadDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a document for {company.name}</DialogDescription>
          </DialogHeader>
          <DocumentUpload onUpload={handleUploadDocument} onClose={() => setUploadDocumentDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={documentPreviewOpen} onOpenChange={setDocumentPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <DocumentPreviewContent document={selectedDocument} />
        </DialogContent>
      </Dialog>

      <UnifiedDocumentShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        document={selectedDocument}
      />

      <DocumentDownloadHandler
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        document={selectedDocument}
      />

      <EditDocumentDialog
        open={editDocumentDialogOpen && selectedDocument !== null}
        onOpenChange={setEditDocumentDialogOpen}
        document={selectedDocument}
        onSave={handleSaveEditedDocument}
        onCancel={() => setEditDocumentDialogOpen(false)}
        companyId={company.id}
      />

      <DeleteDocumentDialog
        open={deleteDocumentDialogOpen && selectedDocument !== null}
        onOpenChange={setDeleteDocumentDialogOpen}
        document={selectedDocument}
        onDelete={handleConfirmDeleteDocument}
        companyId={company.id}
      />
    </div>
  )
}
