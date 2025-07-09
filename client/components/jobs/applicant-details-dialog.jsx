"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Download, CheckCircle, XCircle, Mail, Phone, MapPin, Calendar, Star, Award, Briefcase, ArrowRight, User, BarChart3, FileCheck, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useJobs } from "@/contexts/jobs-context";
import { RejectApplicantDialog } from "./reject-applicant-dialog";
import { useMatching } from "@/contexts/matching-context";
import { atsService } from "@/services/atsService";
import { documentService } from "@/services/documentService";
import { candidateService } from "@/services/candidateService";
import { api } from "@/config/api";
import { ContactCandidateDialog } from "@/components/matching/contact-candidate-dialog";

// Utility to format months as 'X yrs Y mos'
function formatExperienceMonths(months) {
  if (!months || isNaN(months)) return '';
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  let str = '';
  if (yrs > 0) str += `${yrs} yr${yrs > 1 ? 's' : ''}`;
  if (mos > 0) str += (str ? ' ' : '') + `${mos} mo${mos > 1 ? 's' : ''}`;
  return str || '0 mos';
}

export function ApplicantDetailsDialog({
  isOpen,
  onOpenChange,
  applicant,
}) {
  const [currentApplicant, setCurrentApplicant] = useState(applicant);
  const [activeTab, setActiveTab] = useState("profile");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [atsScores, setAtsScores] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [candidateDocuments, setCandidateDocuments] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const { toast } = useToast();
  const {
    selectedJob: job,
    jobService,
    fetchJobApplicants // To refresh the list
  } = useJobs();
  const { matchedCandidates, updateCandidateStatus: updateSourcedStatus } = useMatching();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  // Update currentApplicant when applicant prop changes
  useEffect(() => {
    setCurrentApplicant(applicant);
  }, [applicant]);

  // Fetch ATS scores and analysis only when dialog opens, applicant/job changes
  useEffect(() => {
    if (!isOpen || !applicant || !job || !applicant.candidateId) return;
    let isMounted = true;
    atsService.ensureATSScores(applicant.candidateId, job.id).then((scores) => {
      if (!isMounted) return;
      setCurrentApplicant((prev) => ({
        ...prev,
        atsScore: scores.atsScore,
        skillsMatch: scores.skillsMatch,
        experienceMatch: scores.experienceMatch,
        educationMatch: scores.educationMatch,
      }));
      setAnalysis(scores.analysis || "");
    });
    return () => { isMounted = false; };
  }, [isOpen, applicant, job]);

  // Fetch candidate documents on dialog open
  useEffect(() => {
    if (!isOpen || !applicant?.candidateId) return;
    documentService.getCandidateDocuments({ candidateId: applicant.candidateId })
      .then((docs) => setCandidateDocuments(docs.documents || docs || []))
      .catch(() => setCandidateDocuments([]));
  }, [isOpen, applicant]);

  // Fetch candidate profile (with resumeUrl) on dialog open
  useEffect(() => {
    if (!isOpen || !applicant?.candidateId) return;
    candidateService.getCandidateById(applicant.candidateId)
      .then((res) => {
        if (res && res.data) setCandidateProfile(res.data);
      })
      .catch(() => setCandidateProfile(null));
  }, [isOpen, applicant]);

  if (!currentApplicant || !job) return null;

  // Use applicant/applicant.Candidate for all profile fields
  const candidate = currentApplicant.Candidate || currentApplicant;

  // Use context data if available, otherwise fall back to applicant fields
  const atsScore = currentApplicant.atsScore ?? 0;
  const skillsMatch = currentApplicant.skillsMatch ?? 0;
  const experienceMatch = currentApplicant.experienceMatch ?? 0;
  const educationMatch = currentApplicant.educationMatch ?? 0;
  // Always use the latest analysis from state for AI Analysis
  const atsAnalysis = analysis;

  // For applicants, get candidateSkills from CandidateSkillMaps
  let candidateSkills = currentApplicant.candidateSkills || [];
  if ((!candidateSkills || candidateSkills.length === 0) && currentApplicant?.Candidate?.CandidateSkillMaps) {
    candidateSkills = currentApplicant.Candidate.CandidateSkillMaps.map(sm => sm.Skill?.title).filter(Boolean);
  }

  console.log('ApplicantDetailsDialog atsAnalysis:', atsAnalysis, { applicant: currentApplicant });
  const scoreColor = atsScore >= 80 ? "text-green-500" : atsScore >= 60 ? "text-yellow-500" : "text-red-500";

  // Calculate ATS score based on matching skills
  const calculateATSScore = () => {
    if (!currentApplicant.requiredSkills || !currentApplicant.candidateSkills) return 0;
    const matchingSkills = currentApplicant.requiredSkills.filter(skill =>
      currentApplicant.candidateSkills.includes(skill)
    );
    return Math.round((matchingSkills.length / currentApplicant.requiredSkills.length) * 100);
  };

  // Get missing skills
  const getMissingSkills = () => {
    if (!currentApplicant.requiredSkills || !currentApplicant.candidateSkills) return [];
    return currentApplicant.requiredSkills.filter(
      skill => !currentApplicant.candidateSkills.includes(skill)
    );
  };

  let stages = [];
  const defaultStages = ["Applied", "Screening", "Interview", "Offer", "Hired"];

  try {
    if (typeof job.applicationStages === 'string' && job.applicationStages) {
      stages = JSON.parse(job.applicationStages).map(s => s.name);
    } else if (Array.isArray(job.applicationStages) && job.applicationStages.length > 0) {
      stages = job.applicationStages.map(s => s.name);
    }

    if (stages.length === 0) {
      stages = defaultStages;
    }
  } catch (e) {
    console.log('Error parsing application stages in ApplicantDetailsDialog:', e);
    stages = defaultStages;
  }

  const currentStageIndex = stages.findIndex(stageName => stageName === currentApplicant.status);
  const isLastStage = currentStageIndex !== -1 && currentStageIndex === stages.length - 1;

  const handleAdvance = async () => {
    if (currentStageIndex === -1 || isLastStage) {
      toast({
        title: "Cannot Advance",
        description: "Applicant is either not in a defined stage or already at the final stage.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const nextStageName = stages[currentStageIndex + 1];

      if (currentApplicant.type === 'application') {
        await jobService.updateApplicationStatus(currentApplicant.id, nextStageName);
      } else if (currentApplicant.type === 'assignment') {
        await jobService.updateAssignmentStatus(currentApplicant.jobId, currentApplicant.candidateId, nextStageName);
      }

      setCurrentApplicant(prev => ({ ...prev, status: nextStageName }));
      toast({
        title: "Applicant Advanced",
        description: `The applicant has been advanced to ${nextStageName}.`,
      });
      fetchJobApplicants(job.id, { onlyApplicants: true }); // Refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to advance applicant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      setIsLoading(true);

      if (currentApplicant.type === 'application') {
        await jobService.rejectApplication(currentApplicant.id, reason);
      } else if (currentApplicant.type === 'assignment') {
        // Assignments are just a status update to 'Rejected'
        await jobService.updateAssignmentStatus(currentApplicant.jobId, currentApplicant.candidateId, 'Rejected');
      }

      setIsRejectDialogOpen(false);
      toast({
        title: "Applicant Rejected",
        description: "The applicant's status has been updated to Rejected.",
      });
      fetchJobApplicants(job.id, { onlyApplicants: true }); // Refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject applicant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRejectConfirm = async (reason) => {
    if (!reason) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    await handleReject(reason);
  };

  // Get the most up-to-date match data from matching context for this job/applicant
  let matchData = null;
  if (job && matchedCandidates && matchedCandidates[job.id]) {
    matchData = matchedCandidates[job.id].find(
      c => c.candidateId === currentApplicant.candidateId || c.id === currentApplicant.candidateId || c.id === currentApplicant.id
    );
  }

  // Helper to split analysis into sections
  function parseAnalysisSections(analysisText) {
    if (!analysisText) return {};
    // Heuristic: look for keywords to split the analysis
    const skillsRegex = /(skills? (analysis|match|are|:|–|-))/i;
    const experienceRegex = /(experience (analysis|match|are|:|–|-))/i;
    const educationRegex = /(education (match|analysis|are|:|–|-))/i;

    // Try to split by sentences containing keywords
    const skillsSentences = [];
    const experienceSentences = [];
    const educationSentences = [];
    const otherSentences = [];
    const sentences = analysisText.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      if (skillsRegex.test(sentence)) {
        skillsSentences.push(sentence);
      } else if (experienceRegex.test(sentence)) {
        experienceSentences.push(sentence);
      } else if (educationRegex.test(sentence)) {
        educationSentences.push(sentence);
      } else {
        // Heuristics for common patterns
        if (/proficien|technolog|framework|front-end|back-end|stack|skillset|skills|familiarity|knowledge|object-oriented|algorithms|programming|architecture|api|microservices|database|react|c#|.net|html|css|javascript|mongo|mysql|mssql|core/i.test(sentence)) {
          skillsSentences.push(sentence);
        } else if (/experience|role|years|months|leadership|team|manager|worked|work history|job scraper|developer|position|employment|current role|duration|project/i.test(sentence)) {
          experienceSentences.push(sentence);
        } else if (/education|degree|bachelor|master|phd|school|university|college|graduat|completion|academic|study|studies|field of study|match score/i.test(sentence)) {
          educationSentences.push(sentence);
        } else {
          otherSentences.push(sentence);
        }
      }
    }
    return {
      skills: skillsSentences.join(' '),
      experience: experienceSentences.join(' '),
      education: educationSentences.join(' '),
      other: otherSentences.join(' '),
    };
  }

  const parsedAnalysis = parseAnalysisSections(atsAnalysis);

  // Stage icon mapping (smart defaults)
  const stageIcons = [
    <FileText className="h-5 w-5" />, // Submission
    <User className="h-5 w-5" />,    // Screening
    <Award className="h-5 w-5" />,   // Interview
    <Star className="h-5 w-5" />,    // Assessment
    <Users className="h-5 w-5" />,   // Onsite
    <CheckCircle className="h-5 w-5" /> // Offer/Final
  ];
  const stageDescriptions = [
    "Application received and logged.",
    "Initial screening by recruiter or HR.",
    "Technical interview to assess skills.",
    "Technical assessment or test.",
    "Onsite or final round interview.",
    "Offer extended to candidate."
  ];

  // View Resume button handler
  const handleViewResume = async () => {
    try {
      const response = await fetch(api.candidates.getResume(applicant.candidateId), { credentials: "include" });
      if (!response.ok) throw new Error("No resume found for this candidate.");
      const data = await response.json();
      const resumeUrl = data.url || data.downloadUrl;
      if (!resumeUrl) throw new Error("No resume found for this candidate.");
      window.open(resumeUrl, "_blank");
    } catch (error) {
      toast({
        title: "No Resume Uploaded",
        description: "No resume is available for this candidate.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-2xl font-bold">Applicant Details</DialogTitle>
            </div>
            <DialogDescription>
              Review applicant information, ATS scores, and manage their application status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* ATS Score Card */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-blue-100 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center md:items-stretch gap-8 relative">
              <div className="flex flex-col items-center justify-center md:items-start md:justify-between flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">ATS Score</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-4xl font-extrabold ${scoreColor}`}>{atsScore}%</span>
                  <span className="text-base text-gray-500 font-medium">Overall</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-green-600">{skillsMatch}%</span>
                  <span className="text-base text-gray-600 mt-1">Skills Match</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-blue-600">{experienceMatch}%</span>
                  <span className="text-base text-gray-600 mt-1">Experience Match</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-purple-600">{educationMatch}%</span>
                  <span className="text-base text-gray-600 mt-1">Education Match</span>
                </div>
              </div>
            </div>

            {/* Header with basic info and actions */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 shadow-md">
                  <AvatarImage src={candidate.profilePicture} />
                  <AvatarFallback className="text-2xl">
                    {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p className="text-gray-600 mb-2">{candidate.email}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{candidate.location || "Location not specified"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Applied: {currentApplicant.appliedDate ? new Date(currentApplicant.appliedDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 mt-6 md:mt-0">
                <Button variant="outline" size="sm" className="gap-2 transition hover:bg-blue-50" onClick={() => setIsContactDialogOpen(true)}>
                  <Mail className="h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" size="sm" className="gap-2 transition hover:bg-blue-50" onClick={handleViewResume}>
                  <FileText className="h-4 w-4" />
                  View Resume
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-2">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="ats" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  ATS Analysis
                </TabsTrigger>
                <TabsTrigger value="pipeline" className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Pipeline
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                      <User className="h-4 w-4" />
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{candidate.phone || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{candidate.location || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                      <Briefcase className="h-4 w-4" />
                      Professional Summary
                    </h4>
                    <p className="text-sm text-gray-600">{candidate.summary || "No summary provided"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ats" className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-700">
                    <BarChart3 className="h-4 w-4" />
                    AI Analysis
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <h5 className="font-semibold text-blue-700 mb-1">Skills Analysis</h5>
                      <p className="text-sm text-gray-700">{parsedAnalysis.skills || "No skills analysis available."}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-green-700 mb-1">Experience Analysis</h5>
                      <p className="text-sm text-gray-700">{parsedAnalysis.experience || "No experience analysis available."}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-pink-700 mb-1">Education Match Analysis</h5>
                      <p className="text-sm text-gray-700">{parsedAnalysis.education || "No education analysis available."}</p>
                    </div>
                    {parsedAnalysis.other && (
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-1">Other Notes</h5>
                        <p className="text-sm text-gray-700">{parsedAnalysis.other}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pipeline" className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                    <ArrowRight className="h-4 w-4" />
                    Application Pipeline
                  </h4>
                  <div className="flex flex-col items-start pl-6">
                    {stages.map((stage, idx) => {
                      const isCompleted = idx < currentStageIndex;
                      const isCurrent = idx === currentStageIndex;
                      const isUpcoming = idx > currentStageIndex;
                      return (
                        <div className="flex items-center min-h-[56px]" key={stage}>
                          <div className="flex flex-col items-center">
                            {/* Top line segment */}
                            {idx > 0 && (
                              <div className={`w-1 h-5 ${idx <= currentStageIndex ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            )}
                            {/* Step circle */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-0.5
                              ${isCompleted || isCurrent ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                              {isCompleted ? <CheckCircle className="h-4 w-4" /> : isCurrent ? <span className="block w-3 h-3 bg-white rounded-full" /> : null}
                            </div>
                            {/* Bottom line segment */}
                            {idx < stages.length - 1 && (
                              <div className={`w-1 h-5 ${idx < currentStageIndex ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            )}
                          </div>
                          <div className={`ml-4 mt-1.5 font-semibold text-base
                            ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {stage}
                            {isCurrent && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">Current</Badge>
                            )}
                            <div className="text-sm font-normal text-gray-500 mt-0.5">{stageDescriptions[idx] || ''}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-pink-700">
                    <FileCheck className="h-4 w-4" />
                    Documents & Attachments
                  </h4>
                  <div className="space-y-3">
                    {candidateDocuments.length === 0 && (
                      <div className="text-gray-400 text-sm">No documents uploaded for this candidate.</div>
                    )}
                    {candidateDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{doc.name || doc.originalName || doc.fileName || "Document"}</p>

                          </div>
                        </div>
                        <div className="flex gap-2">
                          {doc.url && (
                            <Button variant="outline" size="sm" onClick={() => window.open(doc.url, "_blank")}>View</Button>
                          )}
                          {doc.downloadUrl && (
                            <Button variant="outline" size="sm" onClick={() => window.open(doc.downloadUrl, "_blank")}>Download</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t gap-4 mt-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Current Status:</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-base px-3 py-1 rounded-full">
                  {currentApplicant.status || "Applied"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(true)}
                  className="gap-2 transition hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={handleAdvance}
                  disabled={isLoading || currentStageIndex === -1 || isLastStage}
                  className="gap-2 bg-green-600 text-white hover:bg-green-700 transition"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Advance to Next Stage
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RejectApplicantDialog
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        applicant={currentApplicant}
        isLoading={isLoading}
        onSuccess={handleReject}
      />

      <ContactCandidateDialog
        isOpen={isContactDialogOpen}
        onClose={setIsContactDialogOpen}
        candidate={{
          ...candidate,
          name:
            (candidate.firstName || "") +
            (candidate.lastName ? " " + candidate.lastName : "") ||
            candidate.name ||
            candidate.email ||
            "Candidate",
          title: candidate.title || candidate.position || "Candidate",
          jobTitle: job?.jobTitle || "",
          email: candidate.email,
        }}
      />
    </>
  );
} 