export const calculateJobStatus = (deadline, postedDate) => {
    const now = new Date()
    const deadlineDate = deadline ? new Date(deadline) : null
    const postedDateTime = postedDate ? new Date(postedDate) : null

    // If no deadline set, status depends on posted date
    if (!deadlineDate) {
        if (!postedDateTime) return "draft"
        return "active"
    }

    // Calculate days until deadline
    const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))

    // If deadline has passed
    if (daysUntilDeadline < 0) {
        return "closed"
    }

    // If deadline is within 7 days
    if (daysUntilDeadline <= 7) {
        return "closing soon"
    }

    // If job has a posted date, it's active
    if (postedDateTime) {
        return "active"
    }

    // Default to new status
    return "new"
}

const stageColors = [
    { badge: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100", hover: "hover:bg-sky-100" },
    { badge: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100", hover: "hover:bg-indigo-100" },
    { badge: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100", hover: "hover:bg-purple-100" },
    { badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-100", hover: "hover:bg-fuchsia-100" },
    { badge: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100", hover: "hover:bg-rose-100" },
    { badge: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100", hover: "hover:bg-amber-100" },
    { badge: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100", hover: "hover:bg-teal-100" },
    { badge: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-100", hover: "hover:bg-cyan-100" },
    { badge: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100", hover: "hover:bg-emerald-100" },
    { badge: "bg-lime-100 text-lime-800 border-lime-200 hover:bg-lime-100", hover: "hover:bg-lime-100" },
];

const defaultColors = {
    badge: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100",
    hover: "hover:bg-slate-100",
};

export const getStatusColor = (status, applicationStages = []) => {
    if (!status) {
        return defaultColors;
    }

    const lowerStatus = status.trim().toLowerCase();

    switch (lowerStatus) {
        case "hired":
            return { badge: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100", hover: "hover:bg-green-100" };
        case "rejected":
            return { badge: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100", hover: "hover:bg-red-100" };
        case "archived":
            return { badge: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100", hover: "hover:bg-gray-100" };
    }

    let stages = [];
    try {
        if (typeof applicationStages === 'string' && applicationStages) {
            stages = JSON.parse(applicationStages);
        } else if (Array.isArray(applicationStages)) {
            stages = applicationStages;
        }
    } catch (e) {
        console.log('Error parsing application stages in getStatusColor:', e);
        stages = [];
    }

    if (stages.length > 0) {
        const stageIndex = stages.findIndex(stage =>
            stage && stage.name && stage.name.trim().toLowerCase() === lowerStatus
        );
        if (stageIndex !== -1) {
            return stageColors[stageIndex % stageColors.length];
        }
    }

    return defaultColors;
}; 