"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailTemplates } from "@/components/communications/email-templates";
import { CommunicationAnalytics } from "@/components/communications/communication-analytics";
import { AutomatedMessages } from "@/components/communications/automated-messages";
import { useToast } from "@/hooks/use-toast";

function CommunicationsContent() {
  const [activeTab, setActiveTab] = useState("templates"); // Default to 'templates'
  const [messages, setMessages] = useState([]);

  const { toast } = useToast ? useToast() : { toast: () => { } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <PenSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Communications
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage, send, and analyze all your communications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        defaultValue="templates"
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
            <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="automated" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              Automated Messages
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="templates" className="space-y-4">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="automated" className="space-y-4">
          <AutomatedMessages />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CommunicationAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CommunicationsPage() {
  return <CommunicationsContent />;
}
