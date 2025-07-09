"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { OverviewTab } from "@/components/analytics/overview-tab"
import { AnalyticsTab } from "@/components/analytics/analytics-tab"
import { ReportsTab } from "@/components/analytics/reports-tab"
import { NotificationsTab } from "@/components/analytics/notifications-tab"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AnalyticsPage() {
  const { toast } = useToast()

  const handleExportData = () => {
    // Create sample analytics data
    const analyticsData = [
      { date: "2023-01-01", metric: "Applications", value: 145 },
      { date: "2023-01-01", metric: "Interviews", value: 42 },
      { date: "2023-01-01", metric: "Hires", value: 12 },
      { date: "2023-01-02", metric: "Applications", value: 152 },
      { date: "2023-01-02", metric: "Interviews", value: 38 },
      { date: "2023-01-02", metric: "Hires", value: 10 },
      // Add more data as needed
    ]

    // Convert data to CSV format
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Date,Metric,Value\n"

    analyticsData.forEach((row) => {
      csvContent += `${row.date},${row.metric},${row.value}\n`
    })

    // Create a download link and trigger the download
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `analytics_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)

    // Trigger the download
    link.click()

    // Clean up
    document.body.removeChild(link)

    // Show toast notification
    toast({
      title: "Export Successful",
      description: "Analytics data has been exported as CSV",
      duration: 3000,
    })
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="glass-card rounded-xl p-6 border-none shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h2>
              <p className="text-slate-600 dark:text-slate-300">Track your recruitment performance and insights</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <DateRangePicker />
            <Button
              onClick={handleExportData}
              className="flex items-center gap-2 w-full sm:w-auto glass-tile border border-white/20 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="glass-card rounded-xl border-none shadow-xl overflow-hidden">
        <Tabs defaultValue="overview" className="w-full">
          <div className="p-6 pb-0">
            <TabsList className="grid w-full grid-cols-4 glass-tile rounded-full p-1 bg-white/30 backdrop-blur-md border border-white/10">
              <TabsTrigger
                value="overview"
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-blue-400 data-[state=active]:text-white"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
              >
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 pt-4">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-0">
              <AnalyticsTab />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6 mt-0">
              <ReportsTab />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-0">
              <NotificationsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
