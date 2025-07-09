"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Briefcase, Calendar, CheckCircle, Clock, XCircle, UserPlus, BarChart3, TrendingUp } from "lucide-react"
import { useState } from "react"

export function RecruitmentOverview() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4 border-b border-gray-200/50">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-gray-900">Recruitment Overview</div>
            <div className="text-sm font-normal text-gray-600 mt-1">
              Comprehensive view of your recruitment pipeline
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="summary" className="p-6">
          <TabsList className="grid w-full grid-cols-3 gap-2 h-12 bg-gray-100/50">
            <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
              Summary
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatsCard
                title="Total Candidates"
                value="1,248"
                trend="+12%"
                icon={<Users className="h-5 w-5 text-blue-600" />}
                color="blue"
              />
              <StatsCard
                title="Open Positions"
                value="42"
                trend="+3%"
                icon={<Briefcase className="h-5 w-5 text-indigo-600" />}
                color="indigo"
              />
              <StatsCard
                title="Interviews"
                value="68"
                trend="+15%"
                icon={<Calendar className="h-5 w-5 text-purple-600" />}
                color="purple"
              />
              <StatsCard
                title="New Hires"
                value="18"
                trend="+5%"
                icon={<UserPlus className="h-5 w-5 text-green-600" />}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatusCard
                title="Screening"
                value="124"
                icon={<Clock className="h-5 w-5 text-amber-600" />}
                color="amber"
                description="In review process"
              />
              <StatusCard
                title="Hired"
                value="86"
                icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                color="green"
                description="Successfully placed"
              />
              <StatusCard
                title="Rejected"
                value="215"
                icon={<XCircle className="h-5 w-5 text-red-600" />}
                color="red"
                description="Not selected"
              />
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatsCard
                title="New Candidates"
                value="78"
                trend="+18%"
                icon={<Users className="h-5 w-5 text-blue-600" />}
                color="blue"
              />
              <StatsCard
                title="New Positions"
                value="5"
                trend="+2"
                icon={<Briefcase className="h-5 w-5 text-indigo-600" />}
                color="indigo"
              />
              <StatsCard
                title="Interviews"
                value="32"
                trend="+8"
                icon={<Calendar className="h-5 w-5 text-purple-600" />}
                color="purple"
              />
              <StatsCard
                title="New Hires"
                value="4"
                trend="+1"
                icon={<UserPlus className="h-5 w-5 text-green-600" />}
                color="green"
              />
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatsCard
                title="New Candidates"
                value="312"
                trend="+24%"
                icon={<Users className="h-5 w-5 text-blue-600" />}
                color="blue"
              />
              <StatsCard
                title="New Positions"
                value="18"
                trend="+5"
                icon={<Briefcase className="h-5 w-5 text-indigo-600" />}
                color="indigo"
              />
              <StatsCard
                title="Interviews"
                value="145"
                trend="+32"
                icon={<Calendar className="h-5 w-5 text-purple-600" />}
                color="purple"
              />
              <StatsCard
                title="New Hires"
                value="16"
                trend="+4"
                icon={<UserPlus className="h-5 w-5 text-green-600" />}
                color="green"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function StatsCard({ title, value, trend, icon, color }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`group relative rounded-xl border-0 bg-white/60 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20 hover:-translate-y-1 overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-${color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-gray-900">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${color}-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <TrendingUp className="h-3 w-3" />
        {trend}
      </div>

      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-${color}-500 to-${color}-600 transform transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  )
}

function StatusCard({ title, value, icon, color, description }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`group relative rounded-xl border-0 bg-white/60 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20 hover:-translate-y-1 overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-${color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${color}-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-900">
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
            {value}
          </p>
          <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700 mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-${color}-500 to-${color}-600 transform transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  )
}
