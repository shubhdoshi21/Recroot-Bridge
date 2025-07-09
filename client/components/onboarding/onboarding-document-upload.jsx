"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { FileUp, X, Plus, FileText, FileImage, FileIcon as FilePdf, FileSpreadsheet, FileArchive } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import * as onboardingService from "@/services/onboardingService"
import { api } from "@/config/api"

const SUBCATEGORY_OPTIONS = [
  { value: "Policies", label: "Policies" },
  { value: "Guides", label: "Guides" },
  { value: "Forms", label: "Forms" },
]

function OnboardingDocumentUpload({ onUpload, onClose }) {
  const [fileName, setFileName] = useState("")
  const [documentName, setDocumentName] = useState("")
  const [description, setDescription] = useState("")
  const [subcategory, setSubcategory] = useState(SUBCATEGORY_OPTIONS[0].value)
  const [selectedFile, setSelectedFile] = useState(null)
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [visibility, setVisibility] = useState("private")
  const { toast } = useToast()

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setFileName(file.name)
      if (!documentName) {
        setDocumentName(file.name)
      }
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }
    if (!documentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a document name",
        variant: "destructive",
      })
      return
    }
    setIsUploading(true)
    try {
      const documentData = {
        name: documentName.trim(),
        description: description.trim(),
        tags,
        visibility,
        isTemplate: false,
        categoryId: 25,
      }
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("name", documentData.name)
      formData.append("description", documentData.description)
      formData.append("tags", JSON.stringify(tags))
      formData.append("visibility", visibility)
      formData.append("isTemplate", "false")
      formData.append("categoryId", 25)     
      const res = await fetch(api.documents.upload(), {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to upload document")
      const uploaded = await res.json()
      console.log('uploaded',uploaded)
      await onboardingService.addOnboardingDocument({
        documentId: uploaded.document.id,
        subcategory,
      })
      if (onUpload) onUpload(uploaded)
      if (onClose) onClose()
      setFileName("")
      setDocumentName("")
      setDescription("")
      setSubcategory(SUBCATEGORY_OPTIONS[0].value)
      setVisibility("private")
      setSelectedFile(null)
      setTags([])
      setNewTag("")
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">File</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
            />
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Select a file..."
              className="pr-20"
              readOnly
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Browse
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="document-name">Document Name</Label>
        <Input
          id="document-name"
          placeholder="Enter document name"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="document-description">Description (Optional)</Label>
        <Textarea
          id="document-description"
          placeholder="Enter a brief description of the document"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="document-subcategory">Subcategory</Label>
        <Select value={subcategory} onValueChange={setSubcategory}>
          <SelectTrigger id="document-subcategory">
            <SelectValue placeholder="Select a subcategory" />
          </SelectTrigger>
          <SelectContent>
            {SUBCATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="document-visibility">Visibility</Label>
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger id="document-visibility">
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="document-tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="document-tags"
            placeholder="Add tags..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Tag</span>
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags
              .filter(tag => tag && typeof tag === 'string')
              .map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-gray-500 hover:text-gray-700"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag}</span>
                  </button>
                </Badge>
              ))}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">
                <FileUp className="h-4 w-4" />
              </span>
              Uploading...
            </>
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default OnboardingDocumentUpload; 