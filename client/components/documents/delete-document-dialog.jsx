"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Loader2, Trash2, FileText, Calendar, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDocumentIcon, getDocumentStyles } from "@/lib/documentUtils";

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  document,
  onDelete,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!document?.id) {
      toast({
        title: "Error",
        description: "Invalid document information.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      // The onDelete callback should be an async function that handles the API call
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
        description: error.message || "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fallback in case document is null/undefined when dialog is closing
  if (!document) {
    return null;
  }
  
  const Icon = getDocumentIcon(document.fileType || document.mimeType);
  const { icon: color, bg: bgColor } = getDocumentStyles(document.fileType || document.mimeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Delete Document</DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete "{document.name}"? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Document Preview */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${bgColor} bg-gradient-to-br ${bgColor.replace('bg-', 'from-')} to-${bgColor.replace('bg-', '')}-600`}>
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{document.name}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{(document.fileType || "DOCUMENT").toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      <span>{document.fileSize || "Unknown size"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Uploaded {new Date(document.createdAt || document.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Message */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Warning</h4>
                  <p className="text-sm text-red-700">
                    This action will permanently delete the document and cannot be undone. 
                    All associated data, including sharing settings and tags, will be lost.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="p-6 pt-0 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
