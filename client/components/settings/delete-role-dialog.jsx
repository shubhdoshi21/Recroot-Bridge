"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 as TrashIcon } from "lucide-react";

export default function DeleteRoleDialog({ showDeleteRoleDialog, setShowDeleteRoleDialog, handleConfirmDeleteRole }) {
  return (
    <AlertDialog open={showDeleteRoleDialog} onOpenChange={setShowDeleteRoleDialog}>
      <AlertDialogContent className="bg-white/90 backdrop-blur-md border-0 shadow-2xl rounded-xl p-0 overflow-hidden">
        <AlertDialogHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-100 rounded-t-xl p-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
            <TrashIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-1">
              This action cannot be undone. This will permanently delete the role and remove it from all users.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-gradient-to-r from-gray-50 to-red-50 border-t border-gray-100 rounded-b-xl p-6 flex gap-3 justify-end">
          <AlertDialogCancel className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDeleteRole} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
