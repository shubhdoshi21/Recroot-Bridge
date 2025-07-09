"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield as ShieldIcon } from "lucide-react";

export default function EditRoleDialog({
  showEditRoleDialog,
  setShowEditRoleDialog,
  editingRole,
  setEditingRole,
  handleSaveEditedRole,
  isEditingRole,
}) {
  return (
    <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-md border-0 shadow-2xl rounded-xl p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <ShieldIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">Edit Role</DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">Update the role details and permissions.</DialogDescription>
          </div>
        </DialogHeader>
        {editingRole && (
          <div className="grid gap-6 p-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role-name" className="text-right text-sm font-medium text-gray-700">Role Name</Label>
              <Input
                id="edit-role-name"
                value={editingRole.name}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                className="col-span-3 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role-based-on" className="text-right text-sm font-medium text-gray-700">Based On</Label>
              <Select
                value={editingRole.basedOn}
                onValueChange={(value) => setEditingRole({ ...editingRole, basedOn: value })}
              >
                <SelectTrigger id="edit-role-based-on" className="col-span-3 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md">
                  <SelectValue placeholder="Select base role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Recruiter">Recruiter</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 rounded-b-xl p-6 flex gap-3 justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveEditedRole} disabled={isEditingRole} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            {isEditingRole ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
