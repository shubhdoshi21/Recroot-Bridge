"use client"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SettingsProvider } from "@/contexts/settings-context"
import { CandidatesProvider } from "@/contexts/candidates-context"
import { MatchingProvider } from "@/contexts/matching-context"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { usePathname } from "next/navigation"
import { JobsProvider } from "@/contexts/jobs-context"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login" || pathname === "/landing"

  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <AuthProvider>
        {isLoginPage ? (
          // Login page layout - no navigation elements
          <div className="min-h-screen">{children}</div>
        ) : (
          // Main application layout with navigation and auth protection
          <AuthGuard>
            <SettingsProvider>
              <CandidatesProvider>
                <MatchingProvider>
                  <JobsProvider>
                    <TooltipProvider delayDuration={0}>
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
                    </TooltipProvider>
                  </JobsProvider>
                </MatchingProvider>
              </CandidatesProvider>
            </SettingsProvider>
          </AuthGuard>
        )}
      </AuthProvider>
    </ThemeProvider>
  )
}
