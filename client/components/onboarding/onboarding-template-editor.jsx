import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import TaskTemplateEditor from "@/components/onboarding/task-template-editor";
import { getTaskTemplates } from "@/services/onboardingService";
import {
  addTaskToTemplate,
  removeTaskFromTemplate,
  reorderTasks,
} from "@/services/onboardingService";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingTemplateEditor({ template, onSave, onCancel }) {
  const [taskTemplatesLibrary, setTaskTemplatesLibrary] = useState([]);
  const [isTaskTemplateDialogOpen, setIsTaskTemplateDialogOpen] = useState(false);
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [department, setDepartment] = useState(template?.department || "");
  const [category, setCategory] = useState(template?.category || "checklist");
  const [tasks, setTasks] = useState(template?.TemplateTaskMaps ? template.TemplateTaskMaps.map(m => ({
    taskTemplateId: m.taskTemplateId,
    title: m.OnboardingTaskTemplate?.title,
    description: m.OnboardingTaskTemplate?.description,
    sequence: m.sequence,
  })) : []);
  const [departments] = useState(["Engineering", "Sales", "HR"]);
  const categoryOptions = [
    { value: "checklist", label: "Checklist" },
    { value: "welcome-kit", label: "Welcome Kit" },
    { value: "training-plan", label: "Training Plan" },
  ];
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTaskTemplates().then(setTaskTemplatesLibrary).catch(() => setTaskTemplatesLibrary([]));
  }, []);

  // Add task from library (API)
  const handleAddTask = async (taskTemplate) => {
    if (!template?.id) {
      toast({ title: "Save template first", description: "You must save the template before adding tasks.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await addTaskToTemplate(template.id, taskTemplate.id, tasks.length + 1);
      toast({ title: "Task Added", description: `"${taskTemplate.title}" was added to the template.` });
      // Refetch tasks
      onSave && onSave({ reload: true });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to add task", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Remove task (API)
  const handleRemoveTask = async (idx) => {
    if (!template?.id) return;
    setLoading(true);
    try {
      await removeTaskFromTemplate(template.id, tasks[idx].taskTemplateId);
      toast({ title: "Task Removed", description: `Task was removed from the template.` });
      onSave && onSave({ reload: true });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to remove task", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Move task up/down (API)
  const moveTask = async (idx, direction) => {
    if (!template?.id) return;
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(idx, 1);
    newTasks.splice(idx + direction, 0, removed);
    const reordered = newTasks.map((t, i) => ({ taskTemplateId: t.taskTemplateId, sequence: i + 1 }));
    setLoading(true);
    try {
      await reorderTasks(template.id, reordered);
      toast({ title: "Tasks Reordered", description: "Task order updated." });
      onSave && onSave({ reload: true });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to reorder tasks", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Save (for template details, not tasks)
  const handleSave = () => {
    onSave({
      name,
      description,
      department,
      category,
      // tasks: not sent here, managed via API
    });
  };

  // Handle new task template creation (local only, not persisted)
  const handleNewTaskTemplate = (data) => {
    // This could POST to the backend if you want to allow creating new task templates here
    setIsTaskTemplateDialogOpen(false);
    toast({ title: "Not implemented", description: "Create new task template from here is not implemented.", variant: "destructive" });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{template ? "Edit Onboarding Template" : "Create Onboarding Template"}</DialogTitle>
        <DialogDescription>
          Build your onboarding flow by assembling tasks from the library.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Template Name" />
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dep => (
              <SelectItem key={dep} value={dep}>{dep}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name || !department}>Save</Button>
      </DialogFooter>
      <TaskTemplateEditor
        open={isTaskTemplateDialogOpen}
        onClose={() => setIsTaskTemplateDialogOpen(false)}
        onSave={handleNewTaskTemplate}
      />
    </>
  );
} 