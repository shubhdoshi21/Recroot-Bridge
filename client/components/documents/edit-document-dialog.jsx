"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Plus, FileText, FileImage, FileIcon as FilePdf, FileSpreadsheet, FileCode, Edit, Tag, FolderOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDocuments } from "@/contexts/documents-context"

export function EditDocumentDialog({ open, onOpenChange, document, onUpdate }) {
  const { toast } = useToast()
  const { categories } = useDocuments()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: [],
    newTag: "",
  })

  // Initialize form data when document changes
  useEffect(() => {
    if (document) {
      console.log("Document for edit:", document);

      // Handle different category field formats from backend
      let categoryValue = "";
      if (document.category && typeof document.category === "object" && document.category.name) {
        categoryValue = document.category.name;
      } else if (document.categoryName) {
        categoryValue = document.categoryName;
      } else if (typeof document.category === "string") {
        categoryValue = document.category;
      }

      // Handle tags - ensure we get tag names as strings
      let tagValues = [];
      if (document.tags) {
        tagValues = document.tags.map(tag =>
          typeof tag === "object" && tag.name ? tag.name : tag
        ).filter(Boolean);
      }

      setFormData({
        name: document.name || "",
        description: document.description || "",
        category: categoryValue,
        tags: tagValues,
        newTag: "",
      });
    }
  }, [document]);

  // Document type options
  const documentTypes = [
    { value: "pdf", label: "PDF Document", icon: FilePdf },
    { value: "doc", label: "Word Document", icon: FileText },
    { value: "xls", label: "Excel Spreadsheet", icon: FileSpreadsheet },
    { value: "img", label: "Image", icon: FileImage },
    { value: "code", label: "Code File", icon: FileCode },
  ]

  // Get category options from context, with fallback to static options
  const categoryOptions = categories && Array.isArray(categories) && categories.length > 0
    ? categories
      .filter(cat => cat && typeof cat === 'object' && cat.name)
      .map(cat => cat.name)
    : [
      "Uncategorized",
      "Contracts",
      "Reports",
      "Policies",
      "Templates",
      "Invoice",
      "Proposal",
      "Resume",
      "Legal",
      "Marketing",
      "Financial",
      "Technical",
      "Other",
    ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: "",
      }))
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!document?.id) {
        throw new Error('Invalid document ID')
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
      }

      await onUpdate(document.id, updateData)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Edit Document</DialogTitle>
              <DialogDescription className="text-gray-600">
                Update the document details below. Click save when you're done.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Document Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Document Information</h3>
                    <p className="text-sm text-gray-600">Update basic document details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Document Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter document name"
                      required
                      className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger id="category" className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-blue-500" />
                              <span>{category}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter document description"
                    rows={3}
                    className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Tags</h3>
                    <p className="text-sm text-gray-600">Add or remove tags to organize your document</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium text-gray-700">Add Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newTag"
                      name="newTag"
                      value={formData.newTag}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Add a tag"
                      className="flex-1 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!formData.newTag.trim()}
                      className="hover:bg-blue-50 border-blue-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Current Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags
                        .filter(tag => tag && typeof tag === 'string')
                        .map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                            <Tag className="h-3 w-3" />
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove {tag} tag</span>
                            </Button>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document Type Info */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {document?.icon && <document.icon className={`h-6 w-6 ${document.iconColor || "text-blue-500"}`} />}
                <div>
                  <span className="text-sm font-medium text-gray-700">File Type:</span>
                  <span className="ml-2 text-sm text-gray-900 font-semibold">
                    {document?.fileType?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2">
                    <Edit className="h-4 w-4" />
                  </div>
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
