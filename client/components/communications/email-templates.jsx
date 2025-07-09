"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Plus, Copy, Trash2, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/config/api";
import { useCommunication } from "@/contexts/communication-context";
import { ComposeMessage } from "./compose-message.jsx";
import { useToast } from "@/hooks/use-toast";

export function EmailTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitialData, setComposeInitialData] = useState(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(null);

  const {
    emailTemplates,
    fetchEmailTemplates,
    emailTemplatesLoading,
    emailTemplatesError,
    sendMessage,
  } = useCommunication();

  const { toast } = useToast();

  useEffect(() => {
    fetchEmailTemplates();
  }, [fetchEmailTemplates]);

  // Group templates by category for tabs
  const templates = {};
  (emailTemplates || []).forEach((tpl) => {
    const key = tpl.category?.toLowerCase().replace(/\s+/g, "-") || "other";
    if (!templates[key]) templates[key] = [];
    templates[key].push(tpl);
  });

  // Get all templates as a flat array
  const getAllTemplates = () => Object.values(templates).flat();

  const filteredTemplates = getAllTemplates().filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleUseTemplate = (template) => {
    setComposeInitialData({
      subject: template.subject,
      message: `Dear {{candidate_name}},\n\n${template.content}\n\nBest regards,\n{{sender_name}}\n{{client_name}}`,
    });
    setIsComposeOpen(true);
    setSelectedTemplateKey(template.id);
  };

  if (emailTemplatesLoading) {
    return <div className="p-8 text-center text-gray-500">Loading templates...</div>;
  }
  if (emailTemplatesError) {
    return <div className="p-8 text-center text-red-500">{emailTemplatesError}</div>;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
      <CardHeader className="bg-gradient-to-r from-transparent to-blue-50/50 border-b border-gray-100 flex items-center gap-3 justify-start text-left">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent text-left">
          Email Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md px-4 py-2 w-full"
            />
          </div>
        </div>
        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-blue-200 mb-4" />
            <p className="text-lg text-gray-500">No templates found</p>
            <p className="text-sm text-gray-400">Try a different search query.</p>
          </div>
        )}
        {/* Template List */}
        {filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-5 bg-white/90 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 truncate">{template.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1 truncate">{template.description}</div>
                <div className="flex flex-wrap gap-2 mb-1">
                  {(template.tags || []).map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-gray-400">Last updated: {template.lastUpdated}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Preview Template
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div
              className="text-gray-900 whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: (selectedTemplate?.description || '')
                  .replace(/\n\n/g, '<br/><br/>')
                  .replace(/\n/g, '<br/>')
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* Compose Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Use Template
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              Compose a message using this template.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ComposeMessage
              onSend={async (data) => {
                if (data) {
                  try {
                    await sendMessage(data);
                    toast({ title: 'Email sent successfully!', variant: 'success' });
                  } catch (e) {
                    toast({ title: 'Failed to send email', description: e.message || String(e), variant: 'destructive' });
                  }
                }
                setIsComposeOpen(false);
              }}
              initialData={composeInitialData}
              templates={emailTemplates}
              showCancelButton={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export const EMAIL_TEMPLATES = {
  "candidate-communications": [
    {
      id: 101,
      name: "Application Received Confirmation",
      description:
        "Thank you for applying for the {{job_title}} position at {{company_name}}. We have received your application and our team will review it shortly. We appreciate your interest in joining our company and will be in touch soon regarding next steps.",
      lastUpdated: "2024-05-10",
      category: "Candidate Communications",
      tags: ["Automated", "Application"],
    },
    {
      id: 102,
      name: "Interview Invitation",
      description:
        "We are pleased to invite you to interview for the {{job_title}} position at {{company_name}}. Please find the interview details below:\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nLocation: {{interview_location}}\n\nIf you have any questions or need to reschedule, please let us know. We look forward to meeting you!",
      lastUpdated: "2024-05-10",
      category: "Candidate Communications",
      tags: ["Interview", "Scheduling"],
    },
    {
      id: 103,
      name: "Interview Confirmation",
      description:
        "This is a confirmation for your upcoming interview for the {{job_title}} position at {{company_name}}.\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nLocation: {{interview_location}}\n\nPlease let us know if you have any questions or require further information.",
      lastUpdated: "2024-05-10",
      category: "Candidate Communications",
      tags: ["Interview", "Confirmation"],
    },
    {
      id: 104,
      name: "Application Rejection",
      description:
        "Thank you for your interest in the {{job_title}} position at {{company_name}}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe appreciate the time you took to apply and wish you the best in your future endeavors.",
      lastUpdated: "2024-05-10",
      category: "Candidate Communications",
      tags: ["Rejection", "Automated"],
    },
  ],
  "offer-process": [
    {
      id: 201,
      name: "Offer Letter Email",
      description:
        "Congratulations! We are excited to offer you the position of {{job_title}} at {{company_name}}. Please find your official offer letter attached.\n\nIf you have any questions or need clarification, feel free to reach out. We look forward to welcoming you to our team.",
      lastUpdated: "2024-05-10",
      category: "Offer Process",
      tags: ["Offer", "Formal"],
    },
    {
      id: 202,
      name: "Offer Negotiation Response",
      description:
        "Thank you for discussing your offer for the {{job_title}} position at {{company_name}}. We appreciate your openness and have reviewed your requests.\n\nPlease see our response attached. If you have further questions or wish to continue the discussion, let us know.",
      lastUpdated: "2024-05-10",
      category: "Offer Process",
      tags: ["Negotiation", "Offer"],
    },
    {
      id: 203,
      name: "Offer Acceptance Confirmation",
      description:
        "We are delighted to confirm your acceptance of the {{job_title}} position at {{company_name}}. Our team will be in touch soon with onboarding details and next steps.\n\nWelcome to the team!",
      lastUpdated: "2024-05-10",
      category: "Offer Process",
      tags: ["Acceptance", "Confirmation"],
    },
  ],
  onboarding: [
    {
      id: 301,
      name: "Welcome Email",
      description:
        "Welcome to {{company_name}}! We are excited to have you join us as a {{job_title}}.\n\nYour first day is scheduled for {{start_date}}. If you have any questions before then, please feel free to reach out.\n\nWe look forward to working with you!",
      lastUpdated: "2024-05-10",
      category: "Onboarding",
      tags: ["Welcome", "New Hire"],
    },
    {
      id: 302,
      name: "First Day Instructions",
      description:
        "We are looking forward to your first day at {{company_name}}!\n\nPlease arrive at {{company_location}} by {{start_time}}.\n\nBring a valid ID and any required documents.\n\nIf you have questions, contact your manager or HR representative.",
      lastUpdated: "2024-05-10",
      category: "Onboarding",
      tags: ["First Day", "Instructions"],
    },
    {
      id: 303,
      name: "IT Setup Information",
      description:
        "To help you get started, here is your IT setup information for {{company_name}}:\n\n- Email: {{company_email}}\n- Temporary password: {{temp_password}}\n- IT support contact: {{it_support_contact}}\n\nPlease log in and change your password on your first day. If you need assistance, our IT team is here to help.",
      lastUpdated: "2024-05-10",
      category: "Onboarding",
      tags: ["IT", "Setup"],
    },
  ],
  "internal-communications": [
    {
      id: 401,
      name: "Interview Feedback Request",
      description:
        "We kindly request your feedback for the recent interview with {{candidate_name}} for the {{job_title}} position.\n\nYour input is valuable in helping us make informed hiring decisions. Please complete the feedback form at your earliest convenience.",
      lastUpdated: "2024-05-10",
      category: "Internal Communications",
      tags: ["Feedback", "Interview"],
    },
    {
      id: 402,
      name: "New Hire Announcement",
      description:
        "We are excited to announce that {{candidate_name}} has joined {{company_name}} as our new {{job_title}}.\n\nPlease join us in welcoming {{candidate_name}} to the team!",
      lastUpdated: "2024-05-10",
      category: "Internal Communications",
      tags: ["Announcement", "New Hire"],
    },
    {
      id: 403,
      name: "Recruitment Status Update",
      description:
        "Here is the latest update on our recruitment efforts for {{job_title}} at {{company_name}}:\n\n- Applications received: {{applications_received}}\n- Interviews scheduled: {{interviews_scheduled}}\n- Offers extended: {{offers_extended}}\n\nIf you have questions or need more details, please contact the HR team.",
      lastUpdated: "2024-05-10",
      category: "Internal Communications",
      tags: ["Status", "Update"],
    },
  ],
};
