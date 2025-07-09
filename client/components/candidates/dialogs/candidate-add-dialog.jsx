"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  FileText,
  PlusCircle,
  Trash2,
  UserPlus,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Star,
  Award,
  Activity,
  Linkedin,
  Github,
  Twitter,
  Calendar,
  Building2,
  Clock,
  DollarSign,
  Upload,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { api } from "@/config/api";
import { useCandidates } from "@/contexts/candidates-context";
import { candidateService } from "@/services/candidateService";

export function CandidateAddDialog({ isOpen, onOpenChange, onAdd }) {
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    position: "",
    phone: "",
    location: "",
    currentCompany: "",
    education: "",
    bio: "",
    skills: [],
    resumeName: undefined,
    resumeUrl: undefined,
    resumeType: undefined,
    source: "",
    noticePeriod: "",
    expectedSalary: "",
    socialMedia: {
      linkedin: "",
      github: "",
      twitter: "",
      other: "",
    },
    newSkill: "",
  });

  // States for multiple entries
  const [educationEntries, setEducationEntries] = useState([
    {
      id: generateId("edu"),
      degree: "",
      institution: "",
      field: "",
      startDate: "",
      endDate: "",
      documents: [],
    },
  ]);

  // Professional experience entries state
  const [experienceEntries, setExperienceEntries] = useState([
    {
      id: generateId("exp"),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      description: "",
      documents: [],
    },
  ]);

  // Extracurricular activities entries state
  const [activityEntries, setActivityEntries] = useState([
    {
      id: generateId("act"),
      activityTitle: "",
      organization: "",
      description: "",
      documents: [],
    },
  ]);

  // Certification entries state
  const [certificationEntries, setCertificationEntries] = useState([
    {
      id: generateId("cert"),
      certificationName: "",
      issuingOrganization: "",
      issueDate: "",
      expiryDate: "",
      documents: [],
    },
  ]);

  const { toast } = useToast();
  const { addCandidate, uploadCandidateDocuments } = useCandidates();

  // Reset all form state when the dialog opens or closes
  useEffect(() => {
    // Reset all form fields to their initial state
    setNewCandidate({
      name: "",
      email: "",
      position: "",
      phone: "",
      location: "",
      currentCompany: "",
      education: "",
      bio: "",
      skills: [],
      resumeName: undefined,
      resumeUrl: undefined,
      resumeType: undefined,
      source: "",
      noticePeriod: "",
      expectedSalary: "",
      socialMedia: {
        linkedin: "",
        github: "",
        twitter: "",
        other: "",
      },
      newSkill: "",
    });

    // Reset education entries
    setEducationEntries([
      {
        id: generateId("edu"),
        degree: "",
        institution: "",
        field: "",
        startDate: "",
        endDate: "",
        documents: [],
      },
    ]);

    // Reset experience entries
    setExperienceEntries([
      {
        id: generateId("exp"),
        jobTitle: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        isCurrentRole: false,
        description: "",
        documents: [],
      },
    ]);

    // Reset activity entries
    setActivityEntries([
      {
        id: generateId("act"),
        activityTitle: "",
        organization: "",
        description: "",
        documents: [],
      },
    ]);

    // Reset certification entries
    setCertificationEntries([
      {
        id: generateId("cert"),
        certificationName: "",
        issuingOrganization: "",
        issueDate: "",
        expiryDate: "",
        documents: [],
      },
    ]);
  }, [isOpen]);

  const handleAdd = async () => {
    try {
      // Check each required field individually and show specific error messages
      const missingFields = [];

      // Required fields from Candidate model
      if (!newCandidate.name?.trim()) {
        missingFields.push("Name");
      }
      if (!newCandidate.email?.trim()) {
        missingFields.push("Email");
      }
      if (!newCandidate.phone?.trim()) {
        missingFields.push("Phone");
      }
      if (!newCandidate.position?.trim()) {
        missingFields.push("Position");
      }
      if (!newCandidate.bio?.trim()) {
        missingFields.push("Bio");
      }

      // Validate education entries
      const invalidEducationEntries = educationEntries.filter((entry) => {
        const isInvalid = !entry.degree?.trim() || !entry.institution?.trim();
        if (isInvalid) {
          toast({
            title: "Invalid Education Entry",
            description: `Education entry ${entry.id} is missing required fields (degree and institution)`,
            variant: "destructive",
            duration: 3000,
          });
        }
        return isInvalid;
      });

      if (invalidEducationEntries.length > 0) {
        missingFields.push("Education (degree and institution are required)");
      }

      // Validate experience entries
      const invalidExperienceEntries = experienceEntries.filter(
        (entry) => entry.jobTitle?.trim() === "" || entry.company?.trim() === ""
      );
      if (invalidExperienceEntries.length > 0) {
        missingFields.push("Experience (job title and company are required)");
      }

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in the following required fields: ${missingFields.join(
            ", "
          )}`,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Validate phone format
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(newCandidate.phone)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit phone number.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newCandidate.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Validate notice period if provided
      if (newCandidate.noticePeriod?.trim()) {
        const noticePeriodRegex = /^(\d+)\s*(?:months?|days?|weeks?)$/i;
        if (!noticePeriodRegex.test(newCandidate.noticePeriod.trim())) {
          toast({
            title: "Invalid Notice Period",
            description:
              "Please enter notice period in format: 'X months/days/weeks' (e.g., '2 months', '30 days', '4 weeks')",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }
      }

      // Validate expected salary if provided
      if (newCandidate.expectedSalary) {
        const salaryValue = String(newCandidate.expectedSalary).trim();
        const salaryRegex = /^\d+(\.\d{1,2})?\s*(?:LPA|lpa)?$/;
        if (!salaryRegex.test(salaryValue)) {
          toast({
            title: "Invalid Expected Salary",
            description:
              "Please enter salary in format: 'X.X' ( LPA ) (e.g., '12.3' ( LPA ))",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }
        // Extract numeric value and store it
        const numericValue = parseFloat(
          salaryValue.replace(/\s*(?:LPA|lpa)$/i, "")
        );
        newCandidate.expectedSalary = numericValue;
      }

      const formData = new FormData();

      // Prepare candidate data, excluding file-related info from the main object
      const educationHistory = educationEntries
        .filter((entry) => entry.degree?.trim() && entry.institution?.trim())
        .map((entry) => ({
          degree: entry.degree,
          institution: entry.institution,
          fieldOfStudy: entry.field || newCandidate.position,
          startDate: entry.startDate || null,
          endDate: entry.endDate || null,
          location: entry.location || null,
          // document handling for education is not implemented in this scope
        }));

      const workHistory = experienceEntries
        .filter((entry) => entry.jobTitle?.trim() && entry.company?.trim())
        .map((entry) => ({
          title: entry.jobTitle,
          company: entry.company,
          location: entry.location,
          startDate: entry.startDate,
          endDate: entry.isCurrentRole ? null : entry.endDate,
          description: entry.description,
          isCurrentRole: entry.isCurrentRole,
          // document handling for experience is not implemented in this scope
        }));

      // Helper to format date as YYYY-MM-DD
      function formatDateForBackend(date) {
        if (!date) return null;
        // If already in YYYY-MM-DD, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        // If in dd/mm/yyyy, convert
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
          const [d, m, y] = date.split("/");
          return `${y}-${m}-${d}`;
        }
        return null;
      }

      const certifications = certificationEntries
        .filter((entry) => entry.certificationName?.trim())
        .map((entry) => {
          return {
            certificationName: entry.certificationName,
            issuingOrganization: entry.issuingOrganization,
            issueDate: formatDateForBackend(entry.issueDate),
            expiryDate: formatDateForBackend(entry.expiryDate),
          };
        });

      const extracurricularActivities = activityEntries
        .filter(
          (entry) => entry.activityTitle?.trim() || entry.organization?.trim()
        )
        .map((entry) => ({
          title: entry.activityTitle,
          organization: entry.organization,
          description: entry.description,
          // document handling for extracurricular is not implemented in this scope
        }));

      const candidateDataForForm = {
        name: newCandidate.name,
        email: newCandidate.email,
        position: newCandidate.position,
        phone: newCandidate.phone,
        location: newCandidate.location,
        currentCompany: newCandidate.currentCompany,
        bio: newCandidate.bio,
        source: newCandidate.source,
        noticePeriod: newCandidate.noticePeriod,
        expectedSalary: newCandidate.expectedSalary,
        linkedInProfile: newCandidate.socialMedia?.linkedin || "",
        githubProfile: newCandidate.socialMedia?.github || "",
        twitterProfile: newCandidate.socialMedia?.twitter || "",
        portfolioUrl: newCandidate.socialMedia?.other || "",
        skills: newCandidate.skills || [],
      };

      // Append stringified JSON for structured data
      formData.append("name", candidateDataForForm.name);
      formData.append("email", candidateDataForForm.email);
      formData.append("position", candidateDataForForm.position);
      formData.append("phone", candidateDataForForm.phone);
      formData.append("location", candidateDataForForm.location);
      formData.append("currentCompany", candidateDataForForm.currentCompany);
      formData.append("bio", candidateDataForForm.bio);
      formData.append("source", candidateDataForForm.source);
      formData.append("noticePeriod", candidateDataForForm.noticePeriod);
      formData.append("expectedSalary", candidateDataForForm.expectedSalary);
      formData.append("linkedInProfile", candidateDataForForm.linkedInProfile);
      formData.append("githubProfile", candidateDataForForm.githubProfile);
      formData.append("twitterProfile", candidateDataForForm.twitterProfile);
      formData.append("portfolioUrl", candidateDataForForm.portfolioUrl);

      formData.append("educationHistory", JSON.stringify(educationHistory));
      formData.append("workHistory", JSON.stringify(workHistory));
      formData.append("certifications", JSON.stringify(certifications));
      formData.append(
        "extracurricularActivities",
        JSON.stringify(extracurricularActivities)
      );
      formData.append("skills", JSON.stringify(candidateDataForForm.skills));

      // Append education files
      educationEntries.forEach((entry, index) => {
        if (entry.documents && entry.documents[0] && entry.documents[0].file) {
          formData.append(
            "educationDocuments",
            entry.documents[0].file,
            entry.documents[0].name
          );
        }
      });

      // Append experience files
      experienceEntries.forEach((entry, index) => {
        if (entry.documents && entry.documents[0] && entry.documents[0].file) {
          formData.append(
            "experienceDocuments",
            entry.documents[0].file,
            entry.documents[0].name
          );
        }
      });

      // Append extracurricular files
      activityEntries.forEach((entry, index) => {
        if (entry.documents && entry.documents[0] && entry.documents[0].file) {
          formData.append(
            "activityDocuments",
            entry.documents[0].file,
            entry.documents[0].name
          );
        }
      });

      // Create candidate using context with FormData
      const createdCandidate = await addCandidate(formData);
      const candidateId = createdCandidate?.id;
      if (!candidateId) throw new Error("Candidate creation failed");

      // Upload resume if present using service
      if (newCandidate.resumeFile) {
        const resumeFormData = new FormData();
        resumeFormData.append("resume", newCandidate.resumeFile);
        const response = await candidateService.uploadResume(
          candidateId,
          resumeFormData
        );
        if (response?.error) throw new Error(response.error);
        // Optionally, fetch and display resume metadata here
      }

      // === Upload all education, experience, extracurricular, and certification documents ===
      // Fetch the candidate with all related entities to get their IDs
      const { data: fullCandidate } = await candidateService.getCandidateById(
        candidateId
      );
      if (!fullCandidate)
        throw new Error(
          "Failed to fetch created candidate for document upload"
        );

      // Helper to match entity by unique fields
      function findEntityId(list, entry, type) {
        if (type === "education") {
          return (
            list.find(
              (e) =>
                e.degree === entry.degree &&
                e.institution === entry.institution &&
                (!entry.startDate || e.startDate === entry.startDate)
            )?.id || null
          );
        } else if (type === "experience") {
          return (
            list.find(
              (e) =>
                e.title === entry.jobTitle &&
                e.company === entry.company &&
                (!entry.startDate || e.startDate === entry.startDate)
            )?.id || null
          );
        } else if (type === "activity") {
          return (
            list.find(
              (e) =>
                e.title === entry.activityTitle &&
                e.organization === entry.organization
            )?.id || null
          );
        } else if (type === "certification") {
          return (
            list.find(
              (e) =>
                e.certificationName === entry.certificationName &&
                e.issuingOrganization === entry.issuingOrganization
            )?.id || null
          );
        }
        return null;
      }

      // Education
      for (const entry of educationEntries) {
        if (entry.documents && entry.documents.length > 0) {
          const entityId = findEntityId(
            fullCandidate.CandidateEducations,
            entry,
            "education"
          );
          if (entityId) {
            for (const doc of entry.documents) {
              const result = await uploadCandidateDocuments(
                candidateId,
                "education",
                entityId,
                [doc.file]
              );
              if (result.error) {
                toast({
                  title: "Education document upload failed",
                  description: result.error,
                  variant: "destructive",
                });
              }
            }
          }
        }
      }
      // Experience
      for (const entry of experienceEntries) {
        if (entry.documents && entry.documents.length > 0) {
          const entityId = findEntityId(
            fullCandidate.CandidateExperiences,
            entry,
            "experience"
          );
          if (entityId) {
            for (const doc of entry.documents) {
              const result = await uploadCandidateDocuments(
                candidateId,
                "experience",
                entityId,
                [doc.file]
              );
              if (result.error) {
                toast({
                  title: "Experience document upload failed",
                  description: result.error,
                  variant: "destructive",
                });
              }
            }
          }
        }
      }
      // Activities
      for (const entry of activityEntries) {
        if (entry.documents && entry.documents.length > 0) {
          const entityId = findEntityId(
            fullCandidate.CandidateExtraCurriculars,
            entry,
            "activity"
          );
          if (entityId) {
            for (const doc of entry.documents) {
              const result = await uploadCandidateDocuments(
                candidateId,
                "activity",
                entityId,
                [doc.file]
              );
              if (result.error) {
                toast({
                  title: "Activity document upload failed",
                  description: result.error,
                  variant: "destructive",
                });
              }
            }
          }
        }
      }
      // Certifications (already handled in main formData, but handle extra files if any)
      for (const entry of certificationEntries) {
        if (entry.documents && entry.documents.length > 0) {
          const entityId = findEntityId(
            fullCandidate.CandidateCertifications,
            entry,
            "certification"
          );
          if (entityId) {
            for (const doc of entry.documents) {
              const result = await uploadCandidateDocuments(
                candidateId,
                "certification",
                entityId,
                [doc.file]
              );
              if (result.error) {
                toast({
                  title: "Certification document upload failed",
                  description: result.error,
                  variant: "destructive",
                });
              }
            }
          }
        }
      }
      // === End document uploads ===

      // Show success message
      toast({
        title: "Success",
        description: "Candidate added successfully",
        duration: 3000,
      });
      onOpenChange(false);
    } catch (error) {
      console.log("Error adding candidate:", error);
      toast({
        title: "Error",
        description:
          error.message === "A candidate with this email already exists"
            ? "A candidate with this email already exists. Please use a different email address."
            : "There was a problem adding the candidate. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Add New Candidate</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Enter the details of the new candidate to add them to your talent pipeline.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full grid grid-cols-3 p-1 bg-gray-100/50 rounded-xl">
              <TabsTrigger
                value="basic"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Basic Info</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Education & Experience</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="extracurricular"
                className="px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Certifications & Activities</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="new-name"
                    value={newCandidate.name || ""}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        name: e.target.value,
                      })
                    }
                    className="col-span-1 md:col-span-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    placeholder="Enter candidate's full name"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-500" />
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newCandidate.email || ""}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        email: e.target.value,
                      })
                    }
                    className="col-span-1 md:col-span-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-green-400 focus:ring-green-400"
                    placeholder="Enter candidate's email address"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-position" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-orange-500" />
                    Position <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="new-position"
                    value={newCandidate.position || ""}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        position: e.target.value,
                      })
                    }
                    className="col-span-1 md:col-span-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    placeholder="Enter candidate's position/title"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-500" />
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <div className="col-span-1 md:col-span-3 space-y-2">
                    <Input
                      id="new-phone"
                      value={newCandidate.phone || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setNewCandidate({
                          ...newCandidate,
                          phone: value,
                        });
                      }}
                      className={`bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-400 focus:ring-purple-400 ${newCandidate.phone && newCandidate.phone.length !== 10
                        ? "border-red-500 focus:border-red-400 focus:ring-red-400"
                        : ""
                        }`}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      required
                    />
                    {newCandidate.phone && newCandidate.phone.length !== 10 && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Phone number must be exactly 10 digits
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-location" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    Location
                  </Label>
                  <Input
                    id="new-location"
                    value={newCandidate.location || ""}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        location: e.target.value,
                      })
                    }
                    className="col-span-1 md:col-span-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-red-400 focus:ring-red-400"
                    placeholder="Enter candidate's location"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-current-company" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-orange-500" />
                    Current Company
                  </Label>
                  <Input
                    id="new-current-company"
                    value={newCandidate.currentCompany || ""}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        currentCompany: e.target.value,
                      })
                    }
                    className="col-span-1 md:col-span-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    placeholder="Enter current company name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                  <Label htmlFor="new-bio" className="text-sm font-semibold text-gray-700 flex items-center gap-2 pt-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Bio <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="new-bio"
                    value={newCandidate.bio || ""}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        bio: e.target.value,
                      })
                    }
                    className="col-span-1 md:col-span-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                    rows={4}
                    required
                    placeholder="Enter candidate's professional bio and background..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                  <Label htmlFor="resume-upload" className="text-sm font-semibold text-gray-700 flex items-center gap-2 pt-2">
                    <Upload className="h-4 w-4 text-blue-500" />
                    Resume
                  </Label>
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Create a URL for the file
                              const fileUrl = URL.createObjectURL(file);
                              setNewCandidate({
                                ...newCandidate,
                                resumeFile: file,
                                resumeName: file.name,
                                resumeUrl: fileUrl,
                                resumeType: file.type,
                              });
                            }
                          }}
                          className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Accepted formats: PDF, DOC, DOCX
                      </p>

                      {newCandidate.resumeName && (
                        <div className="mt-2 p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50/30 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              {newCandidate.resumeUrl ? (
                                <a
                                  href={newCandidate.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-blue-700 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {newCandidate.resumeName}
                                </a>
                              ) : (
                                <span className="font-semibold text-gray-700">
                                  {newCandidate.resumeName}
                                </span>
                              )}
                              <p className="text-xs text-gray-500 mt-1">Resume uploaded successfully</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => {
                              if (newCandidate.resumeUrl) {
                                URL.revokeObjectURL(newCandidate.resumeUrl);
                              }
                              setNewCandidate({
                                ...newCandidate,
                                resumeFile: undefined,
                                resumeName: undefined,
                                resumeUrl: undefined,
                                resumeType: undefined,
                              });

                              // Reset the file input
                              const fileInput =
                                document.getElementById("resume-upload");
                              if (fileInput) fileInput.value = "";
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-notice-period" className="text-right">
                    Notice Period
                  </Label>
                  <Input
                    id="new-notice-period"
                    value={newCandidate.noticePeriod || ""}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        noticePeriod: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="e.g., 2 months"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-expected-salary" className="text-right">
                    Expected Salary
                  </Label>
                  <Input
                    id="new-expected-salary"
                    value={newCandidate.expectedSalary || ""}
                    onChange={(e) =>
                      setNewCandidate({
                        ...newCandidate,
                        expectedSalary: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="e.g., 12.3 ( in LPA )"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Education & Experience Tab */}
            <TabsContent value="education" className="space-y-6 mt-4">
              {/* Education Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Educational Qualifications{" "}
                    <span className="text-red-500">*</span>
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEducationEntries = [
                        ...educationEntries,
                        {
                          id: generateId("edu"),
                          degree: "",
                          institution: "",
                          field: "",
                          startDate: "",
                          endDate: "",
                          documents: [],
                        },
                      ];
                      setEducationEntries(newEducationEntries);
                    }}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Education
                  </Button>
                </div>

                {educationEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="border rounded-md p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Education Entry {index + 1}
                      </h4>
                      {educationEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newEducationEntries = educationEntries.filter(
                              (_, i) => i !== index
                            );
                            setEducationEntries(newEducationEntries);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`degree-${index}`}>
                          Degree/Certificate{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`degree-${index}`}
                          placeholder="e.g., Bachelor of Science"
                          value={entry.degree || ""}
                          onChange={(e) => {
                            const newEducationEntries = [...educationEntries];
                            newEducationEntries[index].degree = e.target.value;
                            setEducationEntries(newEducationEntries);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`institution-${index}`}>
                          Institution <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`institution-${index}`}
                          placeholder="e.g., Stanford University"
                          value={entry.institution || ""}
                          onChange={(e) => {
                            const newEducationEntries = [...educationEntries];
                            newEducationEntries[index].institution =
                              e.target.value;
                            setEducationEntries(newEducationEntries);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`field-${index}`}>Field of Study</Label>
                        <Input
                          id={`field-${index}`}
                          placeholder="e.g., Computer Science"
                          value={entry.field || ""}
                          onChange={(e) => {
                            const newEducationEntries = [...educationEntries];
                            newEducationEntries[index].field = e.target.value;
                            setEducationEntries(newEducationEntries);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`location-${index}`}>Location</Label>
                        <Input
                          id={`location-${index}`}
                          placeholder="e.g., California, USA"
                          value={entry.location || ""}
                          onChange={(e) => {
                            const newEducationEntries = [...educationEntries];
                            newEducationEntries[index].location =
                              e.target.value;
                            setEducationEntries(newEducationEntries);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`start-date-${index}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`start-date-${index}`}
                          type="date"
                          value={entry.startDate || ""}
                          onChange={(e) => {
                            const newEducationEntries = [...educationEntries];
                            newEducationEntries[index].startDate =
                              e.target.value;
                            setEducationEntries(newEducationEntries);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`end-date-${index}`}>End Date</Label>
                        <Input
                          id={`end-date-${index}`}
                          type="date"
                          value={entry.endDate || ""}
                          onChange={(e) => {
                            const newEducationEntries = [...educationEntries];
                            newEducationEntries[index].endDate = e.target.value;
                            setEducationEntries(newEducationEntries);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Education Documents</Label>
                      <div className="border border-dashed rounded-md p-4">
                        <div className="flex flex-col items-center gap-2">
                          <Input
                            id={`education-docs-${index}`}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="max-w-full"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const newEducationEntries = [
                                  ...educationEntries,
                                ];
                                const newDocs = Array.from(e.target.files).map(
                                  (file) => ({
                                    id: generateId("doc"),
                                    name: file.name,
                                    type: file.type,
                                    file: file,
                                    uploadDate: new Date(),
                                  })
                                );

                                newEducationEntries[index].documents = [
                                  ...(newEducationEntries[index].documents ||
                                    []),
                                  ...newDocs,
                                ];
                                setEducationEntries(newEducationEntries);
                              }
                            }}
                          />
                          <p className="text-sm text-muted-foreground">
                            Upload degree certificates, transcripts, etc. (PDF,
                            DOC, DOCX, JPG, PNG)
                          </p>
                        </div>

                        {entry.documents && entry.documents.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <Label>Uploaded Documents</Label>
                            <div className="space-y-2">
                              {entry.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">
                                      {doc.name}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newEducationEntries = [
                                        ...educationEntries,
                                      ];
                                      newEducationEntries[index].documents =
                                        newEducationEntries[
                                          index
                                        ].documents?.filter(
                                          (d) => d.id !== doc.id
                                        ) || [];
                                      setEducationEntries(newEducationEntries);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Professional Experience Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Professional Experience{" "}
                    <span className="text-red-500">*</span>
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newExperienceEntries = [
                        ...experienceEntries,
                        {
                          id: generateId("exp"),
                          jobTitle: "",
                          company: "",
                          location: "",
                          startDate: "",
                          endDate: "",
                          isCurrentRole: false,
                          description: "",
                          documents: [],
                        },
                      ];
                      setExperienceEntries(newExperienceEntries);
                    }}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Experience
                  </Button>
                </div>

                {experienceEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="border rounded-md p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Experience Entry {index + 1}
                      </h4>
                      {experienceEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExperienceEntries =
                              experienceEntries.filter((_, i) => i !== index);
                            setExperienceEntries(newExperienceEntries);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`job-title-${index}`}>
                          Job Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`job-title-${index}`}
                          placeholder="e.g., Senior Developer"
                          value={entry.jobTitle || ""}
                          onChange={(e) => {
                            const newExperienceEntries = [...experienceEntries];
                            newExperienceEntries[index].jobTitle =
                              e.target.value;
                            setExperienceEntries(newExperienceEntries);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`company-${index}`}>
                          Company <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`company-${index}`}
                          placeholder="e.g., Google"
                          value={entry.company || ""}
                          onChange={(e) => {
                            const newExperienceEntries = [...experienceEntries];
                            newExperienceEntries[index].company =
                              e.target.value;
                            setExperienceEntries(newExperienceEntries);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`job-location-${index}`}>
                          Location
                        </Label>
                        <Input
                          id={`job-location-${index}`}
                          placeholder="e.g., San Francisco, CA"
                          value={entry.location || ""}
                          onChange={(e) => {
                            const newExperienceEntries = [...experienceEntries];
                            newExperienceEntries[index].location =
                              e.target.value;
                            setExperienceEntries(newExperienceEntries);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`start-date-${index}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`start-date-${index}`}
                          type="date"
                          value={entry.startDate || ""}
                          onChange={(e) => {
                            const newExperienceEntries = [...experienceEntries];
                            newExperienceEntries[index].startDate =
                              e.target.value;
                            setExperienceEntries(newExperienceEntries);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`end-date-${index}`}>End Date</Label>
                        <Input
                          id={`end-date-${index}`}
                          type="date"
                          value={entry.endDate || ""}
                          disabled={index === 0 && entry.isCurrentRole}
                          onChange={(e) => {
                            const newExperienceEntries = [...experienceEntries];
                            newExperienceEntries[index].endDate =
                              e.target.value;
                            setExperienceEntries(newExperienceEntries);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`job-description-${index}`}>
                        Job Description
                      </Label>
                      <Textarea
                        id={`job-description-${index}`}
                        placeholder="Describe your responsibilities and achievements"
                        rows={3}
                        value={entry.description || ""}
                        onChange={(e) => {
                          const newExperienceEntries = [...experienceEntries];
                          newExperienceEntries[index].description =
                            e.target.value;
                          setExperienceEntries(newExperienceEntries);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Documents</Label>
                      <div className="border border-dashed rounded-md p-4">
                        <div className="flex flex-col items-center gap-2">
                          <Input
                            id={`experience-docs-${index}`}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="max-w-full"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const newExperienceEntries = [
                                  ...experienceEntries,
                                ];
                                const newDocs = Array.from(e.target.files).map(
                                  (file) => ({
                                    id: generateId("doc"),
                                    name: file.name,
                                    type: file.type,
                                    file: file,
                                    uploadDate: new Date(),
                                  })
                                );

                                newExperienceEntries[index].documents = [
                                  ...(newExperienceEntries[index].documents ||
                                    []),
                                  ...newDocs,
                                ];
                                setExperienceEntries(newExperienceEntries);
                              }
                            }}
                          />
                          <p className="text-sm text-muted-foreground">
                            Upload recommendation letters, certificates, etc.
                            (PDF, DOC, DOCX, JPG, PNG)
                          </p>
                        </div>

                        {entry.documents && entry.documents.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <Label>Uploaded Documents</Label>
                            <div className="space-y-2">
                              {entry.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">
                                      {doc.name}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newExperienceEntries = [
                                        ...experienceEntries,
                                      ];
                                      newExperienceEntries[index].documents =
                                        newExperienceEntries[
                                          index
                                        ].documents?.filter(
                                          (d) => d.id !== doc.id
                                        ) || [];
                                      setExperienceEntries(
                                        newExperienceEntries
                                      );
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`current-role-${index}`}
                          checked={entry.isCurrentRole}
                          onCheckedChange={(checked) => {
                            const newExperienceEntries = [...experienceEntries];
                            newExperienceEntries[index].isCurrentRole = checked;
                            if (checked) {
                              newExperienceEntries[index].endDate = "";
                            }
                            setExperienceEntries(newExperienceEntries);
                          }}
                        />
                        <Label
                          htmlFor={`current-role-${index}`}
                          className="text-sm font-normal"
                        >
                          Current Role
                        </Label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Extra Curricular Activities Tab */}
            <TabsContent value="extracurricular" className="space-y-6 mt-4">
              <div className="space-y-4">
                {/* Certifications Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium">Certifications</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCertificationEntries = [
                          ...certificationEntries,
                          {
                            id: generateId("cert"),
                            certificationName: "",
                            issuingOrganization: "",
                            issueDate: "",
                            expiryDate: "",
                            documents: [],
                          },
                        ];
                        setCertificationEntries(newCertificationEntries);
                      }}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Certification
                    </Button>
                  </div>

                  {certificationEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="border rounded-md p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">
                          Certification Entry {index + 1}
                        </h4>
                        {certificationEntries.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newCertificationEntries =
                                certificationEntries.filter(
                                  (_, i) => i !== index
                                );
                              setCertificationEntries(newCertificationEntries);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`certification-name-${index}`}>
                            Certification Name{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`certification-name-${index}`}
                            placeholder="e.g., AWS Certified Solutions Architect"
                            value={entry.certificationName || ""}
                            onChange={(e) => {
                              const newCertificationEntries = [
                                ...certificationEntries,
                              ];
                              newCertificationEntries[index].certificationName =
                                e.target.value;
                              setCertificationEntries(newCertificationEntries);
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`issuing-org-${index}`}>
                            Issuing Organization
                          </Label>
                          <Input
                            id={`issuing-org-${index}`}
                            placeholder="e.g., Amazon Web Services"
                            value={entry.issuingOrganization || ""}
                            onChange={(e) => {
                              const newCertificationEntries = [
                                ...certificationEntries,
                              ];
                              newCertificationEntries[
                                index
                              ].issuingOrganization = e.target.value;
                              setCertificationEntries(newCertificationEntries);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`issue-date-${index}`}>
                            Issue Date
                          </Label>
                          <Input
                            id={`issue-date-${index}`}
                            type="date"
                            value={entry.issueDate || ""}
                            onChange={(e) => {
                              const newCertificationEntries = [
                                ...certificationEntries,
                              ];
                              newCertificationEntries[index].issueDate =
                                e.target.value;
                              setCertificationEntries(newCertificationEntries);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`expiry-date-${index}`}>
                            Expiry Date
                          </Label>
                          <Input
                            id={`expiry-date-${index}`}
                            type="date"
                            value={entry.expiryDate || ""}
                            onChange={(e) => {
                              const newCertificationEntries = [
                                ...certificationEntries,
                              ];
                              newCertificationEntries[index].expiryDate =
                                e.target.value;
                              setCertificationEntries(newCertificationEntries);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Certification Documents</Label>
                        <div className="border border-dashed rounded-md p-4">
                          <div className="flex flex-col items-center gap-2">
                            <Input
                              id={`certification-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const newCertificationEntries = [
                                    ...certificationEntries,
                                  ];
                                  const file = e.target.files[0];
                                  const newDoc = {
                                    id: generateId("doc"),
                                    name: file.name,
                                    type: file.type,
                                    file: file,
                                    uploadDate: new Date(),
                                  };

                                  newCertificationEntries[index].documents = [
                                    newDoc,
                                  ];
                                  setCertificationEntries(
                                    newCertificationEntries
                                  );
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload a single certification document. (PDF, DOC,
                              DOCX, JPG, PNG)
                            </p>
                          </div>

                          {entry.documents && entry.documents.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <Label>Uploaded Documents</Label>
                              <div className="space-y-2">
                                {entry.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm font-medium">
                                        {doc.name}
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newCertificationEntries = [
                                          ...certificationEntries,
                                        ];
                                        newCertificationEntries[
                                          index
                                        ].documents =
                                          newCertificationEntries[
                                            index
                                          ].documents?.filter(
                                            (d) => d.id !== doc.id
                                          ) || [];
                                        setCertificationEntries(
                                          newCertificationEntries
                                        );
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                      <span className="sr-only">Remove</span>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra Curricular Activities Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium">
                      Extra Curricular Activities
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newActivityEntries = [
                          ...activityEntries,
                          {
                            id: generateId("act"),
                            activityTitle: "",
                            organization: "",
                            description: "",
                            documents: [],
                          },
                        ];
                        setActivityEntries(newActivityEntries);
                      }}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Activity
                    </Button>
                  </div>

                  {activityEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="border rounded-md p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">
                          Activity Entry {index + 1}
                        </h4>
                        {activityEntries.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newActivityEntries = activityEntries.filter(
                                (_, i) => i !== index
                              );
                              setActivityEntries(newActivityEntries);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`activity-title-${index}`}>
                            Activity Title
                          </Label>
                          <Input
                            id={`activity-title-${index}`}
                            placeholder="e.g., Volunteer Work, Sports, Hackathons"
                            value={entry.activityTitle || ""}
                            onChange={(e) => {
                              const newActivityEntries = [...activityEntries];
                              newActivityEntries[index].activityTitle =
                                e.target.value;
                              setActivityEntries(newActivityEntries);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`organization-${index}`}>
                            Organization
                          </Label>
                          <Input
                            id={`organization-${index}`}
                            placeholder="e.g., Red Cross, Chess Club"
                            value={entry.organization || ""}
                            onChange={(e) => {
                              const newActivityEntries = [...activityEntries];
                              newActivityEntries[index].organization =
                                e.target.value;
                              setActivityEntries(newActivityEntries);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`activity-description-${index}`}>
                          Description
                        </Label>
                        <Textarea
                          id={`activity-description-${index}`}
                          placeholder="Describe your involvement and achievements"
                          rows={3}
                          value={entry.description || ""}
                          onChange={(e) => {
                            const newActivityEntries = [...activityEntries];
                            newActivityEntries[index].description =
                              e.target.value;
                            setActivityEntries(newActivityEntries);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Activity Documents</Label>
                        <div className="border border-dashed rounded-md p-4">
                          <div className="flex flex-col items-center gap-2">
                            <Input
                              id={`activity-docs-${index}`}
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const newActivityEntries = [
                                    ...activityEntries,
                                  ];
                                  const newDocs = Array.from(
                                    e.target.files
                                  ).map((file) => ({
                                    id: generateId("doc"),
                                    name: file.name,
                                    type: file.type,
                                    file: file,
                                    uploadDate: new Date(),
                                  }));

                                  newActivityEntries[index].documents = [
                                    ...(newActivityEntries[index].documents ||
                                      []),
                                    ...newDocs,
                                  ];
                                  setActivityEntries(newActivityEntries);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload certificates, photos, recognition
                              documents, etc. (PDF, DOC, DOCX, JPG, PNG)
                            </p>
                          </div>

                          {entry.documents && entry.documents.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <Label>Uploaded Documents</Label>
                              <div className="space-y-2">
                                {entry.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm font-medium">
                                        {doc.name}
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newActivityEntries = [
                                          ...activityEntries,
                                        ];
                                        newActivityEntries[index].documents =
                                          newActivityEntries[
                                            index
                                          ].documents?.filter(
                                            (d) => d.id !== doc.id
                                          ) || [];
                                        setActivityEntries(newActivityEntries);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                      <span className="sr-only">Remove</span>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Skills</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        id="skills"
                        value={newCandidate.newSkill || ""}
                        onChange={(e) => {
                          setNewCandidate((prev) => ({
                            ...prev,
                            newSkill: e.target.value,
                          }));
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            newCandidate.newSkill?.trim()
                          ) {
                            e.preventDefault();
                            const newSkill = newCandidate.newSkill.trim();
                            setNewCandidate((prev) => ({
                              ...prev,
                              skills: [...(prev.skills || []), newSkill],
                              newSkill: "",
                            }));
                          }
                        }}
                        placeholder="Type a skill and press Enter"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newCandidate.newSkill?.trim()) {
                            const newSkill = newCandidate.newSkill.trim();
                            setNewCandidate((prev) => ({
                              ...prev,
                              skills: [...(prev.skills || []), newSkill],
                              newSkill: "",
                            }));
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Display added skills */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newCandidate.skills?.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 pl-2 pr-1 py-1"
                        >
                          {skill}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full"
                            onClick={() => {
                              setNewCandidate((prev) => ({
                                ...prev,
                                skills: prev.skills.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove skill</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Type a skill and press Enter or click Add to add it to the
                    list.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Social Media & Online Presence
                    </h3>
                  </div>

                  <div className="border rounded-md p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={newCandidate.socialMedia?.linkedin || ""}
                          onChange={(e) =>
                            setNewCandidate({
                              ...newCandidate,
                              socialMedia: {
                                ...(newCandidate.socialMedia || {}),
                                linkedin: e.target.value,
                              },
                            })
                          }
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={newCandidate.socialMedia?.github || ""}
                          onChange={(e) =>
                            setNewCandidate({
                              ...newCandidate,
                              socialMedia: {
                                ...(newCandidate.socialMedia || {}),
                                github: e.target.value,
                              },
                            })
                          }
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={newCandidate.socialMedia?.twitter || ""}
                          onChange={(e) =>
                            setNewCandidate({
                              ...newCandidate,
                              socialMedia: {
                                ...(newCandidate.socialMedia || {}),
                                twitter: e.target.value,
                              },
                            })
                          }
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portfolio">Portfolio/Website</Label>
                        <Input
                          id="portfolio"
                          value={newCandidate.socialMedia?.other || ""}
                          onChange={(e) =>
                            setNewCandidate({
                              ...newCandidate,
                              socialMedia: {
                                ...(newCandidate.socialMedia || {}),
                                other: e.target.value,
                              },
                            })
                          }
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
