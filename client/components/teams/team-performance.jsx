"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTeams } from "@/contexts/teams-context"
import { BarChart3, TrendingUp, Users, Clock, CheckCircle } from "lucide-react"

export function TeamPerformance({ teamId }) {
  const { teams } = useTeams()
  const [timeFrame, setTimeFrame] = useState("last_6_months")

  const team = teams.find((t) => t.id === teamId)

  if (!team) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
        <CardContent className="p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team not found</h3>
            <p className="text-gray-500">The requested team could not be found.</p>
          </div>
        </div>
        </CardContent>
      </Card>
    )
  }

  // Use the performanceData from the team or fallback to default values
  const performanceData = team.performanceData || {
    hiringTarget: 10,
    currentHires: 0,
    timeToHire: 30,
    targetTimeToHire: 25,
    offerAcceptanceRate: 80,
    targetOfferAcceptanceRate: 85,
    monthlyHires: [
      { month: "Jan", hires: 0 },
      { month: "Feb", hires: 0 },
      { month: "Mar", hires: 0 },
      { month: "Apr", hires: 0 },
      { month: "May", hires: 0 },
      { month: "Jun", hires: 0 },
    ],
    timeToHireByMonth: [
      { month: "Jan", days: 30 },
      { month: "Feb", days: 30 },
      { month: "Mar", days: 30 },
      { month: "Apr", days: 30 },
      { month: "May", days: 30 },
      { month: "Jun", days: 30 },
    ],
    offerAcceptanceByMonth: [
      { month: "Jan", rate: 80 },
      { month: "Feb", rate: 80 },
      { month: "Mar", rate: 80 },
      { month: "Apr", rate: 80 },
      { month: "May", rate: 80 },
      { month: "Jun", rate: 80 },
    ],
    candidateSourceData: [
      { source: "LinkedIn", value: 40 },
      { source: "Indeed", value: 25 },
      { source: "Referrals", value: 20 },
      { source: "Company Site", value: 10 },
      { source: "Other", value: 5 },
    ],
    memberPerformance: [],
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{team.name} Performance Metrics</h2>
        </div>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="last_year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
          <CardTitle className="text-lg font-bold text-gray-900">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-blue-900">Hiring Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target: {performanceData.hiringTarget}</span>
                  <span className="font-semibold text-blue-700">{performanceData.currentHires} hires</span>
                </div>
                <Progress
                  value={(performanceData.currentHires / performanceData.hiringTarget) * 100}
                  className="h-3 bg-blue-100 [&>div]:bg-blue-500"
                />
                <p className="text-xs text-blue-600 text-right font-medium">
                  {Math.round((performanceData.currentHires / performanceData.hiringTarget) * 100)}% complete
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-green-900">Time to Hire</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target: {performanceData.targetTimeToHire} days</span>
                  <span className="font-semibold text-green-700">{performanceData.timeToHire} days</span>
                </div>
                <Progress
                  value={Math.min(100, (performanceData.targetTimeToHire / performanceData.timeToHire) * 100)}
                  className="h-3 bg-green-100 [&>div]:bg-green-500"
                />
                <p className="text-xs text-green-600 text-right font-medium">
                  {performanceData.timeToHire < performanceData.targetTimeToHire
                    ? `${performanceData.targetTimeToHire - performanceData.timeToHire} days ahead of target`
                    : `${performanceData.timeToHire - performanceData.targetTimeToHire} days behind target`}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-purple-900">Offer Acceptance Rate</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target: {performanceData.targetOfferAcceptanceRate}%</span>
                  <span className="font-semibold text-purple-700">{performanceData.offerAcceptanceRate}%</span>
                </div>
                <Progress
                  value={(performanceData.offerAcceptanceRate / performanceData.targetOfferAcceptanceRate) * 100}
                  className="h-3 bg-purple-100 [&>div]:bg-purple-500"
                />
                <p className="text-xs text-purple-600 text-right font-medium">
                  {performanceData.offerAcceptanceRate >= performanceData.targetOfferAcceptanceRate
                    ? `${performanceData.offerAcceptanceRate - performanceData.targetOfferAcceptanceRate}% above target`
                    : `${performanceData.targetOfferAcceptanceRate - performanceData.offerAcceptanceRate
                      }% below target`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
            <CardTitle className="text-lg font-bold text-gray-900">Monthly Hires</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="chart-container h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData.monthlyHires}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hires" fill="#4f46e5" name="Hires" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50">
            <CardTitle className="text-lg font-bold text-gray-900">Time to Hire Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="chart-container h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.timeToHireByMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="days" stroke="#0ea5e9" strokeWidth={2} name="Days to Hire" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100/50">
            <CardTitle className="text-lg font-bold text-gray-900">Offer Acceptance Rate Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="chart-container h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.offerAcceptanceByMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} name="Acceptance Rate (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100/50">
            <CardTitle className="text-lg font-bold text-gray-900">Candidate Sources</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="chart-container h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData.candidateSourceData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="source" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" name="Percentage (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-gray-900">Team Member Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {performanceData.memberPerformance && performanceData.memberPerformance.length > 0 ? (
            <div className="overflow-hidden transition-all duration-500 ease-in-out">
              <Table className="w-full transition-all duration-500 ease-in-out">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30 hover:bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700 py-4">Team Member</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Hires</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Avg. Time to Hire</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Offer Acceptance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.memberPerformance.map((member) => (
                    <TableRow
                      key={member.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-blue-100 shadow-md">
                            <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-gray-900">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-semibold text-gray-900">{member.hires}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-semibold text-gray-900">{member.timeToHire} days</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-semibold text-gray-900">{member.offerAcceptanceRate}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No performance data yet</h3>
                <p className="text-gray-500">Team member performance data will appear here once available.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
