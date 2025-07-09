"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function DeleteJobDialog({ open, onOpenChange, onDeleteJob, jobId }) {
  const handleDelete = () => {
    onDeleteJob()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-red-50 via-red-50/50 to-red-50/30 border-b border-red-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Delete Job</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">Are you sure you want to delete this job? This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="border border-red-200 rounded-lg p-4 bg-red-50/80 backdrop-blur-sm text-red-800 text-sm mb-4">
          <p className="font-medium">Warning:</p>
          <p>Deleting this job will remove it from the company's job listings and any associated applications.</p>
        </div>
        <DialogFooter className="bg-gradient-to-r from-gray-50 to-red-50/30 border-t border-gray-100 -mx-6 -mb-6 px-6 py-4 mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none hover:bg-gray-50 hover:border-gray-300 transition-colors">Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
