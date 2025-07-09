"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Play,
  Pause,
  Clock,
  Mail,
  MessageSquare,
  Calendar,
  Settings,
  ChevronRight,
  AlertCircle,
  Eye,
  TestTube,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useCommunication } from "@/contexts/communication-context";
import { format, parseISO, isValid } from "date-fns";
import { communicationService } from "@/services/communicationService";

// Helper to flatten templates
const getAllTemplates = () => Object.values(EMAIL_TEMPLATES).flat();

function getTriggerValue(trigger) {
  if (!trigger) return "";

  // Map backend trigger IDs to frontend values
  const triggerMap = {
    candidate_rejected: "candidate_rejected",
    candidate_accepted: "candidate_accepted",
    application_received: "application_received",
    interview_scheduled: "interview_scheduled",
    interview_reminder: "interview_reminder",
    interview_completed: "interview_completed",
    interview_cancelled: "interview_cancelled",
    interview_rescheduled: "interview_rescheduled",
    offer_sent: "offer_sent",
    welcome_new_hire: "welcome_new_hire",
    interview_cancelled: "interview_cancelled",
    interview_updated: "interview_updated",
    // Legacy mappings for backward compatibility
    "On application submission": "application_received",
    "24 hours before interview": "interview_reminder",
    "Interview scheduled": "interview_scheduled",
    "When candidate status changes": "candidate_rejected", // Default mapping
  };

  return triggerMap[trigger] || trigger;
}

function getTriggerDisplayName(triggerValue) {
  const displayMap = {
    candidate_rejected: "Candidate Rejected",
    candidate_accepted: "Candidate Accepted",
    application_received: "Application Received",
    interview_scheduled: "Interview Scheduled",
    interview_reminder: "Interview Reminder",
    interview_completed: "Interview Completed",
    interview_cancelled: "Interview Cancelled",
    interview_rescheduled: "Interview Rescheduled",
    offer_sent: "Offer Sent",
    welcome_new_hire: "Welcome New Hire",
  };

  return displayMap[triggerValue] || triggerValue;
}

// Helper to extract variables from a template string
function extractTemplateVariables(template) {
  if (!template) return [];
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  const found = new Set();
  let match;
  while ((match = regex.exec(template))) {
    found.add(match[1]);
  }
  return Array.from(found);
}

// Helper to group variables by entity type
function groupVariablesByEntity(variables, availableVariables) {
  const groups = {};

  variables.forEach((varName) => {
    for (const [category, vars] of Object.entries(availableVariables)) {
      if (Object.prototype.hasOwnProperty.call(vars, varName)) {
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push({
          name: varName,
          description: vars[varName],
        });
        break;
      }
    }
  });

  return groups;
}

// Entity type mappings
const entityTypeMap = {
  candidate: "candidates",
  job: "jobs",
  company: "companies",
  sender: "recruiters",
  interview: "interviews",
  application: "applications",
};

// Add a helper to render template with test data
function renderTemplate(template, testData) {
  if (!template) return "";
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, varName) => {
    return testData[varName] || "";
  });
}

export function AutomatedMessages() {
  const [isAutomationEditorOpen, setIsAutomationEditorOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState([]);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [isTestSectionOpen, setIsTestSectionOpen] = useState(false);
  const [isVariablesSectionOpen, setIsVariablesSectionOpen] = useState(false);

  const {
    loading,
    error,
    entityLists,
    automations,
    fetchCandidates,
    fetchJobs,
    fetchCompanies,
    fetchRecruiters,
    fetchInterviews,
    fetchApplications,
    fetchAutomations,
    createAutomation,
    updateAutomation,
    toggleAutomationStatus,
    deleteAutomation,
    runTestAutomation,
    emailTemplates,
    fetchEmailTemplates,
  } = useCommunication();

  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  console.log("[AUTOMATED_MESSAGES] Auth context state:", {
    user,
    authLoading,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "",
    channel: "",
    template: "",
    status: true,
  });

  const allTemplates = emailTemplates || [];
  const [customTemplate, setCustomTemplate] = useState({
    subject: "",
    message: "",
  });

  // Test data state
  const [testData, setTestData] = useState({
    candidateId: "",
    jobId: "",
    senderId: "",
    companyId: "",
    // Interview-specific variables
    interviewId: "",
    applicationId: "",
    // Custom variables for different triggers
    customVariables: {
      interview_type: "",
      interview_date: "",
      interview_time: "",
      interview_location: "",
      interview_notes: "",
      previous_status: "",
      new_status: "",
      previous_date: "",
      new_date: "",
      deletion_reason: "",
      status_change: "",
      offer_details: "",
      start_date: "",
    },
  });

  // Compute variables used in the current subject and message
  const usedVariables = extractTemplateVariables(customTemplate.subject)
    .concat(extractTemplateVariables(customTemplate.message))
    .filter((v, i, arr) => arr.indexOf(v) === i); // unique

  // Group variables by entity type
  // const variableGroups = groupVariablesByEntity(
  //   usedVariables,
  //   availableVariables
  // );

  // Add state for current user
  const [currentUser, setCurrentUser] = useState(null);

  // Add state for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [automationToDelete, setAutomationToDelete] = useState(null);

  // Add state and handler for edit message dialog
  const [isEditMessageDialogOpen, setIsEditMessageDialogOpen] = useState(false);
  const [editMessageData, setEditMessageData] = useState({ subject: "", message: "", id: null });

  // Add state for selected entities
  const [selectedEntities, setSelectedEntities] = useState({
    candidate: null,
    job: null,
    company: null,
    sender: null,
    interview: null,
    application: null,
  });

  // Fetch all entity lists in parallel using context fetchers
  const fetchAllEntityLists = async () => {
    await Promise.all([
      fetchCandidates(),
      fetchJobs(),
      fetchCompanies(),
      fetchRecruiters(),
      fetchInterviews(),
      fetchApplications(),
    ]);
  };

  useEffect(() => {
    setIsAuthError(false);
    (async () => {
      try {
        await Promise.all([
          fetchAutomations(),
          fetchAllEntityLists(),
        ]);
      } catch (e) {
        setIsAuthError(true);
      }
    })();
  }, []);

  // Set sender data from current user when user data is available
  useEffect(() => {
    // console.log("[AUTOMATED_MESSAGES] useEffect triggered with user:", user);
    // console.log("[AUTOMATED_MESSAGES] Auth loading state:", authLoading);
    // console.log(
    //   "[AUTOMATED_MESSAGES] User object keys:",
    //   user ? Object.keys(user) : "No user"
    // );

    // Don't set sender data if auth is still loading
    if (authLoading) {
      // console.log(
      //   "[AUTOMATED_MESSAGES] Auth still loading, skipping sender data setup"
      // );
      return;
    }

    // Check for nested user structure (user.user) as seen in account-settings.jsx
    const userData = user?.user || user;

    if (userData) {
      // console.log("[AUTOMATED_MESSAGES] Current user data:", userData);
      // console.log("[AUTOMATED_MESSAGES] User properties:", {
      //   fullName: userData.fullName,
      //   name: userData.name,
      //   firstName: userData.firstName,
      //   lastName: userData.lastName,
      //   email: userData.email,
      //   phone: userData.phone,
      // });

      const senderName =
        userData.fullName ||
        userData.name ||
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
        "Current User";
      const senderEmail = userData.email || "user@example.com";
      const senderPhone = userData.phone || "N/A";

      // console.log("[AUTOMATED_MESSAGES] Setting sender data:", {
      //   sender_name: senderName,
      //   sender_email: senderEmail,
      //   sender_phone: senderPhone,
      // });

      setTestData((prev) => {
        const updated = {
          ...prev,
          sender_name: senderName,
          sender_email: senderEmail,
          sender_phone: senderPhone,
        };
        console.log("[AUTOMATED_MESSAGES] Updated testData:", updated);
        return updated;
      });
    } else {
      // console.log(
      //   "[AUTOMATED_MESSAGES] No user data available, setting default sender"
      // );
      // Set default sender data if no user is available
      setTestData((prev) => ({
        ...prev,
        sender_name: "Current User",
        sender_email: "user@example.com",
        sender_phone: "N/A",
      }));
    }
  }, [user, authLoading]);

  const handleEditAutomation = (automation) => {
    setSelectedAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description,
      trigger: getTriggerValue(automation.trigger),
      channel: automation.channel.toLowerCase().includes("email")
        ? "email"
        : automation.channel.toLowerCase().includes("sms")
          ? "sms"
          : "notification",
      template: automation.template,
      status: automation.status === "Active",
    });
    setCustomTemplate({
      subject: automation.subject || "",
      message: automation.message || "",
    });
    setIsAutomationEditorOpen(true);
  };

  const handleCreateAutomation = () => {
    setSelectedAutomation(null);
    setFormData({
      name: "",
      description: "",
      trigger: "",
      channel: "",
      template: "",
      status: true,
    });
    setIsAutomationEditorOpen(true);
  };

  const handleToggleAutomationStatus = async (id) => {
    try {
      const updated = await toggleAutomationStatus(id);
      await fetchAutomations();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const getTriggerIcon = (trigger) => {
    if (trigger.includes("before")) return <Clock className="h-4 w-4" />;
    if (trigger.includes("Weekly") || trigger.includes("Monthly"))
      return <Calendar className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };

  const getChannelIcon = (channel) => {
    if (channel.includes("Email")) return <Mail className="h-4 w-4" />;
    if (channel.includes("notification"))
      return <MessageSquare className="h-4 w-4" />;
    return <MessageSquare className="h-4 w-4" />;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Automation name is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!formData.trigger) {
      errors.trigger = "Trigger type is required";
    }
    if (!formData.channel) {
      errors.channel = "Channel is required";
    }
    if (!formData.template) {
      errors.template = "Template is required";
    }
    if (formData.template === "custom") {
      if (!customTemplate.subject.trim()) {
        errors.subject = "Subject is required for custom template";
      }
      if (!customTemplate.message.trim()) {
        errors.message = "Message is required for custom template";
      }
    }
    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateChange = (value) => {
    setFormData((prev) => ({ ...prev, template: value }));
    if (value === "custom") {
      setCustomTemplate({ subject: "", message: "" });
    } else {
      const tpl = allTemplates.find((t) => t.id === Number(value));
      console.log("[AUTOMATED_MESSAGES] Template found:", tpl);
      if (tpl) {
        setCustomTemplate({
          subject: tpl.subject,
          message: `Dear {{candidate_name}},\n\n${(tpl.content || '').replace(/\\n/g, '\n')}\n\nBest regards,\n{{sender_name}}\n{{client_name}}`,
        });
      }
    }
  };

  const handleSaveAutomation = async () => {
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Use the trigger value directly since it now matches backend expectations
    const triggerText = formData.trigger;

    const channelText =
      formData.channel === "email"
        ? "Email"
        : formData.channel === "sms"
          ? "SMS"
          : "In-app notification";
    let subject = customTemplate.subject;
    let message = customTemplate.message;
    if (formData.template !== "custom") {
      const tpl = allTemplates.find((t) => t.id === Number(formData.template));
      if (tpl) {
        subject = tpl.subject;
        message = `Dear {{candidate_name}},\n\n${(tpl.content || '').replace(/\\n/g, '\n')}\n\nBest regards,\n{{sender_name}}\n{{client_name}}`;
      }
    }
    const payload = {
      name: formData.name,
      description: formData.description,
      trigger: triggerText,
      channel: channelText,
      template: formData.template,
      subject,
      message,
      status: formData.status ? "Active" : "Inactive",
    };
    try {
      if (selectedAutomation) {
        const updated = await updateAutomation(
          selectedAutomation.id,
          payload
        );
        await fetchAutomations();
        toast({
          title: "Success",
          description: "Automation updated successfully!",
        });
      } else {
        const created = await createAutomation(payload);
        await fetchAutomations();
        toast({
          title: "Success",
          description: "New automation created successfully!",
        });
      }
      setIsAutomationEditorOpen(false);
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleTestAutomation = async () => {
    if (!selectedAutomation) return;

    // Use candidate_email or sender_email as the recipient
    const recipientEmail = testData.candidate_email || testData.sender_email;

    if (!recipientEmail || recipientEmail.endsWith("@example.com")) {
      toast({
        title: "Test Failed",
        description:
          "Please select a real candidate or ensure a valid email is present before testing.",
        variant: "destructive",
      });
      return;
    }

    // Validate that we have a candidateId for proper email lookup
    if (!testData.candidateId) {
      console.warn("[AUTOMATED_MESSAGES] No candidateId found in test data");
    }

    try {
      // Structure test data properly for the backend
      const testPayload = {
        automationId: selectedAutomation.id,
        triggerType: selectedAutomation.trigger,
        clientId: user?.clientId || user?.user?.clientId,
        context: {
          candidateId: testData.candidateId,
          jobId: testData.jobId,
          interviewId: testData.interviewId,
          applicationId: testData.applicationId,
          // Include all test data variables directly
          candidate_name: testData.candidate_name,
          candidate_email: testData.candidate_email,
          candidate_phone: testData.candidate_phone,
          candidate_location: testData.candidate_location,
          candidate_position: testData.candidate_position,
          candidate_company: testData.candidate_company,
          candidate_experience: testData.candidate_experience,
          job_title: testData.job_title,
          job_type: testData.job_type,
          job_department: testData.job_department,
          job_location: testData.job_location,
          job_salary_min: testData.job_salary_min,
          job_salary_max: testData.job_salary_max,
          job_experience_level: testData.job_experience_level,
          company_name: testData.company_name,
          company_industry: testData.company_industry,
          company_size: testData.company_size,
          company_location: testData.company_location,
          company_website: testData.company_website,
          company_phone: testData.company_phone,
          company_email: testData.company_email,
          sender_name: testData.sender_name,
          sender_email: testData.sender_email,
          sender_phone: testData.sender_phone,
          interview_type: testData.interview_type,
          interview_date: testData.interview_date,
          interview_time: testData.interview_time,
          interview_location: testData.interview_location,
          interview_notes: testData.interview_notes,
          // Include custom variables
          ...testData.customVariables,
        }
      };

      const result = await communicationService.testAutomation(testPayload);
      if (result && result.preview) {
        toast({
          title: "Preview",
          description: (
            <div>
              <div><b>Subject:</b> {result.preview.subject}</div>
              <div style={{ whiteSpace: "pre-line", marginTop: 8 }}><b>Message:</b><br />{result.preview.message}</div>
            </div>
          ),
          duration: 10000,
        });
      } else {
        toast({
          title: "Test Failed",
          description: "No preview returned from backend.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePreviewAutomation = async (automation) => {
    setSelectedAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description,
      trigger: getTriggerValue(automation.trigger),
      channel: automation.channel.toLowerCase().includes("email")
        ? "email"
        : automation.channel.toLowerCase().includes("sms")
          ? "sms"
          : "notification",
      template: automation.template,
      status: automation.status === "Active",
    });
    setCustomTemplate({
      subject: automation.subject || "",
      message: automation.message || "",
    });
    setIsPreviewDialogOpen(true);
  };

  const handleEntitySelection = (entityType, entityId) => {
    const entityListKey = entityTypeMap[entityType];
    const entity = entityLists[entityListKey]?.find((e) => e.id === entityId);

    console.log("[AUTOMATED_MESSAGES] handleEntitySelection called:", {
      entityType,
      entityId,
      entityListKey,
      entityList: entityLists[entityListKey],
      foundEntity: entity,
    });

    if (!entity) return;

    setSelectedEntities((prev) => ({
      ...prev,
      [entityType]: entity,
    }));

    // Update test data with entity properties
    const updatedTestData = { ...testData };

    // Map entity properties to test data variables
    switch (entityType) {
      case "candidate":
        updatedTestData.candidateId = entity.id; // Set the candidate ID
        updatedTestData.candidate_name = entity.name;
        updatedTestData.candidate_email = entity.email;
        updatedTestData.candidate_phone = entity.phone;
        updatedTestData.candidate_location = entity.location;
        updatedTestData.candidate_position = entity.position;
        updatedTestData.candidate_company = entity.company;
        updatedTestData.candidate_experience = entity.experience;
        break;
      case "job":
        updatedTestData.jobId = entity.id; // Set the job ID
        updatedTestData.job_title = entity.jobTitle;
        updatedTestData.job_type = entity.type;
        updatedTestData.job_department = entity.department;
        updatedTestData.job_location = entity.location;
        updatedTestData.job_salary_min = entity.salary_min;
        updatedTestData.job_salary_max = entity.salary_max;
        updatedTestData.job_experience_level = entity.experience_level;
        break;
      case "company":
        updatedTestData.companyId = entity.id; // Set the company ID
        updatedTestData.company_name = entity.name;
        updatedTestData.company_industry = entity.industry;
        updatedTestData.company_size = entity.size;
        updatedTestData.company_location = entity.location;
        updatedTestData.company_website = entity.website;
        updatedTestData.company_phone = entity.phone;
        updatedTestData.company_email = entity.email;
        break;
      case "sender":
        updatedTestData.senderId = entity.id; // Set the sender ID
        updatedTestData.sender_name = entity.name;
        updatedTestData.sender_email = entity.email;
        updatedTestData.sender_phone = entity.phone;
        break;
      case "interview":
        updatedTestData.interviewId = entity.id; // Set the interview ID
        updatedTestData.interview_type = entity.type;
        updatedTestData.interview_date = entity.date;
        updatedTestData.interview_time = entity.time;
        updatedTestData.interview_location = entity.location;
        updatedTestData.interview_notes = entity.notes;
        console.log("[AUTOMATED_MESSAGES] Setting interview data:", {
          interviewId: entity.id,
          interview_type: entity.type,
          interview_date: entity.date,
          interview_time: entity.time,
          interview_location: entity.location,
          interview_notes: entity.notes,
        });
        console.log("[AUTOMATED_MESSAGES] Entity object:", entity);
        break;
      case "application":
        updatedTestData.applicationId = entity.id; // Set the application ID
        updatedTestData.application_date = entity.date;
        updatedTestData.application_status = entity.status;
        break;
    }

    console.log(
      "[AUTOMATED_MESSAGES] Updated test data after entity selection:",
      updatedTestData
    );
    setTestData(updatedTestData);
  };

  const handleDeleteAutomation = (automation) => {
    setAutomationToDelete(automation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAutomation = async () => {
    if (!automationToDelete) return;
    try {
      await deleteAutomation(automationToDelete.id);
      await fetchAutomations();
      toast({
        title: "Deleted",
        description: "Automation deleted successfully.",
      });
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setAutomationToDelete(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const filteredAutomatedMessages = automations.filter((automation) =>
    automation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditAutomationMessage = (automation) => {
    setEditMessageData({
      subject: automation.subject || "",
      message: automation.message || "",
      id: automation.id,
    });
    setIsEditMessageDialogOpen(true);
  };

  const handleSaveEditMessage = async () => {
    try {
      await updateAutomation(
        editMessageData.id,
        {
          subject: editMessageData.subject,
          message: editMessageData.message,
        }
      );
      await fetchAutomations();
      toast({ title: "Success", description: "Automation message updated." });
      setIsEditMessageDialogOpen(false);
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchEmailTemplates();
  }, [fetchEmailTemplates]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
      <CardHeader className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100 flex items-center gap-3 justify-start text-left">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent text-left">
          Automated Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md px-4 py-2 w-full"
            />
          </div>
          <Button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            size="sm"
            onClick={handleCreateAutomation}
          >
            <Plus className="h-4 w-4" />
            New Automation
          </Button>
        </div>
        {/* Empty State */}
        {filteredAutomatedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-blue-200 mb-4" />
            <p className="text-lg text-gray-500">No automations found</p>
            <p className="text-sm text-gray-400">Try a different search query or add a new automation.</p>
          </div>
        )}
        {/* Automation List */}
        {filteredAutomatedMessages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAutomatedMessages.map((automation) => (
              <div
                key={automation.id}
                className="p-5 bg-white/90 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2"
                onClick={() => handlePreviewAutomation(automation)}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(automation.trigger)}
                    <span className="font-semibold text-gray-900 truncate">{automation.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={e => { e.stopPropagation(); handleEditAutomation(automation); }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={e => { e.stopPropagation(); handleEditAutomationMessage(automation); }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={e => { e.stopPropagation(); handleDeleteAutomation(automation); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1 truncate">{automation.description}</div>
                <div className="flex flex-wrap gap-2 mb-1">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {automation.channel}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {automation.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">
                  Last run: {automation.lastRun && isValid(parseISO(automation.lastRun)) ? format(parseISO(automation.lastRun), 'PPpp') : 'Never'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {/* Automation Editor Dialog */}
      <Dialog open={isAutomationEditorOpen} onOpenChange={setIsAutomationEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  {selectedAutomation ? "Edit Automation" : "Create New Automation"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  {selectedAutomation ? "Update your automation settings" : "Set up a new automated message"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Automation Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter automation name"
                    className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter description"
                    className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                </div>
              </div>
            </div>

            {/* Trigger and Channel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Trigger & Channel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger" className="text-sm font-medium text-gray-700">Trigger Type</Label>
                  <Select value={formData.trigger} onValueChange={(value) => handleInputChange("trigger", value)}>
                    <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application_received">Application Received</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="interview_reminder">Interview Reminder</SelectItem>
                      <SelectItem value="interview_rescheduled">Interview Rescheduled</SelectItem>
                      <SelectItem value="interview_cancelled">Interview Cancelled</SelectItem>
                      <SelectItem value="interview_updated">Interview Updated</SelectItem>
                      <SelectItem value="interview_completed">Interview Completed</SelectItem>
                      <SelectItem value="candidate_accepted">Candidate Accepted</SelectItem>
                      <SelectItem value="candidate_rejected">Candidate Rejected</SelectItem>
                      <SelectItem value="offer_sent">Offer Sent</SelectItem>
                      <SelectItem value="welcome_new_hire">Welcome New Hire</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.trigger && <p className="text-red-500 text-xs mt-1">{formErrors.trigger}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel" className="text-sm font-medium text-gray-700">Channel</Label>
                  <Select value={formData.channel} onValueChange={(value) => handleInputChange("channel", value)}>
                    <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="notification">In-app Notification</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.channel && <p className="text-red-500 text-xs mt-1">{formErrors.channel}</p>}
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Message Template</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-sm font-medium text-gray-700">Template</Label>
                  <Select value={formData.template} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Template</SelectItem>
                      {allTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.template && <p className="text-red-500 text-xs mt-1">{formErrors.template}</p>}
                </div>

                {formData.template === "custom" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
                      <Input
                        id="subject"
                        value={customTemplate.subject}
                        onChange={(e) => setCustomTemplate(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter email subject"
                        className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      {formErrors.subject && <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                      <Textarea
                        id="message"
                        value={customTemplate.message}
                        onChange={(e) => setCustomTemplate(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Enter message content"
                        rows={6}
                        className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      {formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Automation Section */}
            <div className="space-y-4 border border-blue-100 rounded-xl p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 shadow-sm mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-blue-500" /> Test Automation
                </h3>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={handleTestAutomation}
                  disabled={loading || !selectedAutomation}
                >
                  <Mail className="h-4 w-4 mr-1" /> Send Test Email
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Entity selectors for test data */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Test Candidate</Label>
                  <Select
                    value={selectedEntities.candidate?.id || ""}
                    onValueChange={id => handleEntitySelection("candidate", id)}
                  >
                    <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityLists.candidates.map(candidate => (
                        <SelectItem key={candidate.id} value={candidate.id}>{candidate.name} ({candidate.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Test Job</Label>
                  <Select
                    value={selectedEntities.job?.id || ""}
                    onValueChange={id => handleEntitySelection("job", id)}
                  >
                    <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select job" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityLists.jobs.map(job => (
                        <SelectItem key={job.id} value={job.id}>{job.jobTitle}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Add more selectors as needed for company, sender, interview, etc. */}
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Preview</Label>
                <div className="rounded-lg border border-blue-100 bg-white/80 p-4 shadow-inner min-h-[120px] max-h-64 overflow-auto">
                  <div
                    className="prose prose-blue max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderTemplate(customTemplate.message, testData)
                        .replace(/\n\n/g, '<br/><br/>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  This preview uses the selected test data. Variables will be replaced as in the real email.
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => handleInputChange("status", checked)}
                />
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  {formData.status ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 rounded-b-xl p-6">
            <div className="flex gap-3 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAutomationEditorOpen(false)}
                className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAutomation}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {selectedAutomation ? "Update Automation" : "Create Automation"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
          <DialogHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-100 rounded-t-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Delete Automation</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Are you sure you want to delete this automation? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            <p className="text-gray-700">
              You are about to delete: <strong>{automationToDelete?.name}</strong>
            </p>
          </div>

          <DialogFooter className="bg-gradient-to-r from-gray-50 to-red-50 border-t border-gray-100 rounded-b-xl p-6">
            <div className="flex gap-3 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteAutomation}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Delete Automation
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog open={isEditMessageDialogOpen} onOpenChange={setIsEditMessageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Automation Message</DialogTitle>
            <DialogDescription>Update the subject and message for this automation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Subject</Label>
            <Input
              value={editMessageData.subject}
              onChange={e => setEditMessageData(d => ({ ...d, subject: e.target.value }))}
              placeholder="Email subject"
            />
            <Label>Message</Label>
            <Textarea
              value={editMessageData.message}
              onChange={e => setEditMessageData(d => ({ ...d, message: e.target.value }))}
              rows={8}
              placeholder="Email message body"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMessageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEditMessage}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
