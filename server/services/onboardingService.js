import { onboardingRepository } from "../repositories/onboardingRepository.js";
import { sequelize } from "../config/sequelize.js";
import { communicationsService } from "./communicationsService.js";

export async function initiateOnboarding({ candidateId, jobId, managerId, workLocation, startDate, firstName, lastName, email, position, department, status, progress, clientId, senderId, accessToken, refreshToken }) {
    const newHireData = {
        candidateId,
        jobId,
        managerId: managerId ? Number(managerId) : null,
        workLocation,
        startDate,
        firstName,
        lastName,
        email,
        position,
        department,
        status,
        progress
    };
    // console.log('NewHire.create payload:', newHireData);
    const newHire = await onboardingRepository.createNewHire(newHireData);
    // Trigger welcome_new_hire automation
    try {
        await communicationsService.triggerCandidateAutomation({
            triggerType: 'welcome_new_hire',
            context: {
                candidateId,
                jobId,
                newHireId: newHire.id,
                email,
                firstName,
                lastName,
                senderId,
            },
            tokens: {
                accessToken,
                refreshToken
            },
            clientId
        });
    } catch (err) {
        console.error('[ONBOARDING][initiateOnboarding] welcome_new_hire automation error:', err);
    }
    return { newHire };
}

// Onboarding Template Service
export async function getAllTemplates(clientId) {
    return await onboardingRepository.getAllTemplates(clientId);
}

export async function getTemplateById(id) {
    const template = await onboardingRepository.getTemplateById(id);
    if (!template) throw new Error("Template not found");
    return template;
}

export async function createTemplate(data) {
    return await onboardingRepository.createTemplate(data);
}

export async function updateTemplate(id, data) {
    const updated = await onboardingRepository.updateTemplate(id, data);
    if (!updated) throw new Error("Template not found");
    return updated;
}

export async function deleteTemplate(id) {
    const deleted = await onboardingRepository.deleteTemplate(id);
    if (!deleted) throw new Error("Template not found");
    return true;
}

export async function addTaskToTemplate(templateId, taskTemplateId, sequence) {
    return await onboardingRepository.addTaskToTemplate(templateId, taskTemplateId, sequence);
}

export async function removeTaskFromTemplate(templateId, taskTemplateId) {
    return await onboardingRepository.removeTaskFromTemplate(templateId, taskTemplateId);
}

export async function reorderTasks(templateId, taskOrders) {
    return await onboardingRepository.reorderTasks(templateId, taskOrders);
}

// Onboarding Task Template Service
export async function getAllTaskTemplates() {
    return await onboardingRepository.getAllTaskTemplates();
}

export async function getTaskTemplateById(id) {
    const template = await onboardingRepository.getTaskTemplateById(id);
    if (!template) throw new Error("Task template not found");
    return template;
}

export async function createTaskTemplate(data) {
    return await onboardingRepository.createTaskTemplate(data);
}

export async function updateTaskTemplate(id, data) {
    const updated = await onboardingRepository.updateTaskTemplate(id, data);
    if (!updated) throw new Error("Task template not found");
    return updated;
}

export async function deleteTaskTemplate(id) {
    const deleted = await onboardingRepository.deleteTaskTemplate(id);
    if (!deleted) throw new Error("Task template not found");
    return true;
}

export async function getAllNewHires(clientId) {
    return await onboardingRepository.getAllNewHires(clientId);
}

export async function getNewHireById(id, clientId) {
    return await onboardingRepository.getNewHireById(id, clientId);
}

export async function applyTemplateToNewHire({ newHireId, templateId, dueDate, tasks }) {
    if (Array.isArray(tasks) && tasks.length > 0) {
        // Customized tasks: create each with its own fields
        const createdTasks = [];
        for (const task of tasks) {
            const onboardingTask = await onboardingRepository.createOnboardingTask({
                newHireId,
                taskTemplateId: task.taskTemplateId,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate || null,
                assignedTo: task.assignedTo || null,
                priority: task.priority || null,
                category: task.category || null,
                status: 'pending',
            });
            createdTasks.push(onboardingTask);
        }
        return { tasks: createdTasks };
    }
    // Default: use template logic
    const templateTasks = await onboardingRepository.getTasksForTemplate(templateId);
    if (!templateTasks.length) throw new Error('No tasks found for this template');
    const createdTasks = [];
    for (const task of templateTasks) {
        const onboardingTask = await onboardingRepository.createOnboardingTask({
            newHireId,
            taskTemplateId: task.id,
            title: task.title,
            description: task.description,
            dueDate: dueDate || null,
            status: 'pending',
        });
        createdTasks.push(onboardingTask);
    }
    return { tasks: createdTasks };
}

export async function getOnboardingTasksForNewHire(newHireId, clientId) {
    return await onboardingRepository.getOnboardingTasksForNewHire(newHireId, clientId);
}

export async function getAllOnboardingTasks(clientId) {
    return await onboardingRepository.getAllOnboardingTasks(clientId);
}

export async function updateOnboardingTask(taskId, data, userId = null) {
    return await onboardingRepository.updateOnboardingTask(taskId, data, userId);
}

export async function deleteOnboardingTask(taskId) {
    return await onboardingRepository.deleteOnboardingTask(taskId);
}

export async function deleteNewHire(id) {
    const deleted = await onboardingRepository.deleteNewHire(id);
    if (!deleted) throw new Error("New hire not found");
    return true;
}

// New Hire Notes Service
export async function addNoteToNewHire(newHireId, content, userId, title = "") {
    return await onboardingRepository.addNoteToNewHire(newHireId, content, userId, title);
}

export async function getNotesForNewHire(newHireId) {
    return await onboardingRepository.getNotesForNewHire(newHireId);
}

export async function updateNote(noteId, content, userId, title = "") {
    return await onboardingRepository.updateNote(noteId, content, userId, title);
}

export async function deleteNote(noteId, userId) {
    return await onboardingRepository.deleteNote(noteId, userId);
}

export async function addDocumentToNewHire({ newHireId, documentId, addedBy }) {
    // Add any business logic/validation here if needed
    return await onboardingRepository.addDocumentToNewHire({ newHireId, documentId, addedBy });
}

export async function getDocumentsForNewHire(newHireId) {
    return await onboardingRepository.getDocumentsForNewHire(newHireId);
}

export async function removeDocumentFromNewHire({ newHireId, documentId }) {
    return await onboardingRepository.removeDocumentFromNewHire({ newHireId, documentId });
}

// Onboarding Documents (Global)
export async function addOnboardingDocument({ documentId, subcategory = null }) {
    return await onboardingRepository.addOnboardingDocument({ documentId, subcategory });
}

export async function getAllOnboardingDocuments(clientId) {
    return await onboardingRepository.getAllOnboardingDocuments(clientId);
}

export async function removeOnboardingDocument(id) {
    return await onboardingRepository.removeOnboardingDocument(id);
}

export async function getTemplateTasks(templateId) {
    return await onboardingRepository.getTasksForTemplate(templateId);
}

export async function updateTemplateTasks(templateId, tasks) {
    // Use a transaction for safety
    return await sequelize.transaction(async (transaction) => {
        await onboardingRepository.clearTasksForTemplate(templateId, transaction);
        await onboardingRepository.addTasksToTemplate(templateId, tasks, transaction);
        return await onboardingRepository.getTasksForTemplate(templateId, transaction);
    });
}

export async function updateNewHire(id, data) {
    const updated = await onboardingRepository.updateNewHire(id, data);
    if (!updated) throw new Error("New hire not found");
    return updated;
}

export async function createOnboardingTask(data) {
    return await onboardingRepository.createOnboardingTask(data);
}
