"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Bell, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react"

const notificationTypes = [
  { id: "account", label: "Account Activity", icon: Bell, color: "from-blue-500 to-cyan-500" },
  { id: "security", label: "Security Alerts", icon: AlertTriangle, color: "from-red-500 to-orange-500" },
  { id: "performance", label: "Performance Updates", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
  { id: "market", label: "Market Trends", icon: TrendingDown, color: "from-purple-500 to-pink-500" },
  { id: "financial", label: "Financial Reports", icon: DollarSign, color: "from-yellow-500 to-orange-500" },
  { id: "user", label: "User Behavior", icon: Users, color: "from-indigo-500 to-blue-500" },
]

export function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    account: true,
    security: true,
    performance: false,
    market: false,
    financial: true,
    user: false,
  })

  const toggleNotification = (id) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 17h5l-5 5v-5z" />
            <path d="M4.19 4.19A2 2 0 0 0 4 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.81-1.19" />
            <path d="M4 12h8" />
            <path d="M4 8h12" />
            <path d="M4 16h6" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notification Center</h3>
      </div>

      <Card className="glass-card border-none shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between p-3 rounded-lg glass-tile border border-white/10 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center ${type.color}`}>
                  <type.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{type.label}</span>
              </div>
              <Switch
                checked={notifications[type.id]}
                onCheckedChange={() => toggleNotification(type.id)}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card border-none shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-lg glass-tile border border-white/10 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Unusual account activity detected</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg glass-tile border border-white/10 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your portfolio has grown by 5% this week</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg glass-tile border border-white/10 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">New feature: Advanced analytics now available</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg glass-tile border border-white/10 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Monthly financial report is ready for review</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">5 days ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="outline"
          className="text-sm glass-tile border border-white/20 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all"
        >
          View All Notifications
        </Button>
      </div>
    </div>
  )
}
