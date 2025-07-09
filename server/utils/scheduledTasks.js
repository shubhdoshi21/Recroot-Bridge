import { Company } from "../models/Company.js";
import { Job } from "../models/Job.js";
import { Application } from "../models/Application.js";
import { Candidate } from "../models/Candidate.js";
import { Op } from "sequelize";
// import { triggerAutomation } from "../services/automationService.js";
import { Interview } from "../models/Interview.js";
import { communicationsService } from "../services/communicationsService.js";

/**
 * Recalculates company metrics to ensure data integrity
 * This function should be scheduled to run periodically (e.g., daily or weekly)
 */
export const recalculateCompanyMetrics = async () => {
  try {
    console.log("Starting company metrics recalculation...");
    const companies = await Company.findAll();

    for (const company of companies) {
      console.log(`Recalculating metrics for company ID: ${company.id}`);

      // Recalculate total jobs
      const totalJobs = await Job.count({
        where: { companyId: company.id },
      });

      // Recalculate open jobs
      const openJobs = await Job.count({
        where: {
          companyId: company.id,
          jobStatus: { [Op.ne]: "Closed" },
        },
      });

      // Recalculate unique candidates who have applied to jobs at this company
      const candidateIds = await Application.findAll({
        attributes: ["candidateId"],
        include: [
          {
            model: Job,
            where: { companyId: company.id },
            attributes: [],
          },
        ],
        group: ["candidateId"],
      });

      const candidatesCount = candidateIds.length;

      // Update the company
      await company.update({
        jobs: totalJobs,
        openJobs: openJobs,
        candidates: candidatesCount,
      });

      console.log(
        `Updated company ${company.id} metrics: jobs=${totalJobs}, openJobs=${openJobs}, candidates=${candidatesCount}`
      );
    }

    console.log("Company metrics recalculation completed successfully.");
  } catch (error) {
    console.log("Error recalculating company metrics:", error);
  }
};

/**
 * Calculate recent hires (last 6 months) for all companies
 * This data is not stored but calculated on demand
 */
export const calculateRecentHiresAllCompanies = async () => {
  try {
    console.log("Calculating recent hires for all companies...");
    const companies = await Company.findAll();
    const results = {};

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6);

    for (const company of companies) {
      // Count hired applications in the past 6 months
      const hires = await Application.count({
        where: {
          status: "Hired",
          updatedAt: { [Op.gte]: cutoffDate },
        },
        include: [
          {
            model: Job,
            where: { companyId: company.id },
          },
        ],
      });

      results[company.id] = hires;
      console.log(`Company ${company.id} recent hires: ${hires}`);
    }

    console.log("Recent hires calculation completed.");
    return results;
  } catch (error) {
    console.log("Error calculating recent hires:", error);
    return {};
  }
};

/**
 * Run all scheduled tasks
 * This function can be called by a scheduler (like node-cron)
 */
export const runAllScheduledTasks = async () => {
  await recalculateCompanyMetrics();
  await calculateRecentHiresAllCompanies();
};

export async function sendInterviewReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Find interviews scheduled in the next 24 hours and not already reminded
  const interviews = await Interview.findAll({
    where: {
      date: {
        [Op.between]: [now, in24h],
      },
      reminderSent: { [Op.not]: true }, // Add this field to your Interview model if not present
    },
  });

  for (const interview of interviews) {
    const context = {
      interviewId: interview.id,
      candidateId: interview.candidateId,
      applicationId: interview.applicationId,
      customVariables: {
        interview_type: interview.interviewType,
        interview_date: interview.date,
        interview_time: interview.time,
        interview_location: interview.location,
        interview_notes: interview.notes,
      },
    };

    await communicationsService.triggerCandidateAutomation({
      triggerType: "interview_reminder",
      context,
      tokens: {
        accessToken: "SYSTEM_ACCESS_TOKEN", // Replace with a real token
        refreshToken: "SYSTEM_REFRESH_TOKEN", // Replace with a real token
      },
      clientId: interview.clientId // or appropriate clientId
    });

    interview.reminderSent = true;
    await interview.save();
  }
}
