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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { User, Users, Globe, Lock, Share2 } from "lucide-react"
import { useDocuments } from "@/contexts/documents-context";
import { useSettings } from "@/contexts/settings-context";

function mapShareTypeToVisibility(shareType) {
  if (shareType === "user") return "Specific people";
  if (shareType === "team") return "Team";
  if (shareType === "public" || shareType === "anyone") return "Anyone with link";
  return "Specific people";
}

function mapVisibilityToBackend(visibility) {
  if (visibility === "Specific people") return "private";
  if (visibility === "Team") return "team";
  if (visibility === "Anyone with link") return "public";
  return "private";
}

export function EditSharedDocumentDialog({ open, onOpenChange, document, isSharedByMe, onUpdate }) {
  const { getDocumentById } = useDocuments();
  const { users } = useSettings();
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    accessLevel: "view",
    visibility: "Specific people",
    sharedWith: "",
    notes: "",
  })

  // Update form data when document changes, using the latest from context if available
  useEffect(() => {
    if (document) {
      console.log("Dialog received document:", document);
      console.log("Users available in dialog:", users);

      let sharedWithDisplay = "";
      if (document.shareType === "team" && Array.isArray(document.sharedWithIds)) {
        sharedWithDisplay = document.sharedWithIds
          .map(id => {
            const user = users.find(u => u.id === id);
            if (!user) {
              console.warn(`User with ID ${id} not found.`);
            }
            return user?.fullName;
          })
          .filter(Boolean)
          .join(", ");
      } else {
        sharedWithDisplay = Array.isArray(document.sharedWith)
          ? document.sharedWith.join(", ")
          : (document.sharedWith || "");
      }

      console.log("Setting 'Shared With' field to:", sharedWithDisplay);

      setFormData({
        name: document.name || "",
        accessLevel: document.permission || "view",
        visibility: mapShareTypeToVisibility(document.shareType) || document.visibility || "Specific people",
        sharedWith: sharedWithDisplay,
        notes: document.notes || document.message || "",
      });
    }
  }, [document, open, users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create a copy of the original document to preserve all properties
      const updatedDocument = { ...document }

      // Update common fields
      updatedDocument.name = formData.name
      updatedDocument.accessLevel = formData.accessLevel
      updatedDocument.notes = formData.notes

      // Update fields specific to the document type
      if (isSharedByMe) {
        updatedDocument.visibility = mapVisibilityToBackend(formData.visibility)

        // Process shared with data based on visibility
        if (formData.visibility === "Specific people") {
          // Always use the user ID for sharedWith
          updatedDocument.sharedWith = document.sharedWithId;
        } else if (formData.visibility === "Team") {
          updatedDocument.sharedWith = ["HR Team"]
        } else if (formData.visibility === "Anyone with link") {
          updatedDocument.sharedWith = ["Anyone with link"]
        } else {
          updatedDocument.sharedWith = []
        }
      } else {
        updatedDocument.sharedWith = []
      }

      // Call the onUpdate function with the updated document
      onUpdate(updatedDocument)

      // Close the dialog
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the document. Please try again.",
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
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Edit Shared Document</DialogTitle>
              <DialogDescription className="text-gray-600">
                {isSharedByMe
                  ? "Update sharing settings for this document."
                  : "Update your settings for this shared document."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-4">
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
              <Label htmlFor="accessLevel" className="text-sm font-medium text-gray-700">Access Level</Label>
              <Select
                value={formData.accessLevel}
                onValueChange={(value) => handleSelectChange("accessLevel", value)}
                disabled={!isSharedByMe}
              >
                <SelectTrigger id="accessLevel" className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
              {!isSharedByMe && (
                <p className="text-xs text-gray-500">You cannot change the access level for documents shared with you.</p>
              )}
            </div>

            {/* Always show Shared With as read-only info */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Shared With</Label>
              <Input value={formData.sharedWith} readOnly disabled className="bg-gray-100 cursor-not-allowed" />
            </div>

            {isSharedByMe && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Visibility</Label>
                <RadioGroup
                  value={formData.visibility}
                  onValueChange={(value) => handleSelectChange("visibility", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="Specific people" id="specific-people" />
                    <Label htmlFor="specific-people" className="text-sm">Specific people</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="Team" id="team" />
                    <Label htmlFor="team" className="text-sm">Team</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="Anyone with link" id="anyone-link" />
                    <Label htmlFor="anyone-link" className="text-sm">Anyone with link</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add notes (optional)"
                className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
