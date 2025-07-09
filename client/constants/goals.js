export const GOAL_CATEGORIES = {
    HIRING_VELOCITY: {
        label: "Hiring Velocity",
        fields: {
            monthlyHiringTarget: { label: "Monthly Hiring Target", type: "number", min: 0, default: 10 },
            currentHires: { label: "Current Month Hires", type: "number", min: 0, default: 0 },
            averageTimeToClose: { label: "Average Days to Close Position", type: "number", min: 0, default: 30 },
            targetTimeToClose: { label: "Target Days to Close Position", type: "number", min: 0, default: 25 }
        }
    },
    TIME_TO_FILL: {
        label: "Time to Fill Positions",
        fields: {
            averageDaysToFill: { label: "Current Average Time to Fill (days)", type: "number", min: 0, default: 45 },
            targetDaysToFill: { label: "Target Time to Fill (days)", type: "number", min: 0, default: 30 },
            screeningTime: { label: "Current Screening Time (days)", type: "number", min: 0, default: 7 },
            targetScreeningTime: { label: "Target Screening Time (days)", type: "number", min: 0, default: 5 }
        }
    },
    OFFER_ACCEPTANCE: {
        label: "Offer Acceptance Rate",
        fields: {
            acceptanceRate: { label: "Current Offer Acceptance Rate (%)", type: "number", min: 0, max: 100, default: 80 },
            targetAcceptanceRate: { label: "Target Offer Acceptance Rate (%)", type: "number", min: 0, max: 100, default: 90 },
            declinedOffers: { label: "Number of Declined Offers", type: "number", min: 0, default: 0 },
            totalOffersCount: { label: "Total Offers Made", type: "number", min: 0, default: 0 }
        }
    },
    CANDIDATE_QUALITY: {
        label: "Candidate Quality",
        fields: {
            qualifiedCandidateRate: { label: "Qualified Candidate Rate (%)", type: "number", min: 0, max: 100, default: 70 },
            targetQualifiedRate: { label: "Target Qualified Rate (%)", type: "number", min: 0, max: 100, default: 85 },
            interviewPassRate: { label: "Interview Pass Rate (%)", type: "number", min: 0, max: 100, default: 60 },
            targetPassRate: { label: "Target Pass Rate (%)", type: "number", min: 0, max: 100, default: 75 }
        }
    },
    DIVERSITY_HIRING: {
        label: "Diversity Hiring",
        fields: {
            currentDiversityRate: { label: "Current Diversity Rate (%)", type: "number", min: 0, max: 100, default: 30 },
            targetDiversityRate: { label: "Target Diversity Rate (%)", type: "number", min: 0, max: 100, default: 50 },
            diverseApplications: { label: "Diverse Applications Count", type: "number", min: 0, default: 0 },
            totalApplications: { label: "Total Applications", type: "number", min: 0, default: 0 }
        }
    },
    COST_PER_HIRE: {
        label: "Cost per Hire",
        fields: {
            currentCostPerHire: { label: "Current Cost per Hire ($)", type: "number", min: 0, default: 4000 },
            targetCostPerHire: { label: "Target Cost per Hire ($)", type: "number", min: 0, default: 3000 },
            totalRecruitmentBudget: { label: "Total Recruitment Budget ($)", type: "number", min: 0, default: 100000 },
            spentBudget: { label: "Budget Utilized ($)", type: "number", min: 0, default: 0 }
        }
    },
    CANDIDATE_EXPERIENCE: {
        label: "Candidate Experience",
        fields: {
            satisfactionScore: { label: "Candidate Satisfaction Score (%)", type: "number", min: 0, max: 100, default: 85 },
            targetSatisfactionScore: { label: "Target Satisfaction Score (%)", type: "number", min: 0, max: 100, default: 95 },
            feedbackResponseRate: { label: "Feedback Response Rate (%)", type: "number", min: 0, max: 100, default: 60 },
            targetResponseRate: { label: "Target Response Rate (%)", type: "number", min: 0, max: 100, default: 80 }
        }
    },
    SOURCING_EFFECTIVENESS: {
        label: "Sourcing Effectiveness",
        fields: {
            qualifiedCandidatesPerSource: { label: "Qualified Candidates per Source", type: "number", min: 0, default: 10 },
            targetCandidatesPerSource: { label: "Target Candidates per Source", type: "number", min: 0, default: 15 },
            sourceConversionRate: { label: "Source to Hire Rate (%)", type: "number", min: 0, max: 100, default: 20 },
            targetConversionRate: { label: "Target Conversion Rate (%)", type: "number", min: 0, max: 100, default: 30 }
        }
    }
};

export const defaultGoal = {
    title: "HIRING_VELOCITY",
    monthlyHiringTarget: 10,
    currentHires: 0,
    averageTimeToClose: 30,
    targetTimeToClose: 25
}; 