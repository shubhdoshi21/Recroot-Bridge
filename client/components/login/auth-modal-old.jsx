"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Phone,
  User,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/authService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function AuthModal({
  isOpen,
  onClose,
  activeTab: initialActiveTab,
}) {
  const { toast } = useToast();
  const router = useRouter();
  const { login, signup, loginWithGoogle, loginWithLinkedIn } = useAuth();

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authStep, setAuthStep] = useState("email");
  const [authType, setAuthType] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState([]);
  const [isOAuthRedirecting, setIsOAuthRedirecting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  // Signup Step states
  const [signupStep, setSignupStep] = useState("email_name"); // 'email_name', 'otp', 'details'

  // Signup form data states
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // OTP states for inline verification
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Refs (Remove unused refs if using state)
  const submitTimeoutRef = useRef(null);
  const formRef = useRef(null); // Keep formRef if needed for form-wide actions
  const loginEmailRef = useRef(null);
  const loginPasswordRef = useRef(null);
  const signupPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const modalRef = useRef(null);

  // Add OTP countdown effect
  useEffect(() => {
    let timer;
    if (signupStep === "otp" && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    } else if (signupStep !== "otp" && otpCountdown !== 0) {
      setOtpCountdown(0); // Reset countdown if not on OTP step
    }
    return () => clearInterval(timer);
  }, [otpCountdown, signupStep]);

  // Handle requesting OTP (replaces handleSendOtp)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setSignupError("");
    if (!fullName || !signupEmail) {
      setSignupError("Please fill in your name and email address.");
      return;
    }

    setIsSendingOtp(true);
    try {
      await authService.requestOtp(signupEmail);

      setSignupStep("otp"); // Transition to OTP step
      setOtpCountdown(120); // Start 2-minute countdown
      toast({
        title: "Verification Code Sent",
        description: `We've sent a verification code to ${signupEmail}.`,
      });
    } catch (error) {
      setSignupError(error.message || "Failed to send verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Add resend OTP handler
  const handleResendOTP = async () => {
    if (otpCountdown > 0 || isResendingOtp || isVerifyingOtp || !signupEmail)
      return;

    setIsResendingOtp(true);
    setSignupError("");
    try {
      await authService.resendOTP(signupEmail);
      setOtpCountdown(120); // Reset to 2 minutes
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      setSignupError(error.message || "Failed to resend OTP");
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Add handler for verifying OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setSignupError("");
    if (!otp) {
      setSignupError("Please enter the verification code.");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await authService.verifyOTP(signupEmail, otp);

      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified.",
      });
      setSignupStep("details"); // Transition to details step
      setOtp(""); // Clear OTP field
    } catch (error) {
      setSignupError(error.message || "Invalid or expired verification code.");
      // Optionally clear OTP field on failure:
      // setOtp("");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle final signup submission
  const handleFinalSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");
    setPasswordMatchError(false);
    setPasswordValidationErrors([]);

    // Re-validate details before final submission
    if (
      !fullName ||
      !signupEmail || // Should be filled from step 1
      !phone ||
      !signupPassword ||
      !confirmPassword ||
      !agreeToTerms
    ) {
      // This case should ideally not be hit if steps are followed,
      // but added for robustness.
      setSignupError("Please fill in all required fields.");
      return;
    }

    // Password validation already done, but re-check match for robustness
    if (signupPassword !== confirmPassword) {
      setPasswordMatchError(true);
      return;
    }

    setIsSigningUp(true);
    try {
      // Call the actual signup API with all collected data
      await signup(fullName, signupEmail, signupPassword, phone);

      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
      onClose(); // Close modal on success
      router.push("/dashboard");
    } catch (err) {
      setSignupError(err.message || "Error creating account.");
    } finally {
      setIsSigningUp(false);
    }
  };

  // Password visibility toggles
  const toggleSignupPassword = useCallback((e) => {
    e.preventDefault();
    const input = signupPasswordRef.current;
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  }, []);

  const toggleConfirmPassword = useCallback((e) => {
    e.preventDefault();
    const input = confirmPasswordRef.current;
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  }, []);

  const toggleLoginPassword = useCallback((e) => {
    e.preventDefault();
    const input = loginPasswordRef.current;
    if (input) {
      const currentValue = input.value;
      input.type = input.type === "password" ? "text" : "password";
      input.value = currentValue;
    }
  }, []);

  // Handle social login
  const handleGoogleLogin = useCallback(async () => {
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      setLoginError(err.message || "Error logging in with Google");
      throw err;
    }
  }, [loginWithGoogle, router]);

  const handleLinkedInLogin = useCallback(async () => {
    try {
      await loginWithLinkedIn();
      router.push("/");
    } catch (err) {
      setLoginError(err.message || "Error logging in with LinkedIn");
      throw err;
    }
  }, [loginWithLinkedIn, router]);

  // Handle login form submission
  const handleLoginSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }

      if (isSubmitting) return;

      setIsSubmitting(true);

      submitTimeoutRef.current = setTimeout(async () => {
        try {
          const email = loginEmail.trim();
          const password = loginPasswordRef.current?.value;

          if (authStep === "email") {
            if (!email) {
              setLoginError("Please enter your email address.");
              loginEmailRef.current?.focus();
              setIsSubmitting(false);
              return;
            }

            const type = await authService.checkAuthType(email);
            setAuthType(type);

            if (type === "local") {
              setSavedEmail(email);
              setAuthStep("password");
              setTimeout(() => {
                loginPasswordRef.current?.focus();
              }, 0);
            } else if (type === "google") {
              setIsOAuthRedirecting(true);
              await handleGoogleLogin();
            } else if (type === "linkedin") {
              setIsOAuthRedirecting(true);
              await handleLinkedInLogin();
            } else if (type === "none") {
              toast({
                title: "Account Not Found",
                description:
                  "No account exists with this email. Please sign up to create a new account.",
                variant: "destructive",
                duration: 4000,
              });
              setActiveTab("signup");
            } else {
              throw new Error(`Unsupported authentication type: ${type}`);
            }
          } else {
            if (!savedEmail || !password) {
              setLoginError("Please enter both email and password");
              if (!password) loginPasswordRef.current?.focus();
              setIsSubmitting(false);
              return;
            }

            await login(savedEmail, password, rememberMe);
            router.push("/dashboard");
          }
        } catch (error) {
          console.log("Error in form submission:", error);
          setLoginError(
            error.message || "An error occurred. Please try again."
          );
        } finally {
          setIsSubmitting(false);
          setIsOAuthRedirecting(false);
          submitTimeoutRef.current = null;
        }
      }, 300);
    },
    [
      authStep,
      handleGoogleLogin,
      handleLinkedInLogin,
      login,
      rememberMe,
      router,
      isSubmitting,
      savedEmail,
      toast,
      loginEmail,
    ]
  );

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

  // Check individual password requirements
  const checkPasswordRequirement = (password, requirement) => {
    switch (requirement) {
      case "length":
        return password.length >= 8;
      case "uppercase":
        return /[A-Z]/.test(password);
      case "lowercase":
        return /[a-z]/.test(password);
      case "number":
        return /[0-9]/.test(password);
      case "special":
        return /[!@#$%^&*(),.?":{}|<>]/.test(password);
      default:
        return false;
    }
  };

  const validatePhone = (value) => {
    const phoneRegex = /^\d{10}$/;
    if (!value) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(value)) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-8 w-full max-w-md overflow-scroll max-h-[80vh]"
      >
        {isOAuthRedirecting ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg font-medium">
              Redirecting to authentication provider...
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {activeTab === "login" ? "Login" : "Sign Up"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="flex rounded-md bg-gray-100 p-1">
                <button
                  className={`flex-1 rounded-md py-2 text-sm font-medium ${
                    activeTab === "login"
                      ? "bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>
                <button
                  className={`flex-1 rounded-md py-2 text-sm font-medium ${
                    activeTab === "signup"
                      ? "bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
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
              </Button>
              <Button
                onClick={handleLinkedInLogin}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#0A66C2"
                    d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                  />
                </svg>
                Continue with LinkedIn
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <form
                ref={formRef}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                {loginError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {loginError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      required
                      autoComplete="username"
                      ref={loginEmailRef}
                      disabled={isSubmitting || authStep === "password"}
                      value={authStep === "password" ? savedEmail : loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                {authStep === "password" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs"
                          onClick={toggleLoginPassword}
                          disabled={isSubmitting}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          required
                          autoComplete="current-password"
                          ref={loginPasswordRef}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked)}
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor="remember-me"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0 text-xs h-auto"
                        disabled={isSubmitting}
                      >
                        Forgot password?
                      </Button>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
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
                        {authStep === "email" ? "Continue" : "Logging in..."}
                      </div>
                    ) : authStep === "email" ? (
                      "Continue with Email"
                    ) : (
                      "Login"
                    )}
                  </Button>
                  {authStep === "password" && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => {
                        setAuthStep("email");
                        setLoginError("");
                        if (loginPasswordRef.current) {
                          loginPasswordRef.current.value = "";
                        }
                        setTimeout(() => {
                          loginEmailRef.current?.focus();
                        }, 0);
                      }}
                      disabled={isSubmitting}
                    >
                      Back to Email
                    </Button>
                  )}
                </div>
              </form>
            )}

            {/* Signup Form - Multi-Step */}
            {activeTab === "signup" && (
              <form
                onSubmit={
                  signupStep === "email_name"
                    ? handleRequestOtp
                    : signupStep === "otp"
                    ? handleVerifyOtp
                    : handleFinalSignupSubmit // signupStep === 'details'
                }
                className="space-y-4"
              >
                {signupError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {signupError}
                  </div>
                )}

                {/* Step 1: Full Name & Email */}
                {(signupStep === "email_name" ||
                  signupStep === "otp" ||
                  signupStep === "details") && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="name"
                        disabled={signupStep !== "email_name" || isSendingOtp} // Disabled in OTP and details steps
                      />
                    </div>
                  </div>
                )}

                {(signupStep === "email_name" ||
                  signupStep === "otp" ||
                  signupStep === "details") && (
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="name@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className={`pl-10 ${
                          signupStep === "email_name" ? "pr-28" : "" // Add padding only in email_name step
                        }`}
                        required
                        autoComplete="email"
                        disabled={signupStep !== "email_name" || isSendingOtp} // Disabled in OTP and details steps
                      />
                      {/* Send OTP Button */}
                      {signupStep === "email_name" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute inset-y-0 right-0 my-1 mr-1 px-3"
                          onClick={handleRequestOtp}
                          disabled={!signupEmail || !fullName || isSendingOtp}
                        >
                          {isSendingOtp ? (
                            <div className="flex items-center justify-center">
                              <svg
                                className="animate-spin h-4 w-4 text-current"
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
                              <span className="ml-1">Sending...</span>
                            </div>
                          ) : (
                            "Send Code"
                          )}
                        </Button>
                      )}
                      {/* Email is sent/verified state icon */}
                      {(signupStep === "otp" || signupStep === "details") && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: OTP Verification */}
                {signupStep === "otp" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-medium">Verify Your Email</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        We've sent a verification code to{" "}
                        <strong>{signupEmail}</strong>.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="pl-10"
                          required
                          maxLength={6}
                          disabled={isVerifyingOtp}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {otpCountdown > 0
                            ? `Resend code in ${Math.floor(
                                otpCountdown / 60
                              )}:${(otpCountdown % 60)
                                .toString()
                                .padStart(2, "0")}`
                            : "Didn't receive the code?"}
                        </span>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="px-0 text-xs"
                          onClick={handleResendOTP}
                          disabled={
                            otpCountdown > 0 || isResendingOtp || isVerifyingOtp
                          }
                        >
                          {isResendingOtp ? "Resending..." : "Resend Code"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Remaining Details */}
                {signupStep === "details" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-medium">Almost There!</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Please provide a few more details to complete your
                        account setup.
                      </p>
                    </div>
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter 10-digit phone number"
                          value={phone}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setPhone(value);
                            validatePhone(value);
                          }}
                          className={cn(
                            "pl-10",
                            phoneError && "border-red-500"
                          )}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          maxLength={10}
                        />
                      </div>
                      {phoneError && (
                        <p className="text-sm text-red-500">{phoneError}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="signupPassword">Password</Label>
                          {/* Password Popover - keep as is */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-transparent"
                                disabled={isSigningUp}
                              >
                                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" align="start">
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">
                                  Password Requirements
                                </h4>
                                <div className="space-y-2">
                                  {[
                                    {
                                      text: "At least 8 characters long",
                                      requirement: "length",
                                    },
                                    {
                                      text: "At least one uppercase letter",
                                      requirement: "uppercase",
                                    },
                                    {
                                      text: "At least one lowercase letter",
                                      requirement: "lowercase",
                                    },
                                    {
                                      text: "At least one number",
                                      requirement: "number",
                                    },
                                    {
                                      text: "At least one special character",
                                      requirement: "special",
                                    },
                                  ].map((req, index) => {
                                    const isSatisfied =
                                      checkPasswordRequirement(
                                        signupPassword, // Use signupPassword state here
                                        req.requirement
                                      );
                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2"
                                      >
                                        {isSatisfied ? (
                                          <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                        )}
                                        <span
                                          className={`text-sm ${
                                            isSatisfied
                                              ? "text-green-600"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          {req.text}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        {/* Keep toggle button for password visibility */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs"
                          onClick={toggleSignupPassword}
                          disabled={isSigningUp}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="signupPassword"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => {
                            const newPassword = e.target.value;
                            setSignupPassword(newPassword); // Update state
                            const errors = validatePassword(newPassword);
                            setPasswordValidationErrors(errors);
                          }}
                          className="pl-10"
                          required
                          autoComplete="new-password"
                          disabled={isSigningUp}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        {/* Keep toggle button for confirm password visibility */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs"
                          onClick={toggleConfirmPassword}
                          disabled={isSigningUp}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)} // Update state
                          className="pl-10"
                          required
                          autoComplete="new-password"
                          disabled={isSigningUp}
                        />
                      </div>
                    </div>

                    {passwordMatchError && (
                      <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                        Passwords do not match
                      </div>
                    )}

                    {/* Terms and Conditions */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked)} // Update state
                        required
                        disabled={isSigningUp}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm">
                        I agree to the{" "}
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="px-0 text-xs"
                        >
                          Terms and Conditions
                        </Button>
                      </Label>
                    </div>
                  </div>
                )}

                {/* Buttons based on step */}
                {signupStep === "email_name" && (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-4 w-4 text-current mr-2"
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
                        Sending Code...
                      </div>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                )}

                {signupStep === "otp" && (
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isVerifyingOtp || isResendingOtp}
                    >
                      {isVerifyingOtp ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-4 w-4 text-current mr-2"
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
                          Verifying...
                        </div>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSignupStep("email_name"); // Go back to email/name step
                        setOtp("");
                        setSignupError("");
                        setOtpCountdown(0);
                      }}
                      disabled={isVerifyingOtp || isResendingOtp}
                    >
                      Back
                    </Button>
                  </div>
                )}

                {signupStep === "details" && (
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSigningUp}
                    >
                      {isSigningUp ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-4 w-4 text-current mr-2"
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
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSignupStep("otp"); // Go back to OTP step
                        setSignupError("");
                        // OTP field will be empty on going back, user might need to resend
                      }}
                      disabled={isSigningUp}
                    >
                      Back
                    </Button>
                  </div>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
