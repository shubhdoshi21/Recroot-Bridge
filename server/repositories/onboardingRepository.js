import { OnboardingTemplate, DocumentTag, TemplateTaskMap, OnboardingTaskTemplate, NewHire, OnboardingTask, TeamMember, NewHireNote, Note, Job, NewHireDocument, Document, User, OnboardingDocument, Company } from "../models/index.js"


export const onboardingRepository = {
    // Onboarding Template Methods
    async getAllTemplates(clientId) {
        return await OnboardingTemplate.findAll({
            include: [
                {
                    model: User,
                    as: "creator",
                    where: { clientId },
                    attributes: [],
                },
                {
                    model: TemplateTaskMap,
                    include: [{ model: OnboardingTaskTemplate }],
                    order: [["sequence", "ASC"]],
                },
            ],
        });
    },
    async getTemplateById(id) {
        return await OnboardingTemplate.findByPk(id, {
            include: [{
                model: TemplateTaskMap,
                include: [{ model: OnboardingTaskTemplate }],
                order: [["sequence", "ASC"]],
            }],
        });
    },
    async createTemplate(data) {
        return await OnboardingTemplate.create({
            ...data,
            itemCount: data.itemCount ?? 0,
        });
    },
    async updateTemplate(id, data) {
        const template = await OnboardingTemplate.findByPk(id);
        if (!template) return null;
        await template.update(data);
        return template;
    },
    async deleteTemplate(id) {
        const template = await OnboardingTemplate.findByPk(id);
        if (!template) return null;
        await template.destroy();
        return true;
    },
    async getTasksForTemplate(templateId, transaction = null) {
        const mappings = await TemplateTaskMap.findAll({
            where: { templateId },
            include: [{ model: OnboardingTaskTemplate, as: 'OnboardingTaskTemplate' }],
            order: [['sequence', 'ASC']],
            transaction,
        });
        // Return a clean list of task templates, not the mapping objects
        return mappings.map(m => ({
            id: m.OnboardingTaskTemplate.id,
            title: m.OnboardingTaskTemplate.title,
            description: m.OnboardingTaskTemplate.description,
            sequence: m.sequence,
        }));
    },
    async clearTasksForTemplate(templateId, transaction) {
        await TemplateTaskMap.destroy({
            where: { templateId },
            transaction,
        });
        // We don't update the itemCount here, it will be updated after adding new tasks
    },
    async addTasksToTemplate(templateId, tasks, transaction) {
        const mappings = tasks.map((task, index) => ({
            templateId,
            taskTemplateId: task.id,
            sequence: index + 1, // Ensure sequence is 1-based and ordered
        }));
        await TemplateTaskMap.bulkCreate(mappings, { transaction });

        // Now, update the itemCount on the parent template
        const template = await OnboardingTemplate.findByPk(templateId, { transaction });
        if (template) {
            await template.update({ itemCount: tasks.length }, { transaction });
        }
    },

    // Onboarding Task Template Methods
    async getAllTaskTemplates() {
        return await OnboardingTaskTemplate.findAll();
    },
    async getTaskTemplateById(id) {
        return await OnboardingTaskTemplate.findByPk(id);
    },
    async createTaskTemplate(data) {
        if (!data.title) throw new Error("Title is required");
        return await OnboardingTaskTemplate.create({
            title: data.title,
            description: data.description || null,
        });
    },
    async updateTaskTemplate(id, data) {
        const template = await OnboardingTaskTemplate.findByPk(id);
        if (!template) return null;
        if (!data.title) throw new Error("Title is required");
        await template.update({
            title: data.title,
            description: data.description || null,
        });
        return template;
    },
    async deleteTaskTemplate(id) {
        const template = await OnboardingTaskTemplate.findByPk(id);
        if (!template) return null;
        await template.destroy();
        return true;
    },

    // NewHire Methods
    async createNewHire(data, transaction = null) {
        try {
            // Fetch job to get companyId
            const job = await Job.findByPk(data.jobId);
            if (!job) throw new Error("Job not found");
            data.companyId = job.companyId;
            console.log('onboardingRepository.createNewHire payload:', data);
            return await NewHire.create(data, { transaction });
        } catch (error) {
            console.log('Error in onboardingRepository.createNewHire:', error);
            throw error;
        }
    },
    async getNewHireById(id, clientId) {
        return await NewHire.findOne({
            where: { id },
            include: [{
                model: Company,
                where: { clientId },
                attributes: [],
            }],
        });
    },
    async updateNewHire(id, data) {
        const hire = await NewHire.findByPk(id);
        if (!hire) return null;
        await hire.update(data);
        return hire;
    },
    async deleteNewHire(id) {
        const hire = await NewHire.findByPk(id);
        if (!hire) return null;
        await hire.destroy();
        return true;
    },
    async getAllNewHires(clientId) {
        return await NewHire.findAll({
            include: [{
                model: Company,
                where: { clientId },
                attributes: [],
            }],
            order: [['createdAt', 'DESC']],
        });
    },
    async createOnboardingTask(data, transaction = null) {
        const task = await OnboardingTask.create(data, { transaction });
        await NewHire.recalculateProgressAndStatus(task.newHireId);
        return task;
    },
    async getOnboardingTasksForNewHire(newHireId) {
        // console.log('[onboardingRepository] getOnboardingTasksForNewHire called with newHireId:', newHireId);
        try {
            const include = [
                { model: NewHire, attributes: ['firstName', 'lastName', 'position'] }
            ];
            // console.log('[onboardingRepository] Include structure:', include.map(i => ({ model: i.model?.name, as: i.as, attributes: i.attributes })));
            const tasks = await OnboardingTask.findAll({
                where: { newHireId },
                include,
                order: [['dueDate', 'ASC']],
            });
            // console.log('[onboardingRepository] Tasks found:', tasks.length);
            return tasks;
        } catch (error) {
            // console.error('[onboardingRepository] Error in getOnboardingTasksForNewHire:', error);
            throw error;
        }
    },
    async getAllOnboardingTasks(clientId) {
        return await OnboardingTask.findAll({
            include: [{
                model: NewHire,
                required: true,
                attributes: ['firstName', 'lastName', 'position'],
                include: [{
                    model: Company,
                    where: { clientId },
                    required: true,
                    attributes: [],
                }],
            }],
            order: [['dueDate', 'ASC']],
        });
    },
    async updateOnboardingTask(taskId, data, userId = null) {
        const task = await OnboardingTask.findByPk(taskId);
        if (!task) throw new Error("Task not found");
        const oldNewHireId = task.newHireId;

        // Check if status is being changed to completed
        const isBeingCompleted = data.status === "completed" && task.status !== "completed";

        // If being completed, set completedBy and completedDate
        if (isBeingCompleted) {
            data.completedDate = new Date();
            if (userId) {
                // Get user information to set completedBy
                const { User } = await import("../models/User.js");
                const user = await User.findByPk(userId);
                if (user) {
                    data.completedBy = user.fullName || user.email || `User ${userId}`;
                }
            }
        }

        // console.log('oldNewHireId', oldNewHireId);
        // console.log('data.newHireId', data.newHireId);
        await task.update(data);
        // If newHireId changed, recalculate for both old and new
        if (data.newHireId && data.newHireId !== oldNewHireId) {
            await NewHire.recalculateProgressAndStatus(oldNewHireId);
            await NewHire.recalculateProgressAndStatus(data.newHireId);
        } else {
            await NewHire.recalculateProgressAndStatus(task.newHireId);
        }
        return task;
    },
    async deleteOnboardingTask(taskId) {
        const task = await OnboardingTask.findByPk(taskId);
        if (!task) throw new Error("Task not found");
        const newHireId = task.newHireId;
        await task.destroy();
        await NewHire.recalculateProgressAndStatus(newHireId);
        return true;
    },
    // Add a note and link to new hire
    async addNoteToNewHire(newHireId, content, userId, title = "") {
        // Fetch new hire to get companyId
        const newHire = await NewHire.findByPk(newHireId);
        if (!newHire) throw new Error("New hire not found");
        const note = await Note.create({
            content,
            author: userId,
            title,
            companyId: newHire.companyId
        });
        await NewHireNote.create({
            newHireId,
            noteId: note.id,
            createdBy: userId
        });
        return note;
    },
    // Fetch all notes for a new hire
    async getNotesForNewHire(newHireId) {
        return await NewHireNote.findAll({
            where: { newHireId },
            include: [{ model: Note }],
            order: [["createdAt", "DESC"]],
        });
    },
    // Update a note
    async updateNote(noteId, content, userId, title) {
        // Only allow update if userId matches
        const note = await Note.findOne({ where: { id: noteId, author: userId } });
        if (!note) throw new Error("Note not found or unauthorized");
        note.content = content;
        note.title = title;
        await note.save();
        return note;
    },
    // Delete a note
    async deleteNote(noteId, userId) {
        const note = await Note.findByPk(noteId);
        if (!note) throw new Error("Note not found");
        if (!userId || String(note.author) !== String(userId)) throw new Error("Not authorized to delete this note");
        await NewHireNote.destroy({ where: { noteId } });
        await note.destroy();
        return true;
    },
    // Add a document to a new hire (upload or link existing)
    async addDocumentToNewHire({ newHireId, documentId, addedBy }) {
        return await NewHireDocument.create({ newHireId, documentId, addedBy });
    },
    // Get all documents for a new hire (with document and user details)
    async getDocumentsForNewHire(newHireId) {
        return await NewHireDocument.findAll({
            where: { newHireId },
            include: [
                { model: Document },
                { model: User, as: "addedByUser", attributes: ["id", "fullName", "email"] },
            ],
            order: [["createdAt", "DESC"]],
        });
    },
    // Remove (unlink) a document from a new hire
    async removeDocumentFromNewHire({ newHireId, documentId }) {
        return await NewHireDocument.destroy({ where: { newHireId, documentId } });
    },
    // Onboarding Documents (Global)
    async addOnboardingDocument({ documentId, subcategory = null }) {
        console.log('documentId',documentId)
        return await OnboardingDocument.create({ documentId, subcategory });
    },
    async getAllOnboardingDocuments(clientId) {
        return await OnboardingDocument.findAll({
            include: [
                {
                    model: Document,
                    as: "document",
                    where: { clientId },
                    include: [
                        {
                            model: DocumentTag,
                            as: "tags",
                            attributes: ["id", "name", "color"],
                            through: { attributes: [] },
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
    },
    async removeOnboardingDocument(id) {
        const onboardingDoc = await OnboardingDocument.findByPk(id);
        if (!onboardingDoc) return null;
        await onboardingDoc.destroy();
        return true;
    },
}; 