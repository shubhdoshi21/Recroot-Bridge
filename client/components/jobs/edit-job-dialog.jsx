"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/contexts/jobs-context";
import { useCompanies } from "@/contexts/companies-context";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  X,
  Briefcase,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { calculateJobStatus } from "@/lib/jobUtils";

// Add normalization function
const normalizeForComparison = (value) => {
  if (!value) return "";
  return value.toLowerCase().replace(/\s+/g, "-");
};

export function EditJobDialog({ open, onOpenChange, job, onSubmit }) {
  const { jobService } = useJobs();
  const { companies } = useCompanies();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    location: "",
    jobType: "",
    description: "",
    jobStatus: "",
    companyId: "",
    openings: 1,
    salaryMin: "",
    salaryMax: "",
    requiredSkills: [],
    newSkill: "",
    experienceLevel: "entry",
    requirements: "",
    responsibilities: "",
    benefits: "",
    deadline: "",
    workType: "remote",
    postedDate: null,
    applicationStages: [
      {
        name: "Applied",
        order: 1,
        description: "Initial application received",
        requirements: [],
        duration: 1,
      },
      {
        name: "Screening",
        order: 2,
        description: "Resume screening",
        requirements: [],
        duration: 3,
      },
      {
        name: "Interview",
        order: 3,
        description: "Technical interview",
        requirements: [],
        duration: 7,
      },
      {
        name: "Offer",
        order: 4,
        description: "Job offer",
        requirements: [],
        duration: 3,
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openCompanySelect, setOpenCompanySelect] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        jobTitle: job.jobTitle || job.title || "",
        jobType: (job.jobType || job.type || "")
          .toLowerCase()
          .replace(/\s+/g, "-"),
        department: job.department || "",
        location: job.location || "",
        description: job.description || "",
        jobStatus: job.jobStatus || job.status || "active",
        companyId:
          job.companyId !== undefined && job.companyId !== null
            ? String(job.companyId)
            : "",
        openings: job.openings?.toString() || "1",
        salaryMin: job.salaryMin?.toString() || "",
        salaryMax: job.salaryMax?.toString() || "",
        requiredSkills: Array.isArray(job.requiredSkills)
          ? job.requiredSkills.map((skill) =>
            String(skill)
              .replace(/^[\"'\[]+|[\"'\]]+$/g, "")
              .replace(/\\/g, "")
              .trim()
          )
          : typeof job.requiredSkills === "string"
            ? job.requiredSkills
              .split(",")
              .map((skill) =>
                String(skill)
                  .replace(/^[\"'\[]+|[\"'\]]+$/g, "")
                  .replace(/\\/g, "")
                  .trim()
              )
              .filter(Boolean)
            : [],
        newSkill: "",
        experienceLevel: (job.experienceLevel || "entry").toLowerCase(),
        requirements: job.requirements || "",
        responsibilities: job.responsibilities || "",
        benefits: job.benefits || "",
        deadline: job.deadline
          ? new Date(job.deadline).toISOString().split("T")[0]
          : "",
        workType: (job.workType || "remote").toLowerCase(),
        postedDate: job.postedDate || null,
        applicationStages: job.applicationStages
          ? typeof job.applicationStages === "string"
            ? JSON.parse(job.applicationStages)
            : job.applicationStages
          : [
            {
              name: "Applied",
              order: 1,
              description: "Initial application received",
              requirements: [],
              duration: 1,
            },
            {
              name: "Screening",
              order: 2,
              description: "Resume screening",
              requirements: [],
              duration: 3,
            },
            {
              name: "Interview",
              order: 3,
              description: "Technical interview",
              requirements: [],
              duration: 7,
            },
            {
              name: "Offer",
              order: 4,
              description: "Job offer",
              requirements: [],
              duration: 3,
            },
          ],
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name, value) => {
    if (name === "companyId") {
      setFormData((prev) => ({ ...prev, [name]: String(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = Number.parseInt(value, 10);

    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle application stage changes
  const handleStageChange = (index, field, value) => {
    setFormData((prev) => {
      const newStages = [...prev.applicationStages];
      newStages[index] = { ...newStages[index], [field]: value };
      return { ...prev, applicationStages: newStages };
    });
  };

  // Add new application stage
  const handleAddStage = () => {
    setFormData((prev) => ({
      ...prev,
      applicationStages: [
        ...prev.applicationStages,
        {
          name: "",
          order: prev.applicationStages.length + 1,
          description: "",
          requirements: [],
          duration: 1,
        },
      ],
    }));
  };

  // Remove application stage
  const handleRemoveStage = (index) => {
    setFormData((prev) => ({
      ...prev,
      applicationStages: prev.applicationStages
        .filter((_, i) => i !== index)
        .map((stage, i) => ({ ...stage, order: i + 1 })),
    }));
  };

  // Move stage up or down
  const handleMoveStage = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.applicationStages.length - 1)
    )
      return;

    setFormData((prev) => {
      const newStages = [...prev.applicationStages];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      const temp = newStages[index];
      newStages[index] = { ...newStages[newIndex], order: index + 1 };
      newStages[newIndex] = { ...temp, order: newIndex + 1 };
      return { ...prev, applicationStages: newStages };
    });
  };

  const handleAddSkill = () => {
    if (formData.newSkill?.trim()) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, prev.newSkill.trim()],
        newSkill: "",
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields based on Job model
    if (!formData.jobTitle?.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!formData.jobType?.trim()) {
      newErrors.jobType = "Job type is required";
    }

    if (!formData.companyId) {
      newErrors.companyId = "Company is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Job description is required";
    }

    if (!formData.requirements?.trim()) {
      newErrors.requirements = "Requirements are required";
    }

    if (!formData.openings || formData.openings <= 0) {
      newErrors.openings = "Number of openings must be greater than 0";
    }

    // Validate job status
    if (!formData.jobStatus) {
      newErrors.jobStatus = "Job status is required";
    } else if (
      !["new", "active", "closing soon", "closed", "draft"].includes(
        formData.jobStatus
      )
    ) {
      newErrors.jobStatus = "Invalid job status";
    }

    // Validate salary range if either value is provided
    if (formData.salaryMin || formData.salaryMax) {
      const minSalary = Number(formData.salaryMin);
      const maxSalary = Number(formData.salaryMax);

      if (minSalary && maxSalary && minSalary > maxSalary) {
        newErrors.salaryMin =
          "Minimum salary cannot be greater than maximum salary";
      }
    }

    // Validate deadline if provided
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        newErrors.deadline = "Invalid deadline date";
      }
    }

    // Validate application stages
    if (!Array.isArray(formData.applicationStages)) {
      newErrors.applicationStages = "Application stages must be an array";
    } else {
      // Validate each stage
      const stageErrors = formData.applicationStages.some((stage) => {
        return (
          !stage.name ||
          !stage.order ||
          !stage.duration ||
          typeof stage.duration !== "number" ||
          stage.duration < 1
        );
      });

      if (stageErrors) {
        newErrors.applicationStages =
          "Each stage must have a name, order, and valid duration";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted fields",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[EditJobDialog] Starting form submission");
    console.log("[EditJobDialog] Initial form data:", formData);

    if (!validateForm()) {
      console.log("[EditJobDialog] Form validation failed", errors);
      return;
    }

    try {
      setLoading(true);
      const jobStatus = calculateJobStatus(
        formData.deadline,
        formData.postedDate
      );

      const processedData = {
        jobTitle: formData.jobTitle,
        jobType: formData.jobType,
        department: formData.department,
        location: formData.location,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        openings: Number(formData.openings),
        companyId: Number(formData.companyId),
        requiredSkills: formData.requiredSkills,
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : null,
        postedDate: formData.postedDate,
        jobStatus: jobStatus,
        experienceLevel: formData.experienceLevel,
        workType: formData.workType,
        applicationStages: formData.applicationStages
          ? JSON.stringify(formData.applicationStages)
          : JSON.stringify([
            { name: "Applied", order: 1 },
            { name: "Screening", order: 2 },
            { name: "Interview", order: 3 },
            { name: "Offer", order: 4 },
          ]),
      };

      console.log("[EditJobDialog] Processed data to submit:", processedData);
      console.log("[EditJobDialog] Calling onSubmit...");

      await onSubmit(processedData);
      console.log("[EditJobDialog] Submit successful");
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
    } catch (error) {
      console.log("[EditJobDialog] Failed to save job:", error);
      console.log("[EditJobDialog] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      toast({
        title: "Error",
        description: error.message || "Failed to save job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = companies.find(
    (company) => String(company.id) === String(formData.companyId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-blue-200">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Edit Job
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Update the details for this job listing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  error={errors.jobTitle}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500">{errors.jobTitle}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId">Company</Label>
                <Popover
                  open={openCompanySelect}
                  onOpenChange={setOpenCompanySelect}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCompanySelect}
                      className={cn(
                        "w-full justify-between",
                        !formData.companyId && "text-muted-foreground",
                        errors.companyId && "border-red-500"
                      )}
                    >
                      {selectedCompany ? selectedCompany.name : "Select company"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search company..." />
                      <CommandList>
                        <CommandEmpty>No company found.</CommandEmpty>
                        <CommandGroup>
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.name}
                              onSelect={() => {
                                handleSelectChange(
                                  "companyId",
                                  company.id.toString()
                                );
                                setOpenCompanySelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  Number(formData.companyId) ===
                                    Number(company.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {company.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.companyId && (
                  <p className="text-sm text-red-500">{errors.companyId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) => handleSelectChange("jobType", value)}
                >
                  <SelectTrigger
                    className={errors.jobType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
                {errors.jobType && (
                  <p className="text-sm text-red-500">{errors.jobType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  error={errors.department}
                />
                {errors.department && (
                  <p className="text-sm text-red-500">{errors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={errors.location}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workType">Work Type</Label>
                <Select
                  value={formData.workType}
                  onValueChange={(value) => handleSelectChange("workType", value)}
                >
                  <SelectTrigger
                    className={errors.workType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
                {errors.workType && (
                  <p className="text-sm text-red-500">{errors.workType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) =>
                    handleSelectChange("experienceLevel", value)
                  }
                >
                  <SelectTrigger
                    className={errors.experienceLevel ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                {errors.experienceLevel && (
                  <p className="text-sm text-red-500">{errors.experienceLevel}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="openings">Number of Openings</Label>
                <Input
                  id="openings"
                  name="openings"
                  type="number"
                  min="1"
                  value={formData.openings}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum Salary</Label>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  min="0"
                  value={formData.salaryMin}
                  onChange={handleNumberChange}
                  error={errors.salaryMin}
                />
                {errors.salaryMin && (
                  <p className="text-sm text-red-500">{errors.salaryMin}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary</Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  min="0"
                  value={formData.salaryMax}
                  onChange={handleNumberChange}
                  error={errors.salaryMax}
                />
                {errors.salaryMax && (
                  <p className="text-sm text-red-500">{errors.salaryMax}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>
          {/* Compensation & Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Compensation & Details</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[100px]"
                error={errors.description}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">
                Requirements <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Enter job requirements"
                className={cn(errors.requirements && "border-red-500")}
                required
              />
              {errors.requirements && (
                <p className="text-sm text-red-500">{errors.requirements}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </div>
          {/* Skills Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills" className="font-medium">
                Required Skills <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={formData.newSkill}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, newSkill: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter"
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requiredSkills.map((skill, index) => (
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
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {skill}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              {errors.requiredSkills && (
                <p className="text-sm text-red-500">{errors.requiredSkills}</p>
              )}
            </div>
          </div>
          {/* Application Stages Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Application Stages</h3>
            </div>
            <div className="space-y-4">
              {formData.applicationStages.map((stage, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <Input
                          value={stage.name}
                          onChange={(e) =>
                            handleStageChange(index, "name", e.target.value)
                          }
                          placeholder="Stage name"
                          className="w-[200px]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveStage(index, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveStage(index, "down")}
                          disabled={
                            index === formData.applicationStages.length - 1
                          }
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveStage(index)}
                          disabled={formData.applicationStages.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-500">
                          Description
                        </Label>
                        <Textarea
                          value={stage.description}
                          onChange={(e) =>
                            handleStageChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Stage description"
                          className="h-20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-500">
                          Duration (days)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={stage.duration}
                          onChange={(e) =>
                            handleStageChange(
                              index,
                              "duration",
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          {/* Description, Requirements, Responsibilities, Benefits */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[100px]"
                error={errors.description}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">
                Requirements <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Enter job requirements"
                className={cn(errors.requirements && "border-red-500")}
                required
              />
              {errors.requirements && (
                <p className="text-sm text-red-500">{errors.requirements}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="pt-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 transition-all duration-200"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
