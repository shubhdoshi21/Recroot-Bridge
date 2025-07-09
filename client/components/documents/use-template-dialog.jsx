"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDocuments } from "@/contexts/documents-context"
import { useToast } from "@/hooks/use-toast"

export function UseTemplateDialog({ isOpen, onClose, template }) {
  const [documentName, setDocumentName] = useState(template ? template.name : "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addDocument } = useDocuments()
  const { toast } = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create a new document based on the template
    const newDocument = {
      id: `doc_${Date.now()}`,
      name: documentName,
      type: template.type,
      size: "0 KB", // Will be calculated based on content
      uploadedBy: "Current User", // Should be replaced with actual user
      uploadedDate: new Date().toISOString().split("T")[0],
      category: template.category || "Uncategorized",
      tags: [],
      icon: template.icon,
      iconColor: template.iconColor,
      url: "#",
      content: `This document was created from the "${template.name}" template.`,
    }

    // Calculate approximate size based on content length
    const contentLength = newDocument.content.length
    if (contentLength > 0) {
      const sizeInKB = Math.max(1, Math.round(contentLength / 100))
      newDocument.size = `${sizeInKB} KB`
    }

    // Add the document to the library
    addDocument(newDocument)

    // Reset form and close dialog
    setDocumentName("")
    setIsSubmitting(false)
    onClose()

    // Show success notification
    toast({
      title: "Document Created",
      description: `"${documentName}" has been created and added to your document library.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Use Template: {template?.name}</DialogTitle>
          <DialogDescription>
            Create a new document based on this template. The new document will be added to your document library.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document-name" className="text-right">
                Document Name
              </Label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Template Info</Label>
              <div className="col-span-3 text-sm">
                <p>
                  <span className="font-medium">Type:</span> {template?.type}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Category:</span> {template?.category || "Uncategorized"}
                </p>
                <p className="mt-1 text-gray-500">{template?.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document-notes" className="text-right">
                Notes
              </Label>
              <Textarea id="document-notes" placeholder="Add any notes about this document..." className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
