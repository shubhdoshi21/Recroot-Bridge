"use client"

import { useState } from "react"
import { Bell, X, Info, AlertTriangle, Calendar, UserPlus, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const notifications = [
  {
    id: 1,
    title: "New Feature",
    message: "Check out our new candidate matching algorithm!",
    date: "2023-07-15",
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    id: 2,
    title: "Interview Alert",
    message: "You have 3 interviews scheduled for tomorrow.",
    date: "2023-07-14",
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
  },
  {
    id: 3,
    title: "Upcoming Interview",
    message: "Interview with Alex Johnson in 30 minutes.",
    date: "2023-07-13",
    icon: Calendar,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
  },
  {
    id: 4,
    title: "New Candidate",
    message: "Sarah Williams applied for UX Designer position.",
    date: "2023-07-12",
    icon: UserPlus,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
  {
    id: 5,
    title: "New Job Opening",
    message: "New Product Manager position has been posted.",
    date: "2023-07-11",
    icon: Briefcase,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/50",
  },
]

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
      </Button>
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 z-50 light-mode-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-transparent to-blue-50/50 dark:bg-transparent">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close notifications">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="mb-4 last:mb-0 border shadow-sm light-mode-card">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`${notification.bgColor} p-2 rounded-full`}>
                        <notification.icon className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
