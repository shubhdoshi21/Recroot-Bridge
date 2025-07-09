import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { DocumentsProvider } from "@/contexts/documents-context";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AdminProvider } from "@/contexts/admin-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommunicationProvider } from "@/contexts/communication-context";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { TeamsProvider } from "@/contexts/teams-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { CandidatesProvider } from "@/contexts/candidates-context";
import { JobsProvider } from "@/contexts/jobs-context";
import { CompaniesProvider } from "@/contexts/companies-context";
import { RecruitersProvider } from "@/contexts/recruiters-context";
import { InterviewsProvider } from "@/contexts/interviews-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RecrootBridge",
  description: "Recruitment Management System",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
          >
            <AuthProvider>
              <AdminProvider>
                <DocumentsProvider>
                  <CandidatesProvider>
                    <JobsProvider>
                      <CompaniesProvider>
                        <RecruitersProvider>
                          <InterviewsProvider>
                            <CommunicationProvider>
                              <TooltipProvider delayDuration={0}>
                                <OnboardingProvider>
                                  <TeamsProvider>
                                    <SettingsProvider>
                                      <LayoutWrapper>{children}</LayoutWrapper>
                                    </SettingsProvider>
                                  </TeamsProvider>
                                </OnboardingProvider>
                                <Toaster />
                              </TooltipProvider>
                            </CommunicationProvider>
                          </InterviewsProvider>
                        </RecruitersProvider>
                      </CompaniesProvider>
                    </JobsProvider>
                  </CandidatesProvider>
                </DocumentsProvider>
              </AdminProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
