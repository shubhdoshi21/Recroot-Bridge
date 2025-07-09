import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TaskTemplateEditor({ open, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, description });
    setTitle("");
    setDescription("");
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Task Template</DialogTitle>
          <DialogDescription>
            Create a reusable onboarding task template.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Complete Paperwork" />
          </div>
          <div>
            <label className="font-semibold">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Task description (optional)" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 