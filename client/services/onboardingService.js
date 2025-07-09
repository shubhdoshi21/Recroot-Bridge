import { api } from "@/config/api";

// Onboarding Initiation
export async function initiateOnboarding(data) {
    const res = await fetch(api.onboarding.initiate(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to initiate onboarding");
    return res.json();
}

// Onboarding Templates
export async function getTemplates() {
    const res = await fetch(api.onboarding.templates.getAll(), { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch onboarding templates");
    return res.json();
}

export async function getTemplateById(id) {
    const res = await fetch(api.onboarding.templates.getById(id), { credentials: "include" });
    if (!res.ok) throw new Error("Onboarding template not found");
    return res.json();
}

export async function createTemplate(data) {
    const res = await fetch(api.onboarding.templates.create(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create onboarding template");
    return res.json();
}

export async function updateTemplate(id, data) {
    const res = await fetch(api.onboarding.templates.update(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update onboarding template");
    return res.json();
}

export async function deleteTemplate(id) {
    const res = await fetch(api.onboarding.templates.delete(id), {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete onboarding template");
    return true;
}

// Template Tasks
export async function getTemplateTasks(templateId) {
    const res = await fetch(api.onboarding.templates.getTasks(templateId), {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch tasks for template");
    return res.json();
}

export async function updateTemplateTasks(templateId, tasks) {
    const res = await fetch(api.onboarding.templates.updateTasks(templateId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tasks }),
    });
    if (!res.ok) throw new Error("Failed to update tasks for template");
    return res.json();
}

// Onboarding Task Templates
export async function getTaskTemplates() {
    const res = await fetch(api.onboarding.taskTemplates.getAll(), { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch task templates");
    return res.json();
}

export async function getTaskTemplateById(id) {
    const res = await fetch(api.onboarding.taskTemplates.getById(id), { credentials: "include" });
    if (!res.ok) throw new Error("Task template not found");
    return res.json();
}

export async function createTaskTemplate(data) {
    const res = await fetch(api.onboarding.taskTemplates.create(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create task template");
    return res.json();
}

export async function updateTaskTemplate(id, data) {
    const res = await fetch(api.onboarding.taskTemplates.update(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update task template");
    return res.json();
}

export async function deleteTaskTemplate(id) {
    const res = await fetch(api.onboarding.taskTemplates.delete(id), {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete task template");
    return true;
}

export async function getAllNewHires() {
    const res = await fetch(api.onboarding.getAllNewHires(), { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch new hires");
    return res.json();
}

export async function applyTemplateToNewHire({ newHireId, templateId, dueDate }) {
    const res = await fetch(api.onboarding.applyTemplateToNewHire(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newHireId, templateId, dueDate }),
    });
    if (!res.ok) throw new Error("Failed to apply template to new hire");
    return res.json();
}

export async function getOnboardingTasksForNewHire(newHireId) {
    const res = await fetch(api.onboarding.getOnboardingTasksForNewHire(newHireId), { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch onboarding tasks");
    return res.json();
}

export async function getAllOnboardingTasks(newHireId) {
    const res = await fetch(api.onboarding.getAllOnboardingTasks(newHireId), { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch onboarding tasks");
    return res.json();
}

export async function applyCustomizedTasksToNewHire({ newHireId, tasks }) {
    const res = await fetch(api.onboarding.applyTemplateToNewHire(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newHireId, tasks }),
    });
    if (!res.ok) throw new Error("Failed to apply customized tasks");
    return res.json();
}

export async function updateOnboardingTask(taskId, data) {
    const res = await fetch(api.onboarding.updateTask(taskId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update onboarding task");
    return res.json();
}

export async function deleteOnboardingTask(taskId) {
    const res = await fetch(api.onboarding.deleteTask(taskId), {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete onboarding task");
    return true;
}

export async function updateNewHire(id, data) {
    const res = await fetch(api.onboarding.updateNewHire(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update new hire");
    return res.json();
}

export async function deleteNewHire(id) {
    const res = await fetch(api.onboarding.deleteNewHire(id), {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete new hire");
    return true;
}

export async function getDepartments() {
    const res = await fetch(api.jobs.getDepartments(), { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch departments");
    return res.json();
}

// New Hire Notes API
export async function addNoteToNewHire({ newHireId, content, userId, title }) {
    const res = await fetch(api.onboarding.notes.addNote(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newHireId, content, userId, title }),
    });
    if (!res.ok) throw new Error("Failed to add note");
    return res.json();
}

export async function getNotesForNewHire(newHireId) {
    const res = await fetch(api.onboarding.notes.getNotes(newHireId), {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
}

export async function updateNote(noteId, { content, userId, title }) {
    const res = await fetch(api.onboarding.notes.updateNote(noteId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, userId, title }),
    });
    if (!res.ok) throw new Error("Failed to update note");
    return res.json();
}

export async function deleteNote(noteId, userId) {
    const res = await fetch(api.onboarding.notes.deleteNote(noteId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to delete note");
    return true;
}

export async function getDocumentsForNewHire(newHireId) {
    const res = await fetch(api.onboarding.newHireDocuments.get(newHireId), {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch documents for new hire");
    return res.json();
}

export async function addDocumentToNewHire({ newHireId, documentId, addedBy }) {
    const res = await fetch(api.onboarding.newHireDocuments.add(newHireId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId, addedBy }),
    });
    if (!res.ok) throw new Error("Failed to add document to new hire");
    return res.json();
}

export async function removeDocumentFromNewHire({ newHireId, documentId }) {
    const res = await fetch(api.onboarding.newHireDocuments.remove(newHireId, documentId), {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to remove document from new hire");
    return true;
}

// Onboarding Documents (Global)
export async function getAllOnboardingDocuments() {
    const res = await fetch(api.onboarding.documents.getAll(), { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch onboarding documents");
    return res.json();
}

export async function addOnboardingDocument({ documentId, subcategory = null }) {
    const res = await fetch(api.onboarding.documents.add(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId, subcategory }),
    });
    if (!res.ok) throw new Error("Failed to add onboarding document");
    return res.json();
}

export async function removeOnboardingDocument(id) {
    const res = await fetch(api.onboarding.documents.remove(id), {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to remove onboarding document");
    return true;
}

export async function createOnboardingTask(data) {
    const res = await fetch(api.onboarding.createTask(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create onboarding task");
    return res.json();
} 