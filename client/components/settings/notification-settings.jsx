"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export default function NotificationSettings({ settings, updateNotificationSettings, handleSaveNotifications }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Notification Channels</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-notifications"
                defaultChecked={settings.notifications.email}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({
                    ...settings.notifications,
                    email: checked === true,
                  })
                }
              />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="push-notifications"
                defaultChecked={settings.notifications.push}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({
                    ...settings.notifications,
                    push: checked === true,
                  })
                }
              />
              <Label htmlFor="push-notifications">Push Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms-notifications"
                defaultChecked={settings.notifications.sms}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({
                    ...settings.notifications,
                    sms: checked === true,
                  })
                }
              />
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notification Types</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="account-activity"
                defaultChecked={settings.notifications.accountActivity}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({
                    ...settings.notifications,
                    accountActivity: checked === true,
                  })
                }
              />
              <Label htmlFor="account-activity">Account Activity</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-features"
                defaultChecked={settings.notifications.newFeatures}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({
                    ...settings.notifications,
                    newFeatures: checked === true,
                  })
                }
              />
              <Label htmlFor="new-features">New Features and Updates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketing"
                defaultChecked={settings.notifications.marketing}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({
                    ...settings.notifications,
                    marketing: checked === true,
                  })
                }
              />
              <Label htmlFor="marketing">Marketing and Promotions</Label>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notification-frequency">Notification Frequency</Label>
          <Select
            value={settings.notifications.frequency}
            onValueChange={(value) => {
              if (value === "real-time" || value === "daily" || value === "weekly") {
                updateNotificationSettings({
                  ...settings.notifications,
                  frequency: value,
                })
              }
            }}
          >
            <SelectTrigger id="notification-frequency">
              <SelectValue placeholder="Select Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="real-time">Real-time</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quiet-hours-start">Quiet Hours</Label>
          <div className="flex items-center space-x-2">
            <Input id="quiet-hours-start" type="time" defaultValue="22:00" />
            <span>to</span>
            <Input id="quiet-hours-end" type="time" defaultValue="07:00" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
      </CardFooter>
    </Card>
  )
}
