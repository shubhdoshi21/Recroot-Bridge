"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocumentDownloadHandler({
  document,
  variant = "default",
  size = "default",
  showIcon = true,
  showLabel = true,
  className = "",
  id,
  onDownloadComplete,
}) {
  const [status, setStatus] = useState("idle");
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

  // Use either doc or documentFile, whichever is provided
  const docToUse = document;

  const generateDocumentContent = (docObj) => {
    // Safety check to prevent errors
    if (!docObj || !docObj.type) {
      return `Error: Invalid document format`;
    }

    // In a real app, this would fetch the actual document content
    // Here we're just simulating different content based on document type
    switch (docObj.type) {
      case "pdf":
        return `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 6 0 R >> >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT /F1 24 Tf 100 700 Td (${docObj.name}) Tj ET
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000216 00000 n
0000000259 00000 n
0000000352 00000 n
trailer
<< /Size 7 /Root 1 0 R >>
startxref
429
%%EOF`;
      case "document":
        return `Document: ${docObj.name}\n\nThis is a sample document content for ${docObj.name}.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl.`;
      case "spreadsheet":
        return `ID,Name,Department,Position,Salary\n1,John Doe,Engineering,Senior Developer,120000\n2,Jane Smith,Marketing,Marketing Manager,95000\n3,Robert Johnson,Sales,Sales Representative,85000\n4,Emily Davis,HR,HR Specialist,75000\n5,Michael Wilson,Engineering,Junior Developer,65000`;
      case "presentation":
        return `Presentation: ${docObj.name}\n\nSlide 1: Introduction\n- Welcome to the presentation\n- Overview of topics\n\nSlide 2: Key Points\n- First important point\n- Second important point\n- Third important point\n\nSlide 3: Conclusion\n- Summary of key takeaways\n- Next steps\n- Questions?`;
      case "image":
        // For images, we'd normally return binary data, but for this simulation we'll return a text placeholder
        return `[Binary image data for ${docObj.name}]`;
      case "archive":
        // For archives, we'd normally return binary data, but for this simulation we'll return a text placeholder
        return `[Archive content for ${docObj.name}]`;
      default:
        return `Content for ${docObj.name}`;
    }
  };

  const getMimeType = (docObj) => {
    // Safety check to prevent errors
    if (!docObj || !docObj.type) {
      return "text/plain";
    }

    // Map document types to MIME types
    switch (docObj.type) {
      case "pdf":
        return "application/pdf";
      case "document":
        return docObj.name.endsWith(".docx")
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/msword";
      case "spreadsheet":
        return docObj.name.endsWith(".xlsx")
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/vnd.ms-excel";
      case "presentation":
        return docObj.name.endsWith(".pptx")
          ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          : "application/vnd.ms-powerpoint";
      case "image":
        if (docObj.name.endsWith(".jpg") || docObj.name.endsWith(".jpeg"))
          return "image/jpeg";
        if (docObj.name.endsWith(".png")) return "image/png";
        if (docObj.name.endsWith(".gif")) return "image/gif";
        return "image/jpeg";
      case "archive":
        if (docObj.name.endsWith(".zip")) return "application/zip";
        if (docObj.name.endsWith(".rar")) return "application/x-rar-compressed";
        return "application/zip";
      default:
        return "application/octet-stream";
    }
  };

  const downloadDocument = async () => {
    if (!docToUse || !docToUse.id) {
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

      setStatus("loading");

      // Actual download
      const response = await documentService.downloadDocumentWithResponse(docToUse.id);

      clearInterval(progressInterval);

      // Create a download link
      const url = URL.createObjectURL(response.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docToUse.name || `document-${docToUse.id}`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setStatus("complete");

      // Always call the onDownloadComplete callback to update the UI
      // This ensures the download count updates immediately without requiring a refresh
      if (onDownloadComplete) {
        onDownloadComplete();
      }

      toast({
        title: "Download Complete",
        description: `${docToUse.name} has been downloaded successfully.`,
      });

      // Reset status after a delay
      setTimeout(() => {
        setStatus("idle");
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

  return (
    <Button
      variant={variant}
      size={size}
      onClick={downloadDocument}
      disabled={status === "loading"}
      className={`rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-white shadow-md hover:from-blue-600 hover:to-blue-400 transition-all ${className}`}
      id={id}
    >
      {showIcon && (
        <Download className={`h-4 w-4 ${showLabel ? "mr-2" : ""} ${status === "loading" ? "animate-spin" : ""}`} />
      )}
      {showLabel && (status === "loading" ? "Downloading..." : "Download")}
    </Button>
  );
}
