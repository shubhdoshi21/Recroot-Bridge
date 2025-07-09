import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const CATEGORY_OPTIONS = [
    { value: "checklist", label: "Checklists" },
    { value: "welcome-kit", label: "Welcome Kits" },
    { value: "training-plan", label: "Training Plans" },
];

export default function OnboardingTemplateForm({ open, onOpenChange, template, onSave }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
    const [department, setDepartment] = useState("");
    const [items, setItems] = useState([{ title: "", description: "", type: "task" }]);

    React.useEffect(() => {
        if (template) {
            setName(template.name || "");
            setDescription(template.description || "");
            setCategory(template.category || CATEGORY_OPTIONS[0].value);
            setDepartment(template.department || "");
            setItems(template.items && template.items.length > 0 ? template.items : [{ title: "", description: "", type: "task" }]);
        } else {
            // Reset for new template
            setName("");
            setDescription("");
            setCategory(CATEGORY_OPTIONS[0].value);
            setDepartment("");
            setItems([{ title: "", description: "", type: "task" }]);
        }
    }, [template, open]);

    const addItem = () => {
        setItems([...items, { title: "", description: "", type: "task" }]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, description, category, department, items });
    };

    const handleClose = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template ? "Edit Template" : "Create New Onboarding Template"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department (Optional)</Label>
                            <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-semibold">Template Items</h3>
                        {items.map((item, index) => (
                            <div key={index} className="space-y-3 p-3 border rounded-md relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-7 w-7"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="space-y-2">
                                    <Label htmlFor={`item-title-${index}`}>Item Title</Label>
                                    <Input
                                        id={`item-title-${index}`}
                                        value={item.title}
                                        onChange={(e) => updateItem(index, "title", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`item-description-${index}`}>Item Description</Label>
                                    <Textarea
                                        id={`item-description-${index}`}
                                        value={item.description}
                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`item-type-${index}`}>Item Type</Label>
                                    <Select
                                        value={item.type}
                                        onValueChange={(value) => updateItem(index, "type", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="task">Task</SelectItem>
                                            <SelectItem value="document">Document</SelectItem>
                                            <SelectItem value="survey">Survey</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addItem}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Template</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 