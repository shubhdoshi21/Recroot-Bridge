"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

export function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/landing");
    }
  }, [isAuthenticated, router]);

  // Always render children - the redirect will happen if needed
  return children;
}
