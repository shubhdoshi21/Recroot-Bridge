"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TrendingUp, MessageSquare, Eye, Clock, BarChart3 } from "lucide-react"

// Sample data for analytics
const messageVolumeData = [
  { date: "Jul 1", emails: 45, notifications: 32, sms: 12 },
  { date: "Jul 2", emails: 52, notifications: 28, sms: 10 },
  { date: "Jul 3", emails: 48, notifications: 35, sms: 15 },
  { date: "Jul 4", emails: 40, notifications: 30, sms: 8 },
  { date: "Jul 5", emails: 55, notifications: 40, sms: 18 },
  { date: "Jul 6", emails: 60, notifications: 45, sms: 20 },
  { date: "Jul 7", emails: 58, notifications: 42, sms: 16 },
  { date: "Jul 8", emails: 65, notifications: 48, sms: 22 },
  { date: "Jul 9", emails: 70, notifications: 50, sms: 25 },
  { date: "Jul 10", emails: 68, notifications: 52, sms: 24 },
  { date: "Jul 11", emails: 75, notifications: 55, sms: 28 },
  { date: "Jul 12", emails: 80, notifications: 60, sms: 30 },
  { date: "Jul 13", emails: 85, notifications: 65, sms: 32 },
  { date: "Jul 14", emails: 82, notifications: 62, sms: 30 },
]

const responseRateData = [
  { date: "Jul 1", rate: 65 },
  { date: "Jul 2", rate: 68 },
  { date: "Jul 3", rate: 67 },
  { date: "Jul 4", rate: 70 },
  { date: "Jul 5", rate: 72 },
  { date: "Jul 6", rate: 75 },
  { date: "Jul 7", rate: 74 },
  { date: "Jul 8", rate: 76 },
  { date: "Jul 9", rate: 78 },
  { date: "Jul 10", rate: 80 },
  { date: "Jul 11", rate: 82 },
  { date: "Jul 12", rate: 85 },
  { date: "Jul 13", rate: 84 },
  { date: "Jul 14", rate: 86 },
]

const templatePerformanceData = [
  { name: "Application Confirmation", openRate: 92, responseRate: 45 },
  { name: "Interview Invitation", openRate: 95, responseRate: 85 },
  { name: "Interview Reminder", openRate: 90, responseRate: 75 },
  { name: "Application Status Update", openRate: 88, responseRate: 40 },
  { name: "Offer Letter", openRate: 98, responseRate: 90 },
  { name: "Rejection Notification", openRate: 85, responseRate: 20 },
]

const channelEffectivenessData = [
  { channel: "Email", deliveryRate: 98, openRate: 85, responseRate: 65 },
  {
    channel: "In-app Notification",
    deliveryRate: 100,
    openRate: 90,
    responseRate: 70,
  },
  { channel: "SMS", deliveryRate: 95, openRate: 92, responseRate: 75 },
]

export function CommunicationAnalytics() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
      <CardHeader className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100 flex items-center gap-3 justify-start text-left">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent text-left">
          Communication Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          </div>
          <Select defaultValue="last_14_days">
            <SelectTrigger className="w-[180px] bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_14_days">Last 14 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">Total Messages</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">1,248</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">Open Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">87%</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +5% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">Response Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">68%</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +8% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">Avg. Response Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">4.2h</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                -15% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="volume" className="space-y-4">
          <TabsList className="bg-white/80 border border-gray-200 p-1 rounded-lg">
            <TabsTrigger value="volume" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md">
              Message Volume
            </TabsTrigger>
            <TabsTrigger value="response" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md">
              Response Rate
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md">
              Template Performance
            </TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md">
              Channel Effectiveness
            </TabsTrigger>
          </TabsList>

          <TabsContent value="volume">
            <Card className="bg-white/90 border border-gray-100 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Message Volume by Channel</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={messageVolumeData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="emails" name="Emails" fill="#4f46e5" />
                      <Bar dataKey="notifications" name="Notifications" fill="#0ea5e9" />
                      <Bar dataKey="sms" name="SMS" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="response">
            <Card className="bg-white/90 border border-gray-100 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Response Rate Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseRateData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={2} name="Response Rate (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="bg-white/90 border border-gray-100 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Template Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={templatePerformanceData} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="openRate" name="Open Rate (%)" fill="#4f46e5" />
                      <Bar dataKey="responseRate" name="Response Rate (%)" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card className="bg-white/90 border border-gray-100 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Channel Effectiveness</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelEffectivenessData} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="channel" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="deliveryRate" name="Delivery Rate (%)" fill="#4f46e5" />
                      <Bar dataKey="openRate" name="Open Rate (%)" fill="#0ea5e9" />
                      <Bar dataKey="responseRate" name="Response Rate (%)" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
