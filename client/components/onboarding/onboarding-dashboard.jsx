"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Clock, Calendar, CheckCircle, AlertTriangle, Users } from "lucide-react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useMemo } from "react"

// Sample data for onboarding metrics
const onboardingTimeData = [
  { month: "Jan", days: 12 },
  { month: "Feb", days: 11 },
  { month: "Mar", days: 10 },
  { month: "Apr", days: 9 },
  { month: "May", days: 8 },
  { month: "Jun", days: 7 },
  { month: "Jul", days: 7 },
]

const newHiresData = [
  { month: "Jan", count: 5 },
  { month: "Feb", count: 8 },
  { month: "Mar", count: 12 },
  { month: "Apr", count: 10 },
  { month: "May", count: 15 },
  { month: "Jun", count: 18 },
  { month: "Jul", count: 20 },
]

const taskCompletionData = [
  { department: "Engineering", completed: 92 },
  { department: "Design", completed: 88 },
  { department: "Marketing", completed: 95 },
  { department: "Sales", completed: 85 },
  { department: "Product", completed: 90 },
  { department: "HR", completed: 98 },
]

export function OnboardingDashboard() {
  const { newHires, newHiresLoading } = useOnboarding();

  // Active Onboardings: status === 'in-progress'
  const activeOnboardings = useMemo(() => newHires.filter(h => h.status === 'in-progress'), [newHires]);

  // Upcoming Onboardings: status in-progress or not-started, sorted by startDate ascending, next 4
  const upcomingOnboardings = useMemo(() => {
    return newHires
      .filter(h => h.status === 'in-progress' || h.status === 'not-started')
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 4);
  }, [newHires]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-semibold">Onboarding Overview</h3>
        <Select defaultValue="last_6_months">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="last_year">Last Year</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Onboardings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{newHiresLoading ? "..." : activeOnboardings.length}</div>
                <p className="text-xs text-muted-foreground">Active right now</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Onboarding Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">7 days</div>
                <p className="text-xs text-muted-foreground">-2 days from last month</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delayed Onboardings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">-2 from last month</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average Onboarding Time (Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={onboardingTimeData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="days" stroke="#4f46e5" strokeWidth={2} name="Days" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Hires per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newHiresData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" name="New Hires" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskCompletionData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="department" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" name="Completion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Onboardings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newHiresLoading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : upcomingOnboardings.length === 0 ? (
                <div className="text-center text-muted-foreground">No upcoming onboardings</div>
              ) : upcomingOnboardings.map((onboarding, index) => (
                <div key={onboarding.id || index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{onboarding.firstName} {onboarding.lastName}</p>
                      <p className="text-sm text-gray-500">
                        {onboarding.position} • {onboarding.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{onboarding.startDate ? new Date(onboarding.startDate).toLocaleDateString('en-GB') : "Not set"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Onboarding Progress</span>
                      <span>{onboarding.progress || 0}%</span>
                    </div>
                    <Progress value={onboarding.progress || 0} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
