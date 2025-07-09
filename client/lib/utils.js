import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
// Function to generate unique IDs
export function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Calculate total experience in months from work history
 * @param {Array} workHistory - Array of work experience objects
 * @returns {number} Total experience in months
 */
export const calculateTotalExperience = (workHistory) => {
  if (!workHistory || workHistory.length === 0) return 0;

  const now = new Date();
  let totalMonths = 0;

  workHistory.forEach((exp) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.isCurrentRole ? now : (exp.endDate && exp.endDate.trim() !== '' ? new Date(exp.endDate) : now);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    }
  });

  return parseInt(totalMonths);
};

/**
 * Format experience from months to human readable string
 * @param {number} totalMonths - Total experience in months
 * @returns {string} Formatted experience string
 */
export const formatExperience = (totalMonths) => {
  if (!totalMonths || totalMonths === 0) return "Not specified";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return "Fresher";
  }

  return `${years} year${years !== 1 ? "s" : ""}${months > 0 ? ` ${months} month${months !== 1 ? "s" : ""}` : ""
    }`;
};

/**
 * Builds a minimal context object for automation triggers, only including IDs and customVariables.
 * @param {Object} params - All possible entities and the current user.
 * @param {Object} params.applicant - Candidate/applicant object.
 * @param {Object} params.selectedJob - Job object.
 * @param {Object} params.company - Company object (optional).
 * @param {Object} params.currentUser - The logged-in user (sender).
 * @param {Object} params.interview - Interview object (optional).
 * @param {Object} params.application - Application object (optional).
 * @param {Object} params.customVariables - Any custom variables (optional).
 * @returns {Object} context
 */
export function buildAutomationContext({
  applicant = {},
  selectedJob = {},
  company = {},
  currentUser = {},
  interview = {},
  application = {},
  customVariables = {},
}) {
  return {
    candidateId: applicant.candidateId || applicant.id,
    jobId: selectedJob.id,
    companyId: company.id || selectedJob.company?.id,
    senderId: currentUser?.user?.id,
    interviewId: interview.id,
    applicationId: application.id || applicant.applicationId || applicant.id,
    // Only include customVariables if present
    ...(Object.keys(customVariables).length > 0 ? { customVariables } : {}),
  };
}
