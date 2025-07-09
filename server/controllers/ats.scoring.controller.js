import * as ATSScoringService from "../services/ats-scoring.service.js";
import { CandidateJobMap } from "../models/CandidateJobMap.js";
import { Job } from "../models/Job.js";
import { Candidate } from "../models/Candidate.js";
import { Company } from "../models/Company.js";

export class ATSScoringController {
  static async calculateCandidateScore(req, res) {
    try {
      if (!req.user || !req.user.clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      const { candidateId } = req.params;
      const candidate = await Candidate.findByPk(candidateId);
      if (!candidate || candidate.clientId !== req.user.clientId) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      const result = await ATSScoringService.matchCandidateWithJobs(
        candidateId,
        req.user.clientId
      );
      res.json(result);
    } catch (error) {
      console.log("Error calculating candidate ATS scores:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async calculateJobScore(req, res) {
    try {
      if (!req.user || !req.user.clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      const { jobId } = req.params;
      const job = await Job.findByPk(jobId, {
        include: [
          {
            model: Company,
            attributes: ["id", "clientId"],
            required: true,
          },
        ],
      });
      if (!job || job.Company.clientId !== req.user.clientId) {
        return res.status(404).json({ error: "Job not found" });
      }
      const result = await ATSScoringService.matchJobWithCandidates(
        job,
        req.user.clientId
      );
      res.json(result);
    } catch (error) {
      console.log("Error calculating job ATS scores:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getCandidateScores(req, res) {
    try {
      if (!req.user || !req.user.clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      const { candidateId } = req.params;
      const candidate = await Candidate.findByPk(candidateId);
      if (!candidate || candidate.clientId !== req.user.clientId) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      const scores = await CandidateJobMap.findAll({
        where: { candidateId },
        include: [
          {
            model: Job,
            attributes: ["id", "jobTitle", "department", "location"],
            include: [
              {
                model: Company,
                attributes: ["id", "name", "clientId"],
                where: { clientId: req.user.clientId },
                required: true,
              },
            ],
          },
        ],
      });
      res.json(scores);
    } catch (error) {
      console.log("Error fetching candidate ATS scores:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getJobScores(req, res) {
    try {
      if (!req.user || !req.user.clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      const { jobId } = req.params;
      const job = await Job.findByPk(jobId, {
        include: [
          {
            model: Company,
            attributes: ["id", "clientId"],
            required: true,
          },
        ],
      });
      if (!job || job.Company.clientId !== req.user.clientId) {
        return res.status(404).json({ error: "Job not found" });
      }
      const scores = await CandidateJobMap.findAll({
        where: { jobId },
        include: [
          {
            model: Candidate,
            attributes: ["id", "firstName", "lastName", "email"],
            where: { clientId: req.user.clientId },
          },
        ],
      });
      res.json(scores);
    } catch (error) {
      console.log("Error fetching job ATS scores:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getSingleATSScore(req, res) {
    try {
      if (!req.user || !req.user.clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      const { candidateId, jobId } = req.params;
      const candidate = await Candidate.findByPk(candidateId);
      const job = await Job.findByPk(jobId, {
        include: [
          {
            model: Company,
            attributes: ["id", "clientId"],
            required: true,
          },
        ],
      });
      if (
        !candidate ||
        candidate.clientId !== req.user.clientId ||
        !job ||
        job.Company.clientId !== req.user.clientId
      ) {
        return res.status(404).json({ error: "Candidate or Job not found" });
      }
      const score = await ATSScoringService.calculateATSScore(candidate, job);
      res.json(score);
    } catch (error) {
      console.log("Error fetching single ATS score:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "Failed to fetch ATS score: " + error.message });
      }
    }
  }

  static async ensureATSScores(req, res) {
    try {
      if (!req.user || !req.user.clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      const { candidateId, jobId } = req.params;
      const candidate = await Candidate.findByPk(candidateId);
      const job = await Job.findByPk(jobId, {
        include: [
          {
            model: Company,
            attributes: ["id", "clientId"],
            required: true,
          },
        ],
      });
      if (
        !candidate ||
        candidate.clientId !== req.user.clientId ||
        !job ||
        job.Company.clientId !== req.user.clientId
      ) {
        return res.status(404).json({ error: "Candidate or Job not found" });
      }
      const scores = await ATSScoringService.ensureATSScores(
        parseInt(candidateId),
        parseInt(jobId),
        req.user.clientId
      );
      res.json(scores);
    } catch (error) {
      console.log("Error ensuring ATS scores:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
