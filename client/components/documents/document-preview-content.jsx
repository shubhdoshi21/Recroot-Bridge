"use client"
import { useState, useEffect } from "react"
import { FileSpreadsheet, FileIcon as FilePdf, FileText, Image, File, Download, Eye, Calendar, User, Tag, Folder, Share2, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { documentService } from "@/services/documentService"
import { companyService } from "@/services/companyService"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DocumentPreviewContent({ document: documentObj }) {
  const [documentData, setDocumentData] = useState(documentObj)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewError, setPreviewError] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const { toast } = useToast()

  // Fetch document data if needed (always fetch on documentObj change if id is present)
  useEffect(() => {
    if (documentObj?.id) {
      fetchDocumentData()
    }
  }, [documentObj])

  // Generate preview URL when document changes
  useEffect(() => {
    if (documentData && isPreviewable(documentData.fileType)) {
      generatePreviewUrl()
    }
  }, [documentData])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchDocumentData = async () => {
    try {
      setIsLoading(true)
      const data = await documentService.getDocumentById(documentObj.id)
      const fetchedDocument = data.document || data;

      // Ensure uploadedBy is always a name, not an ID
      if (fetchedDocument.uploadedBy !== undefined && !isNaN(fetchedDocument.uploadedBy)) {
        // If uploadedBy is a number (ID), try to get the name from the uploader object
        if (fetchedDocument.uploader && fetchedDocument.uploader.fullName) {
          fetchedDocument.uploadedBy = fetchedDocument.uploader.fullName;
        } else {
          fetchedDocument.uploadedBy = "Unknown User";
        }
      }

      setDocumentData(fetchedDocument)
    } catch (error) {
      console.log("Failed to fetch document data:", error)
      toast({
        title: "Error",
        description: "Failed to load document details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generatePreviewUrl = async () => {
    try {
      setIsLoading(true)
      setPreviewError(false)
      let blob
      // If companyId is present, use companyService
      if (documentData.companyId) {
        blob = await companyService.downloadCompanyDocument(documentData.companyId, documentData.id)
      } else {
        blob = await documentService.getDocumentContent(documentData.id)
      }
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      console.log("Preview URL generated successfully:", url)
    } catch (error) {
      console.log("Failed to generate preview:", error)
      setPreviewError(true)
      toast({
        title: "Preview Error",
        description: "Failed to load document preview. Try downloading the file instead.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isPreviewable = (fileType) => {
    const previewableTypes = ['pdf', 'image', 'text', 'document']
    return previewableTypes.includes(fileType?.toLowerCase())
  }

  const formatFileSize = (bytes) => {
    // If it's already a formatted string, return it as is
    if (typeof bytes === 'string' &&
      (bytes.includes('Bytes') || bytes.includes('KB') ||
        bytes.includes('MB') || bytes.includes('GB'))) {
      return bytes;
    }

    // Handle null, undefined, or invalid inputs
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
      return "Unknown size";
    }

    if (bytes === 0) return "0 Bytes";

    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase()
    switch (type) {
      case 'pdf':
        return <FilePdf className="h-8 w-8 text-red-500" />
      case 'document':
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />
      case 'spreadsheet':
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-purple-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const handleDownload = async () => {
    try {
      setIsLoading(true)

      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.log("Cannot download in non-browser environment")
        toast({
          title: "Error",
          description: "Download is only available in browser",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Ensure we have a valid document ID
      if (!documentData || !documentData.id) {
        console.log("Invalid document data for download")
        toast({
          title: "Error",
          description: "Cannot download document: missing document information",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      console.log("Downloading document:", documentData.id)
      const response = await documentService.downloadDocumentWithResponse(documentData.id)

      if (!response || !response.blob) {
        throw new Error("Failed to download document: Empty response")
      }

      const blob = response.blob

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = documentData.originalName || documentData.name || `document-${documentData.id}`

      // Append to body, click, and clean up
      document.body.appendChild(a)
      a.click()

      // Small delay before cleanup to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      // Always update the download count locally regardless of header presence
      // This ensures the UI updates immediately without requiring a refresh
      setDocumentData(prevData => ({
        ...prevData,
        downloadCount: (prevData.downloadCount || 0) + 1
      }))

      toast({
        title: "Download Complete",
        description: `${documentData.name} has been downloaded successfully.`,
      })
    } catch (error) {
      console.log("Download failed:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading the document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Determine the appropriate preview based on document type
  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="border rounded-lg p-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading preview...</p>
          </div>
        </div>
      )
    }

    const fileType = documentData?.fileType?.toLowerCase()

    switch (fileType) {
      case "pdf":
        return (
          <div className="border rounded-lg overflow-hidden min-h-[400px]">
            <div className="bg-red-50 p-2 border-b flex justify-between items-center">
              <div className="flex items-center">
                <FilePdf className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium">{documentData?.name}</span>
              </div>
              <div>
                <Button
                  onClick={generatePreviewUrl}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? "Loading..." : "Reload"}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            {previewUrl && !previewError ? (
              <iframe
                src={previewUrl}
                className="w-full h-[600px]"
                title={documentData.name}
                onError={(e) => {
                  console.log("Error loading PDF in iframe:", e);
                  setPreviewError(true);
                }}
              />
            ) : (
              <div className="p-8 bg-gray-50 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <FilePdf className="h-16 w-16 mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{documentData?.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">PDF Document • {formatFileSize(documentData?.fileSize)}</p>
                  {isLoading ? (
                    <div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600 mb-4">
                        Loading PDF preview...
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        {previewError ? "Failed to load PDF document." : "PDF preview could not be loaded."}
                      </p>
                      <Button onClick={generatePreviewUrl} variant="outline" size="sm" className="mb-2">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reload
                      </Button>
                      <div className="mt-4">
                        <Button onClick={handleDownload} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return previewUrl ? (
          <div className="border rounded-lg p-4 text-center min-h-[400px]">
            <img
              src={previewUrl}
              alt={documentData?.name}
              className="mx-auto max-h-[500px] object-contain mb-4"
            />
            <p className="text-sm text-gray-500">{documentData?.name}</p>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Image className="h-16 w-16 mx-auto text-purple-500 mb-4" />
              <p className="text-sm text-gray-600">Loading image preview...</p>
              {previewError && (
                <Button onClick={generatePreviewUrl} variant="outline" size="sm" className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )

      case "document":
      case "doc":
      case "docx":
        return (
          <div className="border rounded-lg overflow-hidden min-h-[400px]">
            <div className="bg-blue-50 p-2 border-b flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">{documentData?.name}</span>
              </div>
              <Button
                onClick={handleDownload}
                variant="ghost"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            <div className="p-8 text-center">
              <FileText className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">{documentData?.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {documentData?.fileType?.toUpperCase()} Document • {formatFileSize(documentData?.fileSize)}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-gray-600 mb-4">
                  Document preview is not available in the browser. Please download the document to view its contents.
                </p>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              </div>
            </div>
          </div>
        )

      case "spreadsheet":
      case "xls":
      case "xlsx":
        return (
          <div className="border rounded-lg overflow-hidden min-h-[400px]">
            <div className="bg-green-50 p-4 border-b">
              <FileSpreadsheet className="h-5 w-5 text-green-600 inline-block mr-2" />
              <span className="font-medium">{documentData?.name}</span>
            </div>
            <div className="p-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Spreadsheet preview is not available. Please download the document to view its contents.
                </p>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Spreadsheet
                </Button>
              </div>
            </div>
          </div>
        )

      case "text":
        return (
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
            {previewUrl ? (
              <iframe src={previewUrl} className="w-full h-[500px]" />
            ) : (
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">Loading text preview...</p>
              </div>
            )}
          </div>
        );


      default:

        return (
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <File className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">{documentData?.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {documentData?.fileType} • {formatFileSize(documentData?.fileSize)}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Preview is not available for this file type. Please download the document to view it.
              </p>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )
    }
  }

  const renderProperties = () => {
    if (isLoading) {
      return (
        <div className="bg-white border rounded-md p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading properties...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white border rounded-md p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <File className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">File Name</h4>
                <p className="text-sm">{documentData?.name || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Original Name</h4>
                <p className="text-sm">{documentData?.originalName || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">File Type</h4>
                <div className="flex items-center">
                  {getFileIcon(documentData?.fileType)}
                  <span className="ml-2 text-sm capitalize">{documentData?.fileType || "N/A"}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">File Size</h4>
                <p className="text-sm">{formatFileSize(documentData?.fileSize)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">MIME Type</h4>
                <p className="text-sm">{documentData?.mimeType || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Version</h4>
                <p className="text-sm">{documentData?.version || "1"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Uploaded At</h4>
                <p className="text-sm">{formatDate(documentData?.uploadedAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Last Modified</h4>
                <p className="text-sm">{formatDate(documentData?.updatedAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Uploaded By</h4>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{documentData?.uploadedBy || "Unknown"}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                <div className="flex items-center">
                  <Folder className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{documentData?.categoryName || documentData?.category?.name || documentData?.category || "Uncategorized"}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Usage Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Usage Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Views</h4>
                <p className="text-sm">{documentData?.viewCount || 0}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Downloads</h4>
                <p className="text-sm">{documentData?.downloadCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {documentData?.tags && documentData.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {documentData.tags
                    .filter(tag => tag && (typeof tag === 'string' || (typeof tag === 'object' && tag.name)))
                    .map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {typeof tag === 'string' ? tag : tag.name}
                      </Badge>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* Description */}
          {documentData?.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-sm text-gray-600">{documentData.description}</p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full shadow-xl border-none">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 text-white rounded-t-lg p-4">
        <CardTitle className="text-xl font-bold">Document Details</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100 via-blue-50 to-white rounded-lg mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="document-preview">{renderPreview()}</div>
          </TabsContent>
          <TabsContent value="properties" className="mt-4">
            {renderProperties()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
