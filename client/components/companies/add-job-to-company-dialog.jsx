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
import {
  Check,
  ChevronsUpDown,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Loader2,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/components/ui/use-toast";
import { calculateJobStatus } from "@/lib/jobUtils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCompanies } from "@/contexts/companies-context";

// Add normalization function
const normalizeForComparison = (value) => {
  if (!value) return "";
  return value.toLowerCase().replace(/\s+/g, "-");
};

export function AddJobToCompanyDialog({ open, onOpenChange, company }) {
  const { toast } = useToast();
  const { addCompanyJob } = useCompanies();
  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    location: "",
    jobType: "",
    description: "",
    openings: "1",
    salaryMin: "",
    salaryMax: "",
    requiredSkills: [],
    newSkill: "",
    experienceLevel: "entry",
    requirements: "",
    responsibilities: "",
    benefits: "",
    deadline: "",
    workType: "onsite",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
    const numValue = Number.parseInt(value);

    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));

      // Clear error when field is edited
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (formData.newSkill?.trim()) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, prev.newSkill.trim()],
        newSkill: "",
      }));
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  // Format salary for display in INR
  const formatSalary = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle salary input change
  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    const numValue = value.replace(/[^0-9]/g, "");

    if (numValue === "" || !isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));

      // Clear error when field is edited
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Handle salary input blur
  const handleSalaryBlur = (name) => {
    const value = formData[name];
    const numValue = Number(value);

    if (value && !isNaN(numValue)) {
      // Validate min/max relationship
      if (
        name === "salaryMin" &&
        formData.salaryMax &&
        numValue > Number(formData.salaryMax)
      ) {
        setErrors((prev) => ({
          ...prev,
          salaryMin: "Minimum salary cannot be greater than maximum salary",
        }));
      } else if (
        name === "salaryMax" &&
        formData.salaryMin &&
        numValue < Number(formData.salaryMin)
      ) {
        setErrors((prev) => ({
          ...prev,
          salaryMax: "Maximum salary cannot be less than minimum salary",
        }));
      }

      // Validate minimum values
      if (numValue < 10000) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Salary must be at least ₹10,000",
        }));
      }
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

  const validateForm = () => {
    const errors = {};

    // Job Title validation
    if (!formData.jobTitle?.trim()) {
      errors.jobTitle = "Job title is required";
    }

    // Department validation
    if (!formData.department?.trim()) {
      errors.department = "Department is required";
    }

    // Location validation
    if (!formData.location?.trim()) {
      errors.location = "Location is required";
    }

    // Job Type validation
    if (!formData.jobType?.trim()) {
      errors.jobType = "Job type is required";
    }

    // Description validation
    if (!formData.description?.trim()) {
      errors.description = "Job description is required";
    }

    // Work Type validation
    if (!formData.workType?.trim()) {
      errors.workType = "Work type is required";
    }

    // Required Skills validation
    if (
      !Array.isArray(formData.requiredSkills) ||
      formData.requiredSkills.length === 0
    ) {
      errors.requiredSkills = "At least one required skill is needed";
    }

    // Salary validation
    if (!formData.salaryMin && !formData.salaryMax) {
      errors.salaryMin = "Salary range is required";
    } else {
      const minSalary = Number(formData.salaryMin);
      const maxSalary = Number(formData.salaryMax);

      if (formData.salaryMin && isNaN(minSalary)) {
        errors.salaryMin = "Minimum salary must be a valid number";
      } else if (formData.salaryMin && minSalary < 10000) {
        errors.salaryMin = "Minimum salary must be at least ₹10,000";
      }

      if (formData.salaryMax && isNaN(maxSalary)) {
        errors.salaryMax = "Maximum salary must be a valid number";
      }

      if (formData.salaryMin && formData.salaryMax && minSalary > maxSalary) {
        errors.salaryMin =
          "Minimum salary cannot be greater than maximum salary";
      }
    }

    // Openings validation
    if (!formData.openings) {
      errors.openings = "Number of openings is required";
    } else {
      const openings = Number(formData.openings);
      if (isNaN(openings)) {
        errors.openings = "Number of openings must be a valid number";
      } else if (openings < 1) {
        errors.openings = "Number of openings must be at least 1";
      }
    }

    // Experience Level validation
    if (!formData.experienceLevel?.trim()) {
      errors.experienceLevel = "Experience level is required";
    }

    // Requirements validation
    if (!formData.requirements?.trim()) {
      errors.requirements = "Job requirements are required";
    }

    // Responsibilities validation
    if (!formData.responsibilities?.trim()) {
      errors.responsibilities = "Job responsibilities are required";
    }

    // Benefits validation
    if (!formData.benefits?.trim()) {
      errors.benefits = "Job benefits are required";
    }

    // Application Stages validation
    if (
      !Array.isArray(formData.applicationStages) ||
      formData.applicationStages.length === 0
    ) {
      errors.applicationStages = "At least one application stage is required";
    } else {
      formData.applicationStages.forEach((stage, index) => {
        if (!stage.name?.trim()) {
          errors[`stage_${index}_name`] = "Stage name is required";
        }
        if (!stage.description?.trim()) {
          errors[`stage_${index}_description`] =
            "Stage description is required";
        }
        if (!stage.duration || stage.duration < 1) {
          errors[`stage_${index}_duration`] =
            "Stage duration must be at least 1 day";
        }
      });
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");

    if (isSubmitting) {
      console.log("Already submitting, preventing double submission");
      return;
    }

    const validationErrors = validateForm();
    console.log("Validation errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Show toasts for each validation error
      Object.entries(validationErrors).forEach(([field, error], index) => {
        setTimeout(() => {
          toast({
            title: "Validation Error",
            description: error,
            variant: "destructive",
          });
        }, index * 100);
      });

      return;
    }

    if (!company?.id) {
      console.log("Company information is missing");
      toast({
        title: "Error",
        description: "Company information is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Submitting job with data:", formData);

      const jobData = {
        ...formData,
        companyId: company.id,
        openings: Number(formData.openings),
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        deadline: formData.deadline || null,
        jobStatus: calculateJobStatus(formData.deadline),
        ...(calculateJobStatus(formData.deadline) !== "draft" && {
          postedDate: new Date().toISOString(),
        }),
      };

      const response = await addCompanyJob(company.id, jobData);
      console.log("Job creation response:", response);

      if (response && response.id) {
        toast({
          title: "Success",
          description: "Job posted successfully",
          variant: "default",
        });

        // Reset form and close dialog
        setFormData({
          jobTitle: "",
          department: "",
          location: "",
          jobType: "",
          description: "",
          openings: "1",
          salaryMin: "",
          salaryMax: "",
          requiredSkills: [],
          newSkill: "",
          experienceLevel: "entry",
          requirements: "",
          responsibilities: "",
          benefits: "",
          deadline: "",
          workType: "onsite",
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
        setErrors({});
        onOpenChange(false);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.log("Error creating job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 px-6 py-5 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Post New Job</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Fill in the details to create a new job listing for{" "}
                <span className="font-semibold text-blue-600">{company?.name}</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label className="font-medium">Company</Label>
            <Input
              value={company?.name || ""}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="font-medium">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                className={cn(errors.jobTitle && "border-red-500")}
                required
              />
              {errors.jobTitle && (
                <p className="text-sm text-red-500">{errors.jobTitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobType" className="font-medium">
                Job Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.jobType}
                onValueChange={(value) => handleSelectChange("jobType", value)}
              >
                <SelectTrigger id="jobType">
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="font-medium">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleSelectChange("department", value)
                }
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
                  <SelectItem value="Data">Data</SelectItem>
                  <SelectItem value="Customer Support">
                    Customer Support
                  </SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-medium">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote, New York, NY, etc."
                className={cn(errors.location && "border-red-500")}
                required
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openings" className="font-medium">
                Number of Openings <span className="text-red-500">*</span>
              </Label>
              <Input
                id="openings"
                name="openings"
                type="number"
                min="1"
                value={formData.openings}
                onChange={handleNumberChange}
                placeholder="e.g. 1"
                className={cn(errors.openings && "border-red-500")}
                required
              />
              {errors.openings && (
                <p className="text-sm text-red-500">{errors.openings}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel" className="font-medium">
                Experience Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) =>
                  handleSelectChange("experienceLevel", value)
                }
              >
                <SelectTrigger
                  id="experienceLevel"
                  className={cn(errors.experienceLevel && "border-red-500")}
                >
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="lead">Lead Level</SelectItem>
                  <SelectItem value="executive">Executive Level</SelectItem>
                </SelectContent>
              </Select>
              {errors.experienceLevel && (
                <p className="text-sm text-red-500">{errors.experienceLevel}</p>
              )}
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter job description..."
              className={cn(
                "min-h-[120px]",
                errors.description && "border-red-500"
              )}
              required
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements" className="font-medium">
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
            <Label htmlFor="responsibilities" className="font-medium">
              Responsibilities <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="responsibilities"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="Enter job responsibilities"
              className={cn(
                "min-h-[120px]",
                errors.responsibilities && "border-red-500"
              )}
              required
            />
            {errors.responsibilities && (
              <p className="text-sm text-red-500">{errors.responsibilities}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits" className="font-medium">
              Benefits <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="Enter job benefits"
              className={cn(
                "min-h-[120px]",
                errors.benefits && "border-red-500"
              )}
              required
            />
            {errors.benefits && (
              <p className="text-sm text-red-500">{errors.benefits}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="font-medium">
                Application Deadline
              </Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline || ""}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workType" className="font-medium">
                Work Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.workType}
                onValueChange={(value) => handleSelectChange("workType", value)}
              >
                <SelectTrigger id="workType">
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="hybrid-flexible">
                    Hybrid (Flexible)
                  </SelectItem>
                  <SelectItem value="remote-occasional">
                    Remote (Occasional Office Visits)
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.workType && (
                <p className="text-sm text-red-500">{errors.workType}</p>
              )}
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-4">
            <Label className="font-medium">Salary Range (INR)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin" className="text-sm text-gray-500">
                  Minimum Salary
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <Input
                    id="salaryMin"
                    name="salaryMin"
                    type="text"
                    value={formData.salaryMin || ""}
                    onChange={handleSalaryChange}
                    onBlur={() => handleSalaryBlur("salaryMin")}
                    className={cn("pl-7", errors.salaryMin && "border-red-500")}
                    placeholder="e.g. 300000"
                  />
                </div>
                {errors.salaryMin && (
                  <p className="text-sm text-red-500">{errors.salaryMin}</p>
                )}
                {formData.salaryMin && !errors.salaryMin && (
                  <p className="text-sm text-gray-500">
                    {formatSalary(Number(formData.salaryMin))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax" className="text-sm text-gray-500">
                  Maximum Salary
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <Input
                    id="salaryMax"
                    name="salaryMax"
                    type="text"
                    value={formData.salaryMax || ""}
                    onChange={handleSalaryChange}
                    onBlur={() => handleSalaryBlur("salaryMax")}
                    className={cn("pl-7", errors.salaryMax && "border-red-500")}
                    placeholder="e.g. 500000"
                  />
                </div>
                {errors.salaryMax && (
                  <p className="text-sm text-red-500">{errors.salaryMax}</p>
                )}
                {formData.salaryMax && !errors.salaryMax && (
                  <p className="text-sm text-gray-500">
                    {formatSalary(Number(formData.salaryMax))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Application Stages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Application Stages</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStage}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Stage
              </Button>
            </div>
            {errors.applicationStages && (
              <p className="text-sm text-red-500">{errors.applicationStages}</p>
            )}
            <div className="space-y-4">
              {formData.applicationStages.map((stage, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div className="space-y-1">
                          <Input
                            value={stage.name}
                            onChange={(e) =>
                              handleStageChange(index, "name", e.target.value)
                            }
                            placeholder="Stage name"
                            className={cn(
                              "w-[200px]",
                              errors[`stage_${index}_name`] && "border-red-500"
                            )}
                          />
                          {errors[`stage_${index}_name`] && (
                            <p className="text-sm text-red-500">
                              {errors[`stage_${index}_name`]}
                            </p>
                          )}
                        </div>
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
                          className={cn(
                            "h-20",
                            errors[`stage_${index}_description`] &&
                            "border-red-500"
                          )}
                        />
                        {errors[`stage_${index}_description`] && (
                          <p className="text-sm text-red-500">
                            {errors[`stage_${index}_description`]}
                          </p>
                        )}
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
                          className={cn(
                            errors[`stage_${index}_duration`] &&
                            "border-red-500"
                          )}
                        />
                        {errors[`stage_${index}_duration`] && (
                          <p className="text-sm text-red-500">
                            {errors[`stage_${index}_duration`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="pt-2 text-sm text-muted-foreground">
            <p>
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => console.log("Submit button clicked")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting Job...
                </>
              ) : (
                "Post Job"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
