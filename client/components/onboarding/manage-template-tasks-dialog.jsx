import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { getTaskTemplates, getTemplateTasks, updateTemplateTasks } from "@/services/onboardingService";
import { useToast } from "@/hooks/use-toast";

export default function ManageTemplateTasksDialog(props) {
  if (!props.template) return null;
  const { open, onOpenChange, template, onTasksUpdated } = props;
  const [taskTemplatesLibrary, setTaskTemplatesLibrary] = useState([]);
  const [tasks, setTasks] = useState([]); // { id, title, description, sequence }
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch task templates library and the tasks currently in the template
  useEffect(() => {
    if (!open || !template) return;
    setLoading(true);
    Promise.all([getTaskTemplates(), getTemplateTasks(template.id)])
      .then(([library, currentTasks]) => {
        setTaskTemplatesLibrary(library);
        // The tasks from getTemplateTasks are already sorted and formatted
        setTasks(currentTasks);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description:
            err.message || "Failed to load task data for the template.",
          variant: "destructive",
        });
        setTaskTemplatesLibrary([]);
        setTasks([]);
      })
      .finally(() => setLoading(false));
  }, [open, template, toast]);

  // Add task (local only)
  const handleAddTask = () => {
    if (!selectedTaskId) return;
    const taskTemplate = taskTemplatesLibrary.find(
      (t) => t.id === Number(selectedTaskId)
    );
    if (!taskTemplate) return;
    // Prevent adding duplicates
    if (tasks.some((t) => t.id === taskTemplate.id)) {
      toast({
        title: "Task Already Exists",
        description: "This task is already in the template.",
        variant: "default",
      });
      return;
    }
    setTasks([
      ...tasks,
      {
        ...taskTemplate, // a task in the list has the same shape as a task template
        sequence: tasks.length + 1,
      },
    ]);
    setSelectedTaskId("");
  };

  // Remove task (local only)
  const handleRemoveTask = (idx) => {
    const newTasks = tasks
      .filter((_, i) => i !== idx)
      .map((t, i) => ({ ...t, sequence: i + 1 }));
    setTasks(newTasks);
  };

  // Move task up/down (local only)
  const moveTask = (idx, direction) => {
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(idx, 1);
    newTasks.splice(idx + direction, 0, removed);
    setTasks(newTasks.map((t, i) => ({ ...t, sequence: i + 1 })));
  };

  // Save all changes in a single batch update
  const handleSave = async () => {
    setLoading(true);
    try {
      // The backend will handle the logic of diffing, adding, removing, and reordering.
      // We just send the final desired state of the tasks.
      await updateTemplateTasks(template.id, tasks);
      toast({
        title: "Tasks Updated",
        description: "Template tasks updated successfully.",
      });
      onTasksUpdated?.();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Manage Tasks for: {template?.name}</DialogTitle>
          <DialogDescription>
            Add, remove, and reorder tasks for this onboarding template. Changes
            are saved in batch.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="font-semibold mb-2">Tasks in Template</div>
          {tasks.length === 0 && (
            <div className="text-gray-400">No tasks yet.</div>
          )}
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded"
            >
              <span className="flex-1">{task.title}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveTask(idx, -1)}
                disabled={idx === 0 || loading}
              >
                <ArrowUp />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveTask(idx, 1)}
                disabled={idx === tasks.length - 1 || loading}
              >
                <ArrowDown />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveTask(idx)}
                disabled={loading}
              >
                <Trash2 className="text-red-500" />
              </Button>
            </div>
          ))}
          <div className="mt-2 flex gap-2">
            <Select
              value={selectedTaskId}
              onValueChange={setSelectedTaskId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add Task from Library" />
              </SelectTrigger>
              <SelectContent>
                {taskTemplatesLibrary
                  .filter((t) => !tasks.some((task) => task.id === t.id))
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleAddTask}
              disabled={!selectedTaskId || loading}
            >
              <Plus size={16} /> Add Task
            </Button>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 