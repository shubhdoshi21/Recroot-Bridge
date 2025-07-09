import * as onboardingService from "../services/onboardingService.js";
import { addDocumentToNewHire, getDocumentsForNewHire, removeDocumentFromNewHire } from "../services/onboardingService.js";
import { canManageNewHireDocuments } from "../utils/permissions.js";
import { addOnboardingDocument, getAllOnboardingDocuments, removeOnboardingDocument } from "../services/onboardingService.js";

// Onboarding Initiation
export async function initiateOnboardingHandler(req, res, next) {
    try {
        // console.log("Initiating onboarding with data:", req.body);
        const result = await onboardingService.initiateOnboarding(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

// Onboarding Templates
export const getAllTemplates = async (req, res) => {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) return res.status(403).json({ error: 'Client context required' });
        const templates = await onboardingService.getAllTemplates(clientId);
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getTemplateById = async (req, res) => {
    try {
        const template = await onboardingService.getTemplateById(req.params.id);
        res.json(template);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};
export const createTemplate = async (req, res) => {
    try {
        const data = {
            ...req.body,
            createdBy: req.user?.id // or whatever uniquely identifies the user
        };
        const template = await onboardingService.createTemplate(data);
        res.status(201).json(template);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const updateTemplate = async (req, res) => {
    try {
        const data = {
            ...req.body,
            createdBy: req.body.createdBy || req.user?.id
        };
        const template = await onboardingService.updateTemplate(req.params.id, data);
        res.json(template);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};
export const deleteTemplate = async (req, res) => {
    try {
        await onboardingService.deleteTemplate(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

export const getTemplateTasks = async (req, res, next) => {
    try {
        const tasks = await onboardingService.getTemplateTasks(req.params.id);
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

export const updateTemplateTasks = async (req, res, next) => {
    try {
        const { tasks } = req.body;
        const result = await onboardingService.updateTemplateTasks(req.params.id, tasks);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Onboarding Task Templates
export const getAllTaskTemplates = async (req, res) => {
    try {
        const templates = await onboardingService.getAllTaskTemplates();
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getTaskTemplateById = async (req, res) => {
    try {
        const template = await onboardingService.getTaskTemplateById(req.params.id);
        res.json(template);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};
export const createTaskTemplate = async (req, res) => {
    try {
        const { title, description } = req.body;
        const template = await onboardingService.createTaskTemplate({ title, description });
        res.status(201).json(template);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const updateTaskTemplate = async (req, res) => {
    try {
        const { title, description } = req.body;
        const template = await onboardingService.updateTaskTemplate(req.params.id, { title, description });
        res.json(template);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};
export const deleteTaskTemplate = async (req, res) => {
    try {
        await onboardingService.deleteTaskTemplate(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

export async function getAllNewHires(req, res, next) {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) return res.status(403).json({ error: 'Client context required' });
        const newHires = await onboardingService.getAllNewHires(clientId);
        res.json(newHires);
    } catch (error) {
        next(error);
    }
}

export async function getNewHireById(req, res, next) {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) return res.status(403).json({ error: 'Client context required' });
        const newHire = await onboardingService.getNewHireById(req.params.id, clientId);
        if (!newHire) return res.status(404).json({ error: 'Not found' });
        res.json(newHire);
    } catch (error) {
        next(error);
    }
}

export async function applyTemplateToNewHireHandler(req, res, next) {
    try {
        const result = await onboardingService.applyTemplateToNewHire(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getOnboardingTasksForNewHire(req, res, next) {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) return res.status(403).json({ error: 'Client context required' });
        const tasks = await onboardingService.getOnboardingTasksForNewHire(req.params.newHireId, clientId);
        res.json(tasks);
    } catch (error) {
        next(error);
    }
}

export async function getAllOnboardingTasks(req, res, next) {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) return res.status(403).json({ error: 'Client context required' });
        const tasks = await onboardingService.getAllOnboardingTasks(clientId);
        res.json(tasks);
    } catch (error) {
        next(error);
    }
}

export async function updateOnboardingTaskHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        // Fetch the task first
        const { OnboardingTask } = await import("../models/OnboardingTask.js");
        const task = await OnboardingTask.findByPk(req.params.taskId);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Only allow the assigned user to update the task
        if (task.assignedTo && task.assignedTo !== userId) {
            return res.status(403).json({ error: "You are not allowed to update this task" });
        }

        const updated = await onboardingService.updateOnboardingTask(req.params.taskId, req.body, userId);
        res.json(updated);
    } catch (error) {
        next(error);
    }
}

export async function deleteOnboardingTaskHandler(req, res, next) {
    try {
        await onboardingService.deleteOnboardingTask(req.params.taskId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
}

export async function deleteNewHireHandler(req, res, next) {
    try {
        await onboardingService.deleteNewHire(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

// New Hire Notes Handlers
export async function addNoteToNewHireHandler(req, res, next) {
    try {
        const { newHireId, content, title } = req.body;
        const userId = req.user?.id;
        if (!userId) return res.status(403).json({ error: 'User not authenticated' });
        const note = await onboardingService.addNoteToNewHire(newHireId, content, userId, title);
        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
}

export async function getNotesForNewHireHandler(req, res, next) {
    try {
        const { newHireId } = req.params;
        const notes = await onboardingService.getNotesForNewHire(newHireId);
        res.json(notes);
    } catch (error) {
        next(error);
    }
}

export async function updateNoteHandler(req, res, next) {
    try {
        const { noteId } = req.params;
        const { content, userId, title } = req.body;
        // console.log('noteId', noteId)
        // console.log('title', title)
        const note = await onboardingService.updateNote(noteId, content, userId, title);
        res.json(note);
    } catch (error) {
        console.log('error', error)
        next(error);
    }
}

export async function deleteNoteHandler(req, res, next) {
    try {
        const { noteId } = req.params;
        const { userId } = req.body;
        await onboardingService.deleteNote(noteId, userId);
        res.status(204).end();
    } catch (error) {
        // console.log('error', error)
        next(error);
    }
}

export async function addDocumentToNewHireHandler(req, res, next) {
    try {
        const { id: newHireId } = req.params;
        const user = req.user;
        if (!(await canManageNewHireDocuments({ user, newHireId }))) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const { documentId, addedBy } = req.body;
        const result = await addDocumentToNewHire({ newHireId, documentId, addedBy });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getDocumentsForNewHireHandler(req, res, next) {
    try {
        const { id: newHireId } = req.params;
        const user = req.user;
        if (!(await canManageNewHireDocuments({ user, newHireId }))) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const docs = await getDocumentsForNewHire(newHireId);
        res.json(docs);
    } catch (error) {
        next(error);
    }
}

export async function removeDocumentFromNewHireHandler(req, res, next) {
    try {
        const { id: newHireId, docId: documentId } = req.params;
        const user = req.user;
        if (!(await canManageNewHireDocuments({ user, newHireId }))) {
            return res.status(403).json({ error: "Forbidden" });
        }
        await removeDocumentFromNewHire({ newHireId, documentId });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
}

// Onboarding Documents (Global)
export async function addOnboardingDocumentHandler(req, res, next) {
    try {
        const { documentId, subcategory } = req.body;
        const onboardingDoc = await addOnboardingDocument({ documentId, subcategory });
        res.status(201).json(onboardingDoc);
    } catch (error) {
        next(error);
    }
}

export async function getAllOnboardingDocumentsHandler(req, res, next) {
    try {
        const clientId = req.user?.clientId;
        if (!clientId) return res.status(403).json({ error: 'Client context required' });
        const docs = await onboardingService.getAllOnboardingDocuments(clientId);
        res.json(docs);
    } catch (error) {
        next(error);
    }
}

export async function removeOnboardingDocumentHandler(req, res, next) {
    try {
        const { id } = req.params;
        const result = await removeOnboardingDocument(id);
        if (!result) return res.status(404).json({ error: "Onboarding document not found" });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
}

export async function updateNewHireHandler(req, res, next) {
    try {
        const updated = await onboardingService.updateNewHire(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        next(error);
    }
}

export async function createOnboardingTaskHandler(req, res, next) {
    try {
        const task = await onboardingService.createOnboardingTask(req.body);
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
} 