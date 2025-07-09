import express from 'express';
import {
    initiateOnboardingHandler,
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateTasks,
    updateTemplateTasks,
    getAllTaskTemplates,
    getTaskTemplateById,
    createTaskTemplate,
    updateTaskTemplate,
    deleteTaskTemplate,
    getAllNewHires,
    applyTemplateToNewHireHandler,
    getOnboardingTasksForNewHire,
    getAllOnboardingTasks,
    updateOnboardingTaskHandler,
    deleteOnboardingTaskHandler,
    deleteNewHireHandler,
    addNoteToNewHireHandler,
    getNotesForNewHireHandler,
    updateNoteHandler,
    deleteNoteHandler,
    addDocumentToNewHireHandler,
    getDocumentsForNewHireHandler,
    removeDocumentFromNewHireHandler,
    addOnboardingDocumentHandler,
    getAllOnboardingDocumentsHandler,
    removeOnboardingDocumentHandler,
    updateNewHireHandler,
    createOnboardingTaskHandler,
} from '../controllers/onboardingController.js';
import { protect } from "../middlewares/authMiddleware.js";
import { checkOnboardingDocumentAccess, checkPermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Onboarding Initiation
router.post('/initiate', protect, checkPermission('new_hires.create'), initiateOnboardingHandler);

// New Hires
router.get('/new-hires', protect, checkPermission('new_hires.view'), getAllNewHires);
router.put('/new-hires/:id', protect, checkPermission('new_hires.edit'), updateNewHireHandler);
router.delete('/new-hires/:id', protect, checkPermission('new_hires.delete'), deleteNewHireHandler);

// Onboarding Templates
router.get('/templates', protect, checkPermission('onboarding_template.view'), getAllTemplates);
router.get('/templates/:id', protect, checkPermission('onboarding_template.view'), getTemplateById);
router.post('/templates', protect, checkPermission('onboarding_template.create'), createTemplate);
router.put('/templates/:id', protect, checkPermission('onboarding_template.edit'), updateTemplate);
router.delete('/templates/:id', protect, checkPermission('onboarding_template.delete'), deleteTemplate);

// Onboarding Template Tasks
router.get('/templates/:id/tasks', protect, checkPermission('task_template.view'), getTemplateTasks);
router.put('/templates/:id/tasks', protect, checkPermission('task_template.edit'), updateTemplateTasks);

// Onboarding Task Templates
router.get('/task-templates', protect, checkPermission('task_template.view'), getAllTaskTemplates);
router.get('/task-templates/:id', protect, checkPermission('task_template.view'), getTaskTemplateById);
router.post('/task-templates', protect, checkPermission('task_template.create'), createTaskTemplate);
router.put('/task-templates/:id', protect, checkPermission('task_template.edit'), updateTaskTemplate);
router.delete('/task-templates/:id', protect, checkPermission('task_template.delete'), deleteTaskTemplate);

// Apply Template to New Hire
router.post('/apply-template', protect, checkPermission('onboarding_template.assign'), applyTemplateToNewHireHandler);

// Get onboarding tasks for a new hire
router.get('/tasks/:newHireId', protect, checkPermission('onboarding_task.view'), getOnboardingTasksForNewHire);

// Get all onboarding tasks (optionally filtered by newHireId)
router.get('/tasks', protect, checkPermission('onboarding_task.view'), getAllOnboardingTasks);

// Create onboarding task
router.post('/tasks', protect, checkPermission('onboarding_task.create'), createOnboardingTaskHandler);

// Update and delete onboarding tasks
router.put('/tasks/:taskId', protect, checkPermission('onboarding_task.edit'), updateOnboardingTaskHandler);
router.delete('/tasks/:taskId', protect, checkPermission('onboarding_task.delete'), deleteOnboardingTaskHandler);

// New Hire Notes
router.post('/notes', protect, checkPermission('new_hires.edit'), addNoteToNewHireHandler);
router.get('/notes/:newHireId', protect, checkPermission('new_hires.view'), getNotesForNewHireHandler);
router.put('/notes/:noteId', protect, checkPermission('new_hires.edit'), updateNoteHandler);
router.delete('/notes/:noteId', protect, checkPermission('new_hires.edit'), deleteNoteHandler);

// New Hire Documents (per-hire)
router.post(
    '/new-hires/:id/documents',
    protect,
    checkPermission('new_hires.edit'),
    checkOnboardingDocumentAccess,
    addDocumentToNewHireHandler
);
router.get(
    '/new-hires/:id/documents',
    protect,
    checkPermission('new_hires.view'),
    checkOnboardingDocumentAccess,
    getDocumentsForNewHireHandler
);
router.delete(
    '/new-hires/:id/documents/:docId',
    protect,
    checkPermission('new_hires.edit'),
    checkOnboardingDocumentAccess,
    removeDocumentFromNewHireHandler
);

// Onboarding Documents (Global)
router.post('/documents', protect, checkPermission('onboarding_document.upload'), addOnboardingDocumentHandler);
router.get('/documents', protect, checkPermission('onboarding_document.view'), getAllOnboardingDocumentsHandler);
router.delete('/documents/:id', protect, checkPermission('onboarding_document.delete'), removeOnboardingDocumentHandler);

export default router; 