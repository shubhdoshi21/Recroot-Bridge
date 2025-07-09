"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentPreview } from "@/components/documents/document-preview"
import { UseTemplateDialog } from "@/components/documents/use-template-dialog"
import { DocumentDownloadHandler } from "@/components/documents/document-download-handler"
import {
  Search,
  FileText,
  FileIcon as FilePdf,
  FileSpreadsheet,
  Copy,
  Eye,
  Plus,
  Edit,
  MoreHorizontal,
  Template,
  Calendar,
  Tag,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CreateTemplateDialog } from "@/components/documents/create-template-dialog"
import { EditTemplateDialog } from "@/components/documents/edit-template-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDocuments } from "@/contexts/documents-context"

// Sample data for document templates
const initialTemplates = {
  "job-descriptions": [
    {
      id: 101,
      name: "Software Engineer Job Description",
      description: "Standard template for software engineering roles at all levels.",
      lastUpdated: "2023-06-15",
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
      type: "document",
      category: "job-descriptions",
    },
    {
      id: 102,
      name: "UX Designer Job Description",
      description: "Template for UX design positions with customizable experience levels.",
      lastUpdated: "2023-06-10",
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
      type: "document",
      category: "job-descriptions",
    },
    {
      id: 103,
      name: "Product Manager Job Description",
      description: "Comprehensive template for product management roles.",
      lastUpdated: "2023-05-28",
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
      type: "document",
      category: "job-descriptions",
    },
    {
      id: 104,
      name: "Marketing Specialist Job Description",
      description: "Template for various marketing positions.",
      lastUpdated: "2023-05-20",
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
      type: "document",
      category: "job-descriptions",
    },
  ],
  "offer-letters": [
    {
      id: 201,
      name: "Standard Offer Letter",
      description: "General offer letter template with customizable fields for all positions.",
      lastUpdated: "2023-07-01",
      icon: FilePdf,
      iconColor: "text-red-500",
      url: "#",
      type: "pdf",
      category: "offer-letters",
    },
    {
      id: 202,
      name: "Executive Offer Letter",
      description: "Specialized offer letter for executive and leadership positions.",
      lastUpdated: "2023-06-25",
      icon: FilePdf,
      iconColor: "text-red-500",
      url: "#",
      type: "pdf",
      category: "offer-letters",
    },
    {
      id: 203,
      name: "Contract Position Offer",
      description: "Offer letter template for contract and temporary positions.",
      lastUpdated: "2023-06-18",
      icon: FilePdf,
      iconColor: "text-red-500",
      url: "#",
      type: "pdf",
      category: "offer-letters",
    },
  ],
  "interview-materials": [
    {
      id: 301,
      name: "Technical Interview Scorecard",
      description: "Evaluation form for technical interviews with scoring guidelines.",
      lastUpdated: "2023-06-30",
      icon: FileSpreadsheet,
      iconColor: "text-green-500",
      url: "#",
      type: "spreadsheet",
      category: "interview-materials",
    },
    {
      id: 302,
      name: "Behavioral Interview Questions",
      description: "Standard set of behavioral questions with evaluation criteria.",
      lastUpdated: "2023-06-22",
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
      type: "document",
      category: "interview-materials",
    },
    {
      id: 303,
      name: "Case Study Template",
      description: "Framework for creating and evaluating case study interviews.",
      lastUpdated: "2023-06-15",
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
      type: "document",
      category: "interview-materials",
    },
    {
      id: 304,
      name: "Interview Feedback Form",
      description: "Standardized form for collecting interviewer feedback.",
      lastUpdated: "2023-06-08",
      icon: FileSpreadsheet,
      iconColor: "text-green-500",
      url: "#",
      type: "spreadsheet",
      category: "interview-materials",
    },
  ],
  onboarding: [
    {
      id: 401,
      name: "New Hire Checklist",
      description: "Comprehensive checklist for onboarding new employees.",
      lastUpdated: "2023-07-05",
      icon: FileSpreadsheet,
      iconColor: "text-green-500",
      url: "#",
      type: "spreadsheet",
      category: "onboarding",
    },
    {
      id: 402,
      name: "First Day Welcome Email",
      description: "Template for welcome emails to new hires before their first day.",
      lastUpdated: "2023-06-28",
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
      type: "document",
      category: "onboarding",
    },
    {
      id: 403,
      name: "30-60-90 Day Plan Template",
      description: "Framework for creating 30-60-90 day plans for new hires.",
      lastUpdated: "2023-06-20",
      icon: FileText,
      iconColor: "text-blue-500",
      url: "#",
      type: "document",
      category: "onboarding",
    },
  ],
}

export function DocumentTemplates() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isUseTemplateOpen, setIsUseTemplateOpen] = useState(false)
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false)
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const { toast } = useToast()
  const { templates, createTemplate, updateDocument, deleteDocument, loading } = useDocuments()

  // Group templates by category
  const groupedTemplates = (templates || []).reduce((acc, template) => {
    if (!template || typeof template !== 'object') return acc
    const category = template.templateCategory || template.category || "general"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {})

  const filteredTemplates = Object.keys(groupedTemplates).reduce((acc, category) => {
    const categoryTemplates = (groupedTemplates[category] || []).filter((template) =>
      template &&
      template.name &&
      (searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase())))
    )

    if (categoryTemplates.length > 0) {
      acc[category] = categoryTemplates
    }
    return acc
  }, {})

  const handleTabChange = (value) => {
    setSelectedTemplate(null)
    setIsPreviewOpen(false)
    setIsUseTemplateOpen(false)
    setIsEditTemplateOpen(false)
  }

  const handlePreview = (template) => {
    setSelectedTemplate(template)
    setIsPreviewOpen(true)
  }

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template)
    setIsUseTemplateOpen(true)
  }

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template)
    setIsEditTemplateOpen(true)
  }

  const handleUpdateTemplate = (updatedTemplate) => {
    // Update the template in the appropriate category
    updateDocument(updatedTemplate)

    // Show success toast
    toast({
      title: "Template Updated",
      description: `"${updatedTemplate.name}" has been updated successfully.`,
      variant: "default",
    })
  }

  const handleCreateTemplate = (newTemplate) => {
    // Add the new template to the appropriate category
    createTemplate(newTemplate)

    // Show success toast
    toast({
      title: "Template Created",
      description: `"${newTemplate.name}" has been created successfully.`,
      variant: "default",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Template className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Document Templates</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Pre-built templates for common documents</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreateTemplateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="job-descriptions" value={selectedTemplate?.category || "job-descriptions"} onValueChange={handleTabChange} className="space-y-6">
            {Object.keys(groupedTemplates).length > 0 ? (
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200">
                  {Object.keys(groupedTemplates).map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="py-2 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            ) : null}

            {Object.keys(filteredTemplates).length > 0 ? (
              Object.keys(filteredTemplates).map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    {filteredTemplates[category].length > 0 ? (
                      filteredTemplates[category].map((template) => (
                        <Card
                          key={template.id}
                          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg bg-gradient-to-br ${template.iconColor?.replace('text-', 'from-') || 'from-blue'}-50 to-${template.iconColor?.replace('text-', '') || 'blue'}-100`}>
                                {template.icon ? (
                                  <template.icon className={`h-8 w-8 ${template.iconColor || 'text-blue-500'}`} />
                                ) : (
                                  <FileText className={`h-8 w-8 ${template.iconColor || 'text-blue-500'}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate text-gray-900" title={template.name}>
                                      {template.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{template.description}</p>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                      <Calendar className="h-3 w-3" />
                                      <span>Last updated: {template.lastUpdated}</span>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 hover:bg-gray-100">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px] bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
                                      <DropdownMenuItem onClick={() => handleEditTemplate(template)} className="hover:bg-blue-50">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePreview(template)}
                                    className="hover:bg-blue-50 border-blue-200 text-blue-600"
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                                    Preview
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUseTemplate(template)}
                                    className="hover:bg-green-50 border-green-200 text-green-600"
                                  >
                                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                                    Use
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2">
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                          <CardContent className="p-12 text-center">
                            <Template className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                            <p className="text-gray-600 mb-4">Try adjusting your search query or create a new template</p>
                            <Button
                              onClick={() => setIsCreateTemplateOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create Template
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))
            ) : (
              <TabsContent value="job-descriptions" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="col-span-2">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-12 text-center">
                        <Template className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
                        <p className="text-gray-600 mb-4">Create your first template to get started</p>
                        <Button
                          onClick={() => setIsCreateTemplateOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Template
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <DocumentPreview
          document={{
            ...selectedTemplate,
            icon: FileText,
            iconColor: "text-blue-500",
          }}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}

      {selectedTemplate && (
        <UseTemplateDialog
          isOpen={isUseTemplateOpen}
          onClose={() => setIsUseTemplateOpen(false)}
          template={selectedTemplate}
        />
      )}

      <CreateTemplateDialog
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
        onCreateTemplate={(template) =>
          handleCreateTemplate({
            ...template,
            category: template.category || "job-descriptions",
          })
        }
      />

      {selectedTemplate && (
        <EditTemplateDialog
          isOpen={isEditTemplateOpen}
          onClose={() => setIsEditTemplateOpen(false)}
          template={selectedTemplate}
          onUpdateTemplate={handleUpdateTemplate}
        />
      )}
    </div>
  )
}
