"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import AuthModal from "../../components/login/auth-modal";

export default function LoginPage() {
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleCloseModal = () => {
    // If user closes the login modal without logging in, redirect to landing page
    if (!isAuthenticated) {
      router.push("/landing");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseModal}
        activeTab={activeTab}
      />
    </div>
  );
}
