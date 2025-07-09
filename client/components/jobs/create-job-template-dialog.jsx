"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Info, DollarSign, ListChecks, Users, Briefcase } from "lucide-react";

export function CreateJobTemplateDialog({
  isOpen,
  onClose,
  onSaveTemplate,
  templateToEdit = null,
  isEditing = false,
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    department: "Engineering",
    type: "Full-time",
    openings: 1,
    salaryMin: 50000,
    salaryMax: 100000,
    requiredSkills: "",
    experienceLevel: "Mid-Level",
    workType: "onsite",
  });

  // Initialize form with template data if editing
  useEffect(() => {
    if (templateToEdit && isEditing) {
      setFormData({
        ...templateToEdit,
        jobTitle: templateToEdit.jobTitle || templateToEdit.title || "",
        type: templateToEdit.type || templateToEdit.jobType || "",
        description:
          templateToEdit.description || templateToEdit.jobDescription || "",
        requirements: templateToEdit.requirements || "",
        responsibilities: templateToEdit.responsibilities || "",
        benefits: templateToEdit.benefits || "",
        workType: templateToEdit.workType || "onsite",
      });
    }
  }, [templateToEdit, isEditing, isOpen]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen && !isEditing) {
      setFormData({
        name: "",
        jobTitle: "",
        description: "",
        requirements: "",
        responsibilities: "",
        benefits: "",
        department: "Engineering",
        type: "Full-time",
        openings: 1,
        salaryMin: 50000,
        salaryMax: 100000,
        requiredSkills: "",
        experienceLevel: "Mid-Level",
        workType: "onsite",
      });
      setErrors({});
      setPreviewMode(false);
      setActiveTab("basic");
    }
  }, [isOpen, isEditing]);

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

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = Number.parseInt(value, 10);

    if (!isNaN(numValue)) {
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

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name?.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.jobTitle?.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Job description is required";
    }

    if (!formData.requirements?.trim()) {
      newErrors.requirements = "Job requirements are required";
    }

    if (!formData.requiredSkills?.trim()) {
      newErrors.requiredSkills = "Required skills are required";
    }

    // Numeric validations
    if (
      formData.salaryMin &&
      formData.salaryMax &&
      formData.salaryMin > formData.salaryMax
    ) {
      newErrors.salaryMin =
        "Minimum salary cannot be greater than maximum salary";
    }

    if (formData.openings && formData.openings < 1) {
      newErrors.openings = "Number of openings must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the handleSubmit function to improve the template creation process
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Find the first tab with an error and switch to it
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const basicFields = ["name", "jobTitle", "department", "type"];
        const detailsFields = [
          "description",
          "requiredSkills",
          "experienceLevel",
          "requirements",
        ];
        const compensationFields = ["openings", "salaryMin", "salaryMax"];

        if (errorFields.some((field) => basicFields.includes(field))) {
          setActiveTab("basic");
        } else if (errorFields.some((field) => detailsFields.includes(field))) {
          setActiveTab("details");
        } else if (
          errorFields.some((field) => compensationFields.includes(field))
        ) {
          setActiveTab("compensation");
        }
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Create new template object (let backend assign id for new templates)
    const newTemplate = {
      ...(templateToEdit?.id ? { id: templateToEdit.id } : {}),
      name: formData.name || "",
      jobTitle: formData.jobTitle || "",
      description: formData.description || "",
      requirements: formData.requirements || "",
      responsibilities: formData.responsibilities || "",
      benefits: formData.benefits || "",
      department: formData.department || "Engineering",
      jobType: formData.type || "Full-time",
      openings: formData.openings || 1,
      salaryMin: formData.salaryMin || 50000,
      salaryMax: formData.salaryMax || 100000,
      requiredSkills: formData.requiredSkills || "",
      experienceLevel: formData.experienceLevel || "Mid-Level",
      deadline: formData.deadline || "",
      workType: formData.workType || "onsite",
      isUserCreated: true,
      companyId: formData.companyId,
    };

    try {
      await onSaveTemplate(newTemplate);
      onClose();
    } catch (error) {
      setErrors({ form: error.message || "Failed to update template" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    if (!previewMode && !validateForm()) {
      return;
    }
    setPreviewMode(!previewMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-scroll flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <FileText className="h-6 w-6 text-blue-600" />
            ) : (
              <Plus className="h-6 w-6 text-green-600" />
            )}
            <DialogTitle className="text-2xl font-bold">
              {isEditing ? "Edit Job Template" : "Create Job Template"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isEditing
              ? "Update your job template details. Templates make it easy to create consistent job postings."
              : "Create a new job template to use for future job postings. Templates save time and ensure consistency."}
          </DialogDescription>
        </DialogHeader>

        {!previewMode ? (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-scroll flex flex-col"
          >
            <div className="flex-1 overflow-scroll flex flex-col">
              <Tabs
                defaultValue="basic"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4 sticky top-0 z-10">
                  <TabsTrigger value="basic">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-lg">Basic Info</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="details">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold text-lg">Job Details</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="compensation">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-lg">Compensation</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 pr-4 h-[400px]">
                  <TabsContent value="basic" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-medium">
                        Template Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Senior Developer Template"
                        className={cn(errors.name && "border-red-500")}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="font-medium">
                        Job Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle || ""}
                        onChange={handleChange}
                        placeholder="e.g. Senior Frontend Developer"
                        className={cn(errors.jobTitle && "border-red-500")}
                      />
                      {errors.jobTitle && (
                        <p className="text-sm text-red-500">
                          {errors.jobTitle}
                        </p>
                      )}
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
                            <SelectItem value="Engineering">
                              Engineering
                            </SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Product">Product</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Data">Data</SelectItem>
                            <SelectItem value="Customer Support">
                              Customer Support
                            </SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Operations">
                              Operations
                            </SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type" className="font-medium">
                          Job Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            handleSelectChange("type", value)
                          }
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">
                              Internship
                            </SelectItem>
                            <SelectItem value="Temporary">Temporary</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-medium">
                        Job Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                        placeholder="Enter job description..."
                        className={cn(
                          "min-h-[200px]",
                          errors.description && "border-red-500"
                        )}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">
                          {errors.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Tip: Include sections for responsibilities,
                        requirements, and company benefits.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements" className="font-medium">
                        Job Requirements <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements || ""}
                        onChange={handleChange}
                        placeholder="Enter job requirements"
                        className={cn(errors.requirements && "border-red-500")}
                      />
                      {errors.requirements && (
                        <p className="text-sm text-red-500">
                          {errors.requirements}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsibilities" className="font-medium">
                        Responsibilities
                      </Label>
                      <Textarea
                        id="responsibilities"
                        name="responsibilities"
                        value={formData.responsibilities || ""}
                        onChange={handleChange}
                        placeholder="Enter job responsibilities"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="benefits" className="font-medium">
                        Benefits
                      </Label>
                      <Textarea
                        id="benefits"
                        name="benefits"
                        value={formData.benefits || ""}
                        onChange={handleChange}
                        placeholder="Enter job benefits"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workType" className="font-medium">
                        Work Type
                      </Label>
                      <Select
                        value={formData.workType}
                        onValueChange={(value) =>
                          handleSelectChange("workType", value)
                        }
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requiredSkills" className="font-medium">
                        Required Skills <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="requiredSkills"
                        name="requiredSkills"
                        value={formData.requiredSkills || ""}
                        onChange={handleChange}
                        placeholder="Enter required skills, separated by commas (e.g. JavaScript, React, Node.js)"
                        className={cn(
                          "min-h-[100px]",
                          errors.requiredSkills && "border-red-500"
                        )}
                      />
                      {errors.requiredSkills && (
                        <p className="text-sm text-red-500">
                          {errors.requiredSkills}
                        </p>
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
                        <SelectTrigger id="experienceLevel">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entry-Level">
                            Entry-Level
                          </SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="compensation" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openings" className="font-medium">
                        Number of Openings{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="openings"
                        name="openings"
                        type="number"
                        min="1"
                        value={formData.openings || ""}
                        onChange={handleNumberChange}
                        className={cn(errors.openings && "border-red-500")}
                      />
                      {errors.openings && (
                        <p className="text-sm text-red-500">
                          {errors.openings}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salaryMin" className="font-medium">
                          Minimum Salary <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="salaryMin"
                          name="salaryMin"
                          type="number"
                          min="0"
                          value={formData.salaryMin || ""}
                          onChange={handleNumberChange}
                          className={cn(errors.salaryMin && "border-red-500")}
                        />
                        {errors.salaryMin && (
                          <p className="text-sm text-red-500">
                            {errors.salaryMin}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salaryMax" className="font-medium">
                          Maximum Salary <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="salaryMax"
                          name="salaryMax"
                          type="number"
                          min="0"
                          value={formData.salaryMax || ""}
                          onChange={handleNumberChange}
                          className={cn(errors.salaryMax && "border-red-500")}
                        />
                        {errors.salaryMax && (
                          <p className="text-sm text-red-500">
                            {errors.salaryMax}
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>

            <div className="pt-6 space-x-2 flex justify-between items-center border-t mt-6">
              <div className="text-sm text-muted-foreground">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" variant="outline" onClick={togglePreview}>
                  Preview
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : isEditing
                      ? "Update Template"
                      : "Save Template"}
                </Button>
              </div>
            </div>

            {errors.form && (
              <p className="text-sm text-red-500">{errors.form}</p>
            )}
          </form>
        ) : (
          <div className="flex-1 overflow-scroll flex-col">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-4"
              onClick={togglePreview}
            >
              ← Back to editing
            </Button>

            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium">{formData.jobTitle}</h3>
                    <Badge variant="outline">{formData.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template: {formData.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Department</h4>
                    <p className="text-sm">{formData.department}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Experience Level</h4>
                  <p className="text-sm">{formData.experienceLevel}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Salary Range</h4>
                  <p className="text-sm">
                    ${formData.salaryMin?.toLocaleString()} - $
                    {formData.salaryMax?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Number of Openings
                  </h4>
                  <p className="text-sm">{formData.openings}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.requiredSkills?.split(",").map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Job Description</h4>
                  <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                    {formData.description}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Requirements</h4>
                  <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                    {formData.requirements || "-"}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Responsibilities</h4>
                  <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                    {formData.responsibilities || "-"}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Benefits</h4>
                  <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                    {formData.benefits || "-"}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Work Type</h4>
                  <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                    {formData.workType || "-"}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="pt-6 space-x-2 flex justify-end border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Template"
                    : "Save Template"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
