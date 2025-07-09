"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Share2, MoreVertical, FileEdit, Trash2 } from "lucide-react"

export function DocumentActions({ document, onView, onShare, onDownload, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onView(document)} className="rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
        View
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-lg shadow-xl border border-gray-100 bg-white/95 backdrop-blur-sm">
          <DropdownMenuItem onClick={() => onShare(document)} className="flex items-center gap-2 hover:bg-blue-50">
            <Share2 className="mr-2 h-4 w-4 text-blue-600" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(document)} className="flex items-center gap-2 hover:bg-green-50">
            <FileEdit className="mr-2 h-4 w-4 text-green-600" />
            <span>Edit Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600 flex items-center gap-2 hover:bg-red-50" onClick={() => onDelete(document)}>
            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
