export const validateJobData = (jobData) => {
    if (!jobData.jobTitle) {
        return "Job title is required";
    }

    if (!jobData.department) {
        return "Department is required";
    }

    if (!jobData.location) {
        return "Location is required";
    }

    if (!jobData.jobType) {
        return "Job type is required";
    }

    if (!jobData.description) {
        return "Job description is required";
    }

    if (!jobData.requirements) {
        return "Job requirements are required";
    }

    if (jobData.salaryMin && jobData.salaryMax && jobData.salaryMin > jobData.salaryMax) {
        return "Minimum salary cannot be greater than maximum salary";
    }

    if (jobData.openings && jobData.openings < 1) {
        return "Number of openings must be at least 1";
    }

    return null;
};

export const validateTemplateData = (templateData) => {
    if (!templateData.name) {
        return "Template name is required";
    }

    if (!templateData.jobTitle) {
        return "Job title is required";
    }

    if (!templateData.description) {
        return "Job description is required";
    }

    if (!templateData.requirements) {
        return "Job requirements are required";
    }

    return null;
}; 