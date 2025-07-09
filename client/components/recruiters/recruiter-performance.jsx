"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Clock,
  Users,
  Award,
  Target,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  Trophy,
  Star,
  CheckCircle,
  Activity
} from "lucide-react"

// Sample data for charts
const monthlyHiresData = [
  {
    name: "Jan",
    Jessica: 4,
    Michael: 2,
    Sarah: 3,
    David: 5,
    Emily: 3,
    Robert: 2,
  },
  {
    name: "Feb",
    Jessica: 5,
    Michael: 3,
    Sarah: 4,
    David: 6,
    Emily: 4,
    Robert: 3,
  },
  {
    name: "Mar",
    Jessica: 6,
    Michael: 2,
    Sarah: 5,
    David: 7,
    Emily: 5,
    Robert: 2,
  },
  {
    name: "Apr",
    Jessica: 7,
    Michael: 4,
    Sarah: 4,
    David: 8,
    Emily: 6,
    Robert: 3,
  },
  {
    name: "May",
    Jessica: 8,
    Michael: 3,
    Sarah: 6,
    David: 10,
    Emily: 7,
    Robert: 4,
  },
  {
    name: "Jun",
    Jessica: 9,
    Michael: 5,
    Sarah: 7,
    David: 12,
    Emily: 8,
    Robert: 4,
  },
]

const timeToHireData = [
  {
    name: "Jan",
    Jessica: 35,
    Michael: 42,
    Sarah: 38,
    David: 30,
    Emily: 36,
    Robert: 45,
  },
  {
    name: "Feb",
    Jessica: 33,
    Michael: 40,
    Sarah: 36,
    David: 28,
    Emily: 34,
    Robert: 43,
  },
  {
    name: "Mar",
    Jessica: 30,
    Michael: 38,
    Sarah: 34,
    David: 26,
    Emily: 32,
    Robert: 40,
  },
  {
    name: "Apr",
    Jessica: 28,
    Michael: 36,
    Sarah: 32,
    David: 24,
    Emily: 30,
    Robert: 38,
  },
  {
    name: "May",
    Jessica: 26,
    Michael: 34,
    Sarah: 30,
    David: 22,
    Emily: 28,
    Robert: 36,
  },
  {
    name: "Jun",
    Jessica: 25,
    Michael: 32,
    Sarah: 28,
    David: 20,
    Emily: 26,
    Robert: 34,
  },
]

const topRecruiters = [
  {
    name: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    hires: 12,
    timeToHire: 20,
    offerAcceptRate: 92,
    candidateSatisfaction: 95,
  },
  {
    name: "Jessica Taylor",
    avatar: "/placeholder.svg?height=40&width=40",
    hires: 9,
    timeToHire: 25,
    offerAcceptRate: 88,
    candidateSatisfaction: 90,
  },
  {
    name: "Emily Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    hires: 8,
    timeToHire: 26,
    offerAcceptRate: 85,
    candidateSatisfaction: 88,
  },
  {
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    hires: 7,
    timeToHire: 28,
    offerAcceptRate: 82,
    candidateSatisfaction: 85,
  },
]

export function RecruiterPerformance() {
  return (
    <div className="space-y-8 max-w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recruiter Performance Metrics</h2>
              <p className="text-gray-600 mt-1">Track and analyze recruiter performance across key metrics</p>
            </div>
          </div>
          <Select defaultValue="last_6_months">
            <SelectTrigger className="w-[200px] bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">Monthly Hires by Recruiter</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyHiresData}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="Jessica" fill="#4f46e5" name="Jessica Taylor" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Michael" fill="#0ea5e9" name="Michael Chen" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sarah" fill="#10b981" name="Sarah Johnson" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="David" fill="#f59e0b" name="David Wilson" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Emily" fill="#8b5cf6" name="Emily Rodriguez" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Robert" fill="#ec4899" name="Robert Kim" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <LineChartIcon className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">Average Time to Hire (Days)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeToHireData}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="Jessica" stroke="#4f46e5" name="Jessica Taylor" strokeWidth={3} />
                  <Line type="monotone" dataKey="Michael" stroke="#0ea5e9" name="Michael Chen" strokeWidth={3} />
                  <Line type="monotone" dataKey="Sarah" stroke="#10b981" name="Sarah Johnson" strokeWidth={3} />
                  <Line type="monotone" dataKey="David" stroke="#f59e0b" name="David Wilson" strokeWidth={3} />
                  <Line type="monotone" dataKey="Emily" stroke="#8b5cf6" name="Emily Rodriguez" strokeWidth={3} />
                  <Line type="monotone" dataKey="Robert" stroke="#ec4899" name="Robert Kim" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Section */}
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-900">Top Performing Recruiters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="hires" className="w-full">
            <div className="overflow-x-auto pb-4">
              <TabsList className="inline-flex bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="hires"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                >
                  <Users className="h-4 w-4 mr-2" />
                  By Hires
                </TabsTrigger>
                <TabsTrigger
                  value="time"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  By Time to Hire
                </TabsTrigger>
                <TabsTrigger
                  value="acceptance"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  By Offer Acceptance
                </TabsTrigger>
                <TabsTrigger
                  value="satisfaction"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-600"
                >
                  <Star className="h-4 w-4 mr-2" />
                  By Candidate Satisfaction
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="hires" className="space-y-4 mt-6">
              {topRecruiters
                .sort((a, b) => b.hires - a.hires)
                .map((recruiter, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarImage src={recruiter.avatar} alt={recruiter.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {recruiter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                          <Trophy className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{recruiter.name}</h3>
                        <span className="text-lg font-bold text-blue-600 whitespace-nowrap">{recruiter.hires} hires</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progress to goal (15 hires)</span>
                          <span className="font-medium">{Math.round((recruiter.hires / 15) * 100)}%</span>
                        </div>
                        <Progress value={(recruiter.hires / 15) * 100} className="h-2 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="time" className="space-y-4 mt-6">
              {topRecruiters
                .sort((a, b) => a.timeToHire - b.timeToHire)
                .map((recruiter, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarImage src={recruiter.avatar} alt={recruiter.name} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold">
                          {recruiter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                          <Trophy className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{recruiter.name}</h3>
                        <span className="text-lg font-bold text-green-600 whitespace-nowrap">
                          {recruiter.timeToHire} days avg.
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Compared to target (30 days)</span>
                          <span className="font-medium">{Math.round(((30 - recruiter.timeToHire) / 30) * 100)}% faster</span>
                        </div>
                        <Progress value={((30 - recruiter.timeToHire) / 30) * 100} className="h-2 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="acceptance" className="space-y-4 mt-6">
              {topRecruiters
                .sort((a, b) => b.offerAcceptRate - a.offerAcceptRate)
                .map((recruiter, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-purple-50/50 to-violet-50/50 hover:from-purple-50 hover:to-violet-50 transition-all duration-200">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarImage src={recruiter.avatar} alt={recruiter.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-semibold">
                          {recruiter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                          <Trophy className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{recruiter.name}</h3>
                        <span className="text-lg font-bold text-purple-600 whitespace-nowrap">
                          {recruiter.offerAcceptRate}% acceptance
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Target: 80%</span>
                          <span className="font-medium">{recruiter.offerAcceptRate}%</span>
                        </div>
                        <Progress value={recruiter.offerAcceptRate} className="h-2 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="satisfaction" className="space-y-4 mt-6">
              {topRecruiters
                .sort((a, b) => b.candidateSatisfaction - a.candidateSatisfaction)
                .map((recruiter, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 hover:from-amber-50 hover:to-orange-50 transition-all duration-200">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarImage src={recruiter.avatar} alt={recruiter.name} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold">
                          {recruiter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                          <Trophy className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{recruiter.name}</h3>
                        <span className="text-lg font-bold text-amber-600 whitespace-nowrap">
                          {recruiter.candidateSatisfaction}% satisfaction
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Target: 85%</span>
                          <span className="font-medium">{recruiter.candidateSatisfaction}%</span>
                        </div>
                        <Progress value={recruiter.candidateSatisfaction} className="h-2 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
