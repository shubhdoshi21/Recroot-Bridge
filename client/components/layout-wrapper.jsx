"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { SettingsProvider } from "@/contexts/settings-context";
import { CandidatesProvider } from "@/contexts/candidates-context";
import { MatchingProvider } from "@/contexts/matching-context";
import { RecruitersProvider } from "@/contexts/recruiters-context";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { InterviewsProvider } from "@/contexts/interviews-context";
import { JobsProvider } from "@/contexts/jobs-context";

export function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const isPublicPage =
    pathname === "/login" ||
    pathname === "/landing" ||
    pathname === "/reset-password" ||
    pathname === "/admin";

  // Show a simple loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // For public pages (login and reset password), render without navigation and auth protection
  if (isPublicPage) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
        <main className="w-full">{children}</main>
      </div>
    );
  }

  // Main application layout with navigation and auth protection
  return (
    <AuthGuard>
      <SettingsProvider>
        <RecruitersProvider>
          <CandidatesProvider>
            <MatchingProvider>
              <InterviewsProvider>
                <JobsProvider>
                  <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <TopNav />
                      <div className="flex-1 overflow-auto">
                        <div className="container mx-auto px-4 py-6 max-w-7xl">
                          <main className="w-full">{children}</main>
                        </div>
                      </div>
                    </div>
                  </div>
                </JobsProvider>
              </InterviewsProvider>
            </MatchingProvider>
          </CandidatesProvider>
        </RecruitersProvider>
      </SettingsProvider>
    </AuthGuard>
  );
}
