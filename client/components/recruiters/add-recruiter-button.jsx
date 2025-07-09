import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export function AddRecruiterButton() {
  return (
    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
      <UserPlus className="h-4 w-4" />
      Add Recruiter
    </Button>
  )
}
