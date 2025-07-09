"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  Clock,
  Download,
  X,
  Star,
  TrendingDown,
  Eye
} from "lucide-react"

export function ViewPerformanceDialog({ open, onOpenChange, recruiter }) {
  if (!recruiter) return null

  // Calculate performance metrics
  const hireRate = ((recruiter.hires / recruiter.candidates) * 100).toFixed(1)
  const timeToHire = 18.5 // This would come from real data
  const candidateSatisfaction = 92 // This would come from real data
  const interviewToOffer = 28 // This would come from real data

  // Performance indicators
  const getPerformanceColor = (value, threshold) => {
    if (value >= threshold) return "text-green-600"
    if (value >= threshold * 0.8) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceIcon = (value, threshold) => {
    if (value >= threshold) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (value >= threshold * 0.8) return <Activity className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl" aria-describedby="performance-description">
        <DialogHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100/50 p-6 -m-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {recruiter.firstName} {recruiter.lastName}'s Performance Dashboard
              </DialogTitle>
              <DialogDescription id="performance-description" className="text-gray-600 mt-1">
                Comprehensive performance metrics and analytics for this recruiter.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  {getPerformanceIcon(hireRate, 25)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Hire Rate</p>
                  <p className={`text-3xl font-bold ${getPerformanceColor(hireRate, 25)}`}>
                    {hireRate}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {recruiter.hires} hires from {recruiter.candidates} candidates
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  {getPerformanceIcon(timeToHire, 20, true)} {/* Lower is better for time */}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Time to Hire</p>
                  <p className={`text-3xl font-bold ${getPerformanceColor(timeToHire, 20, true)}`}>
                    {timeToHire} days
                  </p>
                  <p className="text-xs text-gray-500">
                    Average time from application to hire
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  {getPerformanceIcon(candidateSatisfaction, 85)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Candidate Satisfaction</p>
                  <p className={`text-3xl font-bold ${getPerformanceColor(candidateSatisfaction, 85)}`}>
                    {candidateSatisfaction}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Based on candidate feedback surveys
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  {getPerformanceIcon(interviewToOffer, 30)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Interview to Offer</p>
                  <p className={`text-3xl font-bold ${getPerformanceColor(interviewToOffer, 30)}`}>
                    {interviewToOffer}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Conversion rate from interview to offer
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Tabs */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-3 w-full bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="trends"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trends
                  </TabsTrigger>
                  <TabsTrigger
                    value="comparison"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600"
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Comparison
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                            <BarChart className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Hiring by Department</h3>
                        </div>
                        <div className="h-64 flex items-center justify-center bg-white/50 rounded-lg border border-blue-200">
                          <div className="text-center">
                            <BarChart className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">Department hiring chart</p>
                            <p className="text-sm text-gray-400">Interactive visualization coming soon</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg mr-3">
                            <PieChart className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Candidate Sources</h3>
                        </div>
                        <div className="h-64 flex items-center justify-center bg-white/50 rounded-lg border border-purple-200">
                          <div className="text-center">
                            <PieChart className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">Candidate sources chart</p>
                            <p className="text-sm text-gray-400">Interactive visualization coming soon</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="mt-6">
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                          <LineChart className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Performance Trends (Last 12 Months)</h3>
                      </div>
                      <div className="h-80 flex items-center justify-center bg-white/50 rounded-lg border border-green-200">
                        <div className="text-center">
                          <LineChart className="h-16 w-16 text-green-400 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">Performance trends chart</p>
                          <p className="text-sm text-gray-400">Interactive visualization coming soon</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comparison" className="mt-6">
                  <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg mr-3">
                          <BarChart className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Comparison with Team Average</h3>
                      </div>
                      <div className="h-80 flex items-center justify-center bg-white/50 rounded-lg border border-amber-200">
                        <div className="text-center">
                          <BarChart className="h-16 w-16 text-amber-400 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">Team comparison chart</p>
                          <p className="text-sm text-gray-400">Interactive visualization coming soon</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="bg-gradient-to-r from-gray-50 to-purple-50/30 border-t border-gray-100 p-6 -m-6 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Close
          </Button>
          <Button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
