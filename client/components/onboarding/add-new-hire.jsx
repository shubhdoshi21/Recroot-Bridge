"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { candidateService } from "@/services/candidateService";
import { initiateOnboarding } from "@/services/onboardingService";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useSettings } from "@/contexts/settings-context";
import { useTeams } from "@/contexts/teams-context";
import { Check } from "lucide-react";

export function AddNewHire({ onSuccess, mode }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    startDate: "",
    manager: "",
    workLocation: "",
    status: "not-started",
    progress: 0,
  });

  const [errors, setErrors] = useState({});

  // Final-stage mode state
  const [finalStageCandidates, setFinalStageCandidates] = useState([]);
  const [loadingFinalStage, setLoadingFinalStage] = useState(false);
  const [finalStageError, setFinalStageError] = useState("");
  const [selectedFinalStage, setSelectedFinalStage] = useState(null);
  const { newHires, refreshNewHires } = useOnboarding();

  const { users } = useSettings();
  const { teams } = useTeams();
  const managersByRole = users?.filter(u => u.role === "manager") || [];
  const allManagersMap = new Map();
  [...managersByRole].forEach(user => {
    if (user && user.id) {
      allManagersMap.set(user.id, user);
    }
  });
  const allManagers = Array.from(allManagersMap.values());

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch final-stage candidates if in final-stage mode
  useEffect(() => {
    if (mode === "final-stage") {
      setLoadingFinalStage(true);
      setFinalStageError("");
      candidateService.getFinalStageCandidates()
        .then(res => {
          if (res.error) setFinalStageError(res.error);
          else setFinalStageCandidates(res.data);
        })
        .catch(err => setFinalStageError(err.message || "Failed to fetch candidates"))
        .finally(() => setLoadingFinalStage(false));
    }
  }, [mode]);

  // Pre-fill form when a final-stage candidate is selected
  useEffect(() => {
    if (mode === "final-stage" && selectedFinalStage) {
      setFormData({
        firstName: selectedFinalStage.candidateName?.split(" ")[0] || "",
        lastName: selectedFinalStage.candidateName?.split(" ").slice(1).join(" ") || "",
        email: selectedFinalStage.candidateEmail || "",
        position: selectedFinalStage.jobTitle || "",
        department: selectedFinalStage.jobDepartment || "",
        startDate: "",
        phone: selectedFinalStage.candidatePhone || "",
        manager: "",
        workLocation: selectedFinalStage.jobLocation || "",
        status: "not-started",
        progress: 0,
      });
    }
  }, [mode, selectedFinalStage]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "final-stage" && !selectedFinalStage) {
      alert("Please select a candidate/job to onboard.");
      return;
    }

    // Validate form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.position ||
      !formData.department ||
      !formData.startDate ||
      !formData.manager
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newHireData = {
        candidateId: selectedFinalStage?.candidateId,
        jobId: selectedFinalStage?.jobId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        startDate: formData.startDate,
        managerId: formData.manager,
        workLocation: formData.workLocation,
        status: formData.status,
        progress: Number.parseInt(formData.progress.toString()) || 0,
      };
      await initiateOnboarding(newHireData);
      refreshNewHires();
      onSuccess(newHireData);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        startDate: "",
        manager: "",
        workLocation: "",
        status: "not-started",
        progress: 0,
      });
    } catch (error) {
      console.log("Error adding new hire:", error);
      alert(error.message || "There was an error adding the new hire. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "final-stage") {
    // Filter out candidates who are already new hires (by candidateId and jobId)
    const filteredFinalStageCandidates = finalStageCandidates.filter(c =>
      !newHires.some(nh => nh.candidateId === c.candidateId && nh.jobId === c.jobId)
    );

    const renderAppOption = (c, variant = "dropdown") => (
      <div className={`flex items-center gap-3 py-2 ${variant === "card" ? "px-2" : ""} w-full`}> 
        <div className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold${variant === "card" ? " w-12 h-12 text-lg bg-blue-200 text-blue-800" : " w-8 h-8 text-base bg-blue-100 text-blue-700 ml-6"}`}>
          {c.candidateName?.split(" ").map(n => n[0]).join("") || "?"}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className={`truncate ${variant === "card" ? "font-bold text-base" : "font-medium text-sm"}`}>{c.candidateName}</span>
          <span className={`truncate ${variant === "card" ? "text-sm" : "text-xs text-gray-500"}`}>{c.candidateEmail}</span>
          <span className={`truncate ${variant === "card" ? "text-sm" : "text-xs text-gray-600"}`}>Job: {c.jobTitle} <span className="text-gray-400">({c.jobDepartment})</span></span>
          <span className={`truncate ${variant === "card" ? "text-blue-700 font-semibold" : "text-xs text-blue-600"}`}>Stage: {c.finalStageName}</span>
        </div>
        {/* {variant === "dropdown" && selectedFinalStage?.applicationId === c.applicationId && (
          <span className="ml-auto flex items-center">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600 shadow-sm">
              <Check className="w-5 h-5" />
            </span>
          </span>
        )} */}
        {variant === "card" && selectedFinalStage?.applicationId === c.applicationId && (
          <span className="ml-auto text-green-600">
            <Check className="w-5 h-5" />
          </span>
        )}
      </div>
    );

    return (
      <div>
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded px-4 py-2 text-sm mb-3">
            Select a candidate and job application to onboard. Only candidates in the final stage are shown.
          </div>
          {filteredFinalStageCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="2" fill="#f8fafc" /><path d="M8 12h8M12 8v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" /></svg>
              <div className="mt-2 text-base">No candidates in the final stage are available for onboarding.</div>
            </div>
          ) : filteredFinalStageCandidates.length === 1 ?
            (!isDropdownOpen && (
              <>
                <div className="text-xs text-gray-500 mb-1 ml-1">Selected Application:</div>
                <div className="border rounded-lg shadow-sm p-4 flex items-center gap-4 bg-white mb-2">
                  {renderAppOption(filteredFinalStageCandidates[0], "card")}
                </div>
                {!selectedFinalStage && (
                  <Button className="mb-4" onClick={() => setSelectedFinalStage(filteredFinalStageCandidates[0])}>
                    Select
                  </Button>
                )}
              </>
            ))
            : (
              <>
                <Select
                  id="applicationSelect"
                  value={selectedFinalStage?.applicationId?.toString() || ""}
                  onValueChange={val => {
                    const found = filteredFinalStageCandidates.find(c => c.applicationId.toString() === val);
                    setSelectedFinalStage(found);
                  }}
                  onOpenChange={setIsDropdownOpen}
                >
                  <SelectTrigger className="bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-3 min-h-[48px] flex items-center focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all mb-8">
                    <span className="text-base text-gray-700">
                      {selectedFinalStage
                        ? `${selectedFinalStage.candidateName} - ${selectedFinalStage.jobTitle} (${selectedFinalStage.jobDepartment})`
                        : <span className="text-gray-400">Choose application to onboard</span>}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg rounded-lg border border-gray-100 mt-2 p-0">
                    {filteredFinalStageCandidates.map((c, idx) => (
                      <SelectItem
                        key={c.applicationId}
                        value={c.applicationId.toString()}
                        className="!p-0 group"
                      >
                        <div className={
                          `flex items-center px-4 py-2 transition-colors rounded-none group-hover:bg-blue-50 group-hover:text-blue-900 ${selectedFinalStage?.applicationId === c.applicationId ? "border-l-4 border-blue-500 bg-blue-50" : ""}`
                        }>
                          {renderAppOption(c, "dropdown")}
                        </div>
                        {idx < filteredFinalStageCandidates.length - 1 && <div className="border-b border-gray-100 mx-4" />}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFinalStage && !isDropdownOpen && (
                  <>
                    <div className="text-xs text-gray-500 mb-1 ml-1">Selected Application:</div>
                    <div className="border rounded-lg shadow-sm p-4 flex items-center gap-4 bg-white mb-2">
                      {renderAppOption(selectedFinalStage, "card")}
                    </div>
                  </>
                )}
              </>
            )}
        </div>
        {selectedFinalStage && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Candidate Details */}
            <div className="bg-gray-50 rounded p-4 mb-2">
              <h4 className="font-semibold text-sm mb-3 text-gray-700">Candidate Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={formData.firstName} readOnly disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={formData.lastName} readOnly disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={formData.email} readOnly disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={formData.phone} readOnly disabled className="bg-gray-100" />
                </div>
              </div>
            </div>
            {/* Job Details */}
            <div className="bg-gray-50 rounded p-4 mb-2">
              <h4 className="font-semibold text-sm mb-3 text-gray-700">Job Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Job Title</Label>
                  <Input value={formData.position} readOnly disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={formData.department} readOnly disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Work Location</Label>
                  <Input value={formData.workLocation} readOnly disabled className="bg-gray-100" />
                </div>
              </div>
            </div>
            {/* Onboarding Details */}
            <div className="bg-gray-50 rounded p-4 mb-2">
              <h4 className="font-semibold text-sm mb-3 text-gray-700">Onboarding Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input id="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="manager">Manager *</Label>
                  <Select id="manager" value={formData.manager} onValueChange={value => setFormData(prev => ({ ...prev, manager: value }))}>
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
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => setSelectedFinalStage(null)}>
                Close
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedFinalStage}>
                {isSubmitting ? "Onboarding..." : "Initiate Onboarding"}
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData({ ...formData, phone: value });
            }}
            placeholder="Enter 10-digit phone number"
            className={cn(errors.phone && "border-red-500")}
            maxLength={10}
            pattern="[0-9]*"
            inputMode="numeric"
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Position *</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Enter job title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleSelectChange("department", value)}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Human Resources">Human Resources</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manager">Manager *</Label>
        <Select id="manager" value={formData.manager} onValueChange={value => setFormData(prev => ({ ...prev, manager: value }))}>
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

      <div className="space-y-2">
        <Label htmlFor="workLocation">Work Location</Label>
        <Input id="workLocation" value={formData.workLocation} onChange={handleChange} placeholder="Enter work location" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="progress">Onboarding Progress (%)</Label>
        <Input
          id="progress"
          type="number"
          min="0"
          max="100"
          value={formData.progress}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-3 pt-2">
        <Label>Onboarding Options</Label>

        <div className="flex items-center space-x-2">
          <Checkbox id="send-welcome" defaultChecked />
          <Label htmlFor="send-welcome" className="text-sm">
            Send welcome email
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="create-accounts" defaultChecked />
          <Label htmlFor="create-accounts" className="text-sm">
            Create accounts automatically
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="assign-buddy" />
          <Label htmlFor="assign-buddy" className="text-sm">
            Assign onboarding buddy
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="standard-checklist" defaultChecked />
          <Label htmlFor="standard-checklist" className="text-sm">
            Use standard onboarding checklist
          </Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding...
            </>
          ) : (
            "Add New Hire"
          )}
        </Button>
      </div>
    </form>
  );
}
