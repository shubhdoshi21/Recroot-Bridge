"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  FileUp,
  FileText,
  FileIcon as FilePdf,
  FileSpreadsheet,
  MoreHorizontal,
  Eye,
  Trash2,
  FileImage,
  FileArchive,
  Pencil,
  Loader2,
} from "lucide-react"
import { DocumentPreview } from "@/components/documents/document-preview"
import { DocumentUpload } from "@/components/documents/document-upload"
import { EditDocumentDialog } from "@/components/documents/edit-document-dialog"
import * as onboardingService from "@/services/onboardingService"
import OnboardingDocumentUpload from "./onboarding-document-upload"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useDocuments } from "@/contexts/documents-context"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { documentService } from "@/services/documentService"
import { useToast } from "@/hooks/use-toast"

function getFileType(filename) {
  const extension = filename?.split(".").pop()?.toLowerCase() || "";
  if (["doc", "docx"].includes(extension)) return "document";
  if (["pdf"].includes(extension)) return "pdf";
  if (["xls", "xlsx"].includes(extension)) return "spreadsheet";
  if (["ppt", "pptx"].includes(extension)) return "presentation";
  if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image";
  if (["zip", "rar"].includes(extension)) return "archive";
  return "document";
}

function getFileIcon(type) {
  switch (type) {
    case "document": return FileText;
    case "pdf": return FilePdf;
    case "spreadsheet": return FileSpreadsheet;
    case "image": return FileImage;
    case "archive": return FileArchive;
    default: return FileText;
  }
}

function getIconColor(type) {
  switch (type) {
    case "document": return "text-blue-500";
    case "pdf": return "text-red-500";
    case "spreadsheet": return "text-green-500";
    case "presentation": return "text-orange-500";
    case "image": return "text-purple-500";
    case "archive": return "text-yellow-500";
    default: return "text-blue-500";
  }
}

// Add a helper to format file size in KB/MB
function formatFileSize(bytes) {
  if (typeof bytes === 'string' && (bytes.includes('KB') || bytes.includes('MB'))) return bytes;
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) return "Unknown size";
  if (bytes < 1024) return "1 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Add a SkeletonCard component for loading state
function SkeletonCard() {
  return (
    <div className="border rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-4/5 mb-3" />
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  );
}

export function OnboardingDocuments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [documentToEdit, setDocumentToEdit] = useState(null)
  const { onboardingDocs, onboardingDocsLoading: loading, fetchOnboardingDocs, addOnboardingDoc, deleteOnboardingDoc } = useOnboarding()
  const [error, setError] = useState(null)
  const { categories } = useDocuments()
  const { toast } = useToast()

  useEffect(() => {
    fetchOnboardingDocs()
  }, [fetchOnboardingDocs])

  // Extract unique subcategories for tabs
  const subcategories = Array.from(
    new Set(
      onboardingDocs
        .map((od) => od.subcategory)
        .filter((cat) => cat && cat.trim() !== "")
    )
  )

  // Helper to flatten onboardingDocs to document objects and add icon/iconColor
  const documents = onboardingDocs.map((od) => {
    const doc = od.document || {};
    const type = getFileType(doc.name);
    const categoryObj = categories.find(cat => cat.id === doc.categoryId);
    // Tags are now array of {id, name, color}
    const tags = Array.isArray(doc.tags) ? doc.tags : [];
    return {
      ...doc,
      icon: getFileIcon(type),
      iconColor: getIconColor(type),
      tags,
      subcategory: od.subcategory || doc.subcategory || "",
      categoryName: categoryObj ? categoryObj.name : doc.category || "",
      uploadedAt: doc.uploadedAt || doc.createdAt,
    };
  });

  // Filtering logic: only filter by search
  const filteredDocuments = documents.filter((document) => {
    return (
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (document.categoryName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (Array.isArray(document.tags) ? document.tags.some((tag) => tag && tag.toLowerCase().includes(searchQuery.toLowerCase())) : false)
    );
  });

  // Handle preview, edit, delete, upload
  const handlePreview = (document) => setSelectedDocument(document) || setIsPreviewOpen(true)
  const handleEditClick = (document) => setDocumentToEdit(document) || setIsEditDialogOpen(true)

  const handleDeleteClick = (document) => {
    const onboardingDoc = onboardingDocs.find(od => od.documentId === document.id)
    setDocumentToDelete({ ...document, onboardingDocId: onboardingDoc?.id })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!documentToDelete?.onboardingDocId) return
    try {
      await deleteOnboardingDoc(documentToDelete.onboardingDocId)
      setIsDeleteDialogOpen(false)
      setDocumentToDelete(null)
    } catch (err) {
      setError(err.message || "Failed to delete onboarding document")
    }
  }

  const handleUploadSuccess = async (newDocument, subcategory) => {
    if (newDocument && newDocument.id) {
      await addOnboardingDoc({ documentId: newDocument.id, subcategory })
    }
    setIsUploadDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card className="light-mode-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Onboarding Documents</CardTitle>
          <Button size="sm" onClick={() => setIsUploadDialogOpen(true)}>
            <FileUp className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments.map((document) => {
                    const Icon = document.icon || FileText;
                    return (
                      <div key={document.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <Icon className={`h-10 w-10 ${document.iconColor} flex-shrink-0`} />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-sm truncate" title={document.name}>
                                {document.name}
                              </h3>
                              <div className="text-xs text-gray-400 mt-1">
                                {document.fileSize && <span>{formatFileSize(document.fileSize)}</span>}
                                {document.fileSize && document.uploadedAt && <span> • </span>}
                                {document.uploadedAt && format(new Date(document.uploadedAt), "dd MMM yyyy, hh:mm a")}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 ml-2">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreview(document)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(document)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(document)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{document.description}</p>

                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {document.subcategory && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200 whitespace-nowrap"
                              >
                                {document.subcategory}
                              </Badge>
                            )}
                            {document.tags && document.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag.id}
                                style={{
                                  border: `1.5px solid ${tag.color || "#6B7280"}`,
                                  color: tag.color || "#2563EB",
                                  background: "#fff",
                                }}
                                className="text-xs whitespace-nowrap font-medium"
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {document.tags && document.tags.length > 2 && (
                              <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200 whitespace-nowrap">
                                +{document.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="policies">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments
                    .filter((document) => document.subcategory === "Policies")
                    .map((document) => {
                      const Icon = document.icon || FileText;
                      return (
                        <div key={document.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <Icon className={`h-10 w-10 ${document.iconColor} flex-shrink-0`} />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-sm truncate" title={document.name}>
                                  {document.name}
                                </h3>
                                <div className="text-xs text-gray-400 mt-1">
                                  {document.fileSize && <span>{formatFileSize(document.fileSize)}</span>}
                                  {document.fileSize && document.uploadedAt && <span> • </span>}
                                  {document.uploadedAt && format(new Date(document.uploadedAt), "dd MMM yyyy, hh:mm a")}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 ml-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePreview(document)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(document)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(document)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{document.description}</p>

                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {document.categoryName && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap"
                                >
                                  {document.categoryName}
                                </Badge>
                              )}
                              {document.subcategory && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200 whitespace-nowrap"
                                >
                                  {document.subcategory}
                                </Badge>
                              )}
                              {document.tags && document.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  style={{
                                    border: `1.5px solid ${tag.color || "#6B7280"}`,
                                    color: tag.color || "#2563EB",
                                    background: "#fff",
                                  }}
                                  className="text-xs whitespace-nowrap font-medium"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {document.tags && document.tags.length > 2 && (
                                <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200 whitespace-nowrap">
                                  +{document.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="forms">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments
                    .filter((document) => document.subcategory === "Forms")
                    .map((document) => {
                      const Icon = document.icon || FileText;
                      return (
                        <div key={document.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <Icon className={`h-10 w-10 ${document.iconColor} flex-shrink-0`} />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-sm truncate" title={document.name}>
                                  {document.name}
                                </h3>
                                <div className="text-xs text-gray-400 mt-1">
                                  {document.fileSize && <span>{formatFileSize(document.fileSize)}</span>}
                                  {document.fileSize && document.uploadedAt && <span> • </span>}
                                  {document.uploadedAt && format(new Date(document.uploadedAt), "dd MMM yyyy, hh:mm a")}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 ml-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePreview(document)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(document)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(document)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{document.description}</p>

                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {document.categoryName && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap"
                                >
                                  {document.categoryName}
                                </Badge>
                              )}
                              {document.subcategory && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200 whitespace-nowrap"
                                >
                                  {document.subcategory}
                                </Badge>
                              )}
                              {document.tags && document.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  style={{
                                    border: `1.5px solid ${tag.color || "#6B7280"}`,
                                    color: tag.color || "#2563EB",
                                    background: "#fff",
                                  }}
                                  className="text-xs whitespace-nowrap font-medium"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {document.tags && document.tags.length > 2 && (
                                <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200 whitespace-nowrap">
                                  +{document.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="guides">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments
                    .filter((document) => document.subcategory === "Guides")
                    .map((document) => {
                      const Icon = document.icon || FileText;
                      return (
                        <div key={document.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <Icon className={`h-10 w-10 ${document.iconColor} flex-shrink-0`} />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-sm truncate" title={document.name}>
                                  {document.name}
                                </h3>
                                <div className="text-xs text-gray-400 mt-1">
                                  {document.fileSize && <span>{formatFileSize(document.fileSize)}</span>}
                                  {document.fileSize && document.uploadedAt && <span> • </span>}
                                  {document.uploadedAt && format(new Date(document.uploadedAt), "dd MMM yyyy, hh:mm a")}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 ml-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePreview(document)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(document)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(document)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{document.description}</p>

                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {document.categoryName && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap"
                                >
                                  {document.categoryName}
                                </Badge>
                              )}
                              {document.subcategory && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200 whitespace-nowrap"
                                >
                                  {document.subcategory}
                                </Badge>
                              )}
                              {document.tags && document.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  style={{
                                    border: `1.5px solid ${tag.color || "#6B7280"}`,
                                    color: tag.color || "#2563EB",
                                    background: "#fff",
                                  }}
                                  className="text-xs whitespace-nowrap font-medium"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {document.tags && document.tags.length > 2 && (
                                <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200 whitespace-nowrap">
                                  +{document.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name || "Document Preview"}</DialogTitle>
            <DialogDescription>View document details and content</DialogDescription>
          </DialogHeader>
          {selectedDocument && <DocumentPreview document={selectedDocument} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {documentToDelete && (
            <div className="border rounded-md p-3 bg-gray-50 mt-4">
              <div className="flex items-start gap-3">
                <documentToDelete.icon className={`h-8 w-8 ${documentToDelete.iconColor} flex-shrink-0`} />
                <div>
                  <h4 className="font-medium text-sm">{documentToDelete.name}</h4>
                  <div className="text-xs text-gray-400 mt-1">
                    {documentToDelete.fileSize && <span>{formatFileSize(documentToDelete.fileSize)}</span>}
                    {documentToDelete.fileSize && documentToDelete.uploadedAt && <span> • </span>}
                    {documentToDelete.uploadedAt && format(new Date(documentToDelete.uploadedAt), "dd MMM yyyy, hh:mm a")}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload Onboarding Document</DialogTitle>
            <DialogDescription>
              Upload a document for onboarding. Only Policies, Guides, and Forms are allowed.
            </DialogDescription>
          </DialogHeader>
          <OnboardingDocumentUpload onUpload={handleUploadSuccess} onClose={() => setIsUploadDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      {documentToEdit && (
        <EditDocumentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          document={documentToEdit}
          onUpdate={async (id, updateData) => {
            try {
              await documentService.updateDocument(id, updateData);
              await fetchOnboardingDocs();
              setIsEditDialogOpen(false);
              setDocumentToEdit(null);
            } catch (err) {
              toast({
                title: "Error",
                description: err.message || "Failed to update document",
                variant: "destructive",
              });
            }
          }}
        />
      )}
    </div>
  )
}
