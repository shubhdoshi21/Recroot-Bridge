"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { FileUp, X, Plus, FileText, FileImage, FileIcon as FilePdf, FileSpreadsheet, FileArchive, Upload, Tag, Eye, Users, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useDocuments } from "@/contexts/documents-context"

export function DocumentUpload({ onUpload, onClose }) {
  const [fileName, setFileName] = useState("")
  const [documentName, setDocumentName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [visibility, setVisibility] = useState("private")
  const [selectedFile, setSelectedFile] = useState(null)
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { uploadDocument, categories } = useDocuments()

  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id.toString());
    }
  }, [categories]);

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

  const getFileType = (filename) => {
    const extension = filename.split(".").pop()?.toLowerCase() || ""

    if (["doc", "docx"].includes(extension)) return "document"
    if (["pdf"].includes(extension)) return "pdf"
    if (["xls", "xlsx"].includes(extension)) return "spreadsheet"
    if (["ppt", "pptx"].includes(extension)) return "presentation"
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image"
    if (["zip", "rar"].includes(extension)) return "archive"

    return "document"
  }

  const getFileIcon = (type) => {
    switch (type) {
      case "document":
        return FileText
      case "pdf":
        return FilePdf
      case "spreadsheet":
        return FileSpreadsheet
      case "image":
        return FileImage
      case "archive":
        return FileArchive
      default:
        return FileText
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case "document":
        return "text-blue-500"
      case "pdf":
        return "text-red-500"
      case "spreadsheet":
        return "text-green-500"
      case "presentation":
        return "text-orange-500"
      case "image":
        return "text-purple-500"
      case "archive":
        return "text-yellow-500"
      default:
        return "text-blue-500"
    }
  }

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "private":
        return Lock
      case "team":
        return Users
      case "public":
        return Eye
      default:
        return Lock
    }
  }

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case "private":
        return "text-red-500"
      case "team":
        return "text-blue-500"
      case "public":
        return "text-green-500"
      default:
        return "text-red-500"
    }
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
      // Normalize tags to always be an array
      const normalizedTags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string' && tags.trim() !== ''
          ? [tags.trim()]
          : [];
      // Ensure tags are properly formatted as strings
      const formattedTags = normalizedTags.map(tag =>
        typeof tag === 'string' ? tag : (tag?.name || tag.toString())
      ).filter(Boolean);

      // Create the document data for upload
      const documentData = {
        name: documentName.trim(),
        description: description.trim(),
        categoryId: selectedCategoryId ? parseInt(selectedCategoryId) : null,
        tags: formattedTags,
        visibility: visibility,
        isTemplate: false,
      }
      console.log("Selected categoryId:", selectedCategoryId);
      console.log("Document data:", documentData);

      if (onUpload) {
        await onUpload({ file: selectedFile, ...documentData });
      } else {
        // Upload using the document service (generic)
        await uploadDocument(selectedFile, documentData);
      }

      // Close the dialog if onClose is provided
      if (onClose) {
        onClose()
      }

      // Reset form
      setFileName("")
      setDocumentName("")
      setDescription("")
      setSelectedCategoryId("")
      setVisibility("private")
      setSelectedFile(null)
      setTags([])
      setNewTag("")

    } catch (error) {
      console.log("Error uploading document:", error)
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
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">File Upload</h3>
                <p className="text-sm text-gray-600">Select the document you want to upload</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-sm font-medium text-gray-700">File</Label>
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
                    className="pr-20 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-1 top-1 h-7 hover:bg-blue-50 border-blue-200"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Browse
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Details Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Document Details</h3>
                  <p className="text-sm text-gray-600">Provide information about your document</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document-name" className="text-sm font-medium text-gray-700">Document Name</Label>
                  <Input
                    id="document-name"
                    placeholder="Enter document name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-category" className="text-sm font-medium text-gray-700">Category</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger id="document-category" className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                      {categories && Array.isArray(categories) && categories.length > 0 ? (
                        categories
                          .filter(cat => cat && typeof cat === 'object' && cat.id && cat.name)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-description" className="text-sm font-medium text-gray-700">Description (Optional)</Label>
                <Textarea
                  id="document-description"
                  placeholder="Enter a brief description of the document"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Settings & Tags</h3>
                  <p className="text-sm text-gray-600">Configure visibility and add tags</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document-visibility" className="text-sm font-medium text-gray-700">Visibility</Label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger id="document-visibility" className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          <span>Private</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="team">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>Team</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-green-500" />
                          <span>Public</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-tags" className="text-sm font-medium text-gray-700">Tags</Label>
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
                      className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      className="hover:bg-blue-50 border-blue-200"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add Tag</span>
                    </Button>
                  </div>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags
                    .filter(tag => tag && typeof tag === 'string')
                    .map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-blue-500 hover:text-blue-700 transition-colors"
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
          </CardContent>
        </Card>

        <DialogFooter className="pt-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="animate-spin mr-2">
                  <FileUp className="h-4 w-4" />
                </div>
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
    </div>
  )
}
