"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useInterviews } from "@/contexts/interviews-context"
import { ViewNotesDialog } from "./view-notes-dialog"

// This component is for testing the ViewNotesDialog
export function TestNotesDialog() {
  const { interviews } = useInterviews()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInterviewId, setSelectedInterviewId] = useState(null)
  const [completedInterviews, setCompletedInterviews] = useState([])

  // Get completed interviews for testing
  useEffect(() => {
    const completed = interviews.filter((interview) => interview.status === "completed")
    setCompletedInterviews(completed)
  }, [interviews])

  // Open dialog with selected interview
  const openDialog = (id) => {
    setSelectedInterviewId(id)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <span className="text-white font-bold text-lg">📝</span>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
          Test Notes Dialog
        </h3>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-500">Click on an interview to test the notes dialog:</p>

        {completedInterviews.length > 0 ? (
          <div className="space-y-2">
            {completedInterviews.map((interview) => (
              <div
                key={interview.id}
                className="p-4 border border-gray-100 rounded-xl bg-white/80 hover:bg-blue-50 cursor-pointer transition-all"
                onClick={() => openDialog(interview.id)}
              >
                <div className="font-semibold text-gray-900">{interview.candidate}</div>
                <div className="text-sm text-gray-600">{interview.position}</div>
                <div className="text-xs text-gray-400">
                  {new Date(interview.date).toLocaleDateString()} at {interview.time}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No completed interviews available for testing.</p>
        )}

        <Button
          variant="outline"
          onClick={() => {
            // Find the first completed interview
            const firstCompleted = interviews.find((i) => i.status === "completed")
            if (firstCompleted) {
              openDialog(firstCompleted.id)
            }
          }}
          disabled={completedInterviews.length === 0}
          className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Test with first completed interview
        </Button>
      </div>

      <ViewNotesDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} interviewId={selectedInterviewId} />
    </div>
  )
}
