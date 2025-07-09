"use client"
import { useState } from "react"
import { DocumentPreviewContent } from "@/components/documents/document-preview-content"
import { useToast } from "@/hooks/use-toast"
import { DocumentShareDialog } from "@/components/documents/document-share-dialog"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// Format file size helper function
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

export function DocumentPreview({ document, open, onOpenChange, onShare }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      setIsShareDialogOpen(true)
    }
  }

  // If open and onOpenChange are provided, render as a dialog
  if (open !== undefined && onOpenChange) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-auto p-0 bg-transparent shadow-none border-none">
            <VisuallyHidden>
              <DialogTitle>{document?.name || "Document Preview"}</DialogTitle>
            </VisuallyHidden>
            <Card className="w-full h-full shadow-xl border-none">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 text-white rounded-t-lg p-6">
                <CardTitle className="text-2xl font-bold">{document?.name || "Document Preview"}</CardTitle>
                <CardDescription className="text-white/80">View document details and content</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {document?.type} • {formatFileSize(document?.size)}
                  </p>
                </div>
                <DocumentPreviewContent document={document} />
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
        {/* Always render the share dialog outside the main dialog to avoid nesting issues */}
        {isShareDialogOpen && (
          <DocumentShareDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} document={document} />
        )}
      </>
    )
  }

  // Otherwise, render as a regular component
  return (
    <Card className="w-full shadow-xl border-none">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 text-white rounded-t-lg p-6">
        <CardTitle className="text-2xl font-bold">{document?.name}</CardTitle>
        <CardDescription className="text-white/80">
          {document?.type} • {formatFileSize(document?.size)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <DocumentPreviewContent document={document} />
        {/* Share Dialog */}
        {isShareDialogOpen && (
          <DocumentShareDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} document={document} />
        )}
      </CardContent>
    </Card>
  )
}
