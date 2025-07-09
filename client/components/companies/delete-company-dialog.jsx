"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { companyService } from "@/services/companyService"

export function DeleteCompanyDialog({ open, onOpenChange, onDeleteCompany, company }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  if (!company) {
    return null
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      // Call the onDeleteCompany callback to handle deletion
      await onDeleteCompany(company.id)

      // Show success toast
      toast({
        title: "Company deleted",
        description: `${company.name} has been successfully deleted.`,
      })

      // Close the dialog
      onOpenChange(false)
    } catch (error) {
      console.log("Error deleting company:", error)
      toast({
        title: "Error",
        description: "Failed to delete company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-red-50 via-red-50/50 to-red-50/30 border-b border-red-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md">
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Delete Company</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Are you sure you want to delete <span className="font-medium text-red-600">{company.name}</span>? This action cannot be
                undone and will remove all associated data including jobs and company records.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="border border-red-200 rounded-lg p-4 bg-red-50/80 backdrop-blur-sm text-red-800 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="font-semibold">Warning:</p>
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li>All company information will be permanently deleted</li>
            <li>{company.openJobs || 0} open job(s) will be removed</li>
            <li>All associated candidate applications will be unlinked</li>
          </ul>
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-red-50/30 border-t border-gray-100 -mx-6 -mb-6 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Company
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
