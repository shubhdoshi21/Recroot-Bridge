"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Building2, Activity } from "lucide-react";
import AdminManagement from "@/components/admin/admin-management";
import ClientManagement from "@/components/admin/client-management";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Manage users, clients, and system configurations
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Card className="shadow-modern-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
                  <TabsTrigger 
                    value="users" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </TabsTrigger>
                  <TabsTrigger 
                    value="clients"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Client Management
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="users" className="mt-0">
                  <AdminManagement />
                </TabsContent>
                <TabsContent value="clients" className="mt-0">
                  <ClientManagement />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
