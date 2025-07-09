"use client"
import { Checkbox } from "@/components/ui/checkbox"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Copy, Trash2, Eye, FileText, CheckSquare, AlertTriangle, User, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import OnboardingTemplateEditor from "@/components/onboarding/onboarding-template-editor"
import TaskTemplates from "@/components/onboarding/task-templates"
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplateToNewHire,
  applyCustomizedTasksToNewHire,
  getDepartments,
  createTaskTemplate,
} from "@/services/onboardingService"
import ManageTemplateTasksDialog from "@/components/onboarding/manage-template-tasks-dialog"
import OnboardingTemplateForm from "./onboarding-template-form"
import CustomizeTasksDialog from "./customize-tasks-dialog"
import { useOnboarding } from "@/contexts/onboarding-context"

const CATEGORY_OPTIONS = [
  { value: "checklist", label: "Checklists" },
  { value: "welcome-kit", label: "Welcome Kits" },
  { value: "training-plan", label: "Training Plans" },
]

export function OnboardingTemplates() {
  const { templates, templatesLoading, refreshTemplates, setTemplates, newHires } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState(CATEGORY_OPTIONS[0].value)
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isUseTemplateOpen, setIsUseTemplateOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState(null)
  const [isManageTasksOpen, setIsManageTasksOpen] = useState(false)
  const [manageTasksTemplate, setManageTasksTemplate] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false)
  const [customTasks, setCustomTasks] = useState([])
  const [customizeNewHireIds, setCustomizeNewHireIds] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    refreshTemplates();
  }, [refreshTemplates]);

  const getFilteredTemplates = (category) => {
    return templates
      .filter((t) => t.category === category)
      .filter(
        (template) =>
          !searchQuery ||
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (template.department && template.department.toLowerCase().includes(searchQuery.toLowerCase()))
      )
  }

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template)
    setIsTemplateEditorOpen(true)
  }

  const handlePreviewTemplate = async (template) => {
    setIsPreviewOpen(true)
    setPreviewLoading(true)
    try {
      setPreviewTemplate(template)
    } catch (err) {
      setPreviewTemplate(null)
      toast({ title: "Error", description: err.message || "Failed to load template preview", variant: "destructive" })
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    setIsTemplateEditorOpen(true)
  }

  const handleUseTemplate = (template) => {
    // Find the full template (with tasks) from context
    const fullTemplate = templates.find(t => t.id === template.id);
    setSelectedTemplate(fullTemplate);
    setIsUseTemplateOpen(true);
  }

  const handleConfirmUseTemplate = (data) => {
    if (data.customizeItems) {
      let newHireIds = [];
      if (data.newHire) {
        newHireIds = [data.newHire];
      } else if (data.department) {
        newHireIds = newHires.filter(h => h.department === data.department).map(h => h.id);
      } else {
        newHireIds = newHires.map(h => h.id);
      }
      setCustomizeNewHireIds(newHireIds);
      setCustomTasks(
        (selectedTemplate?.TemplateTaskMaps || []).map(map => ({
          title: map.OnboardingTaskTemplate?.title || "",
          description: map.OnboardingTaskTemplate?.description || "",
          dueDate: "",
          assignedTo: map.OnboardingTaskTemplate?.assignedTo ? parseInt(map.OnboardingTaskTemplate.assignedTo, 10) : "",
          priority: 1,
          category: "",
          taskTemplateId: map.OnboardingTaskTemplate?.id,
        }))
      );
      setIsCustomizeDialogOpen(true);
      return;
    }
    toast({
      title: "Template Applied",
      description: `${selectedTemplate?.name} has been applied to ${
        data.newHire ? newHires.find((h) => h.id.toString() === data.newHire)?.name : "all selected employees"
      }.`,
    })
    setIsUseTemplateOpen(false)
  }

  const handleConfirmCustomizeTasks = async (tasks) => {
    try {
      // For each task without a taskTemplateId, create a new task template first
      const updatedTasks = await Promise.all(tasks.map(async (task) => {
        if (!task.taskTemplateId) {
          const template = await createTaskTemplate({
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
          })
          return { ...task, taskTemplateId: template.id }
        }
        return task
      }))
      let successCount = 0, failCount = 0;
      for (const newHireId of customizeNewHireIds) {
        try {
          await applyCustomizedTasksToNewHire({ newHireId, tasks: updatedTasks });
          successCount++;
        } catch (err) {
          failCount++;
        }
      }
      toast({
        title: "Template Applied",
        description: `${selectedTemplate?.name} customized tasks applied. Success: ${successCount}, Failed: ${failCount}`,
        variant: failCount ? "destructive" : "default"
      });
      setIsCustomizeDialogOpen(false);
      setIsUseTemplateOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to apply customized tasks.",
        variant: "destructive",
      });
    }
  }

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return
    setLoading(true)
    setError("")
    try {
      await deleteTemplate(templateToDelete.id)
      toast({ title: "Template Deleted", description: `"${templateToDelete.name}" was deleted successfully.` })
      await refreshTemplates()
      setIsDeleteConfirmOpen(false)
      setTemplateToDelete(null)
    } catch (err) {
      setError(err.message || "Failed to delete onboarding template")
      toast({ title: "Error", description: err.message || "Failed to delete onboarding template", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = (template) => {
    setTemplateToDelete(template)
    setIsDeleteConfirmOpen(true)
  }

  const handleSaveTemplate = async (templateData) => {
    setLoading(true)
    setError("")
    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, templateData)
        toast({ title: "Template Updated", description: `"${templateData.name}" was updated successfully.` })
        await refreshTemplates()
        setIsTemplateEditorOpen(false)
        setSelectedTemplate(null)
      } else {
        // Create and fetch the new template with its ID
        const created = await createTemplate(templateData)
        toast({ title: "Template Created", description: `"${templateData.name}" was created successfully.` })
        await refreshTemplates()
        setIsTemplateEditorOpen(false)
        setSelectedTemplate(null)
      }
    } catch (err) {
      setError(err.message || "Failed to save onboarding template")
      toast({ title: "Error", description: err.message || "Failed to save onboarding template", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleManageTasks = (template) => {
    setManageTasksTemplate(template)
    setIsManageTasksOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card className="light-mode-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Onboarding Templates</CardTitle>
          <Button size="sm" onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchQuery("")} disabled={!searchQuery}>
              Clear
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex">
                {CATEGORY_OPTIONS.map((opt) => (
                  <TabsTrigger key={opt.value} value={opt.value}>
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {CATEGORY_OPTIONS.map((opt) => (
              <TabsContent key={opt.value} value={opt.value} className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {getFilteredTemplates(opt.value).length === 0 ? (
                      <div className="text-center py-8 border rounded-lg">
                        <p className="text-gray-500 mb-2">No templates found matching your search criteria</p>
                        {searchQuery && (
                          <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                            Clear Search
                          </Button>
                        )}
                      </div>
                    ) : (
                      getFilteredTemplates(opt.value).map((template) => (
                        <div key={template.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-4">
                            {opt.value === "checklist" ? (
                              <CheckSquare className="h-10 w-10 text-blue-500 flex-shrink-0" />
                            ) : (
                              <FileText className="h-10 w-10 text-blue-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-base truncate" title={template.name}>
                                {template.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>

                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <Badge variant="outline" className="text-xs">
                                  {template.department}
                                </Badge>
                                <span className="text-xs text-gray-500">{template.itemCount} items</span>
                                <span className="text-xs text-gray-500">
                                  Updated: {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : (template.lastUpdated ? new Date(template.lastUpdated).toLocaleDateString() : "-")}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-4">
                                <Button size="sm" variant="outline" onClick={() => handlePreviewTemplate(template)}>
                                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                                  Preview
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
                                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                                  Use
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteTemplate(template)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                  Delete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => handleManageTasks(template)}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                                  Manage Tasks
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {isTemplateEditorOpen && (
        <Dialog open={isTemplateEditorOpen} onOpenChange={setIsTemplateEditorOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <OnboardingTemplateEditor
              template={selectedTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => setIsTemplateEditorOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {manageTasksTemplate && (
        <ManageTemplateTasksDialog
          open={isManageTasksOpen}
          onOpenChange={setIsManageTasksOpen}
          template={manageTasksTemplate}
          onTasksUpdated={refreshTemplates}
        />
      )}

      <PreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        template={previewTemplate}
        loading={previewLoading}
        onEdit={handleEditTemplate}
      />

      <DeleteConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        templateName={templateToDelete?.name}
        loading={loading}
      />

      {/* Use Template Dialog */}
      <Dialog open={isUseTemplateOpen} onOpenChange={setIsUseTemplateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Use Template: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>Apply this template to new hires or existing employees.</DialogDescription>
          </DialogHeader>

          <UseTemplateForm
            template={selectedTemplate}
            onApply={handleConfirmUseTemplate}
            onCancel={() => setIsUseTemplateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Customize Tasks Dialog */}
      <CustomizeTasksDialog
        open={isCustomizeDialogOpen}
        onOpenChange={setIsCustomizeDialogOpen}
        tasks={customTasks}
        onConfirm={handleConfirmCustomizeTasks}
        templateName={selectedTemplate?.name}
      />

      {/* Place Task Template Library below the main template list/tabs */}
      <div className="mt-10">
        <TaskTemplates />
      </div>
    </div>
  )
}

function PreviewDialog({ open, onOpenChange, template, loading, onEdit }) {
  if (!template && !loading) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {loading
              ? "Loading Template Preview"
              : template
              ? `Template Preview: ${template?.name}`
              : "No Template Data"}
          </DialogTitle>
          {template && (
            <DialogDescription>
              Preview how this template will appear when applied to new hires.
            </DialogDescription>
          )}
        </DialogHeader>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : template ? (
          <>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                {template?.id < 200 ? (
                  <CheckSquare className="h-6 w-6 text-blue-500" />
                ) : (
                  <FileText className="h-6 w-6 text-blue-500" />
                )}
                <div>
                  <h3 className="font-medium">{template?.name}</h3>
                  <p className="text-sm text-gray-500">{template?.description}</p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Template Items</h4>
                <div className="space-y-4">
                  {template?.TemplateTaskMaps?.length > 0 ? (
                    template.TemplateTaskMaps.sort((a, b) => a.sequence - b.sequence).map(
                      (taskMap, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckSquare className="h-5 w-5 mt-0.5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium">
                              {taskMap.OnboardingTaskTemplate?.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {taskMap.OnboardingTaskTemplate?.description}
                            </p>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No tasks assigned to this template.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Department:</span> {template?.department}
                  </div>
                  <div>
                    <span className="font-medium">Items:</span> {template?.itemCount}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {template?.lastUpdated}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {template?.id < 200
                      ? "Checklist"
                      : template?.id < 300
                      ? "Welcome Kit"
                      : "Training Plan"}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  onEdit(template)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">Could not load template data.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirmationDialog({ open, onOpenChange, onConfirm, templateName, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Onboarding Template</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-3 bg-gray-50">
          <h4 className="font-medium">{templateName}</h4>
          <p className="text-sm text-gray-500 mt-1">This template will be permanently deleted.</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            Delete Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const sampleNewHires = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Charlie Lee" },
]

function UseTemplateForm({ template, onApply, onCancel }) {
  const [applyTo, setApplyTo] = useState("individual")
  const [selectedNewHire, setSelectedNewHire] = useState("")
  const [customizeItems, setCustomizeItems] = useState(false)
  const [dueDate, setDueDate] = useState("")
  const { newHires, newHiresLoading, refreshNewHires } = useOnboarding();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("")

  // Get unique departments from newHires
  const departmentList = Array.from(
    new Set(
      (newHires || [])
        .map(hire => hire.department)
        .filter(Boolean)
    )
  )

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (customizeItems) {
        if (applyTo === "individual") {
          onApply && onApply({ customizeItems, newHire: selectedNewHire, templateId: template.id, dueDate });
          setSubmitting(false);
          return;
        } else if (applyTo === "department") {
          onApply && onApply({ customizeItems, templateId: template.id, dueDate, department: selectedDepartment });
          setSubmitting(false);
          return;
        } else if (applyTo === "all") {
          onApply && onApply({ customizeItems, templateId: template.id, dueDate });
          setSubmitting(false);
          return;
        }
      }
      if (applyTo === "individual") {
        await applyTemplateToNewHire({
          newHireId: selectedNewHire,
          templateId: template.id,
          dueDate,
        });
        toast({ title: "Template Applied", description: "Tasks have been created for the new hire." });
        refreshNewHires();
        onApply && onApply({ customizeItems: false, newHire: selectedNewHire, templateId: template.id, dueDate });
      } else if (applyTo === "department") {
        const hiresInDept = newHires.filter(h => h.department === selectedDepartment);
        let successCount = 0, failCount = 0;
        for (const hire of hiresInDept) {
          try {
            await applyTemplateToNewHire({
              newHireId: hire.id,
              templateId: template.id,
              dueDate,
            });
            successCount++;
          } catch (err) {
            failCount++;
          }
        }
        toast({
          title: `Template Applied to Department`,
          description: `Success: ${successCount}, Failed: ${failCount}`,
          variant: failCount ? "destructive" : "default"
        });
        refreshNewHires();
        onApply && onApply({ customizeItems: false, templateId: template.id, dueDate, department: selectedDepartment });
      } else if (applyTo === "all") {
        let successCount = 0, failCount = 0;
        for (const hire of newHires) {
          try {
            await applyTemplateToNewHire({
              newHireId: hire.id,
              templateId: template.id,
              dueDate,
            });
            successCount++;
          } catch (err) {
            failCount++;
          }
        }
        toast({
          title: `Template Applied to All New Hires`,
          description: `Success: ${successCount}, Failed: ${failCount}`,
          variant: failCount ? "destructive" : "default"
        });
        refreshNewHires();
        onApply && onApply({ customizeItems: false, templateId: template.id, dueDate });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to apply template.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-3">
          <Label>Apply to</Label>
          <RadioGroup value={applyTo} onValueChange={setApplyTo} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="apply-individual" />
              <Label htmlFor="apply-individual" className="cursor-pointer">
                Individual new hire
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="department" id="apply-department" />
              <Label htmlFor="apply-department" className="cursor-pointer">
                Entire department
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="apply-all" />
              <Label htmlFor="apply-all" className="cursor-pointer">
                All new hires
              </Label>
            </div>
          </RadioGroup>
        </div>

        {applyTo === "individual" && (
          <div className="space-y-2">
            <Label htmlFor="new-hire">Select New Hire</Label>
            <Select value={selectedNewHire} onValueChange={setSelectedNewHire} required disabled={newHiresLoading}>
              <SelectTrigger id="new-hire" className="w-full">
                <SelectValue placeholder={newHiresLoading ? "Loading..." : "Select a new hire"} />
              </SelectTrigger>
              <SelectContent>
                {newHires.map((hire) => (
                  <SelectItem key={hire.id} value={hire.id.toString()}>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {hire.firstName || ""} {hire.lastName || hire.name || ""}
                        {hire.position ? ` - ${hire.position}` : ""}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {applyTo === "department" && (
          <div className="space-y-2">
            <Label htmlFor="department">Select Department</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment} required disabled={newHiresLoading}>
              <SelectTrigger id="department">
                <SelectValue placeholder={newHiresLoading ? "Loading..." : "Select department"} />
              </SelectTrigger>
              <SelectContent>
                {departmentList.length === 0 ? (
                  <div className="px-2 py-1 text-xs text-gray-400">No departments found</div>
                ) : (
                  departmentList.map((dept, idx) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="due-date">Due Date (Optional)</Label>
          <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="customize"
            checked={customizeItems}
            onCheckedChange={(checked) => setCustomizeItems(checked === true)}
          />
          <Label htmlFor="customize" className="cursor-pointer">
            Customize template items before applying
          </Label>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
          <p>This template will create {template?.itemCount || 0} tasks for the selected recipient(s).</p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>{submitting ? "Applying..." : "Apply Template"}</Button>
      </DialogFooter>
    </form>
  )
}
