"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  User,
  Mail,
  Lock,
  BarChart2,
  Users,
  Calendar,
  FileText,
  Briefcase,
  Award,
  ChevronRight,
  X,
  Menu,
  Check,
  Bell,
  Phone,
  Sparkles,
  Zap,
  Target,
  Shield,
  TrendingUp,
  Star,
  Play,
  ChevronDown,
} from "lucide-react";
import AuthModal from "./auth-modal";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Refs for scroll sections
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  const faqRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Scroll to section
  const scrollToSection = (ref) => {
    setMobileMenuOpen(false);
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // FAQ items
  const faqItems = [
    {
      question: "What is RecrootBridge?",
      answer:
        "RecrootBridge is a comprehensive recruitment and applicant tracking system designed to streamline your hiring process. It combines powerful candidate management, job posting, interview scheduling, and analytics in one intuitive platform.",
    },
    {
      question: "How can RecrootBridge help my recruitment process?",
      answer:
        "RecrootBridge helps by centralizing all recruitment activities, automating repetitive tasks, providing data-driven insights, and creating a seamless candidate experience. This leads to faster hiring, better quality candidates, and reduced recruitment costs.",
    },
    {
      question: "Is RecrootBridge suitable for small businesses?",
      answer:
        "RecrootBridge is designed to scale with your business. Our flexible plans ensure that businesses of all sizes can access powerful recruitment tools without breaking the budget.",
    },
    {
      question: "Can I integrate RecrootBridge with my existing HR software?",
      answer:
        "Yes, RecrootBridge offers seamless integration with popular HR systems, job boards, calendar applications, and communication tools to create a unified workflow for your recruitment team.",
    },
    {
      question: "How secure is my data with RecrootBridge?",
      answer:
        "We take data security seriously. RecrootBridge employs industry-leading security measures including encryption, regular security audits, and compliance with data protection regulations to ensure your recruitment data remains safe.",
    },
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "per month",
      description: "Perfect for small teams and startups",
      features: [
        "Up to 5 active job postings",
        "Basic candidate tracking",
        "Email notifications",
        "Interview scheduling",
        "Standard reports",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 15 active job postings",
        "Advanced candidate filtering",
        "Custom application forms",
        "Team collaboration tools",
        "Advanced analytics",
        "Email and SMS notifications",
        "API access",
      ],
      cta: "Try Professional",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "tailored pricing",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited job postings",
        "Custom workflow automation",
        "Advanced reporting & analytics",
        "Dedicated account manager",
        "Custom integrations",
        "Priority support",
        "Onboarding assistance",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const handleGetStarted = () => {
    setActiveTab("login");
    setLoginModalOpen(true);
  };

  const handleLogin = () => {
    setActiveTab("login");
    setLoginModalOpen(true);
  };

  return (
    <>
      {/* Custom Auth Modal */}
      {loginModalOpen && (
        <AuthModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          activeTab={activeTab}
        />
      )}

      {/* Main Landing Page */}
      <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Enhanced Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Enhanced Navigation */}
        <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Enhanced Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  RecrootBridge
                </span>
              </div>
            </motion.div>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden space-x-8 md:flex">
              {[
                { name: "Features", ref: featuresRef },
                { name: "Benefits", ref: benefitsRef },
                { name: "Testimonials", ref: testimonialsRef },
                { name: "Pricing", ref: pricingRef },
                { name: "FAQ", ref: faqRef },
              ].map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.ref)}
                  className="text-sm font-medium text-gray-700 transition-all duration-300 hover:text-blue-600 relative group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                </motion.button>
              ))}
            </nav>

            {/* Enhanced Auth Buttons */}
            <motion.div
              className="hidden space-x-4 md:flex"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                size="sm"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Button>
            </motion.div>

            {/* Enhanced Mobile Menu Button */}
            <motion.button
              className="flex items-center md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>

          {/* Enhanced Mobile Navigation */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: mobileMenuOpen ? 1 : 0,
              height: mobileMenuOpen ? "auto" : 0
            }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="bg-white/90 backdrop-blur-xl border-b border-white/20 px-4 py-4">
              <div className="container mx-auto">
                <nav className="flex flex-col space-y-4">
                  {[
                    { name: "Features", ref: featuresRef },
                    { name: "Benefits", ref: benefitsRef },
                    { name: "Testimonials", ref: testimonialsRef },
                    { name: "Pricing", ref: pricingRef },
                    { name: "FAQ", ref: faqRef },
                  ].map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => scrollToSection(item.ref)}
                      className="flex justify-between py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {item.name} <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  ))}
                  <motion.div
                    className="flex space-x-4 pt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full"
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </Button>
                  </motion.div>
                </nav>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden pt-20">
          <div className="container mx-auto px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <motion.div
                className="flex flex-col space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute -left-4 -top-4 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.h1
                    className="relative text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                      Revolutionize
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Your Recruitment
                    </span>
                  </motion.h1>
                </div>

                <motion.p
                  className="text-xl text-gray-600 leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  AI-powered recruitment platform that connects exceptional talent with innovative companies.
                  Streamline your hiring process with intelligent automation and data-driven insights.
                </motion.p>

                <motion.div
                  className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <motion.button
                    onClick={handleGetStarted}
                    className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <motion.button
                    className="group bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white transition-all duration-300 border border-gray-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection(featuresRef)}
                  >
                    <Play className="w-5 h-5" />
                    <span>Watch Demo</span>
                  </motion.button>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-6 pt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-medium text-blue-800 ring-2 ring-white shadow-lg"
                        whileHover={{ y: -3, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {String.fromCharCode(64 + i)}
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">500+</span> companies trust RecrootBridge
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Dashboard Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative mx-auto max-w-md md:max-w-none"
              >
                <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl p-3 shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-3xl">
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50">
                    {/* Enhanced Dashboard Header */}
                    <div className="border-b border-gray-200/50 bg-white/90 backdrop-blur-sm p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <motion.div
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                            whileHover={{ rotate: 10, scale: 1.1 }}
                          >
                            <Users className="h-6 w-6" />
                          </motion.div>
                          <div className="flex space-x-8">
                            <span className="font-semibold text-gray-900">Dashboard</span>
                            <span className="text-gray-500 hover:text-gray-700 transition-colors">Jobs</span>
                            <span className="text-gray-500 hover:text-gray-700 transition-colors">Candidates</span>
                            <span className="text-gray-500 hover:text-gray-700 transition-colors">Analytics</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shadow-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Bell className="h-5 w-5 text-blue-600" />
                          </motion.div>
                          <motion.div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="text-sm font-semibold text-gray-700">JD</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Dashboard Content */}
                    <div className="p-6">
                      {/* Enhanced Stats Row */}
                      <div className="mb-8 grid grid-cols-3 gap-6">
                        {[
                          {
                            label: "Open Positions",
                            value: "24",
                            color: "from-blue-500 to-blue-600",
                            icon: <Briefcase className="h-4 w-4" />
                          },
                          {
                            label: "New Applicants",
                            value: "156",
                            color: "from-green-500 to-green-600",
                            icon: <Users className="h-4 w-4" />
                          },
                          {
                            label: "Interviews",
                            value: "12",
                            color: "from-purple-500 to-purple-600",
                            icon: <Calendar className="h-4 w-4" />
                          },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                          >
                            <div className={`mb-3 h-8 w-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white shadow-sm`}>
                              {stat.icon}
                            </div>
                            <motion.p
                              className="text-2xl font-bold text-gray-900"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.9 + i * 0.1 }}
                            >
                              {stat.value}
                            </motion.p>
                            <p className="text-xs text-gray-500 font-medium">
                              {stat.label}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Enhanced Chart Area */}
                      <motion.div
                        className="mb-8 rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="mb-6 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Recruitment Activity</h3>
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="flex items-center">
                              <span className="mr-2 h-3 w-3 rounded-full bg-blue-500"></span>
                              Applications
                            </span>
                            <span className="flex items-center">
                              <span className="mr-2 h-3 w-3 rounded-full bg-green-500"></span>
                              Interviews
                            </span>
                            <span className="flex items-center">
                              <span className="mr-2 h-3 w-3 rounded-full bg-purple-500"></span>
                              Hires
                            </span>
                          </div>
                        </div>
                        <div className="h-40 w-full">
                          <div className="flex h-full items-end space-x-2">
                            {[
                              40, 65, 50, 80, 60, 55, 75, 65, 90, 60, 75, 70,
                            ].map((height, i) => (
                              <motion.div
                                key={i}
                                className="flex-1"
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{
                                  delay: 0.8 + i * 0.05,
                                  duration: 0.8,
                                  type: "spring",
                                }}
                              >
                                <div className="h-full rounded-t-lg bg-gradient-to-t from-blue-500/80 to-blue-300/50 shadow-sm"></div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-gray-400">
                          <span>Jan</span>
                          <span>Feb</span>
                          <span>Mar</span>
                          <span>Apr</span>
                          <span>May</span>
                          <span>Jun</span>
                          <span>Jul</span>
                          <span>Aug</span>
                          <span>Sep</span>
                          <span>Oct</span>
                          <span>Nov</span>
                          <span>Dec</span>
                        </div>
                      </motion.div>

                      {/* Enhanced Candidates Row */}
                      <motion.div
                        className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <h3 className="mb-6 font-semibold text-gray-900">Recent Candidates</h3>
                        <div className="space-y-4">
                          {[
                            {
                              name: "Alex Morgan",
                              role: "UX Designer",
                              status: "Interview",
                              color: "blue"
                            },
                            {
                              name: "Jamie Chen",
                              role: "Frontend Developer",
                              status: "Screening",
                              color: "yellow"
                            },
                            {
                              name: "Taylor Swift",
                              role: "Product Manager",
                              status: "Hired",
                              color: "green"
                            },
                          ].map((candidate, i) => (
                            <motion.div
                              key={i}
                              className="flex items-center justify-between rounded-xl border border-gray-100/50 p-4 hover:bg-blue-50/50 transition-all duration-300"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1 + i * 0.1 }}
                              whileHover={{ x: 5, scale: 1.02 }}
                            >
                              <div className="flex items-center space-x-4">
                                <motion.div
                                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  <span className="text-sm font-semibold text-blue-700">
                                    {candidate.name.charAt(0)}
                                  </span>
                                </motion.div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {candidate.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {candidate.role}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${candidate.color === "blue"
                                    ? "bg-blue-100 text-blue-700"
                                    : candidate.color === "yellow"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                              >
                                {candidate.status}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Floating Cards */}
                <motion.div
                  className="absolute -bottom-8 -left-8 rounded-2xl bg-white/90 backdrop-blur-xl p-4 shadow-2xl border border-white/20"
                  initial={{ opacity: 0, y: 20, rotate: -5 }}
                  animate={{ opacity: 1, y: 0, rotate: -5 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ y: -8, rotate: 0, scale: 1.05 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <BarChart2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      Analytics Dashboard
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -right-8 bottom-16 rounded-2xl bg-white/90 backdrop-blur-xl p-4 shadow-2xl border border-white/20"
                  initial={{ opacity: 0, y: 20, rotate: 5 }}
                  animate={{ opacity: 1, y: 0, rotate: 5 }}
                  transition={{ delay: 1.4 }}
                  whileHover={{ y: -8, rotate: 0, scale: 1.05 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      Interview Scheduler
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to streamline your recruitment
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our comprehensive platform offers powerful tools to manage your
                entire recruitment process from start to finish.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Briefcase className="h-6 w-6 text-blue-600" />,
                  title: "Job Management",
                  description:
                    "Create, publish, and manage job postings across multiple channels from a single dashboard.",
                },
                {
                  icon: <Users className="h-6 w-6 text-blue-600" />,
                  title: "Candidate Tracking",
                  description:
                    "Track candidates through every stage of your recruitment pipeline with customizable workflows.",
                },
                {
                  icon: <Calendar className="h-6 w-6 text-blue-600" />,
                  title: "Interview Scheduling",
                  description:
                    "Seamlessly schedule and manage interviews with automated reminders and calendar integration.",
                },
                {
                  icon: <BarChart2 className="h-6 w-6 text-blue-600" />,
                  title: "Analytics & Reporting",
                  description:
                    "Gain insights into your recruitment process with comprehensive analytics and customizable reports.",
                },
                {
                  icon: <FileText className="h-6 w-6 text-blue-600" />,
                  title: "Document Management",
                  description:
                    "Store, organize, and share candidate documents securely in one centralized location.",
                },
                {
                  icon: <Award className="h-6 w-6 text-blue-600" />,
                  title: "Onboarding Tools",
                  description:
                    "Streamline the onboarding process with automated workflows and task management.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          ref={benefitsRef}
          className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why choose RecrootBridge?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our platform is designed to solve your biggest recruitment
                challenges and deliver measurable results.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid gap-8 md:grid-cols-2">
                <motion.div
                  className="rounded-xl bg-white p-8 shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="mb-6 text-2xl font-bold text-gray-900">
                    Reduce Time-to-Hire
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Streamline your recruitment workflow with automation",
                      "Quickly identify qualified candidates with AI-powered matching",
                      "Eliminate manual tasks and administrative bottlenecks",
                      "Accelerate decision-making with collaborative tools",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="mr-3 mt-1 flex-shrink-0 text-blue-600">
                          <Check className="h-5 w-5" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex items-center justify-between rounded-lg bg-blue-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Average reduction in time-to-hire
                      </p>
                      <p className="text-3xl font-bold text-blue-600">40%</p>
                    </div>
                    <div className="h-16 w-16">
                      <div className="h-full w-full rounded-full border-8 border-blue-200 border-r-blue-600"></div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-xl bg-white p-8 shadow-lg"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="mb-6 text-2xl font-bold text-gray-900">
                    Improve Candidate Quality
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Attract top talent with professional job postings",
                      "Use customizable screening questions to filter candidates",
                      "Implement structured interview processes for objective evaluation",
                      "Build a talent pool of qualified candidates for future openings",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="mr-3 mt-1 flex-shrink-0 text-blue-600">
                          <Check className="h-5 w-5" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex items-center justify-between rounded-lg bg-blue-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Increase in quality of hire
                      </p>
                      <p className="text-3xl font-bold text-blue-600">65%</p>
                    </div>
                    <div className="h-16 w-16">
                      <div className="h-full w-full rounded-full border-8 border-blue-200 border-r-blue-600"></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section ref={testimonialsRef} className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by recruitment teams worldwide
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                See what our customers have to say about how RecrootBridge has
                transformed their hiring process.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  quote:
                    "RecrootBridge has completely transformed our hiring process. We've reduced our time-to-hire by 45% and improved the quality of our candidates significantly.",
                  author: "Sarah Johnson",
                  title: "Head of Talent Acquisition, TechCorp",
                },
                {
                  quote:
                    "The analytics and reporting features have given us invaluable insights into our recruitment funnel. We can now make data-driven decisions that have improved our hiring outcomes.",
                  author: "Michael Chen",
                  title: "HR Director, Global Solutions Inc.",
                },
                {
                  quote:
                    "As a small business, we needed an affordable solution that could scale with us. RecrootBridge delivered exactly that, plus exceptional customer support whenever we needed help.",
                  author: "Emily Rodriguez",
                  title: "Founder, Startup Innovations",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col rounded-xl bg-white p-6 shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="mb-4 text-blue-600">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className="inline-block">
                          ★
                        </span>
                      ))}
                  </div>
                  <p className="mb-6 flex-grow text-gray-700">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                      <div className="flex h-full w-full items-center justify-center text-gray-500">
                        {testimonial.author.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          ref={pricingRef}
          className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Choose the plan that's right for your business, with no hidden
                fees or long-term contracts.
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  className={`relative rounded-xl ${plan.popular
                    ? "border-2 border-blue-600 shadow-xl"
                    : "border border-gray-200 shadow-md"
                    } bg-white p-6`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {plan.description}
                    </p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600"> {plan.period}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="mr-3 mt-1 flex-shrink-0 text-blue-600">
                          <Check className="h-5 w-5" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                      }`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => {
                      setActiveTab("login");
                      setLoginModalOpen(true);
                    }}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Need a custom solution?{" "}
                <Button variant="link" className="p-0 text-blue-600">
                  Contact our sales team
                </Button>
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Find answers to common questions about RecrootBridge and how it
                can help your business.
              </p>
            </div>

            <div className="mt-16 mx-auto max-w-3xl">
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-white"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.question}
                        </h3>
                        <span className="ml-6 flex-shrink-0 text-gray-500 group-open:rotate-180">
                          <ChevronRight className="h-5 w-5 transition-transform duration-300 group-open:rotate-90" />
                        </span>
                      </summary>
                      <div className="border-t border-gray-200 px-6 pb-6 pt-3">
                        <p className="text-gray-700">{item.answer}</p>
                      </div>
                    </details>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to transform your recruitment process?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Join thousands of companies that have streamlined their hiring
                with RecrootBridge.
              </p>
              <div className="mt-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-blue-700"
                >
                  Schedule a Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-12 text-gray-300">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">
                    RecrootBridge
                  </span>
                </div>
                <p className="mt-4 max-w-xs text-sm text-gray-400">
                  Streamlining recruitment processes for businesses of all sizes
                  since 2018.
                </p>
                <div className="mt-6 flex space-x-4">
                  {["twitter", "facebook", "instagram", "linkedin"].map(
                    (social) => (
                      <a
                        key={social}
                        href="#"
                        className="text-gray-400 hover:text-white"
                      >
                        <span className="sr-only">{social}</span>
                        <div className="h-6 w-6 rounded-full bg-gray-700"></div>
                      </a>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Product
                </h3>
                <ul className="space-y-3">
                  {[
                    "Features",
                    "Pricing",
                    "Integrations",
                    "Customers",
                    "Security",
                  ].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm hover:text-white">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {[
                    "Documentation",
                    "Guides",
                    "API Reference",
                    "Blog",
                    "Community",
                  ].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm hover:text-white">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Company
                </h3>
                <ul className="space-y-3">
                  {[
                    "About Us",
                    "Careers",
                    "Contact",
                    "Privacy Policy",
                    "Terms of Service",
                  ].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm hover:text-white">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 border-t border-gray-800 pt-8 text-center">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} RecrootBridge, Inc. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
