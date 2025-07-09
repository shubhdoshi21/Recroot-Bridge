import { Job } from "../models/Job.js";
import { Company } from "../models/Company.js";
import { Candidate } from "../models/Candidate.js";
import { Skills } from "../models/Skills.js";
import { CandidateSkillMap } from "../models/CandidateSkillMap.js";
import { CandidateExperience } from "../models/CandidateExperience.js";
import { CandidateEducation } from "../models/CandidateEducation.js";
import { CandidateJobMap } from "../models/CandidateJobMap.js";
import { analyzeJobMatch } from "./gemini.service.js";
import { Op } from "sequelize";

export async function matchCandidateWithJobs(candidateId, clientId) {
  if (!clientId)
    throw new Error("clientId is required for candidate-job matching");
  try {
    console.log(
      "[ATSScoringService] Starting candidate-job matching for candidate:",
      candidateId,
      "clientId:",
      clientId
    );

    // Get all active jobs for this client through company relationship
    console.log(
      `[ATSScoringService] Looking for active jobs for clientId: ${clientId}`
    );

    // First, let's check what jobs exist for this client regardless of status
    const allJobsForClient = await Job.findAll({
      include: [
        {
          model: Company,
          attributes: ["id", "name", "clientId"],
          where: { clientId },
          required: true,
        },
      ],
    });

    console.log(
      `[ATSScoringService] Total jobs for client ${clientId}: ${allJobsForClient.length}`
    );
    if (allJobsForClient.length > 0) {
      console.log(
        `[ATSScoringService] All jobs for client:`,
        allJobsForClient.map((job) => ({
          id: job.id,
          jobTitle: job.jobTitle,
          jobStatus: job.jobStatus,
          companyId: job.companyId,
          companyName: job.Company?.name,
          companyClientId: job.Company?.clientId,
        }))
      );
    }

    // Now get jobs that are available for matching (active, new, or other relevant statuses)
    const availableJobs = await Job.findAll({
      where: {
        jobStatus: {
          [Op.in]: ["active", "new", "closing soon"], // Include multiple statuses that indicate the job is available
        },
      },
      include: [
        {
          model: Company,
          attributes: ["id", "name", "clientId"],
          where: { clientId },
          required: true,
        },
      ],
      logging: (sql) => console.log("[ATSScoringService] SQL Query:", sql),
    });

    console.log(
      `[ATSScoringService] Found ${availableJobs.length} available jobs for client ${clientId}`
    );
    if (availableJobs.length > 0) {
      console.log(
        `[ATSScoringService] Available jobs found:`,
        availableJobs.map((job) => ({
          id: job.id,
          jobTitle: job.jobTitle,
          jobStatus: job.jobStatus,
          companyId: job.companyId,
          companyName: job.Company?.name,
          companyClientId: job.Company?.clientId,
        }))
      );
    }

    // Use availableJobs instead of activeJobs for the rest of the function
    const activeJobs = availableJobs;

    console.log(
      `[ATSScoringService] Found ${activeJobs.length} active jobs for client ${clientId}`
    );
    if (activeJobs.length > 0) {
      console.log(
        `[ATSScoringService] Active jobs found:`,
        activeJobs.map((job) => ({
          id: job.id,
          jobTitle: job.jobTitle,
          jobStatus: job.jobStatus,
          companyId: job.companyId,
          companyName: job.Company?.name,
          companyClientId: job.Company?.clientId,
        }))
      );
    }

    // Get the candidate
    const candidate = await Candidate.findByPk(candidateId, {
      include: [
        {
          model: CandidateSkillMap,
          as: "CandidateSkillMaps",
          include: [
            {
              model: Skills,
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: CandidateExperience,
          as: "CandidateExperiences",
        },
        {
          model: CandidateEducation,
          as: "CandidateEducations",
        },
      ],
    });

    if (!candidate || candidate.clientId !== clientId) {
      throw new Error("Candidate not found or does not belong to this client");
    }

    // Calculate ATS scores for each job
    const candidateJobScores = await Promise.all(
      activeJobs.map(async (job) => {
        // Ensure requiredSkills is an array
        let requiredSkills = [];
        if (Array.isArray(job.requiredSkills)) {
          requiredSkills = job.requiredSkills;
        } else if (typeof job.requiredSkills === "string") {
          try {
            requiredSkills = JSON.parse(job.requiredSkills);
          } catch (e) {
            requiredSkills = [];
          }
        }
        job.requiredSkills = requiredSkills;
        const scores = await calculateATSScore(candidate, job);
        return {
          job,
          ...scores,
        };
      })
    );

    // Sort jobs by ATS score
    const sortedJobs = candidateJobScores.sort(
      (a, b) => b.atsScore - a.atsScore
    );

    // Create or update mappings in CandidateJobMap
    await Promise.all(
      sortedJobs.map(
        async ({
          job,
          atsScore,
          skillsMatch,
          experienceMatch,
          educationMatch,
          analysis,
        }) => {
          const [mapping, created] = await CandidateJobMap.findOrCreate({
            where: {
              candidateId: candidate.id,
              jobId: job.id,
            },
            defaults: {
              status: "candidate",
              atsScore,
              skillsMatch,
              experienceMatch,
              educationMatch,
              atsAnalysis: analysis,
              lastScoredAt: new Date(),
            },
          });
          if (!created) {
            await mapping.update({
              atsScore,
              skillsMatch,
              experienceMatch,
              educationMatch,
              atsAnalysis: analysis,
              lastScoredAt: new Date(),
            });
          }
        }
      )
    );

    return sortedJobs;
  } catch (error) {
    console.log("Error in matchCandidateWithJobs:", error);
    throw error;
  }
}

export async function matchJobWithCandidates(job, clientId) {
  if (!clientId)
    throw new Error("clientId is required for job-candidate matching");
  try {
    console.log(
      "[ATSScoringService] Starting job-candidate matching for job:",
      job,
      "clientId:",
      clientId
    );

    // Get the job if jobId is provided, otherwise use the job instance
    let jobInstance;
    if (typeof job === "number") {
      jobInstance = await Job.findByPk(job);
    } else {
      jobInstance = job;
    }
    // Verify job belongs to the client through company relationship
    if (!jobInstance) {
      throw new Error("Job not found");
    }

    const jobWithCompany = await Job.findByPk(jobInstance.id, {
      include: [
        {
          model: Company,
          attributes: ["id", "clientId"],
          required: true,
        },
      ],
    });

    if (!jobWithCompany || jobWithCompany.Company.clientId !== clientId) {
      throw new Error("Job not found or does not belong to this client");
    }

    // Get all candidates for this client
    const candidates = await Candidate.findAll({
      where: { clientId },
      include: [
        {
          model: Skills,
          as: "Skills",
          through: {
            model: CandidateSkillMap,
            attributes: [],
          },
          attributes: ["id", "title"],
        },
        {
          model: CandidateExperience,
          as: "CandidateExperiences",
        },
        {
          model: CandidateEducation,
          as: "CandidateEducations",
        },
      ],
    });

    console.log(
      `[ATSScoringService] Found ${candidates.length} candidates for clientId ${clientId}`
    );

    // Ensure job has required skills in the correct format (JSON array)
    let requiredSkills = [];
    if (Array.isArray(jobInstance.requiredSkills)) {
      requiredSkills = jobInstance.requiredSkills;
    } else if (typeof jobInstance.requiredSkills === "string") {
      try {
        requiredSkills = JSON.parse(jobInstance.requiredSkills);
      } catch (e) {
        requiredSkills = [];
      }
    }
    jobInstance.requiredSkills = requiredSkills;

    // Calculate ATS scores for each candidate
    const candidateScores = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const scores = await calculateATSScore(candidate, jobInstance);
          return {
            candidate,
            ...scores,
          };
        } catch (error) {
          return {
            candidate,
            atsScore: 0,
            skillsMatch: 0,
            experienceMatch: 0,
            educationMatch: 0,
            analysis: `Error: ${error.message}`,
          };
        }
      })
    );

    // Sort candidates by ATS score
    const sortedCandidates = candidateScores.sort(
      (a, b) => b.atsScore - a.atsScore
    );

    // Create or update mappings in CandidateJobMap
    await Promise.all(
      sortedCandidates.map(
        async ({
          candidate,
          atsScore,
          skillsMatch,
          experienceMatch,
          educationMatch,
          analysis,
        }) => {
          try {
            const [mapping, created] = await CandidateJobMap.findOrCreate({
              where: {
                candidateId: candidate.id,
                jobId: jobInstance.id,
              },
              defaults: {
                status: "candidate",
                atsScore,
                skillsMatch,
                experienceMatch,
                educationMatch,
                atsAnalysis: analysis,
                lastScoredAt: new Date(),
              },
            });

            if (!created) {
              await mapping.update({
                atsScore,
                skillsMatch,
                experienceMatch,
                educationMatch,
                atsAnalysis: analysis,
                lastScoredAt: new Date(),
              });
            }
          } catch (error) {
            // Continue
          }
        }
      )
    );

    return {
      jobId: jobInstance.id,
      totalCandidates: candidates.length,
      candidateScores: sortedCandidates,
    };
  } catch (error) {
    console.log("Error in matchJobWithCandidates:", error);
    throw error;
  }
}

export async function calculateATSScore(candidate, job) {
  try {
    console.log("[ATSScoringService] Using Gemini for ATS scoring");
    return await analyzeJobMatch(candidate, job);
  } catch (error) {
    console.log("[ATSScoringService] Error in calculateATSScore:", error);
    return {
      atsScore: 0,
      skillsMatch: 0,
      experienceMatch: 0,
      educationMatch: 0,
      analysis: "Error calculating score",
    };
  }
}

/**
 * Ensures ATS scores exist for a specific job-candidate combination.
 * If scores don't exist, they will be calculated and stored.
 * @param {number} candidateId - The candidate ID
 * @param {number} jobId - The job ID
 * @returns {Promise<Object>} The ATS scores and analysis
 */
export async function ensureATSScores(candidateId, jobId, clientId) {
  if (!clientId)
    throw new Error("clientId is required for ATS score calculation");
  try {
    console.log(
      `[ATSScoringService] Ensuring ATS scores for candidate ${candidateId} and job ${jobId}`
    );

    // Check if scores already exist
    const existingMapping = await CandidateJobMap.findOne({
      where: { candidateId, jobId },
    });

    // If scores exist and are recent (within last 7 days), return them
    if (
      existingMapping &&
      existingMapping.atsScore !== null &&
      existingMapping.lastScoredAt
    ) {
      const daysSinceLastScore =
        (new Date() - new Date(existingMapping.lastScoredAt)) /
        (1000 * 60 * 60 * 24);
      if (daysSinceLastScore < 7) {
        console.log(
          `[ATSScoringService] Returning existing scores for candidate ${candidateId} and job ${jobId}`
        );
        return {
          atsScore: existingMapping.atsScore,
          skillsMatch: existingMapping.skillsMatch,
          experienceMatch: existingMapping.experienceMatch,
          educationMatch: existingMapping.educationMatch,
          analysis: existingMapping.atsAnalysis,
        };
      }
    }

    // Get candidate and job data
    const candidate = await Candidate.findByPk(candidateId, {
      include: [
        {
          model: CandidateSkillMap,
          as: "CandidateSkillMaps",
          include: [
            {
              model: Skills,
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: CandidateExperience,
          as: "CandidateExperiences",
        },
        {
          model: CandidateEducation,
          as: "CandidateEducations",
        },
      ],
    });

    const job = await Job.findByPk(jobId);

    if (!candidate || candidate.clientId !== clientId) {
      throw new Error("Candidate not found or does not belong to this client");
    }

    // Verify job belongs to the client through company relationship
    const jobWithCompany = await Job.findByPk(job.id, {
      include: [
        {
          model: Company,
          attributes: ["id", "clientId"],
          required: true,
        },
      ],
    });

    if (!jobWithCompany || jobWithCompany.Company.clientId !== clientId) {
      throw new Error("Job not found or does not belong to this client");
    }

    // Calculate new scores
    const scores = await calculateATSScore(candidate, job);

    // Create or update the mapping
    const [mapping, created] = await CandidateJobMap.findOrCreate({
      where: { candidateId, jobId },
      defaults: {
        status: "candidate",
        atsScore: scores.atsScore,
        skillsMatch: scores.skillsMatch,
        experienceMatch: scores.experienceMatch,
        educationMatch: scores.educationMatch,
        atsAnalysis: scores.analysis,
        lastScoredAt: new Date(),
      },
    });

    if (!created) {
      await mapping.update({
        atsScore: scores.atsScore,
        skillsMatch: scores.skillsMatch,
        experienceMatch: scores.experienceMatch,
        educationMatch: scores.educationMatch,
        atsAnalysis: scores.analysis,
        lastScoredAt: new Date(),
      });
    }

    console.log(
      `[ATSScoringService] Calculated and stored new scores for candidate ${candidateId} and job ${jobId}`
    );
    return scores;
  } catch (error) {
    console.log(
      `[ATSScoringService] Error ensuring ATS scores for candidate ${candidateId} and job ${jobId}:`,
      error
    );
    return {
      atsScore: 0,
      skillsMatch: 0,
      experienceMatch: 0,
      educationMatch: 0,
      analysis: "Error calculating score",
    };
  }
}

/**
 * Ensures ATS scores exist for multiple candidates for a specific job.
 * This is optimized for bulk operations when fetching job applicants.
 * @param {Array<number>} candidateIds - Array of candidate IDs
 * @param {number} jobId - The job ID
 * @returns {Promise<Object>} Object with candidateId as key and scores as value
 */
export async function ensureATSScoresForCandidates(
  candidateIds,
  jobId,
  clientId
) {
  if (!clientId)
    throw new Error("clientId is required for ATS score calculation");
  try {
    console.log(
      `[ATSScoringService] Ensuring ATS scores for ${candidateIds.length} candidates and job ${jobId}`
    );

    // Get the job data once
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new Error("Job not found");
    }


    // Check existing scores for all candidates
    const existingMappings = await CandidateJobMap.findAll({
      where: {
        candidateId: candidateIds,
        jobId,
      },
    });

    const existingScoresMap = new Map();
    existingMappings.forEach((mapping) => {
      existingScoresMap.set(mapping.candidateId, mapping);
    });

    // Identify candidates that need new scores
    const candidatesNeedingScores = [];
    const results = {};

    for (const candidateId of candidateIds) {
      const existingMapping = existingScoresMap.get(candidateId);

      if (
        !existingMapping ||
        existingMapping.atsScore === null ||
        !existingMapping.lastScoredAt ||
        new Date() - new Date(existingMapping.lastScoredAt) >
        7 * 24 * 60 * 60 * 1000 ||
        !existingMapping.atsAnalysis ||
        existingMapping.atsAnalysis === ""
      ) {
        candidatesNeedingScores.push(candidateId);
      } else {
        // Use existing scores
        results[candidateId] = {
          atsScore: existingMapping.atsScore,
          skillsMatch: existingMapping.skillsMatch,
          experienceMatch: existingMapping.experienceMatch,
          educationMatch: existingMapping.educationMatch,
          analysis: existingMapping.atsAnalysis,
        };
      }
    }

    // Calculate scores for candidates that need them
    if (candidatesNeedingScores.length > 0) {
      console.log(
        `[ATSScoringService] Calculating scores for ${candidatesNeedingScores.length} candidates`
      );

      const candidates = await Candidate.findAll({
        where: { id: candidatesNeedingScores, clientId },
        include: [
          {
            model: CandidateSkillMap,
            as: "CandidateSkillMaps",
            include: [
              {
                model: Skills,
                attributes: ["id", "title"],
              },
            ],
          },
          {
            model: CandidateExperience,
            as: "CandidateExperiences",
          },
          {
            model: CandidateEducation,
            as: "CandidateEducations",
          },
        ],
      });

      // Calculate scores for each candidate
      const scorePromises = candidates.map(async (candidate) => {
        try {
          const scores = await calculateATSScore(candidate, job);

          // Create or update the mapping
          const [mapping, created] = await CandidateJobMap.findOrCreate({
            where: { candidateId: candidate.id, jobId },
            defaults: {
              status: "candidate",
              atsScore: scores.atsScore,
              skillsMatch: scores.skillsMatch,
              experienceMatch: scores.experienceMatch,
              educationMatch: scores.educationMatch,
              atsAnalysis: scores.analysis,
              lastScoredAt: new Date(),
            },
          });

          if (!created) {
            await mapping.update({
              atsScore: scores.atsScore,
              skillsMatch: scores.skillsMatch,
              experienceMatch: scores.experienceMatch,
              educationMatch: scores.educationMatch,
              atsAnalysis: scores.analysis,
              lastScoredAt: new Date(),
            });
          }

          return {
            candidateId: candidate.id,
            scores,
          };
        } catch (error) {
          console.log(
            `[ATSScoringService] Error calculating score for candidate ${candidate.id}:`,
            error
          );
          return {
            candidateId: candidate.id,
            scores: {
              atsScore: 0,
              skillsMatch: 0,
              experienceMatch: 0,
              educationMatch: 0,
              analysis: "Error calculating score",
            },
          };
        }
      });

      const scoreResults = await Promise.all(scorePromises);

      // Add new scores to results
      scoreResults.forEach(({ candidateId, scores }) => {
        results[candidateId] = scores;
      });
    }

    console.log(
      `[ATSScoringService] Completed ensuring ATS scores for ${candidateIds.length} candidates`
    );
    return results;
  } catch (error) {
    console.log(
      `[ATSScoringService] Error ensuring ATS scores for candidates:`,
      error
    );
    // Return default scores for all candidates
    const defaultScores = {
      atsScore: 0,
      skillsMatch: 0,
      experienceMatch: 0,
      educationMatch: 0,
      analysis: "Error calculating scores",
    };

    const results = {};
    candidateIds.forEach((candidateId) => {
      results[candidateId] = defaultScores;
    });

    return results;
  }
}

/* Manual ATS Score Calculation (Kept for Reference)
async calculateATSScore(candidate, job, weights = { skillsWeight: 40, experienceWeight: 35, educationWeight: 25 }) {
    try {
        console.log("=== ATS Score Calculation ===");
        console.log("Job:", {
            id: job.id,
            title: job.jobTitle,
            requiredSkills: job.requiredSkills,
            requiredExperience: job.requiredExperience,
            requiredEducation: job.requiredEducation
        });
        console.log("Candidate:", {
            id: candidate.id,
            name: candidate.name,
            skills: candidate.skills?.map(s => s.title) || [],
            experiences: candidate.experiences || [],
            educations: candidate.educations || []
        });

        // Calculate skills match
        const skillsMatch = this.calculateSkillsMatch(candidate, job);
        console.log("=== Skills Match Calculation ===");
        console.log("Skills Match:", skillsMatch);

        // Calculate experience match
        const experienceMatch = this.calculateExperienceMatch(candidate, job);
        console.log("=== Experience Match Calculation ===");
        console.log("Experience Match:", experienceMatch);

        // Calculate education match
        const educationMatch = this.calculateEducationMatch(candidate, job);
        console.log("=== Education Match Calculation ===");
        console.log("Education Match:", educationMatch);

        // Calculate total ATS score
        const atsScore = Math.round(
            (skillsMatch * weights.skillsWeight) +
            (experienceMatch * weights.experienceWeight) +
            (educationMatch * weights.educationWeight)
        ) / 100;

        console.log("=== Final Scores ===");
        console.log("Skills Match:", skillsMatch + "%");
        console.log("Experience Match:", experienceMatch + "%");
        console.log("Education Match:", educationMatch + "%");
        console.log("Total ATS Score:", atsScore + "%");

        return {
            atsScore,
            skillsMatch,
            experienceMatch,
            educationMatch
        };
    } catch (error) {
        console.log("[ATSScoringService] Error in calculateATSScore:", error);
        return {
            atsScore: 0,
            skillsMatch: 0,
            experienceMatch: 0,
            educationMatch: 0
        };
    }
}

calculateSkillsMatch(candidate, job) {
    try {
        const candidateSkills = candidate.skills?.map(s => s.title.toLowerCase()) || [];
        let requiredSkills = [];

        if (typeof job.requiredSkills === 'string') {
            try {
                requiredSkills = JSON.parse(job.requiredSkills);
            } catch (e) {
                console.log('Error parsing requiredSkills:', e);
                return 0;
            }
        }

        if (!requiredSkills.length) return 0;

        requiredSkills = requiredSkills.map(s => s.toLowerCase());
        const matchingSkills = candidateSkills.filter(skill => 
            requiredSkills.some(req => req.includes(skill) || skill.includes(req))
        );
        return Math.round((matchingSkills.length / requiredSkills.length) * 100);
    } catch (error) {
        console.log("[ATSScoringService] Error in calculateSkillsMatch:", error);
        return 0;
    }
}

calculateExperienceMatch(candidate, job) {
    try {
        const experienceLevels = {
            junior: 1,
            mid: 2,
            senior: 3,
            lead: 4
        };

        const requiredLevel = experienceLevels[job.requiredExperience?.toLowerCase()] || 1;
        const experiences = candidate.experiences || [];
        
        if (!experiences.length) return 0;

        let totalYears = 0;
        experiences.forEach(exp => {
            const start = new Date(exp.startDate);
            const end = exp.endDate ? new Date(exp.endDate) : new Date();
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
            totalYears += years;
        });

        const candidateLevel = Math.min(Math.max(Math.floor(totalYears / 2) + 1, 1), 4);
        return candidateLevel >= requiredLevel ? 100 : Math.round((candidateLevel / requiredLevel) * 100);
    } catch (error) {
        console.log("[ATSScoringService] Error in calculateExperienceMatch:", error);
        return 0;
    }
}

calculateEducationMatch(candidate, job) {
    try {
        const educationLevels = {
            high_school: 1,
            associate: 2,
            bachelor: 3,
            master: 4,
            phd: 5
        };

        const requiredLevel = educationLevels[job.requiredEducation?.toLowerCase()] || 1;
        const educations = candidate.educations || [];

        if (!educations.length) return 0;

        const degrees = educations.map(edu => edu.degree.toLowerCase());
        const highestLevel = Math.max(...degrees.map(degree => {
            if (degree.includes('phd') || degree.includes('doctorate')) return 5;
            if (degree.includes('master')) return 4;
            if (degree.includes('bachelor') || degree.includes('b.s.') || degree.includes('b.a.')) return 3;
            if (degree.includes('associate')) return 2;
            return 1;
        }));

        return highestLevel >= requiredLevel ? 100 : Math.round((highestLevel / requiredLevel) * 100);
    } catch (error) {
        console.log("[ATSScoringService] Error in calculateEducationMatch:", error);
        return 0;
    }
}
*/
