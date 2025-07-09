import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteInterviewDialog({
  open,
  onOpenChange,
  interviewId,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-red-800 bg-clip-text text-transparent">
              Delete Interview
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Are you sure you want to{" "}
            <span className="font-semibold text-red-600">
              permanently delete
            </span>{" "}
            this interview? This action cannot be undone and all associated data will be lost.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(interviewId)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
