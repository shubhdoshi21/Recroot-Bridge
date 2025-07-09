import { jobService } from "../services/jobService.js";
import { candidateService } from "../services/candidateService.js";

export const applicationController = {
    /**
     * Handles a candidate applying to a job.
     * Creates an Application record.
     */
    async applyToJob(req, res) {
        try {
            // This logic will need to be moved from the jobService/Controller
            // For now, placeholder:
            res.status(501).json({ message: "Not Implemented" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    /**
     * Updates the status of a specific Application record.
     * e.g., "Screening" -> "Interview"
     */
    async updateApplicationStatus(req, res) {
        try {
            const { applicationId } = req.params;
            const { status } = req.body;
            const application = await jobService.updateApplicationStatusById(applicationId, status, req.user?.clientId, req.body.context);
            res.json(application);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    /**
     * Rejects a formal application.
     */
    async rejectApplication(req, res) {
        try {
            const { applicationId } = req.params;
            const { reason } = req.body;
            const application = await jobService.rejectApplication(applicationId, reason);
            res.json(application);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    /**
     * Updates the status of a sourced candidate assignment.
     * This acts on the CandidateJobMap, not the Application table.
     */
    async updateAssignmentStatus(req, res) {
        try {
            const { jobId, candidateId } = req.params;
            const { status } = req.body;
            const result = await jobService.updateAssignmentStatus(jobId, candidateId, status);
            res.json({ success: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
}; 