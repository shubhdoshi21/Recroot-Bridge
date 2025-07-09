"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Calendar, Clock, User, Building2, CheckCircle, MoreHorizontal, Edit, Trash2, Briefcase, BookOpen, Laptop, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getOnboardingTasksForNewHire, updateOnboardingTask, deleteOnboardingTask, createTaskTemplate, createOnboardingTask } from "@/services/onboardingService"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useTeams } from "@/contexts/teams-context"

const categoryStyles = {
  administrative: {
    color: "bg-blue-100 text-blue-800",
    icon: <Briefcase className="inline-block w-3 h-3 mr-1" />,
    label: "Administrative"
  },
  technical: {
    color: "bg-purple-100 text-purple-800",
    icon: <Laptop className="inline-block w-3 h-3 mr-1" />,
    label: "Technical"
  },
  orientation: {
    color: "bg-green-100 text-green-800",
    icon: <Users className="inline-block w-3 h-3 mr-1" />,
    label: "Orientation"
  },
  training: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <BookOpen className="inline-block w-3 h-3 mr-1" />,
    label: "Training"
  }
};

function getCategoryBadge(category) {
  if (!category) return null;
  const key = category.toLowerCase();
  const style = categoryStyles[key];
  if (!style) return (
    <span className="inline-block rounded bg-gray-100 text-gray-800 text-xs px-2 py-0.5 ml-2 font-semibold align-middle">
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
  return (
    <span className={`inline-flex items-center rounded ${style.color} text-xs px-2 py-0.5 ml-2 font-semibold align-middle shadow-sm`}>
      {style.icon}{style.label}
    </span>
  );
}

export function OnboardingTasks() {
  const { onboardingAllTasks, onboardingAllTasksLoading, onboardingAllTasksError, fetchAllOnboardingTasks, newHires, newHiresLoading, setOnboardingAllTasks, refreshNewHires, taskTemplates, refreshTaskTemplates } = useOnboarding();
  const { teams } = useTeams();
  const [searchQuery, setSearchQuery] = useState("")
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskStatus, setTaskStatus] = useState({})
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "HR Team",
    newHire: "",
    dueDate: "",
    priority: 2,
    status: "pending",
    category: "administrative",
  })
  const [formErrors, setFormErrors] = useState([])
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [selectedNewHire, setSelectedNewHire] = useState("all")
  const { toast } = useToast()
  const [recentlyCompleted, setRecentlyCompleted] = useState([])
  const highlightTimeouts = useRef({})
  const [selectedTemplateId, setSelectedTemplateId] = useState("manual")

  // Only fetch tasks on initial mount or manual refresh
  useEffect(() => {
    if (onboardingAllTasks.length === 0) {
      fetchAllOnboardingTasks(selectedNewHire === "all" ? null : selectedNewHire);
    }
  }, [fetchAllOnboardingTasks, onboardingAllTasks.length, selectedNewHire])

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchAllOnboardingTasks(selectedNewHire === "all" ? null : selectedNewHire);
    toast({ title: "Tasks refreshed from server." });
  }

  // Refresh task templates when dialog opens
  useEffect(() => {
    if (isTaskEditorOpen) {
      refreshTaskTemplates();
    }
  }, [isTaskEditorOpen, refreshTaskTemplates]);

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      assignee: task.assignedTo ? String(task.assignedTo) : "",
      newHire: task.newHireId ? String(task.newHireId) : "",
      dueDate: task.dueDate,
      priority: task.priority ?? 2,
      status: task.status,
      category: task.category,
    })
    setIsTaskEditorOpen(true)
  }

  const handleCreateTask = () => {
    setSelectedTask(null)
    setFormData({
      title: "",
      description: "",
      assignee: "HR Team",
      newHire: "",
      dueDate: "",
      priority: 2,
      status: "pending",
      category: "administrative",
    })
    setIsTaskEditorOpen(true)
  }

  const handleToggleTask = async (taskId) => {
    const task = onboardingAllTasks.find(t => t.id === taskId);
    if (!task) return;
    const isCompleted = (task.status === "completed") || taskStatus[taskId];
    const newStatus = isCompleted ? "pending" : "completed";
    try {
      await updateOnboardingTask(taskId, { ...task, status: newStatus });
      setTaskStatus((prev) => ({ ...prev, [taskId]: !isCompleted }));
      if (newStatus === "completed") {
        setRecentlyCompleted((prev) => [...prev, taskId]);
        if (highlightTimeouts.current[taskId]) clearTimeout(highlightTimeouts.current[taskId]);
        highlightTimeouts.current[taskId] = setTimeout(() => {
          setRecentlyCompleted((prev) => prev.filter(id => id !== taskId));
          delete highlightTimeouts.current[taskId];
        }, 1200);
      }
      setOnboardingAllTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      refreshNewHires();
      toast({
        title: "Task status updated",
        description: `The task status has been set to ${newStatus}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update task status.",
        variant: "destructive",
      });
    }
  }

  const handleDeleteTask = (taskId) => {
    setTaskToDelete(taskId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await deleteOnboardingTask(taskToDelete)
        setOnboardingAllTasks(prevTasks => prevTasks.filter(t => t.id !== taskToDelete))
        refreshNewHires();
        toast({
          title: "Task deleted",
          description: "The task has been successfully deleted.",
        })
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to delete task.",
          variant: "destructive",
        })
      }
      setIsDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    const errors = []

    if (!formData.title.trim()) {
      errors.push("Task title is required")
    }

    if (!formData.description.trim()) {
      errors.push("Task description is required")
    }

    if (!formData.dueDate) {
      errors.push("Due date is required")
    }

    if (errors.length > 0) {
      setFormErrors(errors)
      setIsErrorDialogOpen(true)
      return false
    }

    return true
  }

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId)
    if (templateId === 'manual') {
      // Clear template selection, do not prefill
      setFormData(prev => ({ ...prev, title: '', description: '' }))
      return;
    }
    const template = taskTemplates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
      }))
    }
  }

  const handleSaveTask = async () => {
    if (!validateForm()) return
    const payload = {
      ...formData,
      assignedTo: formData.assignee ? parseInt(formData.assignee, 10) : null,
      newHireId: formData.newHire ? parseInt(formData.newHire, 10) : null,
    }
    delete payload.assignee;
    delete payload.newHire;
    if (selectedTask) {
      try {
        await updateOnboardingTask(selectedTask.id, payload)
        setOnboardingAllTasks(prevTasks =>
          prevTasks.map(t => t.id === selectedTask.id ? { ...t, ...payload } : t)
        )
        if (payload.newHireId && payload.newHireId !== selectedTask.newHireId) {
          refreshNewHires();
        }
        toast({
          title: "Task updated",
          description: "The task has been successfully updated.",
        })
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to update task.",
          variant: "destructive",
        })
      }
    } else {
      try {
        const created = await createOnboardingTask(payload)
        setOnboardingAllTasks(prev => [created, ...prev])
        if (selectedTemplateId === 'manual' || !selectedTemplateId) {
          await createTaskTemplate({ title: formData.title, description: formData.description })
        }
        toast({
          title: "Task created",
          description: "The task has been successfully created.",
        })
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to create task.",
          variant: "destructive",
        })
      }
    }
    setIsTaskEditorOpen(false)
    setSelectedTemplateId("manual")
  }

  const filteredTasks = onboardingAllTasks.filter((task) => {
    const matchesSearch =
      (task.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (task.assignee?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (task.newHire?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter || (statusFilter === "completed" && taskStatus[task.id])

    return matchesSearch && matchesStatus
  })

  const getPriorityBadge = (priority) => {
    switch (Number(priority)) {
      case 3:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case 2:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium</Badge>;
      case 1:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      default:
        return null;
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  function getAssigneeInfo(assignedTo) {
    for (const team of teams) {
      const member = (team.teamMembers || []).find(m => m.id === assignedTo);
      if (member) {
        return { name: member.fullName || member.name || member.email, email: member.email, teamName: team.name };
      }
    }
    return { name: "Unassigned", email: "" };
  }

  console.log('Onboarding Tasks:', onboardingAllTasks);

  if (onboardingAllTasksLoading) return <div className="p-8 text-center text-lg">Loading onboarding tasks...</div>
  if (onboardingAllTasksError) return <div className="p-8 text-center text-red-500">{onboardingAllTasksError}</div>
  const tasks = onboardingAllTasks;

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .animate-completed-highlight {
          animation: completedHighlight 1.2s;
        }
        @keyframes completedHighlight {
          0% { background-color: #bbf7d0; }
          100% { background-color: inherit; }
        }
      `}</style>
      <Card className="light-mode-card">
        <CardContent>
          <div className="flex items-center justify-between px-2 py-4 border-b border-gray-200 bg-white rounded-t-lg">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Onboarding Tasks</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 shadow-sm transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5A9 9 0 1112 21v-3m0 0l-2.25 2.25M12 18l2.25 2.25"
                  />
                </svg>
                Refresh
              </Button>
              <Button size="sm" onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all" value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <Select value={selectedNewHire} onValueChange={setSelectedNewHire}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by new hire (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All New Hires</SelectItem>
                {newHires.map(hire => (
                  <SelectItem key={hire.id} value={hire.id.toString()}>
                    {hire.firstName} {hire.lastName} {hire.position ? `- ${hire.position}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                        (taskStatus[task.id] || task.status === "completed")
                          ? "border-green-200 bg-green-50 hover:bg-green-50"
                          : ""
                      } ${recentlyCompleted.includes(task.id) ? "animate-completed-highlight" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`task-${task.id}`}
                          className="mt-1"
                          checked={taskStatus[task.id] || task.status === "completed"}
                          onCheckedChange={() => handleToggleTask(task.id)}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-medium ${
                                  taskStatus[task.id] || task.status === "completed" ? "line-through text-gray-500" : ""
                                }`}
                              >
                                {task.title}
                              </h3>
                              {getCategoryBadge(task.category)}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getPriorityBadge(task.priority)}
                              {getStatusBadge(task.status)}
                            </div>
                          </div>

                          <p
                            className={`text-sm mt-1 ${
                              taskStatus[task.id] || task.status === "completed"
                                ? "line-through text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {task.description}
                          </p>

                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <User className="h-3.5 w-3.5" />
                              <span>Assignee: {getAssigneeInfo(task.assignedTo).name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>New Hire: {task.NewHire ? `${task.NewHire.firstName} ${task.NewHire.lastName}${task.NewHire.position ? ` - ${task.NewHire.position}` : ''}` : 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
                            </div>
                          </div>

                          <div className="flex justify-end mt-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No tasks match your search criteria.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="kanban">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Pending
                  </h3>
                  <div className="space-y-3">
                    {filteredTasks
                      .filter((task) => task.status === "pending" && !taskStatus[task.id])
                      .map((task) => (
                        <div key={task.id} className="border rounded-lg p-3 bg-white shadow-sm">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{task.NewHire ? `${task.NewHire.firstName} ${task.NewHire.lastName}${task.NewHire.position ? ` - ${task.NewHire.position}` : ''}` : 'Unknown'}</span>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    In Progress
                  </h3>
                  <div className="space-y-3">
                    {filteredTasks
                      .filter((task) => task.status === "in-progress")
                      .map((task) => (
                        <div key={task.id} className="border rounded-lg p-3 bg-white shadow-sm">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{task.NewHire ? `${task.NewHire.firstName} ${task.NewHire.lastName}${task.NewHire.position ? ` - ${task.NewHire.position}` : ''}` : 'Unknown'}</span>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Completed
                  </h3>
                  <div className="space-y-3">
                    {filteredTasks
                      .filter((task) => task.status === "completed" || taskStatus[task.id])
                      .map((task) => (
                        <div key={task.id} className="border rounded-lg p-3 bg-white shadow-sm">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{task.NewHire ? `${task.NewHire.firstName} ${task.NewHire.lastName}${task.NewHire.position ? ` - ${task.NewHire.position}` : ''}` : 'Unknown'}</span>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="border rounded-lg p-4">
                <div className="text-center p-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium">Calendar View</h3>
                  <p className="text-sm text-gray-500">Calendar view is coming soon</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Task Editor Dialog */}
      <Dialog open={isTaskEditorOpen} onOpenChange={setIsTaskEditorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTask ? "Edit Task" : "Create Task"}</DialogTitle>
            <DialogDescription>
              {selectedTask
                ? "Update the details of this onboarding task."
                : "Create a new onboarding task for your new hires."}
            </DialogDescription>
          </DialogHeader>

          {/* Task Template Select - moved to top */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="task-template">Use Task Template</Label>
            <Select id="task-template" value={selectedTemplateId} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">None (Manual Task)</SelectItem>
                {taskTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={formData.assignee} onValueChange={(value) => handleInputChange("assignee", value)}>
                  <SelectTrigger id="task-assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.flatMap(team =>
                      (team.teamMembers || []).map(member => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.fullName || member.name || member.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-new-hire">New Hire</Label>
                <Select value={formData.newHire} onValueChange={(value) => handleInputChange("newHire", value)}>
                  <SelectTrigger id="task-new-hire">
                    <SelectValue placeholder="Select new hire" />
                  </SelectTrigger>
                  <SelectContent>
                    {newHires.map(hire => (
                      <SelectItem key={hire.id} value={hire.id.toString()}>
                        {hire.firstName} {hire.lastName}{hire.position ? ` - ${hire.position}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={String(formData.priority)} onValueChange={value => handleInputChange("priority", parseInt(value, 10))}>
                  <SelectTrigger id="task-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">High</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="1">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger id="task-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="orientation">Orientation</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>{selectedTask ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Validation Error</DialogTitle>
            <DialogDescription>Please fix the following errors:</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="list-disc pl-5 space-y-1">
              {formErrors.map((error, index) => (
                <li key={index} className="text-red-500">
                  {error}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsErrorDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
