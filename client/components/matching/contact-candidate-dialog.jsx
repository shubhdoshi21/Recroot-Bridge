"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useToast } from "@/hooks/use-toast";
import { ComposeMessage } from "../communications/compose-message.jsx";
import { useAuth } from "@/contexts/auth-context";
import { useCommunication } from "@/contexts/communication-context";
import { clientService } from "@/services/clientService";
import { Mail, User, Target } from "lucide-react";

export function ContactCandidateDialog({ isOpen, onClose, candidate }) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const { sendMessage, fetchEmailTemplates, emailTemplates } = useCommunication();
  useEffect(() => { fetchEmailTemplates(); }, [fetchEmailTemplates]);
  // Get sender name
  const senderName =
    user?.user?.fullName || user?.user?.name || user?.user?.email || "";

  // Fetch client name from Client model
  const clientId = user?.user?.clientId;
  const [clientName, setClientName] = useState("");
  useEffect(() => {
    if (clientId) {
      clientService
        .getClientById(clientId)
        .then((client) => setClientName(client.companyName))
        .catch(() => setClientName(""));
    }
  }, [clientId]);

  if (!candidate) return null;

  // Prepare initial data for ComposeMessage
  const initialData = {
    recipients: [candidate.email],
    subject: `Opportunity for ${candidate.jobTitle} position`,
    message: `Dear ${candidate.name
      },\n\nI hope this message finds you well. I'm reaching out because your profile shows a strong match for our ${candidate.jobTitle
      } position.\n\nWe're impressed with your background and would like to discuss this opportunity with you further. Would you be available for a brief call this week to discuss the role?\n\nLooking forward to connecting with you.\n\nBest regards,\n${senderName}${clientName ? `\n${clientName}` : ""
      }`,
  };

  // Handle send from ComposeMessage
  const handleSend = async (msgObj) => {
    if (!msgObj) {
      // Cancel was clicked in ComposeMessage, just close dialog
      onClose(false);
      return;
    }
    setIsSending(true);
    try {
      await sendMessage(msgObj); // Actually send the email
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${candidate.name}.`,
      });
      onClose(false);
    } catch (error) {
      toast({
        title: "Failed to send message",
        description:
          error.message ||
          "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-scroll">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Contact Candidate</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Send a message to {candidate.name} about the {candidate.jobTitle}{" "}
            position.
          </DialogDescription>
        </DialogHeader>

        {/* Candidate Info Header */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-blue-100 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                {candidate.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h3>
              <p className="text-gray-600 mb-2">{candidate.email}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{candidate.title || "No title specified"}</span>
                </div>
                {candidate.matchPercentage && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-600">{candidate.matchPercentage}% Match</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message Composition */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
          <ComposeMessage
            onSend={handleSend}
            initialData={initialData}
            templates={emailTemplates}
            showCancelButton={false}
          />
        </div>

        <DialogFooter className="mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
