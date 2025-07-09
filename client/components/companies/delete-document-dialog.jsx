"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getDocumentIcon, getDocumentStyles, formatFileSize } from "@/lib/documentUtils"

export function DeleteDocumentDialog({ document, onDelete, open, onOpenChange, companyId }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!document?.id || !companyId) {
      toast({
        title: "Error",
        description: "Invalid document or company information.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete(document);
      toast({
        title: "Document Deleted",
        description: `"${document.name}" has been successfully deleted.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.log("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (!document) {
    return null;
  }

  const Icon = getDocumentIcon(document.fileType || document.mimeType);
  const { icon: color, bg: bgColor } = getDocumentStyles(document.fileType || document.mimeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-red-50 via-red-50/50 to-red-50/30 border-b border-red-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Delete Document</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">Are you sure you want to delete "{document.name}"? This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className={`border border-red-200 rounded-lg p-4 bg-red-50/80 backdrop-blur-sm text-red-800 text-sm mb-4`}>
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${color || 'text-blue-500'}`} />
            <div>
              <div className="font-medium">{document.name}</div>
              <div className="text-xs text-gray-500">
                {(document.fileType || "DOCUMENT").toUpperCase()} • {formatFileSize(document.fileSize)} • Uploaded on {new Date(document.createdAt || document.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="bg-gradient-to-r from-gray-50 to-red-50/30 border-t border-gray-100 -mx-6 -mb-6 px-6 py-4 mt-4 gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting} className="flex-1 sm:flex-none hover:bg-gray-50 hover:border-gray-300 transition-colors">Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Document"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
