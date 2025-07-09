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
import { useJobs } from "@/contexts/jobs-context";
import { useCompanies } from "@/contexts/companies-context";
import { useMatching } from "@/contexts/matching-context";
import {
  Check,
  ChevronsUpDown,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  AlertCircle,
  Briefcase,
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
import { toast } from "sonner";
import { calculateJobStatus } from "@/lib/jobUtils";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

// Add options arrays
const departmentOptions = [
  { id: "Engineering", label: "Engineering" },
  { id: "Product", label: "Product" },
  { id: "Design", label: "Design" },
  { id: "Marketing", label: "Marketing" },
  { id: "Sales", label: "Sales" },
  { id: "Human-Resources", label: "Human Resources" },
  { id: "Finance", label: "Finance" },
  { id: "operatOperationsions", label: "Operations" },
  { id: "Customer-Support", label: "Customer Support" },
  { id: "Information Technology", label: "Information Technology" },
  { id: "Legal", label: "Legal" },
  { id: "Research&Development", label: "Research & Development" },
];

const jobTypeOptions = [
  { id: "Full-Time", label: "Full Time" },
  { id: "Part-Time", label: "Part Time" },
  { id: "Contract", label: "Contract" },
  { id: "Internship", label: "Internship" },
  { id: "Freelance", label: "Freelance" },
  { id: "Temporary", label: "Temporary" },
];

const locationOptions = [
  { id: "Bangalore", label: "Bangalore" },
  { id: "Mumbai", label: "Mumbai" },
  { id: "Delhi", label: "Delhi" },
  { id: "Hyderabad", label: "Hyderabad" },
  { id: "Chennai", label: "Chennai" },
  { id: "Pune", label: "Pune" },
  { id: "Kolkata", label: "Kolkata" },
  { id: "Ahmedabad", label: "Ahmedabad" },
  { id: "Remote", label: "Remote" },
];

// Add normalization function
const normalizeForComparison = (value) => {
  if (!value) return "";
  return value.toLowerCase().replace(/\s+/g, "-");
};

export function AddJobDialog({ isOpen, onClose, initialData = null }) {
  const { addJob } = useJobs();
  const { companies } = useCompanies();
  const { refreshJobs } = useMatching();
  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    location: "",
    jobType: "",
    description: "",
    companyId: "",
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
  const [openCompanySelect, setOpenCompanySelect] = useState(false);

  // If initialData is provided, merge it with the default state
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        jobTitle: initialData.jobTitle || initialData.title || "",
        jobType: initialData.jobType || initialData.type || "",
        requiredSkills: Array.isArray(initialData.requiredSkills)
          ? initialData.requiredSkills
          : [],
        salaryMin: initialData.salaryMin?.toString() || "",
        salaryMax: initialData.salaryMax?.toString() || "",
        openings: initialData.openings?.toString() || "1",
        applicationStages: initialData.applicationStages
          ? typeof initialData.applicationStages === "string"
            ? JSON.parse(initialData.applicationStages)
            : initialData.applicationStages
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
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited-1
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

  const handleCompanySelect = (companyId) => {
    setFormData((prev) => ({ ...prev, companyId }));
    setOpenCompanySelect(false);

    // Clear error when field is edited
    if (errors.companyId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.companyId;
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

    if (!formData.jobTitle?.trim()) {
      errors.jobTitle = "Job title is required";
    }

    if (!formData.department?.trim()) {
      errors.department = "Department is required";
    }

    if (!formData.location?.trim()) {
      errors.location = "Location is required";
    }

    if (!formData.jobType?.trim()) {
      errors.jobType = "Job type is required";
    }

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.companyId) {
      errors.companyId = "Company is required";
    }

    if (!formData.workType?.trim()) {
      errors.workType = "Work type is required";
    }

    if (
      !Array.isArray(formData.requiredSkills) ||
      formData.requiredSkills.length === 0
    ) {
      errors.requiredSkills = "At least one required skill is needed";
    }

    if (formData.salaryMin && formData.salaryMax) {
      const minSalary = Number(formData.salaryMin);
      const maxSalary = Number(formData.salaryMax);

      if (isNaN(minSalary) || isNaN(maxSalary)) {
        errors.salaryMin = "Salary must be a valid number";
      } else if (minSalary > maxSalary) {
        errors.salaryMin =
          "Minimum salary cannot be greater than maximum salary";
      } else if (minSalary < 10000) {
        errors.salaryMin = "Minimum salary must be at least ₹10,000";
      }
    } else {
      errors.salaryMin = "Both minimum and maximum salary are required";
    }

    if (!formData.responsibilities?.trim()) {
      errors.responsibilities = "Responsibilities are required";
    }

    if (!formData.benefits?.trim()) {
      errors.benefits = "Benefits are required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const jobData = {
        jobTitle: formData.jobTitle,
        department: formData.department,
        location: formData.location,
        jobType: formData.jobType,
        description: formData.description,
        companyId: Number(formData.companyId),
        openings: Number(formData.openings),
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        requiredSkills: formData.requiredSkills,
        experienceLevel: formData.experienceLevel,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits,
        deadline: formData.deadline || null,
        workType: formData.workType,
        jobStatus: calculateJobStatus(formData.deadline),
        applicationStages: formData.applicationStages,
      };

      console.log("Submitting job data:", jobData);
      await addJob(jobData);

      toast({
        title: "Success",
        description: "Job posted successfully",
      });

      // Refresh jobs in the matching context to update dropdown
      try {
        await refreshJobs();
        console.log("Jobs refreshed in matching context");
      } catch (refreshError) {
        console.log("Error refreshing jobs in matching context:", refreshError);
        // Don't show toast for this error as it's not critical
      }

      onClose();
      resetForm();
    } catch (error) {
      console.log("Error adding job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      department: "",
      location: "",
      jobType: "",
      description: "",
      companyId: "",
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
  };

  const selectedCompany =
    formData.companyId !== ""
      ? companies.find(
        (company) => Number(company.id) === Number(formData.companyId)
      )
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-blue-200">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {initialData ? "Edit Job" : "Add New Job"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {initialData
                  ? "Update the details for this job listing."
                  : "Fill in the details to create a new job listing."}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="font-semibold text-gray-700">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Developer"
                  className={cn(
                    "bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400",
                    errors.jobTitle && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  required
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.jobTitle}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType" className="font-semibold text-gray-700">
                  Job Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) => handleSelectChange("jobType", value)}
                >
                  <SelectTrigger
                    id="jobType"
                    className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  >
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200">
                    {jobTypeOptions.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="font-semibold text-gray-700">
                Company <span className="text-red-500">*</span>
              </Label>
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
                      "w-full justify-between bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 focus:border-blue-400 focus:ring-blue-400",
                      !selectedCompany && "text-muted-foreground",
                      errors.companyId && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  >
                    {selectedCompany ? selectedCompany.name : "Select company..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-white/95 backdrop-blur-sm border-blue-200">
                  <Command>
                    <CommandInput placeholder="Search company..." className="border-b border-gray-200" />
                    <CommandList>
                      <CommandEmpty>No company found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {companies.map((company) => (
                          <CommandItem
                            key={company.id}
                            value={company.name}
                            onSelect={() =>
                              handleCompanySelect(Number(company.id))
                            }
                            className="hover:bg-blue-50 cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCompany?.id === company.id
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
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.companyId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="font-semibold text-gray-700">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }
                >
                  <SelectTrigger
                    id="department"
                    className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200">
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="font-semibold text-gray-700">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleSelectChange("location", value)}
                >
                  <SelectTrigger
                    id="location"
                    className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  >
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200">
                    {locationOptions.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Compensation & Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Compensation & Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openings" className="font-semibold text-gray-700">
                  Number of Openings <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="openings"
                  name="openings"
                  type="number"
                  min="1"
                  value={formData.openings}
                  onChange={handleNumberChange}
                  className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMin" className="font-semibold text-gray-700">
                  Minimum Salary
                </Label>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleSalaryChange}
                  onBlur={() => handleSalaryBlur("salaryMin")}
                  placeholder="₹0"
                  className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax" className="font-semibold text-gray-700">
                  Maximum Salary
                </Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleSalaryChange}
                  onBlur={() => handleSalaryBlur("salaryMax")}
                  placeholder="₹0"
                  className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel" className="font-semibold text-gray-700">
                  Experience Level
                </Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) =>
                    handleSelectChange("experienceLevel", value)
                  }
                >
                  <SelectTrigger
                    id="experienceLevel"
                    className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  >
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200">
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workType" className="font-semibold text-gray-700">
                  Work Type
                </Label>
                <Select
                  value={formData.workType}
                  onValueChange={(value) =>
                    handleSelectChange("workType", value)
                  }
                >
                  <SelectTrigger
                    id="workType"
                    className="bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  >
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200">
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold text-gray-700">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter job description..."
              className={cn(
                "min-h-[120px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400",
                errors.description && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              required
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements" className="font-semibold text-gray-700">
              Requirements <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Enter job requirements"
              className={cn(
                "min-h-[120px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400",
                errors.requirements && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              required
            />
            {errors.requirements && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.requirements}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibilities" className="font-semibold text-gray-700">
              Responsibilities <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="responsibilities"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="Enter job responsibilities"
              className={cn(
                "min-h-[120px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400",
                errors.responsibilities && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              required
            />
            {errors.responsibilities && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.responsibilities}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits" className="font-semibold text-gray-700">
              Benefits <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="Enter job benefits"
              className={cn(
                "min-h-[120px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400",
                errors.benefits && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              required
            />
            {errors.benefits && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.benefits}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="font-semibold text-gray-700">
              Application Deadline
            </Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline || ""}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className={cn(
                "bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400",
                errors.deadline && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.deadline && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.deadline}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="font-semibold text-gray-700">
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
                  className={cn(
                    "bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400",
                    errors.newSkill && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
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
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.requiredSkills}
                </p>
              )}
            </div>
          </div>

          {/* Application Stages */}
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

          <div className="pt-2 text-sm text-muted-foreground">
            <p>
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? initialData
                  ? "Saving..."
                  : "Posting..."
                : initialData
                  ? "Save Changes"
                  : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
