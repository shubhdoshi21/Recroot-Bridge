"use client";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Search, Plus, Edit, Trash2, Code, Users, BriefcaseMedical, BarChart2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateJobTemplateDialog } from "./create-job-template-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { jobService } from "@/services/jobService";

// Sample job templates
const defaultTemplates = {
  tech: [
    {
      id: 1,
      name: "Software Engineer",
      title: "Senior Software Engineer",
      description:
        "We are seeking an experienced Software Engineer to join our development team. The ideal candidate will have strong experience in full-stack development and a passion for creating high-quality, scalable software solutions.",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      companyId: 1,
      openings: 2,
      salaryMin: 120000,
      salaryMax: 150000,
      requiredSkills: "JavaScript, React, TypeScript, Node.js, AWS",
      experienceLevel: "Senior",
      industry: "tech",
      requirements:
        "Bachelor's degree in Computer Science or related field. 5+ years of experience in software development. Strong problem-solving skills.",
      responsibilities:
        "Develop and maintain web applications. Collaborate with cross-functional teams. Write clean, scalable code.",
      benefits:
        "Health insurance, Paid time off, Flexible hours, Remote work options.",
      workType: "remote",
    },
    {
      id: 2,
      name: "UX Designer",
      title: "UX/UI Designer",
      description:
        "We're looking for a talented UX/UI Designer to create amazing user experiences. The ideal candidate will have a strong portfolio demonstrating their ability to create intuitive and visually appealing designs.",
      department: "Design",
      location: "New York, NY",
      type: "Full-time",
      companyId: 2,
      openings: 1,
      salaryMin: 90000,
      salaryMax: 110000,
      requiredSkills: "Figma, Adobe XD, User Research, Prototyping, UI Design",
      experienceLevel: "Mid-Level",
      industry: "tech",
      requirements:
        "Bachelor's degree in Design or related field. 3+ years of experience in UX/UI design.",
      responsibilities:
        "Design user interfaces and workflows. Conduct user research and usability testing.",
      benefits: "Health insurance, 401(k), Paid parental leave.",
      workType: "onsite",
    },
  ],
  marketing: [
    {
      id: 3,
      name: "Marketing Specialist",
      title: "Digital Marketing Specialist",
      description:
        "We are seeking a Digital Marketing Specialist to develop and implement marketing strategies across digital channels. The ideal candidate will have experience in social media, email marketing, and content creation.",
      department: "Marketing",
      location: "Remote",
      type: "Part-time",
      companyId: 3,
      openings: 1,
      salaryMin: 50000,
      salaryMax: 65000,
      requiredSkills:
        "Social Media, Email Marketing, Content Creation, SEO, Google Analytics",
      experienceLevel: "Entry-Level",
      industry: "marketing",
      requirements:
        "Bachelor's degree in Marketing or related field. 1+ years of experience in digital marketing.",
      responsibilities:
        "Plan and execute digital marketing campaigns. Analyze campaign performance and report on results.",
      benefits: "Flexible schedule, Remote work, Professional development.",
      workType: "remote",
    },
  ],
  finance: [
    {
      id: 4,
      name: "Data Analyst",
      title: "Financial Data Analyst",
      description:
        "We are looking for a Financial Data Analyst to join our team. The ideal candidate will have strong analytical skills and experience working with financial data.",
      department: "Finance",
      location: "Chicago, IL",
      type: "Contract",
      companyId: 4,
      openings: 2,
      salaryMin: 70000,
      salaryMax: 90000,
      requiredSkills:
        "SQL, Excel, Tableau, Financial Analysis, Data Visualization",
      experienceLevel: "Mid-Level",
      industry: "finance",
      requirements:
        "Bachelor's degree in Finance, Economics, or related field. 2+ years of experience in data analysis.",
      responsibilities:
        "Analyze financial data and create reports. Support budgeting and forecasting processes.",
      benefits: "Health insurance, 401(k), Paid holidays.",
      workType: "hybrid",
    },
  ],
  healthcare: [
    {
      id: 5,
      name: "Nurse Practitioner",
      title: "Registered Nurse Practitioner",
      description:
        "We are seeking a Registered Nurse Practitioner to join our healthcare team. The ideal candidate will have experience in patient care and a passion for helping others.",
      department: "Clinical",
      location: "Boston, MA",
      type: "Full-time",
      companyId: 5,
      openings: 3,
      salaryMin: 100000,
      salaryMax: 130000,
      requiredSkills:
        "Patient Care, Medical Records, Clinical Assessment, Treatment Planning",
      experienceLevel: "Senior",
      industry: "healthcare",
      requirements:
        "Master's degree in Nursing. Valid RN license. 5+ years of clinical experience.",
      responsibilities:
        "Provide patient care and treatment. Maintain medical records. Collaborate with healthcare team.",
      benefits: "Health insurance, Retirement plan, Continuing education.",
      workType: "onsite",
    },
  ],
  custom: [],
};

export function JobTemplatesModal({ isOpen, onClose, onSelectTemplate }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tech");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [newlyCreatedTemplateId, setNewlyCreatedTemplateId] = useState(null);
  const newTemplateRef = useRef(null);

  // State for template management
  const [allTemplates, setAllTemplates] = useState(defaultTemplates);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState(null);

  const jobTypeMap = {
    "full-time": "Full-Time",
    "part-time": "Part-Time",
    contract: "Contract",
    internship: "Internship",
    freelance: "Freelance",
    temporary: "Temporary",
  };

  const workTypeMap = {
    onsite: "onsite",
    "on-site": "onsite",
    remote: "remote",
    hybrid: "hybrid",
    "hybrid-flexible": "hybrid-flexible",
    "remote-occasional": "remote-occasional",
    "remote (occasional office visits)": "remote-occasional",
  };

  // Fetch templates from backend and categorize
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    setTemplateError(null);
    try {
      const templates = await jobService.getJobTemplates();
      // Categorize backend templates
      const categorized = {
        tech: [],
        marketing: [],
        finance: [],
        healthcare: [],
        custom: [],
      };
      templates.forEach((tpl) => {
        if (tpl.industry === "tech") categorized.tech.push(tpl);
        else if (tpl.industry === "marketing") categorized.marketing.push(tpl);
        else if (tpl.industry === "finance") categorized.finance.push(tpl);
        else if (tpl.industry === "healthcare")
          categorized.healthcare.push(tpl);
        else categorized.custom.push(tpl);
      });
      // Merge hardcoded templates with backend templates for each category (except custom)
      setAllTemplates({
        tech: [...defaultTemplates.tech, ...categorized.tech],
        marketing: [...defaultTemplates.marketing, ...categorized.marketing],
        finance: [...defaultTemplates.finance, ...categorized.finance],
        healthcare: [...defaultTemplates.healthcare, ...categorized.healthcare],
        custom: categorized.custom,
      });
    } catch (err) {
      setTemplateError("Failed to load templates");
      setAllTemplates({
        tech: [...defaultTemplates.tech],
        marketing: [...defaultTemplates.marketing],
        finance: [...defaultTemplates.finance],
        healthcare: [...defaultTemplates.healthcare],
        custom: [],
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // On mount, fetch templates from backend
  useEffect(() => {
    if (isOpen) fetchTemplates();
  }, [isOpen]);

  // Scroll to newly created template
  useEffect(() => {
    if (newlyCreatedTemplateId && newTemplateRef.current) {
      // Scroll the newly created template into view with smooth behavior
      setTimeout(() => {
        newTemplateRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [newlyCreatedTemplateId, activeTab]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSearchQuery("");
        setSelectedTemplate(null);
        setPreviewMode(false);
        setNewlyCreatedTemplateId(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleTemplateSelect = (template) => {
    // Normalize requiredSkills to array
    let requiredSkills = [];
    if (Array.isArray(template.requiredSkills)) {
      requiredSkills = template.requiredSkills.map((s) => String(s).trim());
    } else if (typeof template.requiredSkills === "string") {
      requiredSkills = template.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Normalize jobType and workType
    const rawType = (template.jobType || template.type || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
    const rawWorkType = (template.workType || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    const normalized = {
      name: template.name,
      jobTitle: template.jobTitle || template.title || "",
      description: template.description || template.jobDescription || "",
      requirements: template.requirements || "",
      responsibilities: template.responsibilities || "",
      benefits: template.benefits || "",
      department: template.department || "",
      location: template.location || "",
      type: jobTypeMap[rawType] || "",
      workType: workTypeMap[rawWorkType] || "",
      openings: template.openings || 1,
      salaryMin: template.salaryMin || 0,
      salaryMax: template.salaryMax || 0,
      requiredSkills,
      experienceLevel: (template.experienceLevel || "")
        .toLowerCase()
        .replace(/\s+/g, "-"),
      deadline: template.deadline || "",
      companyId: template.companyId,
      isUserCreated: template.isUserCreated,
      // add any other fields you need
    };
    onSelectTemplate(normalized);
    onClose();
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
  };

  const handleBackToList = () => {
    setPreviewMode(false);
    setSelectedTemplate(null);
  };

  const handleCreateTemplate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditTemplate = (template) => {
    setTemplateToEdit(template);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTemplate = (template) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const saveTemplate = async (template) => {
    setLoadingTemplates(true);
    setTemplateError(null);
    try {
      let result;
      if (
        template.id &&
        allTemplates.custom.some((t) => t.id === template.id)
      ) {
        // Update existing
        result = await jobService.updateJobTemplate(template.id, template);
      } else {
        // Create new
        result = await jobService.createJobTemplate(template);
      }
      await fetchTemplates();
      setActiveTab("custom");
      setNewlyCreatedTemplateId(result.id);
      setTimeout(() => setNewlyCreatedTemplateId(null), 3000);
      toast({
        title: template.id ? "Template updated" : "Template created",
        description: `Your job template has been ${template.id ? "updated" : "created"
          } successfully.`,
      });
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      setTemplateError(error.message || "Error saving template");
      toast({
        title: "Error",
        description:
          error.message || "There was an error saving your template.",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    setLoadingTemplates(true);
    setTemplateError(null);
    try {
      await jobService.deleteJobTemplate(templateToDelete.id);
      await fetchTemplates();
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
      toast({
        title: "Template deleted",
        description: "The job template has been deleted successfully.",
      });
    } catch (error) {
      setTemplateError(error.message || "Error deleting template");
      toast({
        title: "Error",
        description:
          error.message || "There was an error deleting your template.",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Filter templates based on search query
  const filteredTemplates = searchQuery
    ? Object.values(allTemplates)
      .flat()
      .filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (template?.requiredSkills || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : allTemplates[activeTab] || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-2xl font-bold">Job Templates</DialogTitle>
            </div>
            <DialogDescription>
              Create, edit, and select job templates for quick job posting.
            </DialogDescription>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="flex gap-2">
              <TabsTrigger value="tech" className="flex items-center gap-1">
                <Code className="h-4 w-4 text-blue-500" /> Tech
              </TabsTrigger>
              <TabsTrigger value="marketing" className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4 text-pink-500" /> Marketing
              </TabsTrigger>
              <TabsTrigger value="finance" className="flex items-center gap-1">
                <BriefcaseMedical className="h-4 w-4 text-green-500" /> Finance
              </TabsTrigger>
              <TabsTrigger value="healthcare" className="flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-500" /> Healthcare
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1">
                <Plus className="h-4 w-4 text-orange-500" /> Custom
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {!previewMode ? (
            <div className="flex-1 overflow-scroll">
              <div className="flex justify-between items-center pb-4 sticky top-0 z-10 bg-white">
                <div className="relative flex-1 mr-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search templates..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateTemplate}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Template</span>
                </Button>
              </div>

              {!searchQuery && (
                <Tabs
                  defaultValue="tech"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  {Object.keys(allTemplates).map((category) => (
                    <TabsContent
                      key={category}
                      value={category}
                      className="mt-0 pt-0"
                    >
                      {/* Content will be rendered in the ScrollArea below */}
                    </TabsContent>
                  ))}
                </Tabs>
              )}

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 mt-2">
                  {filteredTemplates && filteredTemplates.length > 0 ? (
                    filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        ref={
                          newlyCreatedTemplateId === template.id
                            ? newTemplateRef
                            : null
                        }
                        className={`p-4 border rounded-lg hover:bg-gray-50 transition-all duration-300 ${newlyCreatedTemplateId === template.id
                          ? "ring-2 ring-blue-500 bg-blue-50 animate-pulse"
                          : ""
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <h3 className="font-medium">{template.name}</h3>
                          </div>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {template.description?.split("\n")[0]}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(template?.requiredSkills || "")
                            .split(",")
                            .slice(0, 3)
                            .map((skill, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill.trim()}
                              </Badge>
                            ))}
                          {(template?.requiredSkills || "").split(",").length >
                            3 && (
                              <Badge variant="secondary" className="text-xs">
                                +
                                {(template?.requiredSkills || "").split(",")
                                  .length - 3}{" "}
                                more
                              </Badge>
                            )}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Salary:{" "}
                            </span>
                            ${template.salaryMin.toLocaleString()} - $
                            {template.salaryMax.toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            {template.isUserCreated && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTemplate(template);
                                  }}
                                >
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTemplate(template);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handlePreview(template)}
                            >
                              <FileText className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : activeTab === "custom" &&
                    (!allTemplates.custom ||
                      allTemplates.custom.length === 0) ? (
                    <div className="text-center py-8 flex flex-col items-center gap-2">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="font-medium">No custom templates yet</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Create your own job templates to save time when posting
                        new jobs.
                      </p>
                      <Button
                        onClick={handleCreateTemplate}
                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Your First Template
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No templates found matching your search.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            selectedTemplate && (
              <div className="flex-1 overflow-scroll">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-4"
                  onClick={handleBackToList}
                >
                  ← Back to templates
                </Button>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {selectedTemplate.jobTitle || selectedTemplate.title}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">
                        {selectedTemplate.jobType || selectedTemplate.type}
                      </Badge>
                      <Badge variant="outline">
                        {selectedTemplate.experienceLevel}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Department</h4>
                    <p className="text-sm">{selectedTemplate.department}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Salary Range</h4>
                    <p className="text-sm">
                      ${selectedTemplate.salaryMin.toLocaleString()} - $
                      {selectedTemplate.salaryMax.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Openings</h4>
                    <p className="text-sm">{selectedTemplate.openings}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(selectedTemplate?.requiredSkills || "")
                        .split(",")
                        .map((skill, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Job Description
                    </h4>
                    <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                      {selectedTemplate.description ||
                        selectedTemplate.jobDescription ||
                        "No description provided"}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Requirements</h4>
                    <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                      {selectedTemplate.requirements || "-"}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Responsibilities
                    </h4>
                    <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                      {selectedTemplate.responsibilities || "-"}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Benefits</h4>
                    <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                      {selectedTemplate.benefits || "-"}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Work Type</h4>
                    <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-gray-50">
                      {selectedTemplate.workType || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => handleTemplateSelect(selectedTemplate)}
                    className="w-full"
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      {isCreateDialogOpen && (
        <CreateJobTemplateDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSaveTemplate={saveTemplate}
        />
      )}

      {/* Edit Template Dialog */}
      {isEditDialogOpen && templateToEdit && (
        <CreateJobTemplateDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setTemplateToEdit(null);
          }}
          onSaveTemplate={saveTemplate}
          templateToEdit={templateToEdit}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Optionally, show loading/error state in the UI */}
      {loadingTemplates && (
        <div className="text-center py-4">Loading templates...</div>
      )}
      {templateError && (
        <div className="text-center text-red-500 py-2">{templateError}</div>
      )}
    </>
  );
}
