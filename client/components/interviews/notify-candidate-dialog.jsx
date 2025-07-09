"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Paperclip, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NotifyCandidateDialog({
  open,
  onOpenChange,
  interview,
  onSend,
}) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [template, setTemplate] = useState(undefined);

  // Generate email content based on interview details
  useEffect(() => {
    if (interview) {
      // Set default subject
      setSubject(
        `Interview Scheduled: ${interview.position} at [Company Name]`
      );

      // Set default message based on interview details
      const defaultMessage = `
Dear ${interview.candidate},

We are pleased to inform you that your interview for the ${interview.position
        } position has been scheduled.

Interview Details:
- Date: ${interview.date}
- Time: ${interview.time}
- Duration: ${interview.duration || "60"} minutes
- Format: ${interview.type === "video"
          ? "Video Interview (link will be provided closer to the date)"
          : interview.type === "phone"
            ? "Phone Interview (we will call you at your provided number)"
            : "In-person Interview (address details below)"
        }
- Interviewer: ${interview.interviewer}

${interview.type === "in-person"
          ? `
Location:
[Company Address]
[City, State ZIP]
[Building/Floor/Room information]
[Parking instructions if applicable]
`
          : ""
        }

Please confirm your availability for this interview by replying to this email. If you need to reschedule, please let us know as soon as possible.

What to prepare:
- Please review the job description
- Be ready to discuss your relevant experience and skills
- Prepare questions you may have about the role or company
- ${interview.type === "video"
          ? "Ensure your video conferencing setup is working properly"
          : interview.type === "in-person"
            ? "Plan your travel to arrive 10-15 minutes early"
            : "Ensure you'll be in a quiet location to receive our call"
        }

If you have any questions before the interview, please don't hesitate to contact us.

We look forward to speaking with you!

Best regards,
[Your Name]
[Your Title]
[Company Name]
[Contact Information]
      `.trim();

      setMessage(defaultMessage);
    }
  }, [interview]);

  // Handle template selection
  const handleTemplateChange = (value) => {
    setTemplate(value);

    // Update message based on template selection
    switch (value) {
      case "standard":
        if (interview) {
          setSubject(
            `Interview Scheduled: ${interview.position} at [Company Name]`
          );
          // The default message is already set above
        }
        break;
      case "technical":
        if (interview) {
          setSubject(
            `Technical Interview Scheduled: ${interview.position} at [Company Name]`
          );
          setMessage(
            `
Dear ${interview.candidate},

We're excited to invite you to a technical interview for the ${interview.position
              } position.

Interview Details:
- Date: ${interview.date}
- Time: ${interview.time}
- Duration: ${interview.duration || "60"} minutes
- Format: ${interview.type}
- Interviewer: ${interview.interviewer}

This will be a technical interview focusing on your skills and experience with:
- [Specific technology/skill 1]
- [Specific technology/skill 2]
- [Specific technology/skill 3]

Please be prepared to discuss your past projects and potentially work through some technical problems.

We look forward to speaking with you!

Best regards,
[Your Name]
[Your Title]
[Company Name]
        `.trim()
          );
        }
        break;
      case "follow_up":
        if (interview) {
          setSubject(
            `Follow-up: Your Upcoming Interview for ${interview.position}`
          );
          setMessage(
            `
Dear ${interview.candidate},

This is a friendly reminder about your upcoming interview for the ${interview.position} position.

As previously scheduled:
- Date: ${interview.date}
- Time: ${interview.time}
- Format: ${interview.type}

Please let us know if you need any additional information before the interview.

We're looking forward to our conversation!

Best regards,
[Your Name]
[Company Name]
        `.trim()
          );
        }
        break;
    }
  };

  const handleAddAttachment = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments = Array.from(e.target.files).map(
        (file) => file.name
      );
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleRemoveAttachment = (attachment) => {
    setAttachments(attachments.filter((a) => a !== attachment));
  };

  const handleSend = async () => {
    if (!interview) return;

    setIsSubmitting(true);

    try {
      // In a real application, this would send an actual email
      // For now, we'll just simulate a delay and show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Email Sent",
        description: `Interview notification sent to ${interview.candidate}.`,
      });

      // Call the onSend callback to notify the parent component
      onSend();

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.log("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!interview) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Notify Candidate
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Send an interview notification email to{' '}
            <span className="font-semibold text-gray-900">{interview?.candidate}</span>.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6 py-2" onSubmit={e => { e.preventDefault(); handleSend(); }}>
          {/* Template Selection */}
          <div>
            <Label htmlFor="template">Email Template</Label>
            <Select name="template" onValueChange={handleTemplateChange}>
              <SelectTrigger id="template" className="mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Interview</SelectItem>
                <SelectItem value="technical">Technical Interview</SelectItem>
                <SelectItem value="follow_up">Follow-up Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="mt-2 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[180px]"
              required
            />
          </div>

          {/* Attachments */}
          <div>
            <Label>Attachments</Label>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 cursor-pointer bg-white/80 border border-gray-200 rounded-md px-3 py-2 hover:bg-blue-50">
                <Paperclip className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">Add Attachment</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAddAttachment}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <Badge key={a} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                    {a}
                    <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemoveAttachment(a)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
