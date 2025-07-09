"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OnboardingDashboard } from "@/components/onboarding/onboarding-dashboard"
import { OnboardingTasks } from "@/components/onboarding/onboarding-tasks"
import { NewHires } from "@/components/onboarding/new-hires"
import { OnboardingTemplates } from "@/components/onboarding/onboarding-templates"
import { OnboardingDocuments } from "@/components/onboarding/onboarding-documents"
import TaskTemplates from "@/components/onboarding/task-templates"
import { CompaniesProvider } from "@/contexts/companies-context"

export default function OnboardingPage() {
  return (
    <CompaniesProvider>
      <div className="space-y-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="responsive-heading">Onboarding</h1>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="new-hires">New Hires</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4">
            <OnboardingDashboard />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <OnboardingTasks />
          </TabsContent>

          <TabsContent value="new-hires" className="space-y-4">
            <NewHires />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <OnboardingTemplates />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <OnboardingDocuments />
          </TabsContent>
        </Tabs>
      </div>
    </CompaniesProvider>
  )
}
