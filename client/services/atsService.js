import { api } from "@/config/api";

class ATSService {
    // Calculate ATS scores for a candidate across all jobs
    async calculateCandidateScore(candidateId) {
        try {
            const response = await fetch(api.ats.calculateCandidateScore(candidateId), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to calculate candidate scores");
            }

            return await response.json();
        } catch (error) {
            console.log(`[ATSService] Error calculating candidate scores for ${candidateId}:`, error);
            throw error;
        }
    }

    // Calculate ATS scores for a job across all candidates
    async calculateJobScore(jobId) {
        try {
            const response = await fetch(api.ats.calculateJobScore(jobId), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to calculate job scores");
            }

            return await response.json();
        } catch (error) {
            console.log(`[ATSService] Error calculating job scores for ${jobId}:`, error);
            throw error;
        }
    }

    // Get all ATS scores for a candidate
    async getCandidateScores(candidateId) {
        try {
            const response = await fetch(api.ats.getCandidateScores(candidateId), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch candidate scores");
            }

            return await response.json();
        } catch (error) {
            console.log(`[ATSService] Error fetching candidate scores for ${candidateId}:`, error);
            throw error;
        }
    }

    // Get all ATS scores for a job
    async getJobScores(jobId) {
        try {
            const response = await fetch(api.ats.getJobScores(jobId), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch job scores");
            }

            return await response.json();
        } catch (error) {
            console.log(`[ATSService] Error fetching job scores for ${jobId}:`, error);
            throw error;
        }
    }

    // Get single ATS score for a candidate-job combination
    async getSingleATSScore(candidateId, jobId) {
        try {
            const response = await fetch(api.ats.getSingleATSScore(candidateId, jobId), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch ATS score");
            }

            return await response.json();
        } catch (error) {
            console.log(`[ATSService] Error fetching ATS score for candidate ${candidateId} and job ${jobId}:`, error);
            throw error;
        }
    }

    // Ensure ATS scores exist for a candidate-job combination
    async ensureATSScores(candidateId, jobId) {
        try {
            const response = await fetch(api.ats.ensureATSScores(candidateId, jobId), {
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to ensure ATS scores");
            }

            return await response.json();
        } catch (error) {
            console.log(`[ATSService] Error ensuring ATS scores for candidate ${candidateId} and job ${jobId}:`, error);
            throw error;
        }
    }
}

export const atsService = new ATSService(); 