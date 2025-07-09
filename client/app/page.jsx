"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AuthModal from "@/components/login/auth-modal";
import { RecruitmentOverview } from "@/components/dashboard/recruitment-overview";
import { RecentCandidates } from "@/components/dashboard/recent-candidates";
import { JobOpenings } from "@/components/dashboard/job-openings";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { HiringMetrics } from "@/components/dashboard/hiring-metrics";
import { RecruitmentFunnel } from "@/components/dashboard/recruitment-funnel";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Briefcase, Calendar } from "lucide-react";

export default function Dashboard() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if showLogin is in the URL
    const showLogin = searchParams.get("showLogin");
    if (showLogin === "true") {
      setShowAuthModal(true);
      setActiveTab("login");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Your recruitment overview and key metrics
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <DashboardActions />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">1,248</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Positions</p>
                  <p className="text-2xl font-bold text-gray-900">42</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week's Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">68</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <RecruitmentOverview />
        </div>
        <div className="md:col-span-1">
          <UpcomingInterviews />
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <div className="md:col-span-1">
          <JobOpenings />
        </div>
        <div className="md:col-span-1">
          <RecentCandidates />
        </div>
        <div className="md:col-span-1">
          <RecruitmentFunnel />
        </div>
      </div>

      {/* Full Width Metrics */}
      <div className="mt-6">
        <HiringMetrics />
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        activeTab={activeTab}
      />
    </div>
  );
}
