"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UpcomingInterviews } from "@/components/interviews/upcoming-interviews"
import { InterviewCalendar } from "@/components/interviews/interview-calendar"
import { ScheduleInterviewDialog } from "@/components/interviews/schedule-interview-dialog"
import { AllInterviewsDialog } from "@/components/interviews/all-interviews-dialog"
import { InterviewsProvider } from "@/contexts/interviews-context"
import { CalendarPlus, Calendar, Clock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useInterviews } from "@/contexts/interviews-context"

export default function InterviewsPage() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isAllInterviewsDialogOpen, setIsAllInterviewsDialogOpen] = useState(false)

  return (
    <InterviewsProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Interviews
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Schedule and manage candidate interviews
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsScheduleDialogOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                <CalendarPlus className="h-5 w-5" />
                Schedule Interview
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      <InterviewsStats />
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      <TodayInterviews />
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">
                      <WeekInterviews />
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-6 transition-all duration-500 ease-in-out">
          {/* Upcoming Interviews Section */}
          <div className="xl:flex-shrink-0 transition-all duration-500 ease-in-out">
            <div className="sticky top-6">
              <UpcomingInterviews />
            </div>
          </div>

          {/* Calendar Section */}
          <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
            <InterviewCalendar />
          </div>
        </div>

        <ScheduleInterviewDialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen} />
        <AllInterviewsDialog open={isAllInterviewsDialogOpen} onOpenChange={setIsAllInterviewsDialogOpen} />
      </div>
    </InterviewsProvider>
  )
}

// Stats Components
function InterviewsStats() {
  const { interviews } = useInterviews()
  return interviews?.length || 0
}

function TodayInterviews() {
  const { interviews } = useInterviews()
  const today = new Date().toISOString().split('T')[0]

  const todayInterviews = interviews?.filter(interview =>
    interview.date === today && interview.interviewStatus === "Scheduled"
  ) || []

  return todayInterviews.length
}

function WeekInterviews() {
  const { interviews } = useInterviews()
  const today = new Date()
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + 7)

  const weekInterviews = interviews?.filter(interview => {
    const interviewDate = new Date(interview.date)
    return interviewDate >= today &&
      interviewDate <= endOfWeek &&
      interview.interviewStatus === "Scheduled"
  }) || []

  return weekInterviews.length
}
