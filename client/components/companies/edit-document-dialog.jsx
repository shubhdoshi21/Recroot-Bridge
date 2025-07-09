"use client"
import { useState, useEffect } from "react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { companyService } from "@/services/companyService"
import { useDocuments } from "@/contexts/documents-context"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function EditDocumentDialog({ document, onSave, onCancel, companyId, open, onOpenChange }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { categories } = useDocuments()

  // Initialize form state when document changes or dialog opens
  useEffect(() => {
    console.log('EditDocumentDialog document:', document);
    if (document && open) {
      setName(document.name || "");
      setDescription(document.description || "");
      // Preload category by id if present
      if (document.category && document.category.id) {
        setSelectedCategoryId(document.category.id.toString());
      } else {
        setSelectedCategoryId("");
      }
      // Preload tags if present
      if (Array.isArray(document.tags)) {
        setTags(document.tags.map(tag => typeof tag === "object" && tag.name ? tag.name : tag).filter(Boolean));
      } else {
        setTags([]);
      }
    }
  }, [document, open])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: document.id,
        name: name.trim(),
        description: description.trim(),
        categoryId: selectedCategoryId ? parseInt(selectedCategoryId) : null,
        tags,
      };
      await onSave(payload);
      if (onCancel) onCancel();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save document.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If document is null, show a loading state or return null
  if (!document) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <div className="space-y-4">
          <DialogHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <X className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Edit Document</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">Update the document details. Click save when you're done.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-gray-50/70 rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Document Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description for this document" rows={3} disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input id="tags" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a tag" disabled={isSubmitting} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} />
                  <Button type="button" onClick={handleAddTag} variant="outline" disabled={isSubmitting}>Add</Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-gray-700" disabled={isSubmitting}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50/70 rounded-lg p-4 space-y-2">
              <Label>File Information</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="block max-w-xs truncate" title={document.fileType}>{document.fileType?.toUpperCase() || 'N/A'}</span>
                <span className="text-gray-500">Size:</span>
                <span>{document.fileSize ? `${document.fileSize} bytes` : 'N/A'}</span>
                <span className="text-gray-500">Uploaded by:</span>
                <span>{document.uploadedBy || 'N/A'}</span>
                <span className="text-gray-500">Upload date:</span>
                <span>{document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 -mx-6 -mb-6 px-6 py-4 mt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1 sm:flex-none hover:bg-gray-50 hover:border-gray-300 transition-colors">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (<>Save</>)}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
