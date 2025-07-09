import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useSettings } from "@/contexts/settings-context";
import { useTeams } from "@/contexts/teams-context";
import CustomizeTasksDialog from "./customize-tasks-dialog";

export default function InitiateOnboardingDialog({ candidate, job, open, onClose, onConfirm }) {
//   console.log('InitiateOnboardingDialog job prop:', job);
  const [startDate, setStartDate] = useState("");
  const [manager, setManager] = useState("");
  const [location, setLocation] = useState("");
  const [template, setTemplate] = useState("");
  const [customizeTasks, setCustomizeTasks] = useState(false);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [managers, setManagers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [onboardingOptions, setOnboardingOptions] = useState({
    sendWelcomeEmail: false,
    scheduleOrientation: false,
    assignBuddy: false,
    prepareWorkspace: false,
  });
  const { templates, loading: templatesLoading, getTemplateById, newHires } = useOnboarding();
  const { users } = useSettings();
  const { teams } = useTeams();
  const [status, setStatus] = useState("not-started");
  const [progress, setProgress] = useState(0);

  // Fetch managers, locations, templates on mount
  useEffect(() => {
    // Preload work location from job data if available
    if (open) {
      if (job && job.location) {
        setLocation(job.location);
      }
      setStatus("not-started");
      setProgress(0);
    } else {
      // Reset state when dialog closes
      setStartDate("");
      setManager("");
      setLocation("");
      setTemplate("");
      setCustomizeTasks(false);
      setIsCustomizeDialogOpen(false);
      setOnboardingData(null);
      setOnboardingOptions({
        sendWelcomeEmail: false,
        scheduleOrientation: false,
        assignBuddy: false,
        prepareWorkspace: false,
      });
      setStatus("not-started");
      setProgress(0);
    }
  }, [open, job]);

  // 1. Managers by role
  const managersByRole = users?.filter(u => u.role === "manager") || [];

  // 2. Team leads (teamMembers with role including 'lead')
  // const teamLeads = teams
  //   ?.flatMap(team => team.teamMembers?.filter(m => m.role?.toLowerCase().includes("lead")) || [])
  //   .filter(Boolean) || [];

  // 3. Combine and deduplicate by user id
  const allManagersMap = new Map();
  [...managersByRole].forEach(user => {
    if (user && user.id) {
      allManagersMap.set(user.id, user);
    }
  });
  const allManagers = Array.from(allManagersMap.values());

  const handleOptionChange = (option) => {
    setOnboardingOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleInitialConfirm = () => {
    const [firstName, ...lastNameParts] = candidate?.name?.split(" ") || ["", ""];
    const lastName = lastNameParts.join(" ");

    const data = {
      candidateId: candidate?.candidateId,
      firstName,
      lastName,
      email: candidate?.email,
      phone: candidate?.phone,
      jobId: job?.id,
      position: job?.jobTitle,
      department: job?.department,
      startDate,
      managerId: manager,
      workLocation: location,
      templateId: template,
      status,
      progress: Number.parseInt(progress.toString()) || 0,
      ...onboardingOptions,
    };

    if (customizeTasks) {
      setOnboardingData(data);
      setIsCustomizeDialogOpen(true);
    } else {
      onConfirm(data);
    }
  };

  const handleCustomizationConfirm = (customizedTasks) => {
    onConfirm({ ...onboardingData, tasks: customizedTasks });
    setIsCustomizeDialogOpen(false);
  };

  const selectedTemplate = templates.find(t => t.id.toString() === template);
  const templateTasks = selectedTemplate?.TemplateTaskMaps?.map(taskMap => ({
      ...taskMap.OnboardingTaskTemplate,
      dueDate: taskMap.due_date, // Assuming due_date is what you want to pass
      assignedTo: taskMap.assigned_to_id ? parseInt(taskMap.assigned_to_id, 10) : null, // Ensure integer
  })) || [];

  // Check if this candidate/job is already a new hire
  const isAlreadyNewHire = newHires.some(
    nh => nh.candidateId === candidate?.candidateId && nh.jobId === job?.id
  );

  return (
    <>
      <Dialog open={open && !isCustomizeDialogOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Initiate Onboarding for: {candidate?.name}</DialogTitle>
          </DialogHeader>
          {isAlreadyNewHire && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-center">
              This application has already been converted to a new hire.
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label>Name</label>
              <Input value={candidate?.name || ""} readOnly />
            </div>
            <div>
              <label>Email</label>
              <Input value={candidate?.email || ""} readOnly />
            </div>
            <div>
              <label>Phone</label>
              <Input value={candidate?.phone || ''} readOnly />
            </div>
            <div>
              <label>Position</label>
              <Input value={job?.jobTitle || ""} readOnly />
            </div>
            <div>
              <label>Department</label>
              <Input value={job?.department || ""} readOnly />
            </div>
            <div>
              <label>Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label>Manager</label>
              <Select value={manager} onValueChange={setManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Manager" />
                </SelectTrigger>
                <SelectContent>
                  {allManagers.map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.fullName || m.name || m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Work Location</label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter work location" />
            </div>
          </div>
          <div className="space-y-3 pt-2">
                <Label>Onboarding Options</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox id="sendWelcomeEmail" checked={onboardingOptions.sendWelcomeEmail} onCheckedChange={() => handleOptionChange("sendWelcomeEmail")} />
                    <Label htmlFor="sendWelcomeEmail" className="font-normal cursor-pointer">Send welcome email to new hire</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="scheduleOrientation" checked={onboardingOptions.scheduleOrientation} onCheckedChange={() => handleOptionChange("scheduleOrientation")} />
                    <Label htmlFor="scheduleOrientation" className="font-normal cursor-pointer">Schedule orientation meeting</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="assignBuddy" checked={onboardingOptions.assignBuddy} onCheckedChange={() => handleOptionChange("assignBuddy")} />
                    <Label htmlFor="assignBuddy" className="font-normal cursor-pointer">Assign onboarding buddy</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="prepareWorkspace" checked={onboardingOptions.prepareWorkspace} onCheckedChange={() => handleOptionChange("prepareWorkspace")} />
                    <Label htmlFor="prepareWorkspace" className="font-normal cursor-pointer">Prepare workspace and equipment</Label>
                </div>
            </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleInitialConfirm} disabled={!startDate || !manager || !location || isAlreadyNewHire}>
              Confirm & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isCustomizeDialogOpen && (
          <CustomizeTasksDialog
            open={isCustomizeDialogOpen}
            onOpenChange={setIsCustomizeDialogOpen}
            onConfirm={handleCustomizationConfirm}
            tasks={templateTasks}
            templateName={selectedTemplate?.name}
          />
      )}
    </>
  );
} 