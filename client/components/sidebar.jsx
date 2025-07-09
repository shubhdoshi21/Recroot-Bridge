"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileCheck,
  BarChart2,
  Calendar,
  UserCog,
  Building2,
  UsersRound,
  FileText,
  MessageSquare,
  ClipboardCheck,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "ATS Matching", href: "/matching", icon: FileCheck },
  { name: "Recruiters", href: "/recruiters", icon: UserCog },
  { name: "Teams", href: "/teams", icon: UsersRound },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Communications", href: "/communications", icon: MessageSquare },
  { name: "Onboarding", href: "/onboarding", icon: ClipboardCheck },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(null);

  // Prefetch all routes on component mount
  useEffect(() => {
    navigation.forEach((item) => {
      router.prefetch(item.href);
    });
    bottomNavigation.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  // Clear loading state when route changes
  useEffect(() => {
    setLoadingRoute(null);
  }, [pathname]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const sidebar = document.getElementById("sidebar");
      const mobileToggle = document.getElementById("mobile-toggle");

      if (
        sidebar &&
        !sidebar.contains(event.target) &&
        mobileToggle &&
        !mobileToggle.contains(event.target) &&
        isMobileOpen
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMobileOpen]);

  const handleNavigation = async (href) => {
    try {
      setLoadingRoute(href);
      await router.push(href);
    } catch (error) {
      console.log("Navigation failed:", error);
      setLoadingRoute(null);
    }
  };

  const NavItem = ({ item, isBottom = false }) => {
    const isActive = pathname === item.href;
    const isLoading = loadingRoute === item.href;

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleNavigation(item.href)}
            className={cn(
              "w-full flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-200",
              isActive
                ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 shadow-sm"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white hover:text-blue-700",
              isCollapsed && "justify-center px-2",
              isLoading && "opacity-50 cursor-wait"
            )}
            disabled={isLoading}
            tabIndex={0}
          >
            <span
              className={cn(
                "flex items-center justify-center h-9 w-9 rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 group-hover:bg-blue-50 group-hover:text-blue-700 text-gray-500"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <item.icon className="h-5 w-5" />
              )}
            </span>
            {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
          </button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {item.name}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <>
        <button
          id="mobile-toggle"
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md border border-gray-200"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div
          id="sidebar"
          className={cn(
            "fixed inset-y-0 z-20 flex flex-col bg-gradient-to-b from-white via-blue-50/60 to-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:static shadow-lg",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50/60 to-white">
            <div
              className={cn(
                "flex h-16 items-center gap-2 px-4",
                isCollapsed && "justify-center px-2"
              )}
            >
              {!isCollapsed && (
                <button
                  onClick={() => handleNavigation("/")}
                  className="flex items-center justify-center w-full py-2"
                >
                  <Image
                    src="/final logo file.svg"
                    alt="Logo"
                    width={200}
                    height={200}
                    style={{ display: 'block', margin: '0 auto' }}
                  />
                </button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn("ml-auto h-8 w-8", isCollapsed && "ml-0")}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isCollapsed && "rotate-180"
                  )}
                />
                <span className="sr-only">
                  {isCollapsed ? "Expand" : "Collapse"} Sidebar
                </span>
              </Button>

              {isMobileOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-8 w-8 absolute top-4 right-4"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close Sidebar</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-2 bg-gradient-to-t from-blue-50/40 to-white">
            <nav className="space-y-1">
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} isBottom />
              ))}
            </nav>
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}
