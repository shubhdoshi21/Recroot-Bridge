"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { BarChart3, TrendingUp, Users, Target } from "lucide-react"

const timeToHireData = [
  { name: "Jan", value: 45 },
  { name: "Feb", value: 42 },
  { name: "Mar", value: 38 },
  { name: "Apr", value: 35 },
  { name: "May", value: 32 },
  { name: "Jun", value: 30 },
]

const applicationSourceData = [
  { name: "LinkedIn", value: 35 },
  { name: "Indeed", value: 25 },
  { name: "Referrals", value: 20 },
  { name: "Company Site", value: 15 },
  { name: "Other", value: 5 },
]

const hiringTrendsData = [
  { name: "Jan", applications: 120, interviews: 45, hires: 12 },
  { name: "Feb", applications: 140, interviews: 50, hires: 15 },
  { name: "Mar", applications: 160, interviews: 60, hires: 18 },
  { name: "Apr", applications: 180, interviews: 65, hires: 20 },
  { name: "May", applications: 200, interviews: 70, hires: 22 },
  { name: "Jun", applications: 220, interviews: 75, hires: 25 },
]

export function HiringMetrics() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4 border-b border-gray-200/50">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-gray-900">Hiring Metrics</div>
            <div className="text-sm font-normal text-gray-600 mt-1">
              Comprehensive hiring performance analytics
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="trends" className="p-6">
          <TabsList className="grid w-full grid-cols-3 gap-2 h-12 bg-gray-100/50">
            <TabsTrigger value="trends" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
              <TrendingUp className="mr-2 h-4 w-4" />
              Hiring Trends
            </TabsTrigger>
            <TabsTrigger value="timeToHire" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
              <Target className="mr-2 h-4 w-4" />
              Time to Hire
            </TabsTrigger>
            <TabsTrigger value="sources" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
              <Users className="mr-2 h-4 w-4" />
              Application Sources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-6">
            <div className="h-[350px] w-full overflow-hidden rounded-lg border-0 bg-white/60 backdrop-blur-sm">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <BarChart data={hiringTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="applications"
                    fill="#3b82f6"
                    name="Applications"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="interviews"
                    fill="#8b5cf6"
                    name="Interviews"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="hires"
                    fill="#10b981"
                    name="Hires"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="timeToHire" className="mt-6">
            <div className="h-[350px] w-full overflow-hidden rounded-lg border-0 bg-white/60 backdrop-blur-sm">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <LineChart data={timeToHireData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Days to Hire"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <div className="h-[350px] w-full overflow-hidden rounded-lg border-0 bg-white/60 backdrop-blur-sm">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <BarChart
                  data={applicationSourceData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                >
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    name="Percentage"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
