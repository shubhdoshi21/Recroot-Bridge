"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/authService";

export default function AuthModal({
  isOpen,
  onClose,
  activeTab: initialActiveTab,
}) {
  const { toast } = useToast();
  const router = useRouter();
  const { login, loginWithGoogle, loginWithLinkedIn } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isOAuthRedirecting, setIsOAuthRedirecting] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [resetEmail, setResetEmail] = useState("");
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  // Refs
  const submitTimeoutRef = useRef(null);
  const formRef = useRef(null);
  const loginEmailRef = useRef(null);
  const loginPasswordRef = useRef(null);
  const modalRef = useRef(null);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsOAuthRedirecting(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.log("Google login error:", error);
    } finally {
      setIsOAuthRedirecting(false);
    }
  };

  // Handle LinkedIn login
  const handleLinkedInLogin = async () => {
    setIsOAuthRedirecting(true);
    try {
      await loginWithLinkedIn();
    } catch (error) {
      console.log("LinkedIn login error:", error);
    } finally {
      setIsOAuthRedirecting(false);
    }
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      await login(loginEmail, loginPassword, rememberMe);
      onClose();
    } catch (err) {
      console.log("Login error:", err);
      if (
        err.message.includes("No account found") ||
        err.message.includes("User not found")
      ) {
        setLoginError(
          "No account found with this email. Please check your email address."
        );
      } else {
        setLoginError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!loginEmail) {
      setLoginError("Please enter your email address first.");
      return;
    }

    setIsRequestingReset(true);
    setLoginError("");

    try {
      await authService.forgotPassword(loginEmail);
      setResetEmail(loginEmail);
      setResetStep("sent");
      toast({
        title: "Reset Link Sent",
        description: `If an account exists with ${loginEmail}, you will receive password reset instructions.`,
        duration: 5000,
      });
    } catch (error) {
      setLoginError(
        error.message || "Failed to send reset email. Please try again."
      );
    } finally {
      setIsRequestingReset(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>

          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-6 top-6 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </motion.button>

            {/* Modal Content */}
            {!isOAuthRedirecting ? (
              <>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8 text-center"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Sign in to your RecrootBridge account
                  </p>
                </motion.div>

                {/* Social Login Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3 mb-8"
                >
                  <motion.button
                    onClick={handleGoogleLogin}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-3 flex items-center justify-center gap-3 hover:bg-white/80 transition-all duration-300 text-gray-700 font-medium"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </motion.button>

                  <motion.button
                    onClick={handleLinkedInLogin}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-3 flex items-center justify-center gap-3 hover:bg-white/80 transition-all duration-300 text-gray-700 font-medium"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#0A66C2"
                        d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                      />
                    </svg>
                    Continue with LinkedIn
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative mb-8"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500 rounded-full">
                      Or continue with email
                    </span>
                  </div>
                </motion.div>

                {/* Login Form */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-6"
                >
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl bg-red-50/80 backdrop-blur-sm p-4 text-sm text-red-700 border border-red-200/50"
                    >
                      {loginError}
                    </motion.div>
                  )}

                  {resetStep === "email" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                            <Mail className="h-5 w-5" />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-2xl h-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                            required
                            autoComplete="email"
                            ref={loginEmailRef}
                            disabled={isSubmitting || isRequestingReset}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-white/50 rounded-xl"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            disabled={isSubmitting || isRequestingReset}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                            <Lock className="h-5 w-5" />
                          </div>
                          <Input
                            id="password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-2xl h-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                            required
                            autoComplete="current-password"
                            ref={loginPasswordRef}
                            disabled={isSubmitting || isRequestingReset}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember-me"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked)}
                            disabled={isSubmitting || isRequestingReset}
                            className="rounded-lg"
                          />
                          <Label
                            htmlFor="remember-me"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                          >
                            Remember me
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="px-0 text-xs h-auto text-blue-600 hover:text-blue-700"
                          onClick={handleForgotPassword}
                          disabled={isSubmitting || isRequestingReset}
                        >
                          {isRequestingReset ? "Sending..." : "Forgot password?"}
                        </Button>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting || isRequestingReset}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <svg
                              className="mr-2 h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Signing in...
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </motion.button>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                      <div className="rounded-2xl bg-green-50/80 backdrop-blur-sm p-6 border border-green-200/50">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Check className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-semibold text-green-800">
                              Reset Link Sent
                            </h3>
                            <div className="mt-2 text-green-700">
                              <p>
                                We've sent password reset instructions to{" "}
                                <span className="font-medium">{resetEmail}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white/60 backdrop-blur-sm border border-gray-200/50 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-white/80 transition-all duration-300"
                        onClick={() => {
                          setResetStep("email");
                          setLoginError("");
                        }}
                      >
                        Back to Sign In
                      </motion.button>
                    </motion.div>
                  )}
                </motion.form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-6 py-12"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Redirecting to authentication provider...
                  </p>
                  <p className="text-gray-600">Please wait while we connect you securely.</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
