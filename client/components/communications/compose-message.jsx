"use client";
import { useState, useEffect, useRef } from "react";
import { DialogFooter } from "@/components/ui/dialog";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Paperclip, X, Send, Mail, MessageSquare, Phone, AlertCircle } from "lucide-react";

export function ComposeMessage({
  onSend,
  initialData,
  templates = [],
  selectedTemplateKey,
  showCancelButton = true,
}) {
  const [messageType, setMessageType] = useState("email");
  const [attachments, setAttachments] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(
    selectedTemplateKey || ""
  );
  const fileInputRef = useRef();
  const [error, setError] = useState("");

  // Initialize with initialData if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.recipients) setRecipients(initialData.recipients);
      if (initialData.subject) setSubject(initialData.subject);
      if (initialData.message) setMessage(initialData.message);
    }
  }, [initialData]);

  // When selectedTemplate changes, autofill subject/message from templates
  useEffect(() => {
    if (selectedTemplate) {
      let found = null;
      if (Array.isArray(templates)) {
        found = templates.find(
          (t) => t.id === selectedTemplate || t.name === selectedTemplate
        );
      } else {
        for (const cat of Object.values(templates)) {
          if (Array.isArray(cat)) {
            found = cat.find(
              (t) => t.id === selectedTemplate || t.name === selectedTemplate
            );
            if (found) break;
          }
        }
      }
      if (found) {
        setSubject(found.name);
        setMessage(
          `Dear {{candidate_name}},\n\n${(found.content || '').replace(/\\n/g, '\n')}\n\nBest regards,\n{{sender_name}}\n{{company_name}}`
        );
      }
    }
  }, [selectedTemplate, templates]);

  // Email validation helper
  const isValidEmail = (email) => {
    // Simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Domain-specific validation (optional, set allowedDomain to restrict)
  const allowedDomain = null; // e.g., "company.com" or null for any
  const isAllowedDomain = (email) => {
    if (!allowedDomain) return true;
    return email.toLowerCase().endsWith(`@${allowedDomain}`);
  };

  // Check for duplicates across all fields
  const isDuplicate = (email) => {
    return (
      recipients.includes(email) || cc.includes(email) || bcc.includes(email)
    );
  };

  // Add recipient/cc/bcc handlers
  const handleAddRecipient = () => {
    if (!recipientInput) return;
    if (!isValidEmail(recipientInput)) {
      setError("Please enter a valid recipient email.");
      return;
    }
    if (!isAllowedDomain(recipientInput)) {
      setError(
        allowedDomain
          ? `Only emails from @${allowedDomain} are allowed.`
          : "Invalid email domain."
      );
      return;
    }
    if (isDuplicate(recipientInput)) {
      setError("This email is already added in Recipients, CC, or BCC.");
      return;
    }
    setRecipients([...recipients, recipientInput]);
    setRecipientInput("");
    setError("");
  };
  const handleRemoveRecipient = (recipient) => {
    setRecipients(recipients.filter((r) => r !== recipient));
  };
  const handleAddCc = () => {
    if (!ccInput) return;
    if (!isValidEmail(ccInput)) {
      setError("Please enter a valid CC email.");
      return;
    }
    if (!isAllowedDomain(ccInput)) {
      setError(
        allowedDomain
          ? `Only emails from @${allowedDomain} are allowed.`
          : "Invalid email domain."
      );
      return;
    }
    if (isDuplicate(ccInput)) {
      setError("This email is already added in Recipients, CC, or BCC.");
      return;
    }
    setCc([...cc, ccInput]);
    setCcInput("");
    setError("");
  };
  const handleRemoveCc = (email) => {
    setCc(cc.filter((c) => c !== email));
  };
  const handleAddBcc = () => {
    if (!bccInput) return;
    if (!isValidEmail(bccInput)) {
      setError("Please enter a valid BCC email.");
      return;
    }
    if (!isAllowedDomain(bccInput)) {
      setError(
        allowedDomain
          ? `Only emails from @${allowedDomain} are allowed.`
          : "Invalid email domain."
      );
      return;
    }
    if (isDuplicate(bccInput)) {
      setError("This email is already added in Recipients, CC, or BCC.");
      return;
    }
    setBcc([...bcc, bccInput]);
    setBccInput("");
    setError("");
  };
  const handleRemoveBcc = (email) => {
    setBcc(bcc.filter((b) => b !== email));
  };

  const handleAddAttachment = (e) => {
    console.log('File input event:', e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments = Array.from(e.target.files);
      console.log('New attachments:', newAttachments);
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleRemoveAttachment = (attachment) => {
    setAttachments(attachments.filter((a) => a !== attachment));
  };

  const handleSend = () => {
    if (messageType !== "email") return; // Only allow send for email
    if (recipients.length === 0) {
      setError("Please add at least one recipient.");
      return;
    }
    // Only send data if we have at least a subject or message
    if (subject.trim() || message.trim()) {
      setError("");
      // Filter attachments to only include real File objects
      const validAttachments = attachments.filter(
        (file) =>
          file &&
          typeof file === 'object' &&
          typeof file.name === 'string' &&
          typeof file.size === 'number' &&
          file.size > 0
      );
      if (attachments.length !== validAttachments.length) {
        console.warn('Invalid attachments detected:', attachments);
      }
      console.log('Attachments to be sent:', validAttachments);
      onSend({
        subject,
        message,
        recipients,
        cc,
        bcc,
        attachments: validAttachments,
        messageType,
      });
    } else {
      setError("");
      onSend();
    }
  };

  return (
    <div className="space-y-6 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl p-6 shadow-sm">
      <Tabs value={messageType} onValueChange={setMessageType}>
        <TabsList className="grid w-full grid-cols-3 bg-white/80 border border-gray-200 p-1 rounded-lg">
          <TabsTrigger
            value="email"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md"
          >
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger
            value="message"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </TabsTrigger>
          <TabsTrigger
            value="sms"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md"
          >
            <Phone className="h-4 w-4" />
            SMS
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {messageType !== "email" && (
          <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Coming Soon</span>
            </div>
            <p className="text-sm">This feature is currently under development.</p>
          </div>
        )}

        <div className="space-y-4">
          <Label htmlFor="recipients" className="text-sm font-medium text-gray-700">To</Label>
          <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            {recipients.map((recipient, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              >
                {recipient}
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(recipient)}
                  className="ml-1 rounded-full hover:bg-blue-300 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {recipient}</span>
                </button>
              </Badge>
            ))}
            <Input
              id="recipients"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddRecipient();
                }
              }}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm py-1 px-2 bg-transparent"
              placeholder="Enter recipient email or name"
              disabled={messageType !== "email"}
            />
          </div>
        </div>

        {/* CC Field */}
        {messageType === "email" && (
          <div className="space-y-4">
            <Label htmlFor="cc" className="text-sm font-medium text-gray-700">CC</Label>
            <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              {cc.map((email, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveCc(email)}
                    className="ml-1 rounded-full hover:bg-green-300 p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {email}</span>
                  </button>
                </Badge>
              ))}
              <Input
                id="cc"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCc();
                  }
                }}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm py-1 px-2 bg-transparent"
                placeholder="Enter CC email"
                disabled={messageType !== "email"}
              />
            </div>
          </div>
        )}

        {/* BCC Field */}
        {messageType === "email" && (
          <div className="space-y-4">
            <Label htmlFor="bcc" className="text-sm font-medium text-gray-700">BCC</Label>
            <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              {bcc.map((email, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveBcc(email)}
                    className="ml-1 rounded-full hover:bg-purple-300 p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {email}</span>
                  </button>
                </Badge>
              ))}
              <Input
                id="bcc"
                value={bccInput}
                onChange={(e) => setBccInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBcc();
                  }
                }}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm py-1 px-2 bg-transparent"
                placeholder="Enter BCC email"
                disabled={messageType !== "email"}
              />
            </div>
          </div>
        )}

        {messageType === "email" && (
          <div className="space-y-4">
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="space-y-4">
          <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            className="min-h-[200px] bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={messageType !== "email"}
          />
        </div>

        {messageType === "email" && (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Attachments</Label>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200"
                >
                  <Paperclip className="h-3 w-3" />
                  {attachment.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(attachment)}
                    className="ml-1 rounded-full hover:bg-orange-300 p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {attachment.name}</span>
                  </button>
                </Badge>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 bg-white/80 border-gray-200 hover:bg-gray-50 text-gray-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-3.5 w-3.5 mr-1.5" />
                Attach File
              </Button>
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleAddAttachment}
                multiple
              />
            </div>
          </div>
        )}

        {messageType === "email" && (
          <div className="space-y-4">
            <Label htmlFor="template" className="text-sm font-medium text-gray-700">Use Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger id="template" className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(templates)
                  ? templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  : Object.entries(templates).map(([cat, arr]) =>
                      arr.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))
                    )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Live Preview */}
        {message && (
          <div className="mt-4">
            <div className="font-semibold mb-1 text-gray-700">Preview:</div>
            <div
              className="prose prose-blue max-w-none border rounded bg-gray-50 p-3"
              style={{ minHeight: 80 }}
              dangerouslySetInnerHTML={{
                __html: message
                  .replace(/\n\n/g, '<br/><br/>')
                  .replace(/\n/g, '<br/>')
              }}
            />
          </div>
        )}
      </div>

      <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 rounded-b-xl p-6 -mx-6 -mb-6">
        <div className="flex flex-col w-full gap-3">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            {showCancelButton && (
              <Button
                variant="outline"
                onClick={() => onSend(null)}
                className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSend}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={messageType !== "email" || recipients.length === 0}
            >
              <Send className="h-4 w-4" />
              Send{" "}
              {messageType === "email"
                ? "Email"
                : messageType === "sms"
                  ? "SMS"
                  : "Message"}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </div>
  );
}