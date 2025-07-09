"use client";

import { useState, useEffect, useRef } from "react";
import { useDocuments } from "@/contexts/documents-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentPreview } from "@/components/documents/document-preview";
import { EditDocumentDialog } from "@/components/documents/edit-document-dialog";
import { DeleteDocumentDialog } from "@/components/documents/delete-document-dialog";
import { DocumentShareDialog } from "@/components/documents/document-share-dialog";
import { DocumentDownloadHandler } from "@/components/documents/document-download-handler";
import {
  Search,
  MoreHorizontal,
  Upload,
  Grid,
  List,
  FileText,
  FileImage,
  File,
  FileSpreadsheet,
  FileCode,
  FileVideo,
  FileAudio,
  Archive,
  FileJson,
  Building2,
  Tag,
  User as UserIcon,
  Eye,
  Edit,
  Share2,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentUpload } from "@/components/documents/document-upload";
import { Badge } from "@/components/ui/badge";
import {
  getDocumentIcon,
  getDocumentStyles,
  formatFileSize,
} from "@/lib/documentUtils";
import { AnimatePresence, motion } from "framer-motion";

export default function DocumentLibrary({ filters }) {
  const {
    allDocuments,
    updateDocument,
    deleteDocument,
    uploadDocument,
    loading,
    loadDocuments,
    page: contextPage,
    limit,
    total,
  } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(limit || 5);
  const nodeRef = useRef(null);

  // When filters, search, or pageSize change, reset to page 1 and reload
  useEffect(() => {
    setCurrentPage(1);
    loadDocuments({ ...filters, searchQuery, page: 1, limit: pageSize });
  }, [JSON.stringify(filters), searchQuery, pageSize]);

  // When page changes, load that page
  useEffect(() => {
    loadDocuments({
      ...filters,
      searchQuery,
      page: currentPage,
      limit: pageSize,
    });
  }, [currentPage]);

  // Keep currentPage in sync with contextPage (from backend)
  useEffect(() => {
    if (contextPage && contextPage !== currentPage) {
      setCurrentPage(contextPage);
    }
  }, [contextPage]);

  // Pagination logic
  const totalPages = Math.ceil(total / pageSize);
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  // Use allDocuments as the current page's documents
  const currentDocuments = allDocuments || [];

  const handleOpenPreview = (document) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const handleOpenEdit = (document) => {
    setSelectedDocument(document);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (document) => {
    setSelectedDocument(document);
    setIsDeleteOpen(true);
  };

  const handleOpenShare = (document) => {
    setSelectedDocument(document);
    setIsShareOpen(true);
  };

  const handleOpenUpload = () => {
    setIsUploadOpen(true);
  };

  const handleUploadSuccess = async (documentData) => {
    try {
      // Upload using the document service (generic)
      const newDocument = await uploadDocument(documentData.file, {
        name: documentData.name,
        description: documentData.description,
        categoryId: documentData.categoryId,
        tags: documentData.tags,
        visibility: documentData.visibility,
        isTemplate: documentData.isTemplate,
      });

      // Normalize uploadedBy to always show the name, not the ID
      let normalizedDoc = { ...newDocument };
      if (normalizedDoc.uploader && normalizedDoc.uploader.fullName) {
        normalizedDoc.uploadedBy = normalizedDoc.uploader.fullName;
      } else if (typeof normalizedDoc.uploadedBy === 'string') {
        // If uploadedBy is already a string (name), keep it
      } else {
        normalizedDoc.uploadedBy = "Unknown User";
      }

      console.log("Document uploaded successfully:", normalizedDoc);
      setIsUploadOpen(false);
    } catch (error) {
      console.log("Error uploading document:", error);
      // Error handling is done in the uploadDocument function in context
    }
  };

  const handleUpdateDocument = async (documentId, updateData) => {
    if (updateDocument) {
      try {
        console.log("Updating document with data:", updateData);
        const updatedDoc = await updateDocument(documentId, updateData);
        console.log("Document updated successfully:", updatedDoc);

        // Update the selectedDocument with the latest data from the server
        if (
          updatedDoc &&
          selectedDocument &&
          selectedDocument.id === documentId
        ) {
          setSelectedDocument(updatedDoc);
        }

        // Reload documents to ensure all views are refreshed
        if (loadDocuments) {
          await loadDocuments();
        }
      } catch (error) {
        console.log("Error updating document:", error);
      }
    }
    setIsEditOpen(false);
  };

  const handleDeleteDocument = async (document) => {
    if (deleteDocument) {
      try {
        await deleteDocument(document.id);
        // The dialog will show a success toast and close itself.
        // The documents list will be updated via the context's useEffect.
      } catch (error) {
        // The dialog will show an error toast.
        console.log("Failed to delete document from library view:", error);
      }
    }
    // We no longer need to manually close the dialog here,
    // the dialog component handles it on success.
    // setIsDeleteOpen(false)
  };

  // Enhanced pagination controls
  const renderPagination = () => {
    if (totalPages <= 1 && currentDocuments.length <= pageSize) return null;
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} documents
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-blue-50 border-blue-200"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={currentPage === pageNum ? "bg-blue-600" : "hover:bg-blue-50 border-blue-200"}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-blue-50 border-blue-200"
              >
                Next
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page size:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border border-blue-200 rounded-md px-3 py-1 text-sm bg-white focus:border-blue-400 focus:ring-blue-400"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Document Library
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={`${viewMode === "grid" ? "bg-blue-100 border-blue-300 text-blue-700" : "hover:bg-gray-50"} transition-all duration-200`}
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("list")}
                className={`${viewMode === "list" ? "bg-blue-100 border-blue-300 text-blue-700" : "hover:bg-gray-50"} transition-all duration-200`}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
              <Button
                onClick={handleOpenUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animated document list with Framer Motion */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {currentDocuments.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or upload a new document.
                </p>
                <Button onClick={handleOpenUpload} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentDocuments.map((document) => {
                const DocumentIcon = getDocumentIcon(document.fileType);
                const { icon: iconColor, bg: bgColor } = getDocumentStyles(
                  document.fileType
                );
                return (
                  <Card
                    key={document.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 hover:scale-105"
                  >
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                          <DropdownMenuItem
                            onClick={() => handleOpenPreview(document)}
                            className="hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(document)}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenShare(document)}
                            className="hover:bg-blue-50"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenDelete(document)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div
                      className={`h-40 flex items-center justify-center cursor-pointer ${bgColor} bg-gradient-to-br ${bgColor.replace('bg-', 'from-')} to-${bgColor.replace('bg-', '')}-600`}
                      onClick={() => handleOpenPreview(document)}
                    >
                      <DocumentIcon className={`h-16 w-16 ${iconColor}`} />
                    </div>
                    <CardContent className="p-4 flex-grow flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className="font-semibold text-sm truncate group-hover:text-blue-600 transition-colors"
                          title={document.name}
                        >
                          {document.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 truncate flex-grow">
                        {document.description || "No description provided"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {document.isCompanyDocument && (
                          <Badge
                            variant="secondary"
                            className="font-normal bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            Company
                          </Badge>
                        )}
                        {document.tags &&
                          Array.isArray(document.tags) &&
                          document.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        {document.candidate && (
                          <Badge
                            variant="secondary"
                            className="font-normal bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                          >
                            <UserIcon className="h-3 w-3 mr-1" />
                            {document.candidate.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{document.uploadedBy}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="space-y-1">
                  {currentDocuments.map((document) => {
                    const DocumentIcon = getDocumentIcon(document.fileType);
                    const { icon: iconColor } = getDocumentStyles(
                      document.fileType
                    );
                    return (
                      <div
                        key={document.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 p-4 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${iconColor.replace('text-', 'from-')}-50 to-${iconColor.replace('text-', '')}-100`}>
                              <DocumentIcon className={`h-6 w-6 ${iconColor}`} />
                            </div>
                          </div>
                          <div className="flex-grow grid grid-cols-4 gap-4 items-center min-w-0">
                            <div className="col-span-2">
                              <div className="flex items-center gap-2">
                                <h3
                                  className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors"
                                  title={document.name}
                                >
                                  {document.name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {document.isCompanyDocument && (
                                  <Badge
                                    variant="secondary"
                                    className="font-normal bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  >
                                    <Building2 className="h-3 w-3 mr-1" />
                                    Company
                                  </Badge>
                                )}
                                {document.tags &&
                                  Array.isArray(document.tags) &&
                                  document.tags.slice(0, 2).map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                    >
                                      <Tag className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                {document.candidate && (
                                  <Badge
                                    variant="secondary"
                                    className="font-normal bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                  >
                                    <UserIcon className="h-3 w-3 mr-1" />
                                    {document.candidate.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="truncate">{document.uploadedBy}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatFileSize(document.fileSize)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPreview(document)}
                              className="hover:bg-blue-50 text-blue-600"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-gray-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                                <DropdownMenuItem
                                  onClick={() => handleOpenEdit(document)}
                                  className="hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenShare(document)}
                                  className="hover:bg-blue-50"
                                >
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleOpenDelete(document)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {selectedDocument && (
        <>
          <DocumentPreview
            document={selectedDocument}
            open={isPreviewOpen}
            onOpenChange={setIsPreviewOpen}
          />
          <EditDocumentDialog
            document={selectedDocument}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onUpdate={handleUpdateDocument}
          />
          <DeleteDocumentDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            document={selectedDocument}
            onDelete={handleDeleteDocument}
          />
          <DocumentShareDialog
            document={selectedDocument}
            open={isShareOpen}
            onOpenChange={setIsShareOpen}
          />
        </>
      )}

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
            <DialogTitle className="text-xl font-bold text-gray-900">Upload Document</DialogTitle>
          </DialogHeader>
          <DocumentUpload onUpload={handleUploadSuccess} onClose={() => setIsUploadOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Enhanced Pagination Controls */}
      {renderPagination()}
    </div>
  );
}
