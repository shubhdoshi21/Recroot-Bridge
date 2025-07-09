import { NewHire } from "../models/NewHire.js";
import { OnboardingTask } from "../models/OnboardingTask.js";

export async function canManageNewHireDocuments({ user, newHireId }) {
    if (!user) return false; // Defensive: no user, no access

    // 1. Admin check
    if (user.role === "admin") return true;

    // 2. Manager check
    const newHire = await NewHire.findByPk(newHireId);
    if (!newHire) return false;
    if (String(newHire.managerId) === String(user.id)) return true;

    // 3. Assigned to 'administrative' onboarding task for this new hire
    const adminTask = await OnboardingTask.findOne({
        where: {
            newHireId,
            assignedTo: user.id,
            category: "administrative",
        },
    });
    if (adminTask) return true;

    // Not permitted
    return false;
} 