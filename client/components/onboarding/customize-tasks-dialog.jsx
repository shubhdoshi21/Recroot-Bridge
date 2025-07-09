import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettings } from "@/contexts/settings-context" // To get all users
import { useTeams } from "@/contexts/teams-context" // To get all teams and their members
import { Trash2, Plus, FilePlus2 } from "lucide-react"
import { getTaskTemplates } from "@/services/onboardingService"

export default function CustomizeTasksDialog({ open, onOpenChange, tasks = [], onConfirm, templateName }) {
  const [customTasks, setCustomTasks] = useState([])
  const { users } = useSettings()
  const { teams } = useTeams()
  const [availableTemplates, setAvailableTemplates] = useState([])
  const [usedTemplateIds, setUsedTemplateIds] = useState([])
  const [addTemplateOpen, setAddTemplateOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState("")

  // Create a list of all members with their team names for the dropdown
  const allTeamMembers = teams.flatMap(team =>
    (team.teamMembers || []).map(member => ({
      ...member,
      teamName: team.name,
    }))
  )

  // Fetch all task templates on open
  useEffect(() => {
    if (open) {
      setCustomTasks(
        tasks.map(task => ({
          title: task.title || "",
          description: task.description || "",
          dueDate: task.dueDate || "",
          assignedTo: task.assignedTo || "",
          priority: task.priority === 3 ? 3 : task.priority === 2 ? 2 : 1,
          category: task.category || "",
          taskTemplateId: task.taskTemplateId || task.id || undefined,
        }))
      )
      getTaskTemplates().then(setAvailableTemplates)
    }
  }, [open, tasks])

  // Compute used template IDs
  useEffect(() => {
    setUsedTemplateIds(customTasks.map(t => t.taskTemplateId).filter(Boolean))
  }, [customTasks])

  // Remove a task
  const handleRemoveTask = (idx) => {
    setCustomTasks(prev => prev.filter((_, i) => i !== idx))
  }

  // Add a new blank task
  const handleAddNewTask = () => {
    setCustomTasks(prev => [
      ...prev,
      {
        title: "",
        description: "",
        dueDate: "",
        assignedTo: "",
        priority: 1,
        category: "",
        taskTemplateId: undefined,
      },
    ])
  }

  // Add from template
  const handleAddFromTemplate = () => {
    if (!selectedTemplateId) return
    const template = availableTemplates.find(t => t.id.toString() === selectedTemplateId)
    if (!template) return
    setCustomTasks(prev => [
      ...prev,
      {
        title: template.title || template.name || "",
        description: template.description || "",
        dueDate: "",
        assignedTo: "",
        priority: 1,
        category: template.category || "",
        taskTemplateId: template.id,
      },
    ])
    setSelectedTemplateId("")
    setAddTemplateOpen(false)
  }

  const handleTaskChange = (index, field, value) => {
    setCustomTasks(prev => {
      const updated = [...prev]
      updated[index][field] = value
      return updated
    })
  }

  const handleConfirm = () => {
    onConfirm(customTasks.map(task => ({
      ...task,
      assignedTo: task.assignedTo ? parseInt(task.assignedTo, 10) : null
    })))
  }

  // Filter available templates to only those not used
  const filteredTemplates = availableTemplates.filter(
    t => !usedTemplateIds.includes(t.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Customize Tasks{templateName ? ` for ${templateName}` : ""}</DialogTitle>
          <DialogDescription>
            Edit the tasks before applying the template. You can change the title, description, due date, assignee, priority, and category for each task.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleAddNewTask}>
            <Plus className="w-4 h-4 mr-1" /> Add New Task
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddTemplateOpen(v => !v)}>
            <FilePlus2 className="w-4 h-4 mr-1" /> Add from Template
          </Button>
          {addTemplateOpen && (
            <div className="flex items-center gap-2">
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select template task" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.length === 0 ? (
                    <div className="px-2 py-1 text-xs text-gray-400">No available templates</div>
                  ) : (
                    filteredTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.title || t.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddFromTemplate} disabled={!selectedTemplateId}>
                Add
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-6 py-2">
          {customTasks.length === 0 ? (
            <div className="text-center text-gray-400">No tasks to customize.</div>
          ) : (
            customTasks.map((task, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3 bg-gray-50 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-100"
                  onClick={() => handleRemoveTask(idx)}
                  title="Remove task"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`task-title-${idx}`}>Title</Label>
                    <Input
                      id={`task-title-${idx}`}
                      value={task.title}
                      onChange={e => handleTaskChange(idx, "title", e.target.value)}
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`task-due-${idx}`}>Due Date</Label>
                    <Input
                      id={`task-due-${idx}`}
                      type="date"
                      value={task.dueDate}
                      onChange={e => handleTaskChange(idx, "dueDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`task-assigned-${idx}`}>Assigned To</Label>
                    <Select
                      value={task.assignedTo}
                      onValueChange={val => handleTaskChange(idx, "assignedTo", val)}
                    >
                      <SelectTrigger id={`task-assigned-${idx}`}>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <div key={team.id}>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">{team.name}</div>
                            {(team.teamMembers || []).map(member => (
                              <SelectItem key={member.id} value={member.id.toString()}>
                                {member.fullName || member.name || member.email}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`task-priority-${idx}`}>Priority</Label>
                    <Select
                      value={task.priority.toString()}
                      onValueChange={value => handleTaskChange(idx, "priority", parseInt(value))}
                    >
                      <SelectTrigger id={`task-priority-${idx}`}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">High</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="1">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`task-category-${idx}`}>Category</Label>
                    <Select
                      value={task.category}
                      onValueChange={value => handleTaskChange(idx, "category", value)}
                    >
                      <SelectTrigger id={`task-category-${idx}`}>
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
                <div className="space-y-2">
                  <Label htmlFor={`task-desc-${idx}`}>Description</Label>
                  <Textarea
                    id={`task-desc-${idx}`}
                    value={task.description}
                    onChange={e => handleTaskChange(idx, "description", e.target.value)}
                    placeholder="Task description"
                    rows={2}
                  />
                </div>
                {task.taskTemplateId && (
                  <div className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Task Template ID:</span> {task.taskTemplateId}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={customTasks.length === 0}>
            Confirm & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 