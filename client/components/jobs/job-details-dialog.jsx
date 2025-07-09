"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCompanies } from "@/contexts/companies-context";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Briefcase,
  Clock,
  GraduationCap,
  Globe,
  CheckCircle2,
  Timer,
  Wallet,
  Users2,
  CalendarDays,
  FileText,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function JobDetailsDialog({ open, onOpenChange, job }) {
  const { companies } = useCompanies();

  if (!job) return null;

  const getCompanyName = (companyId) => {
    if (!companyId) return "Not specified";
    const company = companies.find((c) => Number(c.id) === Number(companyId));
    return company ? company.name : "Company not specified";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (days) => {
    if (!days) return "Not specified";
    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Not specified";
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
    if (min && !max) return `From ${formatter.format(min)}`;
    if (!min && max) return `Up to ${formatter.format(max)}`;
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      case "closing-soon":
      case "closing soon":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Status Not Set";

    // Convert to proper display format
    switch (status.toLowerCase()) {
      case "active":
        return "Active";
      case "draft":
        return "Draft";
      case "closed":
        return "Closed";
      case "new":
        return "New";
      case "closing-soon":
      case "closing soon":
        return "Closing Soon";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getApplicationStages = () => {
    console.log("Raw application stages:", job.applicationStages);

    // Return default stages if no stages are set
    if (!job.applicationStages) {
      console.log("No application stages found, using defaults");
      return [
        {
          name: "Applied",
          order: 1,
          description: "Initial application received",
          requirements: [],
          duration: 1,
        },
        {
          name: "Screening",
          order: 2,
          description: "Resume screening",
          requirements: [],
          duration: 3,
        },
        {
          name: "Interview",
          order: 3,
          description: "Technical interview",
          requirements: [],
          duration: 7,
        },
        {
          name: "Offer",
          order: 4,
          description: "Job offer",
          requirements: [],
          duration: 3,
        },
      ];
    }

    // If it's a string, try to parse it
    if (typeof job.applicationStages === "string") {
      try {
        const parsed = JSON.parse(job.applicationStages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
        // If parsing succeeds but result is not a valid array, return defaults
        console.log(
          "Parsed application stages is not a valid array, using defaults"
        );
        return [
          {
            name: "Applied",
            order: 1,
            description: "Initial application received",
            requirements: [],
            duration: 1,
          },
          {
            name: "Screening",
            order: 2,
            description: "Resume screening",
            requirements: [],
            duration: 3,
          },
          {
            name: "Interview",
            order: 3,
            description: "Technical interview",
            requirements: [],
            duration: 7,
          },
          {
            name: "Offer",
            order: 4,
            description: "Job offer",
            requirements: [],
            duration: 3,
          },
        ];
      } catch (e) {
        console.log("Error parsing application stages:", e);
        return [
          {
            name: "Applied",
            order: 1,
            description: "Initial application received",
            requirements: [],
            duration: 1,
          },
          {
            name: "Screening",
            order: 2,
            description: "Resume screening",
            requirements: [],
            duration: 3,
          },
          {
            name: "Interview",
            order: 3,
            description: "Technical interview",
            requirements: [],
            duration: 7,
          },
          {
            name: "Offer",
            order: 4,
            description: "Job offer",
            requirements: [],
            duration: 3,
          },
        ];
      }
    }

    // If it's already an array, validate and return it or defaults
    if (Array.isArray(job.applicationStages)) {
      if (job.applicationStages.length > 0) {
        return job.applicationStages;
      }
      console.log("Application stages array is empty, using defaults");
      return [
        {
          name: "Applied",
          order: 1,
          description: "Initial application received",
          requirements: [],
          duration: 1,
        },
        {
          name: "Screening",
          order: 2,
          description: "Resume screening",
          requirements: [],
          duration: 3,
        },
        {
          name: "Interview",
          order: 3,
          description: "Technical interview",
          requirements: [],
          duration: 7,
        },
        {
          name: "Offer",
          order: 4,
          description: "Job offer",
          requirements: [],
          duration: 3,
        },
      ];
    }

    // If it's neither a string nor an array, return defaults
    console.warn(
      "Application stages is neither string nor array:",
      typeof job.applicationStages
    );
    return [
      {
        name: "Applied",
        order: 1,
        description: "Initial application received",
        requirements: [],
        duration: 1,
      },
      {
        name: "Screening",
        order: 2,
        description: "Resume screening",
        requirements: [],
        duration: 3,
      },
      {
        name: "Interview",
        order: 3,
        description: "Technical interview",
        requirements: [],
        duration: 7,
      },
      {
        name: "Offer",
        order: 4,
        description: "Job offer",
        requirements: [],
        duration: 3,
      },
    ];
  };

  console.log("job.requiredSkills", job.requiredSkills);
  const getRequiredSkills = () => {
    if (!job.requiredSkills) return [];
    if (Array.isArray(job.requiredSkills)) return job.requiredSkills;
    if (typeof job.requiredSkills === "string") {
      try {
        const parsed = JSON.parse(job.requiredSkills);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback: split by comma
        return job.requiredSkills
          .replace(/\[|\]|"/g, "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-2xl font-bold">Job Details</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-2xl font-extrabold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                {job.jobTitle}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getStatusColor(job.jobStatus) + " text-base px-3 py-1 rounded-full font-semibold"}>
                  {formatStatus(job.jobStatus)}
                </Badge>
                <span className="text-gray-500 font-medium text-base">
                  {getCompanyName(job.companyId)}
                </span>
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-blue-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500">Department</div>
                <div className="font-semibold text-base">{job.department || "Not specified"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-xs text-gray-500">Experience Level</div>
                <div className="font-semibold text-base">{job.experienceLevel || "Not specified"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-xs text-gray-500">Openings</div>
                <div className="font-semibold text-base">{job.openings || "Not specified"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-xs text-gray-500">Salary Range</div>
                <div className="font-semibold text-base">
                  {job.salaryMin && job.salaryMax
                    ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`
                    : "Not specified"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-pink-500" />
              <div>
                <div className="text-xs text-gray-500">Application Deadline</div>
                <div className="font-semibold text-base">{formatDate(job.deadline)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-xs text-gray-500">Posted Date</div>
                <div className="font-semibold text-base">{formatDate(job.postedDate || job.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Application Stages */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-blue-700">
              <Timer className="h-5 w-5" />
              Application Process
            </h3>
            <div className="relative bg-white rounded-xl border border-gray-100 p-4">
              {getApplicationStages().map((stage, index) => (
                <div key={index} className="flex gap-4 pb-8 relative">
                  {/* Timeline line */}
                  {index < getApplicationStages().length - 1 && (
                    <div className="absolute left-[15px] top-[30px] bottom-0 w-[2px] bg-gray-200" />
                  )}
                  {/* Stage marker */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  {/* Stage content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-base">{stage.name}</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(stage.duration)}
                      </Badge>
                    </div>
                    {stage.description && (
                      <p className="text-sm text-gray-500">{stage.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2 text-green-700">
              <FileText className="h-5 w-5" />
              Job Description
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap">
                {job.description || "No description provided"}
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2 text-purple-700">
              <ListChecks className="h-5 w-5" />
              Requirements
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap">
                {job.requirements || "No requirements specified"}
              </p>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2 text-pink-700">
              <Users2 className="h-5 w-5" />
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {getRequiredSkills().length > 0 ? (
                getRequiredSkills().map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No specific skills listed</p>
              )}
            </div>
          </div>

          {/* Application Statistics */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-orange-700">
              <CalendarDays className="h-5 w-5" />
              Application Statistics
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-base">{job.applicants || 0} applicants</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-base">
                  Posted {formatDate(job.postedDate || job.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
