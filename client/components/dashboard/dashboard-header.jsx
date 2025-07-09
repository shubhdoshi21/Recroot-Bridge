"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Filter, RefreshCw, X, Check, FileText, FileSpreadsheet, BarChart3, TrendingUp, Activity } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportFormat, setExportFormat] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])

  // Filter states
  const [filters, setFilters] = useState({
    status: {
      active: true,
      pending: true,
      closed: false,
    },
    department: {
      engineering: true,
      marketing: true,
      sales: true,
      design: true,
      operations: false,
    },
    timeframe: {
      today: false,
      thisWeek: true,
      thisMonth: true,
      thisQuarter: false,
      thisYear: false,
    },
  })

  const { toast } = useToast()
  const exportTimeoutRef = useRef(null)

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Show toast notification
    toast({
      title: "Refreshing dashboard",
      description: "Fetching the latest recruitment data...",
    })

    // Simulate refresh with timeout
    setTimeout(() => {
      setIsRefreshing(false)

      // Show success toast
      toast({
        title: "Dashboard refreshed",
        description: "All data is now up to date",
      })
    }, 2000)
  }

  const handleFilterChange = (category, item, checked) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: checked,
      },
    }))
  }

  const applyFilters = () => {
    // Build active filters list
    const newActiveFilters = []

    Object.entries(filters.status).forEach(([key, value]) => {
      if (value) newActiveFilters.push(`Status: ${key}`)
    })

    Object.entries(filters.department).forEach(([key, value]) => {
      if (value) newActiveFilters.push(`Dept: ${key}`)
    })

    Object.entries(filters.timeframe).forEach(([key, value]) => {
      if (value) newActiveFilters.push(`Time: ${key}`)
    })

    setActiveFilters(newActiveFilters)
    setIsFilterOpen(false)

    // Show toast notification
    toast({
      title: "Filters applied",
      description: `Applied ${newActiveFilters.length} filters to dashboard`,
    })
  }

  const resetFilters = () => {
    setFilters({
      status: {
        active: true,
        pending: true,
        closed: false,
      },
      department: {
        engineering: true,
        marketing: true,
        sales: true,
        design: true,
        operations: false,
      },
      timeframe: {
        today: false,
        thisWeek: true,
        thisMonth: true,
        thisQuarter: false,
        thisYear: false,
      },
    })
  }

  const startExport = () => {
    if (!exportFormat) {
      toast({
        title: "Export format required",
        description: "Please select a format for the export",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    // Sample dashboard data to export
    const dashboardData = {
      metrics: [
        {
          category: "Applications",
          current: 245,
          previous: 220,
          change: "+11.4%",
        },
        { category: "Interviews", current: 87, previous: 75, change: "+16.0%" },
        { category: "Offers", current: 32, previous: 28, change: "+14.3%" },
        { category: "Hires", current: 24, previous: 22, change: "+9.1%" },
      ],
      pipeline: [
        { stage: "Applied", count: 245, percentage: "100%" },
        { stage: "Screening", count: 182, percentage: "74.3%" },
        { stage: "Interview", count: 87, percentage: "35.5%" },
        { stage: "Assessment", count: 45, percentage: "18.4%" },
        { stage: "Offer", count: 32, percentage: "13.1%" },
        { stage: "Hired", count: 24, percentage: "9.8%" },
      ],
      jobs: [
        {
          title: "Senior Frontend Developer",
          department: "Engineering",
          applicants: 48,
          status: "Active",
        },
        {
          title: "Product Marketing Manager",
          department: "Marketing",
          applicants: 36,
          status: "Active",
        },
        {
          title: "UX Designer",
          department: "Design",
          applicants: 27,
          status: "Active",
        },
        {
          title: "DevOps Engineer",
          department: "Engineering",
          applicants: 34,
          status: "Active",
        },
      ],
    }

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsExporting(false)
          setIsExportDialogOpen(false)

          // Generate and download file
          if (exportFormat === "csv") {
            generateCSV(dashboardData)
          } else if (exportFormat === "pdf") {
            generatePDF(dashboardData)
          }

          toast({
            title: "Export completed",
            description: `Dashboard data exported as ${exportFormat.toUpperCase()}`,
          })
          return 100
        }
        return prev + 10
      })
    }, 200)

    exportTimeoutRef.current = progressInterval
  }

  const generateCSV = (data) => {
    // Create CSV content
    let csvContent = "Category,Current,Previous,Change\n"

    data.metrics.forEach((metric) => {
      csvContent += `${metric.category},${metric.current},${metric.previous},${metric.change}\n`
    })

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `recruitment-dashboard-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generatePDF = (data) => {
    // For now, just show a success message
    // In a real implementation, you would use a PDF library like jsPDF
    console.log("PDF generation would happen here", data)
  }

  const cancelExport = () => {
    if (exportTimeoutRef.current) {
      clearInterval(exportTimeoutRef.current)
    }
    setIsExporting(false)
    setIsExportDialogOpen(false)
    setExportProgress(0)
    setExportFormat(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Recruitment Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Track your recruitment metrics and activities in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-primary/10 text-primary hover:bg-primary/20">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Status</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-active"
                        checked={filters.status.active}
                        onCheckedChange={(checked) => handleFilterChange("status", "active", checked)}
                      />
                      <Label htmlFor="status-active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-pending"
                        checked={filters.status.pending}
                        onCheckedChange={(checked) => handleFilterChange("status", "pending", checked)}
                      />
                      <Label htmlFor="status-pending">Pending</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-closed"
                        checked={filters.status.closed}
                        onCheckedChange={(checked) => handleFilterChange("status", "closed", checked)}
                      />
                      <Label htmlFor="status-closed">Closed</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Department</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-engineering"
                        checked={filters.department.engineering}
                        onCheckedChange={(checked) => handleFilterChange("department", "engineering", checked)}
                      />
                      <Label htmlFor="dept-engineering">Engineering</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-marketing"
                        checked={filters.department.marketing}
                        onCheckedChange={(checked) => handleFilterChange("department", "marketing", checked)}
                      />
                      <Label htmlFor="dept-marketing">Marketing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-sales"
                        checked={filters.department.sales}
                        onCheckedChange={(checked) => handleFilterChange("department", "sales", checked)}
                      />
                      <Label htmlFor="dept-sales">Sales</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-design"
                        checked={filters.department.design}
                        onCheckedChange={(checked) => handleFilterChange("department", "design", checked)}
                      />
                      <Label htmlFor="dept-design">Design</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-operations"
                        checked={filters.department.operations}
                        onCheckedChange={(checked) => handleFilterChange("department", "operations", checked)}
                      />
                      <Label htmlFor="dept-operations">Operations</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Time Frame</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="time-today"
                        checked={filters.timeframe.today}
                        onCheckedChange={(checked) => handleFilterChange("timeframe", "today", checked)}
                      />
                      <Label htmlFor="time-today">Today</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="time-week"
                        checked={filters.timeframe.thisWeek}
                        onCheckedChange={(checked) => handleFilterChange("timeframe", "thisWeek", checked)}
                      />
                      <Label htmlFor="time-week">This Week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="time-month"
                        checked={filters.timeframe.thisMonth}
                        onCheckedChange={(checked) => handleFilterChange("timeframe", "thisMonth", checked)}
                      />
                      <Label htmlFor="time-month">This Month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="time-quarter"
                        checked={filters.timeframe.thisQuarter}
                        onCheckedChange={(checked) => handleFilterChange("timeframe", "thisQuarter", checked)}
                      />
                      <Label htmlFor="time-quarter">This Quarter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="time-year"
                        checked={filters.timeframe.thisYear}
                        onCheckedChange={(checked) => handleFilterChange("timeframe", "thisYear", checked)}
                      />
                      <Label htmlFor="time-year">This Year</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={applyFilters}>
                    <Check className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("csv")
                  setIsExportDialogOpen(true)
                }}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("pdf")
                  setIsExportDialogOpen(true)
                }}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Generate a quick summary CSV
                  const summaryData = {
                    metrics: [
                      {
                        category: "Applications",
                        current: 245,
                        previous: 220,
                        change: "+11.4%",
                      },
                      {
                        category: "Interviews",
                        current: 87,
                        previous: 75,
                        change: "+16.0%",
                      },
                      {
                        category: "Offers",
                        current: 32,
                        previous: 28,
                        change: "+14.3%",
                      },
                      {
                        category: "Hires",
                        current: 24,
                        previous: 22,
                        change: "+9.1%",
                      },
                    ],
                  }
                  generateCSV(summaryData)
                  toast({
                    title: "Quick export completed",
                    description: "Summary data exported as CSV",
                  })
                }}
                className="cursor-pointer"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Quick Summary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {filter}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Dashboard Data</DialogTitle>
            <DialogDescription>
              Choose your preferred format and export your recruitment dashboard data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {!isExporting ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Export Format</h4>
                    <div className="grid gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="export-csv"
                          checked={exportFormat === "csv"}
                          onCheckedChange={() => setExportFormat("csv")}
                        />
                        <Label htmlFor="export-csv" className="flex items-center">
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          CSV Format
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="export-pdf"
                          checked={exportFormat === "pdf"}
                          onCheckedChange={() => setExportFormat("pdf")}
                        />
                        <Label htmlFor="export-pdf" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          PDF Format
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p className="font-medium">Export will include:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Recruitment metrics summary</li>
                      <li>Candidate pipeline statistics</li>
                      <li>Job openings status</li>
                      <li>Recent hiring activity</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 py-4">
                <div className="text-center">
                  <p className="font-medium">Exporting dashboard data...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please wait while we prepare your {exportFormat?.toUpperCase()} file
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {!isExporting ? (
              <>
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={startExport} disabled={!exportFormat}>
                  Start Export
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={cancelExport}>
                Cancel Export
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
