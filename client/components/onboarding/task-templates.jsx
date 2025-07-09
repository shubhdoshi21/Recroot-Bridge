import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  getTaskTemplates,
  createTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
} from "@/services/onboardingService";
import { useToast } from "@/hooks/use-toast";

export default function TaskTemplates() {
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editorData, setEditorData] = useState({ title: "", description: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTaskTemplates();
      setTaskTemplates(data);
    } catch (err) {
      setError(err.message || "Failed to load task templates");
      toast({ title: "Error", description: err.message || "Failed to load task templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line
  }, []);

  const openEditor = (template = null) => {
    setSelectedTemplate(template);
    setEditorData(template ? { title: template.title, description: template.description } : { title: "", description: "" });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
    setEditorData({ title: "", description: "" });
    setError("");
  };

  const handleSave = async () => {
    if (!editorData.title.trim()) return;
    setLoading(true);
    setError("");
    try {
      if (selectedTemplate) {
        await updateTaskTemplate(selectedTemplate.id, editorData);
        toast({ title: "Task Template Updated", description: `"${editorData.title}" was updated successfully.` });
      } else {
        await createTaskTemplate(editorData);
        toast({ title: "Task Template Created", description: `"${editorData.title}" was created successfully.` });
      }
      await fetchTemplates();
      closeEditor();
    } catch (err) {
      setError(err.message || "Failed to save task template");
      toast({ title: "Error", description: err.message || "Failed to save task template", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openDelete = (template) => {
    setDeleteTarget(template);
    setIsDeleteOpen(true);
    setError("");
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeleteTarget(null);
    setError("");
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteTaskTemplate(deleteTarget.id);
      toast({ title: "Task Template Deleted", description: `"${deleteTarget.title}" was deleted successfully.` });
      await fetchTemplates();
      closeDelete();
    } catch (err) {
      setError(err.message || "Failed to delete task template");
      toast({ title: "Error", description: err.message || "Failed to delete task template", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border border-gray-200 transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Task Template Library</CardTitle>
        <Button onClick={() => openEditor()} className="flex items-center gap-2" size="sm"><Plus size={16}/> New Task Template</Button>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2 font-medium text-gray-700">Title</th>
                  <th className="py-2 px-2 font-medium text-gray-700">Description</th>
                  <th className="py-2 px-2 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {taskTemplates.map(template => (
                  <tr
                    key={template.id}
                    className="border-b"
                  >
                    <td className="py-2 px-2 font-medium">{template.title}</td>
                    <td className="py-2 px-2 text-gray-600">{template.description}</td>
                    <td className="py-2 px-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditor(template)} aria-label="Edit"><Edit size={16}/></Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(template)} aria-label="Delete"><Trash2 size={16} className="text-red-500"/></Button>
                    </td>
                  </tr>
                ))}
                {taskTemplates.length === 0 && !loading && (
                  <tr><td colSpan={3} className="text-center py-4 text-gray-400">No task templates found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={closeEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Edit Task Template" : "New Task Template"}</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? "Update the details of this task template." : "Create a reusable onboarding task template."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Title</label>
              <Input value={editorData.title} onChange={e => setEditorData(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Complete Paperwork" />
            </div>
            <div>
              <label className="font-semibold">Description</label>
              <Input value={editorData.description} onChange={e => setEditorData(d => ({ ...d, description: e.target.value }))} placeholder="Task description (optional)" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={handleSave} disabled={!editorData.title.trim() || loading}>{selectedTemplate ? "Save Changes" : "Create Task Template"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={closeDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeDelete}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 