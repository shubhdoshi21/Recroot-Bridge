"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  X,
  Briefcase,
  Trash2,
  PlusCircle,
  Edit,
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
  Info,
  Save,
  ExternalLink
} from "lucide-react";
import { generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useCandidates } from "@/contexts/candidates-context";
import { api, API_URL } from "@/config/api";
import { candidateService } from "@/services/candidateService";

export function CandidateEditDialog({
  isOpen,
  onOpenChange,
  candidate,
  onSave,
  editedJobs,
  setEditedJobs,
  onEditJobs,
  jobs,
  onCandidateUpdated,
}) {
  const [editedCandidate, setEditedCandidate] = useState({});
  const [editedEducation, setEditedEducation] = useState([]);
  const [editedExperience, setEditedExperience] = useState([]);
  const [editedActivities, setEditedActivities] = useState([]);
  const [editedCertifications, setEditedCertifications] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const { getCandidateJobs, uploadCandidateDocuments } = useCandidates();
  const { toast } = useToast();
  const [resumeMeta, setResumeMeta] = useState(null);
  const [showResumeConfirmModal, setShowResumeConfirmModal] = useState(false);
  const [pendingResumeFile, setPendingResumeFile] = useState(null);
  const resumeInputRef = useRef();
  const [loadingDoc, setLoadingDoc] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (candidate) {
      console.log("[CandidateEditDialog] Received candidate prop:", candidate);
      // Initialize skills as an empty array if not present
      const skills = [];

      // From Skills association (many-to-many)
      if (candidate.Skills && Array.isArray(candidate.Skills)) {
        skills.push(...candidate.Skills.map((skill) => skill.title));
      }

      // From CandidateSkillMaps (with Skill object)
      if (
        candidate.CandidateSkillMaps &&
        Array.isArray(candidate.CandidateSkillMaps)
      ) {
        candidate.CandidateSkillMaps.forEach((skillMap) => {
          if (skillMap.Skill && skillMap.Skill.title) {
            skills.push(skillMap.Skill.title);
          }
        });
      }

      // Remove duplicates
      const uniqueSkills = [...new Set(skills)];

      setEditedCandidate({
        name: candidate.name,
        email: candidate.email,
        position: candidate.position,
        phone: candidate.phone,
        location: candidate.location,
        currentCompany: candidate.currentCompany || "",
        bio: candidate.bio,
        resumeUrl: candidate.resumeUrl,
        linkedInProfile: candidate.linkedInProfile || "",
        githubProfile: candidate.githubProfile || "",
        twitterProfile: candidate.twitterProfile || "",
        portfolioUrl: candidate.portfolioUrl || "",
        source: candidate.source || "",
        noticePeriod: candidate.noticePeriod || "",
        expectedSalary: candidate.expectedSalary || "",
        skills: uniqueSkills,
      });

      // Map education history
      const mappedEducation =
        candidate.CandidateEducations?.map((edu) => ({
          id: edu.id,
          degree: edu.degree,
          institution: edu.institution,
          field: edu.fieldOfStudy,
          startDate: edu.startDate,
          endDate: edu.endDate,
          location: edu.location || "",
          document: edu.Document,
          documents: [],
        })) || [];
      setEditedEducation(mappedEducation);

      // Map work experience
      const mappedExperience =
        candidate.CandidateExperiences?.map((exp) => ({
          id: exp.id,
          jobTitle: exp.title,
          company: exp.company,
          location: exp.location || "",
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description || "",
          isCurrentRole: exp.isCurrentRole,
          document: exp.Document,
          documents: [],
        })) || [];
      setEditedExperience(mappedExperience);

      // Map extracurricular activities
      const mappedActivities =
        candidate.CandidateExtraCurriculars?.map((activity) => ({
          id: activity.id,
          activityTitle: activity.title,
          organization: activity.organization,
          description: activity.description || "",
          document: activity.Document,
          documents: [],
        })) || [];
      setEditedActivities(mappedActivities);

      // Map certifications
      const mappedCertifications =
        candidate.CandidateCertifications?.map((cert) => ({
          id: cert.id,
          certificationName: cert.certificationName,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          document: cert.Document,
          documents: [],
        })) || [];
      console.log(
        "[CandidateEditDialog] Mapped certifications:",
        mappedCertifications
      );
      setEditedCertifications(mappedCertifications);

      setActiveTab("basic");
    }
  }, [candidate]);

  // Fetch jobs when the dialog opens and candidate is available
  useEffect(() => {
    const fetchJobs = async () => {
      if (candidate?.id) {
        setIsLoadingJobs(true);
        try {
          const jobs = await getCandidateJobs(candidate.id);
          setAssignedJobs(jobs);
          // Initialize editedJobs with the fetched jobs
          setEditedJobs(jobs.map((job) => job.id));
        } catch (error) {
          console.log("Error fetching candidate jobs:", error);
          toast({
            title: "Error",
            description: "Failed to fetch assigned jobs. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingJobs(false);
        }
      }
    };

    if (isOpen && candidate?.id) {
      fetchJobs();
    }
  }, [isOpen, candidate?.id, getCandidateJobs, setEditedJobs, toast]);

  useEffect(() => {
    if (candidate?.id) {
      // Fetch resume metadata from backend API (port 3001)
      fetch(api.candidates.getResume(candidate.id), { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setResumeMeta(data))
        .catch(() => setResumeMeta(null));
    }
  }, [candidate]);

  const handleSave = async () => {
    try {
      setIsUpdating(true);

      // Check each required field individually and show specific error messages
      const missingFields = [];

      // Required fields from Candidate model
      if (!editedCandidate.name?.trim()) {
        missingFields.push("Name");
      }
      if (!editedCandidate.email?.trim()) {
        missingFields.push("Email");
      }
      if (!editedCandidate.phone?.trim()) {
        missingFields.push("Phone");
      }
      if (!editedCandidate.position?.trim()) {
        missingFields.push("Position");
      }
      if (!editedCandidate.bio?.trim()) {
        missingFields.push("Bio");
      }

      // Validate education entries
      const invalidEducationEntries = editedEducation.filter(
        (entry) =>
          entry.degree?.trim() === "" || entry.institution?.trim() === ""
      );
      if (invalidEducationEntries.length > 0) {
        missingFields.push("Education (degree and institution are required)");
      }

      // Validate experience entries
      const invalidExperienceEntries = editedExperience.filter(
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
      if (!phoneRegex.test(editedCandidate.phone)) {
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
      if (!emailRegex.test(editedCandidate.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Validate notice period if provided
      if (editedCandidate.noticePeriod?.trim()) {
        const noticePeriodRegex = /^(\d+)\s*(?:months?|days?|weeks?)$/i;
        if (!noticePeriodRegex.test(editedCandidate.noticePeriod.trim())) {
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
      if (editedCandidate.expectedSalary) {
        const salaryValue = String(editedCandidate.expectedSalary).trim();
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
        editedCandidate.expectedSalary = numericValue;
      }

      const formData = new FormData();

      // Append basic candidate data
      console.log("[CandidateEditDialog] Preparing form data:", {
        name: editedCandidate.name,
        email: editedCandidate.email,
        position: editedCandidate.position,
        candidateId: candidate.id
      });

      formData.append("name", editedCandidate.name);
      formData.append("email", editedCandidate.email);
      formData.append("position", editedCandidate.position);
      formData.append("phone", editedCandidate.phone);
      formData.append("location", editedCandidate.location);
      formData.append("currentCompany", editedCandidate.currentCompany);
      formData.append("bio", editedCandidate.bio);
      formData.append("source", editedCandidate.source);
      formData.append("noticePeriod", editedCandidate.noticePeriod);
      formData.append("expectedSalary", editedCandidate.expectedSalary);
      formData.append("linkedInProfile", editedCandidate.linkedInProfile || "");
      formData.append("githubProfile", editedCandidate.githubProfile || "");
      formData.append("twitterProfile", editedCandidate.twitterProfile || "");
      formData.append("portfolioUrl", editedCandidate.portfolioUrl || "");
      formData.append("skills", JSON.stringify(editedCandidate.skills || []));
      formData.append("assignedJobs", JSON.stringify(editedJobs || []));

      // Handle resume file
      if (editedCandidate.resumeFile) {
        formData.append("resume", editedCandidate.resumeFile);
      }

      // Prepare and append education history
      const educationHistory = editedEducation
        .filter(
          (entry) =>
            entry.degree.trim() !== "" && entry.institution.trim() !== ""
        )
        .map((entry) => ({
          id:
            typeof entry.id === "string" && entry.id.startsWith("edu")
              ? undefined
              : entry.id,
          degree: entry.degree,
          institution: entry.institution,
          fieldOfStudy: entry.field,
          startDate: entry.startDate,
          endDate: entry.endDate,
          location: entry.location,
          documentId: entry.document ? entry.document.id : null,
        }));
      formData.append("educationHistory", JSON.stringify(educationHistory));

      // Prepare and append work history
      const workHistory = editedExperience
        .filter(
          (entry) => entry.jobTitle.trim() !== "" && entry.company.trim() !== ""
        )
        .map((entry) => ({
          id:
            typeof entry.id === "string" && entry.id.startsWith("exp")
              ? undefined
              : entry.id,
          title: entry.jobTitle,
          company: entry.company,
          location: entry.location,
          startDate: entry.startDate,
          endDate: entry.isCurrentRole ? null : entry.endDate,
          description: entry.description,
          isCurrentRole: entry.isCurrentRole,
          documentId: entry.document ? entry.document.id : null,
        }));
      formData.append("workHistory", JSON.stringify(workHistory));

      // Prepare and append certifications
      const certifications = editedCertifications
        .filter(
          (entry) =>
            entry.certificationName && entry.certificationName.trim() !== ""
        )
        .map((entry) => ({
          id:
            typeof entry.id === "string" && entry.id.startsWith("cert")
              ? undefined
              : entry.id,
          certificationName: entry.certificationName,
          issuingOrganization: entry.issuingOrganization,
          issueDate: entry.issueDate,
          expiryDate: entry.expiryDate,
          documentId: entry.document ? entry.document.id : null,
        }));
      formData.append("certifications", JSON.stringify(certifications));

      // Prepare and append extracurricular activities
      const extracurricularActivities = editedActivities
        .filter(
          (entry) =>
            entry.activityTitle.trim() !== "" ||
            entry.organization.trim() !== ""
        )
        .map((entry) => ({
          id:
            typeof entry.id === "string" && entry.id.startsWith("act")
              ? undefined
              : entry.id,
          title: entry.activityTitle,
          organization: entry.organization,
          description: entry.description,
          documentId: entry.document ? entry.document.id : null,
        }));
      formData.append(
        "extracurricularActivities",
        JSON.stringify(extracurricularActivities)
      );

      // Call the onSave callback with the candidate ID and FormData
      const success = await onSave(candidate.id, formData);
      if (!success) throw new Error("Candidate update failed");

      // === Handle document uploads separately ===
      // Fetch the updated candidate to get the latest entity IDs
      const { data: updatedCandidate } =
        await candidateService.getCandidateById(candidate.id);
      if (!updatedCandidate) {
        throw new Error(
          "Failed to fetch updated candidate for document upload"
        );
      }

      // Helper function to find entity by unique fields
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

      // Upload education documents
      for (const entry of editedEducation) {
        if (entry.documents && entry.documents.length > 0) {
          const entityId = findEntityId(
            updatedCandidate.CandidateEducations,
            entry,
            "education"
          );
          if (entityId) {
            for (const doc of entry.documents) {
              const result = await uploadCandidateDocuments(
                candidate.id,
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

      // Upload experience documents
      for (const entry of editedExperience) {
        if (entry.documents && entry.documents.length > 0) {
          const entityId = findEntityId(
            updatedCandidate.CandidateExperiences,
            entry,
            "experience"
          );
          if (entityId) {
            for (const doc of entry.documents) {
              const result = await uploadCandidateDocuments(
                candidate.id,
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

      // Upload activity documents
      for (const entry of editedActivities) {
        if (entry.documents && entry.documents.length > 0) {
          const entityId = findEntityId(
            updatedCandidate.CandidateExtraCurriculars,
            entry,
            "activity"
          );
          if (entityId) {
            for (const doc of entry.documents) {
              const result = await uploadCandidateDocuments(
                candidate.id,
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

      // Upload certification documents
      for (const entry of editedCertifications) {
        if (entry.documents && entry.documents.length > 0) {
          const entityId = findEntityId(
            updatedCandidate.CandidateCertifications,
            entry,
            "certification"
          );
          if (entityId) {
            for (const doc of entry.documents) {
              const result = await uploadCandidateDocuments(
                candidate.id,
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

      // Fetch the latest candidate data and update parent state if callback provided
      const { data: latestCandidate } = await candidateService.getCandidateById(candidate.id);
      if (latestCandidate && typeof onCandidateUpdated === 'function') {
        onCandidateUpdated(latestCandidate);
      }

      toast({
        title: "Success",
        description: "Candidate updated successfully",
        duration: 3000,
      });
      onOpenChange(false);
    } catch (error) {
      console.log("Error updating candidate:", error);
      toast({
        title: "Error",
        description:
          error.message === "A candidate with this email already exists"
            ? "A candidate with this email already exists. Please use a different email address."
            : "There was a problem updating the candidate. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeEditedJob = (jobId) => {
    setEditedJobs((prev) => prev.filter((id) => id !== jobId));
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={isUpdating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        {isUpdating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col gap-3 items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-500 border-t-transparent" />
              <p className="text-sm text-gray-600 font-medium">
                Updating candidate...
              </p>
            </div>
          </div>
        )}
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Edit Candidate</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Make changes to the candidate's information and profile details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                {/* Basic fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editedCandidate.name || ""}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        name: e.target.value,
                      })
                    }
                    className="col-span-1 md:col-span-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    placeholder="Enter candidate's full name"
                    disabled={isUpdating}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={editedCandidate.email || ""}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        email: e.target.value,
                      })
                    }
                    disabled
                    className="col-span-1 md:col-span-3 bg-gray-50 border-gray-200 text-gray-500"
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-orange-500" />
                    Position
                  </Label>
                  <Input
                    id="position"
                    value={editedCandidate.position || ""}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        position: e.target.value,
                      })
                    }
                    className="col-span-1 md:col-span-3 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    placeholder="Enter candidate's position/title"
                  />
                </div>

                {/* Additional basic fields */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={editedCandidate.phone || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setEditedCandidate({
                        ...editedCandidate,
                        phone: value,
                      });
                    }}
                    className={`col-span-3 ${editedCandidate.phone &&
                      editedCandidate.phone.length !== 10
                      ? "border-red-500"
                      : ""
                      }`}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                  {editedCandidate.phone &&
                    editedCandidate.phone.length !== 10 && (
                      <p className="text-sm text-red-500 col-span-3 col-start-2">
                        Phone number must be exactly 10 digits
                      </p>
                    )}
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={editedCandidate.location || ""}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        location: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentCompany" className="text-right">
                    Current Company
                  </Label>
                  <Input
                    id="currentCompany"
                    value={editedCandidate.currentCompany || ""}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        currentCompany: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Enter current company name"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bio" className="text-right">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={editedCandidate.bio || ""}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        bio: e.target.value,
                      })
                    }
                    className="col-span-3"
                    rows={3}
                  />
                </div>

                {/* Resume upload and CRUD UI */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label
                    htmlFor="resume-upload-edit"
                    className="text-right pt-2"
                  >
                    Resume
                  </Label>
                  <div className="col-span-3">
                    {resumeMeta ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <a
                            href={resumeMeta.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline truncate"
                          >
                            {resumeMeta.originalName}
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(resumeMeta.downloadUrl, "_blank")
                            }
                          >
                            Download
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              await fetch(
                                api.candidates.deleteResume(candidate.id),
                                {
                                  method: "DELETE",
                                  credentials: "include",
                                }
                              );
                              setResumeMeta(null);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                        <Input
                          id="resume-upload-edit"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          ref={resumeInputRef}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (resumeMeta) {
                                setPendingResumeFile(file);
                                setShowResumeConfirmModal(true);
                                return;
                              }
                              const formData = new FormData();
                              formData.append("resume", file);
                              const response = await fetch(
                                api.candidates.uploadResume(candidate.id),
                                {
                                  method: "POST",
                                  body: formData,
                                  credentials: "include",
                                }
                              );
                              if (response.ok) {
                                const data = await response.json();
                                setResumeMeta(data);
                              }
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        id="resume-upload-edit"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        ref={resumeInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (resumeMeta) {
                              setPendingResumeFile(file);
                              setShowResumeConfirmModal(true);
                              return;
                            }
                            const formData = new FormData();
                            formData.append("resume", file);
                            const response = await fetch(
                              api.candidates.uploadResume(candidate.id),
                              {
                                method: "POST",
                                body: formData,
                                credentials: "include",
                              }
                            );
                            if (response.ok) {
                              const data = await response.json();
                              setResumeMeta(data);
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Additional fields */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notice-period" className="text-right">
                    Notice Period
                  </Label>
                  <Input
                    id="notice-period"
                    value={editedCandidate.noticePeriod || ""}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        noticePeriod: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="e.g., 2 months"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expected-salary" className="text-right">
                    Expected Salary
                  </Label>
                  <Input
                    id="expected-salary"
                    value={editedCandidate.expectedSalary || ""}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        expectedSalary: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="e.g., 12 LPA"
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
                      const newEducation = [
                        ...editedEducation,
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
                      setEditedEducation(newEducation);
                    }}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Education
                  </Button>
                </div>

                {editedEducation.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="border rounded-md p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Education Entry {index + 1}
                      </h4>
                      {editedEducation.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newEducation = editedEducation.filter(
                              (_, i) => i !== index
                            );
                            setEditedEducation(newEducation);
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
                        <Label htmlFor={`edit-degree-${index}`}>
                          Degree/Certificate{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`edit-degree-${index}`}
                          placeholder="e.g., Bachelor of Science"
                          value={entry.degree || ""}
                          onChange={(e) => {
                            const newEducation = [...editedEducation];
                            newEducation[index].degree = e.target.value;
                            setEditedEducation(newEducation);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-institution-${index}`}>
                          Institution <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`edit-institution-${index}`}
                          placeholder="e.g., Stanford University"
                          value={entry.institution || ""}
                          onChange={(e) => {
                            const newEducation = [...editedEducation];
                            newEducation[index].institution = e.target.value;
                            setEditedEducation(newEducation);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-field-${index}`}>
                          Field of Study
                        </Label>
                        <Input
                          id={`edit-field-${index}`}
                          placeholder="e.g., Computer Science"
                          value={entry.field || ""}
                          onChange={(e) => {
                            const newEducation = [...editedEducation];
                            newEducation[index].field = e.target.value;
                            setEditedEducation(newEducation);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-location-${index}`}>
                          Location
                        </Label>
                        <Input
                          id={`edit-location-${index}`}
                          placeholder="e.g., California, USA"
                          value={entry.location || ""}
                          onChange={(e) => {
                            const newEducation = [...editedEducation];
                            newEducation[index].location = e.target.value;
                            setEditedEducation(newEducation);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-start-date-${index}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`edit-start-date-${index}`}
                          type="date"
                          value={entry.startDate || ""}
                          onChange={(e) => {
                            const newEducation = [...editedEducation];
                            newEducation[index].startDate = e.target.value;
                            setEditedEducation(newEducation);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-end-date-${index}`}>
                          End Date
                        </Label>
                        <Input
                          id={`edit-end-date-${index}`}
                          type="date"
                          value={entry.endDate || ""}
                          onChange={(e) => {
                            const newEducation = [...editedEducation];
                            newEducation[index].endDate = e.target.value;
                            setEditedEducation(newEducation);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Education Documents</Label>
                      <div className="border border-dashed rounded-md p-4">
                        {entry.document ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <a
                                href={entry.document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline truncate"
                              >
                                {entry.document.originalName ||
                                  entry.document.name}
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    entry.document.downloadUrl,
                                    "_blank"
                                  )
                                }
                              >
                                Download
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  // Delete the document
                                  try {
                                    await fetch(
                                      api.candidates.deleteDocument(
                                        candidate.id,
                                        entry.document.id
                                      ),
                                      {
                                        method: "DELETE",
                                        credentials: "include",
                                      }
                                    );
                                    // Remove document from local state
                                    const newEducation = [...editedEducation];
                                    newEducation[index].document = null;
                                    setEditedEducation(newEducation);
                                  } catch (error) {
                                    console.log(
                                      "Error deleting document:",
                                      error
                                    );
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                            <Input
                              id={`edit-education-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const file = e.target.files[0];
                                  const newEducation = [...editedEducation];
                                  newEducation[index].documents = [
                                    {
                                      id: generateId("doc"),
                                      name: file.name,
                                      type: file.type,
                                      file: file,
                                      uploadDate: new Date(),
                                    },
                                  ];
                                  setEditedEducation(newEducation);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload new document to replace existing one
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Input
                              id={`edit-education-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const file = e.target.files[0];
                                  const newEducation = [...editedEducation];
                                  newEducation[index].documents = [
                                    {
                                      id: generateId("doc"),
                                      name: file.name,
                                      type: file.type,
                                      file: file,
                                      uploadDate: new Date(),
                                    },
                                  ];
                                  setEditedEducation(newEducation);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload new document to replace existing one
                            </p>
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
                      const newExperience = [
                        ...editedExperience,
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
                      setEditedExperience(newExperience);
                    }}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Experience
                  </Button>
                </div>

                {editedExperience.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="border rounded-md p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Experience Entry {index + 1}
                      </h4>
                      {editedExperience.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExperience = editedExperience.filter(
                              (_, i) => i !== index
                            );
                            setEditedExperience(newExperience);
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
                        <Label htmlFor={`edit-job-title-${index}`}>
                          Job Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`edit-job-title-${index}`}
                          placeholder="e.g., Senior Developer"
                          value={entry.jobTitle || ""}
                          onChange={(e) => {
                            const newExperience = [...editedExperience];
                            newExperience[index].jobTitle = e.target.value;
                            setEditedExperience(newExperience);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-company-${index}`}>
                          Company <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`edit-company-${index}`}
                          placeholder="e.g., Google"
                          value={entry.company || ""}
                          onChange={(e) => {
                            const newExperience = [...editedExperience];
                            newExperience[index].company = e.target.value;
                            setEditedExperience(newExperience);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-job-location-${index}`}>
                          Location
                        </Label>
                        <Input
                          id={`edit-job-location-${index}`}
                          placeholder="e.g., San Francisco, CA"
                          value={entry.location || ""}
                          onChange={(e) => {
                            const newExperience = [...editedExperience];
                            newExperience[index].location = e.target.value;
                            setEditedExperience(newExperience);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-job-start-date-${index}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`edit-job-start-date-${index}`}
                          type="date"
                          value={entry.startDate || ""}
                          onChange={(e) => {
                            const newExperience = [...editedExperience];
                            newExperience[index].startDate = e.target.value;
                            setEditedExperience(newExperience);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-job-end-date-${index}`}>
                          End Date
                        </Label>
                        <Input
                          id={`edit-job-end-date-${index}`}
                          type="date"
                          value={entry.endDate || ""}
                          disabled={entry.isCurrentRole}
                          onChange={(e) => {
                            const newExperience = [...editedExperience];
                            newExperience[index].endDate = e.target.value;
                            setEditedExperience(newExperience);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-job-description-${index}`}>
                        Job Description
                      </Label>
                      <Textarea
                        id={`edit-job-description-${index}`}
                        placeholder="Describe your responsibilities and achievements"
                        rows={3}
                        value={entry.description || ""}
                        onChange={(e) => {
                          const newExperience = [...editedExperience];
                          newExperience[index].description = e.target.value;
                          setEditedExperience(newExperience);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Documents</Label>
                      <div className="border border-dashed rounded-md p-4">
                        {entry.document ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <a
                                href={entry.document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline truncate"
                              >
                                {entry.document.originalName ||
                                  entry.document.name}
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    entry.document.downloadUrl,
                                    "_blank"
                                  )
                                }
                              >
                                Download
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  // Delete the document
                                  try {
                                    await fetch(
                                      api.candidates.deleteDocument(
                                        candidate.id,
                                        entry.document.id
                                      ),
                                      {
                                        method: "DELETE",
                                        credentials: "include",
                                      }
                                    );
                                    // Remove document from local state
                                    const newExperience = [...editedExperience];
                                    newExperience[index].document = null;
                                    setEditedExperience(newExperience);
                                  } catch (error) {
                                    console.log(
                                      "Error deleting document:",
                                      error
                                    );
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                            <Input
                              id={`edit-experience-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const file = e.target.files[0];
                                  const newExperience = [...editedExperience];
                                  newExperience[index].documents = [
                                    {
                                      id: generateId("doc"),
                                      name: file.name,
                                      type: file.type,
                                      file: file,
                                      uploadDate: new Date(),
                                    },
                                  ];
                                  setEditedExperience(newExperience);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload new document to replace existing one
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Input
                              id={`edit-experience-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const file = e.target.files[0];
                                  const newExperience = [...editedExperience];
                                  newExperience[index].documents = [
                                    {
                                      id: generateId("doc"),
                                      name: file.name,
                                      type: file.type,
                                      file: file,
                                      uploadDate: new Date(),
                                    },
                                  ];
                                  setEditedExperience(newExperience);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload recommendation letters, certificates, etc.
                              (PDF, DOC, DOCX, JPG, PNG)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`edit-current-role-${index}`}
                          checked={entry.isCurrentRole}
                          onCheckedChange={(checked) => {
                            const newExperience = [...editedExperience];
                            newExperience[index].isCurrentRole = checked;
                            if (checked) {
                              newExperience[index].endDate = "";
                            }
                            setEditedExperience(newExperience);
                          }}
                        />
                        <Label
                          htmlFor={`edit-current-role-${index}`}
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

            {/* Extra Curricular Tab */}
            <TabsContent value="extracurricular" className="space-y-6 mt-4">
              {/* Certifications Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium">Certifications</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newCertifications = [
                        ...editedCertifications,
                        {
                          id: generateId("cert"),
                          certificationName: "",
                          issuingOrganization: "",
                          issueDate: "",
                          expiryDate: "",
                          document: null,
                          documents: [],
                        },
                      ];
                      setEditedCertifications(newCertifications);
                    }}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Certification
                  </Button>
                </div>

                {editedCertifications.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="border rounded-md p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Certification Entry {index + 1}
                      </h4>
                      {editedCertifications.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newCertifications =
                              editedCertifications.filter(
                                (_, i) => i !== index
                              );
                            setEditedCertifications(newCertifications);
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
                        <Label htmlFor={`edit-certification-name-${index}`}>
                          Certification Name{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`edit-certification-name-${index}`}
                          placeholder="e.g., AWS Certified Solutions Architect"
                          value={entry.certificationName || ""}
                          onChange={(e) => {
                            const newCertifications = [...editedCertifications];
                            newCertifications[index].certificationName =
                              e.target.value;
                            setEditedCertifications(newCertifications);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-issuing-org-${index}`}>
                          Issuing Organization
                        </Label>
                        <Input
                          id={`edit-issuing-org-${index}`}
                          placeholder="e.g., Amazon Web Services"
                          value={entry.issuingOrganization || ""}
                          onChange={(e) => {
                            const newCertifications = [...editedCertifications];
                            newCertifications[index].issuingOrganization =
                              e.target.value;
                            setEditedCertifications(newCertifications);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-issue-date-${index}`}>
                          Issue Date
                        </Label>
                        <Input
                          id={`edit-issue-date-${index}`}
                          type="date"
                          value={entry.issueDate || ""}
                          onChange={(e) => {
                            const newCertifications = [...editedCertifications];
                            newCertifications[index].issueDate = e.target.value;
                            setEditedCertifications(newCertifications);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-expiry-date-${index}`}>
                          Expiry Date
                        </Label>
                        <Input
                          id={`edit-expiry-date-${index}`}
                          type="date"
                          value={entry.expiryDate || ""}
                          onChange={(e) => {
                            const newCertifications = [...editedCertifications];
                            newCertifications[index].expiryDate =
                              e.target.value;
                            setEditedCertifications(newCertifications);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Certification Documents</Label>
                      <div className="border border-dashed rounded-md p-4">
                        {entry.document ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <a
                                href={entry.document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline truncate"
                              >
                                {entry.document.originalName ||
                                  entry.document.name}
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    entry.document.downloadUrl,
                                    "_blank"
                                  )
                                }
                              >
                                Download
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  // Delete the document
                                  try {
                                    await fetch(
                                      api.candidates.deleteDocument(
                                        candidate.id,
                                        entry.document.id
                                      ),
                                      {
                                        method: "DELETE",
                                        credentials: "include",
                                      }
                                    );
                                    // Remove document from local state
                                    const newCertifications = [
                                      ...editedCertifications,
                                    ];
                                    newCertifications[index].document = null;
                                    setEditedCertifications(newCertifications);
                                  } catch (error) {
                                    console.log(
                                      "Error deleting document:",
                                      error
                                    );
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                            <Input
                              id={`edit-certification-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const file = e.target.files[0];
                                  const newCertifications = [
                                    ...editedCertifications,
                                  ];
                                  newCertifications[index].documents = [
                                    {
                                      id: generateId("doc"),
                                      name: file.name,
                                      type: file.type,
                                      file: file,
                                      uploadDate: new Date(),
                                    },
                                  ];
                                  setEditedCertifications(newCertifications);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload new document to replace existing one
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Input
                              id={`edit-certification-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const file = e.target.files[0];
                                  const newCertifications = [
                                    ...editedCertifications,
                                  ];
                                  newCertifications[index].documents = [
                                    {
                                      id: generateId("doc"),
                                      name: file.name,
                                      type: file.type,
                                      file: file,
                                      uploadDate: new Date(),
                                    },
                                  ];
                                  setEditedCertifications(newCertifications);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload certification document (PDF, DOC, DOCX,
                              JPG, PNG)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activities Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Extra Curricular Activities
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditedActivities([
                        ...editedActivities,
                        {
                          id: generateId("act"),
                          activityTitle: "",
                          organization: "",
                          description: "",
                          documents: [],
                        },
                      ]);
                    }}
                    className="flex items-center gap-1"
                  >
                    Add Activity
                  </Button>
                </div>

                {editedActivities.map((entry, index) => (
                  <div
                    key={entry.id || index}
                    className="border rounded-md p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Activity Entry {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newActivities = [...editedActivities];
                          newActivities.splice(index, 1);
                          setEditedActivities(newActivities);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-activity-title-${index}`}>
                          Activity Title
                        </Label>
                        <Input
                          id={`edit-activity-title-${index}`}
                          placeholder="e.g., Volunteer Work, Sports, Hackathons"
                          value={entry.activityTitle || ""}
                          onChange={(e) => {
                            const newActivities = [...editedActivities];
                            newActivities[index].activityTitle = e.target.value;
                            setEditedActivities(newActivities);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-organization-${index}`}>
                          Organization
                        </Label>
                        <Input
                          id={`edit-organization-${index}`}
                          placeholder="e.g., Red Cross, Chess Club"
                          value={entry.organization || ""}
                          onChange={(e) => {
                            const newActivities = [...editedActivities];
                            newActivities[index].organization = e.target.value;
                            setEditedActivities(newActivities);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-activity-description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`edit-activity-description-${index}`}
                        placeholder="Describe your involvement and achievements"
                        rows={3}
                        value={entry.description || ""}
                        onChange={(e) => {
                          const newActivities = [...editedActivities];
                          newActivities[index].description = e.target.value;
                          setEditedActivities(newActivities);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Activity Documents</Label>
                      <div className="border border-dashed rounded-md p-4">
                        {entry.document ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <a
                                href={entry.document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline truncate"
                              >
                                {entry.document.originalName ||
                                  entry.document.name}
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    entry.document.downloadUrl,
                                    "_blank"
                                  )
                                }
                              >
                                Download
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  // Delete the document
                                  try {
                                    await fetch(
                                      api.candidates.deleteDocument(
                                        candidate.id,
                                        entry.document.id
                                      ),
                                      {
                                        method: "DELETE",
                                        credentials: "include",
                                      }
                                    );
                                    // Remove document from local state
                                    const newActivities = [...editedActivities];
                                    newActivities[index].document = null;
                                    setEditedActivities(newActivities);
                                  } catch (error) {
                                    console.log(
                                      "Error deleting document:",
                                      error
                                    );
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                            <Input
                              id={`edit-activity-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const file = e.target.files[0];
                                  const newActivities = [...editedActivities];
                                  newActivities[index].documents = [
                                    {
                                      id: generateId("doc"),
                                      name: file.name,
                                      type: file.type,
                                      file: file,
                                      uploadDate: new Date(),
                                    },
                                  ];
                                  setEditedActivities(newActivities);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload new document to replace existing one
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Input
                              id={`edit-activity-docs-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="max-w-full"
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const file = e.target.files[0];
                                  const newActivities = [...editedActivities];
                                  newActivities[index].documents = [
                                    {
                                      id: generateId("doc"),
                                      name: file.name,
                                      type: file.type,
                                      file: file,
                                      uploadDate: new Date(),
                                    },
                                  ];
                                  setEditedActivities(newActivities);
                                }
                              }}
                            />
                            <p className="text-sm text-muted-foreground">
                              Upload certificates, photos, recognition
                              documents, etc. (PDF, DOC, DOCX, JPG, PNG)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Skills</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      id="edit-skills"
                      value={editedCandidate.newSkill || ""}
                      onChange={(e) => {
                        setEditedCandidate((prev) => ({
                          ...prev,
                          newSkill: e.target.value,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          editedCandidate.newSkill?.trim()
                        ) {
                          e.preventDefault();
                          const newSkill = editedCandidate.newSkill.trim();
                          setEditedCandidate((prev) => ({
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
                        if (editedCandidate.newSkill?.trim()) {
                          const newSkill = editedCandidate.newSkill.trim();
                          setEditedCandidate((prev) => ({
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
                    {editedCandidate.skills?.map((skill, index) => (
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
                            setEditedCandidate((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== index),
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

              {/* Social Media */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Social Media & Online Presence
                  </h3>
                </div>

                <div className="border rounded-md p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-linkedin">LinkedIn</Label>
                      <Input
                        id="edit-linkedin"
                        value={editedCandidate.linkedInProfile || ""}
                        onChange={(e) =>
                          setEditedCandidate({
                            ...editedCandidate,
                            linkedInProfile: e.target.value,
                          })
                        }
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-github">GitHub</Label>
                      <Input
                        id="edit-github"
                        value={editedCandidate.githubProfile || ""}
                        onChange={(e) =>
                          setEditedCandidate({
                            ...editedCandidate,
                            githubProfile: e.target.value,
                          })
                        }
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-twitter">Twitter</Label>
                      <Input
                        id="edit-twitter"
                        value={editedCandidate.twitterProfile || ""}
                        onChange={(e) =>
                          setEditedCandidate({
                            ...editedCandidate,
                            twitterProfile: e.target.value,
                          })
                        }
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-portfolio">Portfolio/Website</Label>
                      <Input
                        id="edit-portfolio"
                        value={editedCandidate.portfolioUrl || ""}
                        onChange={(e) =>
                          setEditedCandidate({
                            ...editedCandidate,
                            portfolioUrl: e.target.value,
                          })
                        }
                        placeholder="https://yourwebsite.com"
                      />
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
              disabled={isUpdating}
              className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {isUpdating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
        {/* Custom Resume Overwrite Confirmation Modal */}
        <Dialog
          open={showResumeConfirmModal}
          onOpenChange={setShowResumeConfirmModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Overwrite Resume?</DialogTitle>
              <DialogDescription>
                Uploading a new resume will overwrite the existing one. Do you
                want to continue?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResumeConfirmModal(false);
                  setPendingResumeFile(null);
                  if (resumeInputRef.current) resumeInputRef.current.value = "";
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (pendingResumeFile) {
                    const formData = new FormData();
                    formData.append("resume", pendingResumeFile);
                    const response = await fetch(
                      api.candidates.uploadResume(candidate.id),
                      {
                        method: "POST",
                        body: formData,
                        credentials: "include",
                      }
                    );
                    if (response.ok) {
                      const data = await response.json();
                      setResumeMeta(data);
                    }
                  }
                  setShowResumeConfirmModal(false);
                  setPendingResumeFile(null);
                  if (resumeInputRef.current) resumeInputRef.current.value = "";
                }}
              >
                Overwrite Resume
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
