"use client"
import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, FileIcon as FilePdf, FileSpreadsheet } from "lucide-react"

export function EditTemplateDialog({ isOpen, onClose, template, onUpdateTemplate }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("job-descriptions")
  const [fileType, setFileType] = useState("document")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with template data when it changes
  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description)
      setCategory(template.category)
      setFileType(template.type)
    }
  }, [template])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!template) return

    setIsSubmitting(true)

    // Determine icon and color based on file type
    let icon, iconColor
    switch (fileType) {
      case "pdf":
        icon = FilePdf
        iconColor = "text-red-500"
        break
      case "spreadsheet":
        icon = FileSpreadsheet
        iconColor = "text-green-500"
        break
      default:
        icon = FileText
        iconColor = "text-blue-500"
    }

    // Create updated template object
    const updatedTemplate = {
      ...template,
      name,
      description,
      category,
      type: fileType,
      lastUpdated: new Date().toISOString().split("T")[0],
      icon,
      iconColor,
    }

    // Call the parent handler
    onUpdateTemplate(updatedTemplate)

    // Reset form and close dialog
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>Update the template information using the form below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job-descriptions">Job Descriptions</SelectItem>
                  <SelectItem value="offer-letters">Offer Letters</SelectItem>
                  <SelectItem value="interview-materials">Interview Materials</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fileType">File Type</Label>
              <Select value={fileType} onValueChange={setFileType} required>
                <SelectTrigger id="fileType">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
