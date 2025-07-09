"use client"
import { Button } from "@/components/ui/button"
import { Briefcase, Calendar, MessageSquare, UserPlus, Sparkles, Filter, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardActions() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 mb-1 pl-1">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">Quick Actions</span>
      </div>
      <div className="flex flex-row gap-3 items-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-md px-4 py-3">
        {/* Primary action button */}
        <Button
          onClick={() => router.push("/jobs")}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-base px-6 py-3 rounded-xl"
          size="lg"
        >
          <Briefcase className="h-5 w-5" />
          Go to Jobs Module
        </Button>

        {/* Secondary actions in dropdown for mobile */}
        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50">
                <Sparkles className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/candidates")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Candidate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/interviews")}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/communications")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Secondary actions for desktop */}
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/90 border-blue-200 hover:bg-blue-50 text-base px-6 py-3 rounded-xl"
          onClick={() => router.push("/candidates")}
        >
          <UserPlus className="h-4 w-4" />
          Go to Candidates Module
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/90 border-blue-200 hover:bg-blue-50 text-base px-6 py-3 rounded-xl"
          onClick={() => router.push("/interviews")}
        >
          <Calendar className="h-4 w-4" />
          Go to Interviews Module
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 border-blue-200 hover:bg-blue-50 rounded-xl"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  )
}
