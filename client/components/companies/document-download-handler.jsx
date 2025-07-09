"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { companyService } from "@/services/companyService";

export function DocumentDownloadHandler({ open, onOpenChange, document, companyId }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !document) return;

    // Reset state when dialog opens
    setProgress(0);
    setStatus("downloading");

    // Start the download process
    downloadDocument();

  }, [open, document]);

  const downloadDocument = async () => {
    if (!document?.id || !companyId) {
      setStatus("error");
      return;
    }

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          // Cap at 90% until we confirm download is complete
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 200);

      // Actual download
      const blob = await companyService.downloadDocument(companyId, document.id, (downloadProgress) => {
        if (downloadProgress <= 90) {
          setProgress(downloadProgress);
        }
      });

      clearInterval(progressInterval);

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = document.name || `document-${document.id}`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setStatus("complete");

      toast({
        title: "Download Complete",
        description: `${document.name} has been downloaded successfully.`,
      });

      // Auto close after completion
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.log("Download failed:", error);
      setStatus("error");

      toast({
        title: "Download Failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Downloading Document</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">Downloading {document.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="flex items-center gap-4 bg-gray-50/70 rounded-lg p-4">
            {document.icon && (
              <div className={`p-3 rounded-lg ${document.iconColor ? document.iconColor.replace("text-", "bg-").replace("500", "100") : "bg-blue-100"}`}>
                {document.icon && (
                  <document.icon className={`h-8 w-8 ${document.iconColor || "text-blue-500"}`} />
                )}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{document.name}</h3>
              <p className="text-sm text-gray-500">{document.size || "Unknown size"}</p>
            </div>
          </div>
          <div className="space-y-2">
            {status === "downloading" && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Downloading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </>
            )}
            {status === "complete" && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                <span>Download complete!</span>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <AlertCircle className="h-5 w-5" />
                <span>Download failed. Please try again.</span>
              </div>
            )}
          </div>
          {status === "error" && (
            <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" onClick={downloadDocument}>
              <Download className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
