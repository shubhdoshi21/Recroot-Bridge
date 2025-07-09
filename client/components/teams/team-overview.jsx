"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  Target,
  Users,
  DollarSign,
  Star,
  Search,
} from "lucide-react";
import { GOAL_CATEGORIES } from "@/constants/goals";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Goal category icons mapping
const GOAL_ICONS = {
  HIRING_VELOCITY: Clock,
  TIME_TO_FILL: Target,
  OFFER_ACCEPTANCE: CheckCircle,
  CANDIDATE_QUALITY: Users,
  DIVERSITY_HIRING: Users,
  COST_PER_HIRE: DollarSign,
  CANDIDATE_EXPERIENCE: Star,
  SOURCING_EFFECTIVENESS: Search,
};

export function TeamOverview({ team }) {
  if (!team) return null;

  // Parse goals from JSON string if needed and ensure it's an array
  let goals = [];
  try {
    if (typeof team.goals === "string") {
      goals = JSON.parse(team.goals);
    } else if (Array.isArray(team.goals)) {
      goals = team.goals;
    } else if (typeof team.goals === "object" && team.goals !== null) {
      // Create default goals for all categories
      goals = Object.keys(GOAL_CATEGORIES).map((category) => {
        const fields = GOAL_CATEGORIES[category].fields;
        const goalData = {
          title: category,
        };
        // Add default values for all fields
        Object.entries(fields).forEach(([key, field]) => {
          goalData[key] = field.default || 0;
        });
        return goalData;
      });

      // If we have legacy data, update the HIRING_VELOCITY goal
      if (
        team.goals.hiring ||
        team.goals.currentHires ||
        team.goals.timeToHire ||
        team.goals.targetTimeToHire
      ) {
        const hiringVelocityGoal = goals.find(
          (g) => g.title === "HIRING_VELOCITY"
        );
        if (hiringVelocityGoal) {
          hiringVelocityGoal.monthlyHiringTarget = team.goals.hiring || 0;
          hiringVelocityGoal.currentHires = team.goals.currentHires || 0;
          hiringVelocityGoal.averageTimeToClose = team.goals.timeToHire || 0;
          hiringVelocityGoal.targetTimeToClose =
            team.goals.targetTimeToHire || 0;
        }
      }
    }
  } catch (error) {
    console.log("Error parsing goals:", error);
    goals = [];
  }

  // Helper function to find goal by type
  const findGoal = (type) => goals.find((g) => g.title === type);

  // Helper function to calculate progress for a goal
  const calculateProgress = (currentValue, targetValue, goalType) => {
    if (!currentValue || !targetValue) return 0;

    // For time and cost metrics, lower is better
    const isInverted = goalType.includes("TIME_") || goalType.includes("COST_");

    if (isInverted) {
      // If current is better (lower) than target, cap at 100%
      if (currentValue <= targetValue) return 100;
      // Calculate how close we are to target (inverse percentage)
      const progress = (targetValue / currentValue) * 100;
      return Math.min(Math.max(progress, 0), 100);
    } else {
      // For regular metrics, higher is better
      const progress = (currentValue / targetValue) * 100;
      return Math.min(Math.max(progress, 0), 100);
    }
  };

  // Helper function to get goal metrics for display
  const getGoalMetrics = (goal) => {
    const category = GOAL_CATEGORIES[goal.title];
    if (!category) return null;

    const metrics = {
      HIRING_VELOCITY: {
        current: goal.currentHires,
        target: goal.monthlyHiringTarget,
        currentKey: "currentHires",
        targetKey: "monthlyHiringTarget",
      },
      TIME_TO_FILL: {
        current: goal.averageDaysToFill,
        target: goal.targetDaysToFill,
        currentKey: "averageDaysToFill",
        targetKey: "targetDaysToFill",
      },
      OFFER_ACCEPTANCE: {
        current: goal.acceptanceRate,
        target: goal.targetAcceptanceRate,
        currentKey: "acceptanceRate",
        targetKey: "targetAcceptanceRate",
      },
      CANDIDATE_QUALITY: {
        current: goal.qualifiedCandidateRate,
        target: goal.targetQualifiedRate,
        currentKey: "qualifiedCandidateRate",
        targetKey: "targetQualifiedRate",
      },
      DIVERSITY_HIRING: {
        current: goal.currentDiversityRate,
        target: goal.targetDiversityRate,
        currentKey: "currentDiversityRate",
        targetKey: "targetDiversityRate",
      },
      COST_PER_HIRE: {
        current: goal.currentCostPerHire,
        target: goal.targetCostPerHire,
        currentKey: "currentCostPerHire",
        targetKey: "targetCostPerHire",
      },
      CANDIDATE_EXPERIENCE: {
        current: goal.satisfactionScore,
        target: goal.targetSatisfactionScore,
        currentKey: "satisfactionScore",
        targetKey: "targetSatisfactionScore",
      },
      SOURCING_EFFECTIVENESS: {
        current: goal.qualifiedCandidatesPerSource,
        target: goal.targetCandidatesPerSource,
        currentKey: "qualifiedCandidatesPerSource",
        targetKey: "targetCandidatesPerSource",
      },
    };

    return metrics[goal.title];
  };

  // Helper function to get tooltip text
  const getTooltipText = (
    currentValue,
    targetValue,
    goalType,
    currentKey,
    targetKey
  ) => {
    const progress = calculateProgress(currentValue, targetValue, goalType);
    const isInverted = goalType.includes("TIME_") || goalType.includes("COST_");
    const category = GOAL_CATEGORIES[goalType];
    const currentField = category?.fields[currentKey];
    const targetField = category?.fields[targetKey];

    let statusIcon = "✅";
    let statusText = "";

    if (isInverted) {
      if (currentValue <= targetValue) {
        statusText = "Meeting Target";
      } else {
        statusIcon = "❌";
        const difference = currentValue - targetValue;
        statusText = `${formatValue(
          difference,
          goalType,
          currentKey
        )} over target`;
      }
    } else {
      if (currentValue >= targetValue) {
        statusText = "Meeting Target";
      } else {
        statusIcon = "❌";
        const difference = targetValue - currentValue;
        statusText = `${formatValue(
          difference,
          goalType,
          targetKey
        )} below target`;
      }
    }

    return `${statusIcon} ${statusText}\nProgress: ${progress.toFixed(1)}%\nCurrent: ${formatValue(
      currentValue,
      goalType,
      currentKey
    )}\nTarget: ${formatValue(targetValue, goalType, targetKey)}`;
  };

  // Helper function to format values based on field type
  const formatValue = (value, goalType, fieldKey) => {
    if (value === null || value === undefined) return "0";

    const category = GOAL_CATEGORIES[goalType];
    const field = category?.fields[fieldKey];

    if (!field) return value.toString();

    switch (field.type) {
      case "percentage":
      return `${value}%`;
      case "currency":
        return `$${value.toLocaleString()}`;
      case "number":
        return value.toLocaleString();
      case "days":
      return `${value} days`;
      case "weeks":
        return `${value} weeks`;
      case "months":
        return `${value} months`;
      default:
        return value.toString();
    }
  };

  // Helper function to get metric description
  const getMetricDescription = (goalType, metricKey) => {
    const descriptions = {
      HIRING_VELOCITY: {
        monthlyHiringTarget: "Target number of hires per month",
        currentHires: "Current number of hires this month",
        averageTimeToClose: "Average time to close a position",
        targetTimeToClose: "Target time to close a position",
      },
      TIME_TO_FILL: {
        averageDaysToFill: "Average days to fill a position",
        targetDaysToFill: "Target days to fill a position",
        totalOpenPositions: "Total number of open positions",
      },
      OFFER_ACCEPTANCE: {
        acceptanceRate: "Percentage of offers accepted",
        targetAcceptanceRate: "Target acceptance rate",
        totalOffers: "Total number of offers made",
      },
      CANDIDATE_QUALITY: {
        qualifiedCandidateRate:
          "Percentage of candidates meeting job requirements",
        interviewPassRate: "Percentage of candidates passing interviews",
      },
      DIVERSITY_HIRING: {
        currentDiversityRate: "Current diversity percentage in hiring",
        diverseApplications: "Number of applications from diverse candidates",
      },
      COST_PER_HIRE: {
        currentCostPerHire: "Current average cost per hire",
        spentBudget: "Amount spent from recruitment budget",
      },
      CANDIDATE_EXPERIENCE: {
        satisfactionScore: "Candidate satisfaction rating",
        feedbackResponseRate: "Percentage of candidates providing feedback",
      },
      SOURCING_EFFECTIVENESS: {
        qualifiedCandidatesPerSource:
          "Number of qualified candidates per source",
        sourceConversionRate: "Percentage of sourced candidates hired",
      },
    };

    return descriptions[goalType]?.[metricKey] || "No description available";
  };

  // Helper function to get the main metrics for each goal category
  const getMainMetrics = (goalType, goal) => {
    const category = GOAL_CATEGORIES[goalType];
    if (!category || !goal) return [];

    const fields = Object.entries(category.fields);
    const metrics = [];

    fields.forEach(([key, field]) => {
      if (!key.toLowerCase().includes("target")) {
        const targetField = fields.find(
          ([k]) =>
            k.toLowerCase().includes("target") &&
            k
              .toLowerCase()
              .includes(
                key.toLowerCase().replace(/^current|average|total/i, "")
              )
        );

        if (targetField) {
          metrics.push({
            label: field.label,
            current: { key, value: goal[key] },
            target: { key: targetField[0], value: goal[targetField[0]] },
          });
        }
      }
    });

    return metrics;
  };

  // Helper function to get goal status
  const getGoalStatus = (metrics, goalType) => {
    if (!metrics.length) return "neutral";

    const totalProgress = metrics.reduce((sum, metric) => {
      return (
        sum +
        calculateProgress(metric.current.value, metric.target.value, goalType)
      );
    }, 0);

    const averageProgress = totalProgress / metrics.length;

    if (averageProgress >= 90) return "success";
    if (averageProgress >= 70) return "warning";
    return "danger";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const category = GOAL_CATEGORIES[goal.title];
          const metrics = getGoalMetrics(goal);
          if (!category || !metrics) return null;

          const progress = calculateProgress(
            metrics.current,
            metrics.target,
            goal.title
          );
          const Icon = GOAL_ICONS[goal.title] || Target;
          const status = getGoalStatus(progress);

          return (
            <Card key={goal.title} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>{category.label}</span>
                  </div>
                </CardTitle>
                <div className="text-sm text-gray-600 font-medium">
                  {formatValue(metrics.current, goal.title, metrics.currentKey)}{" "}
                  / {formatValue(metrics.target, goal.title, metrics.targetKey)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Progress
                          value={progress}
                          className={cn(
                            "h-3 transition-all duration-300",
                            status === "success" &&
                            "bg-green-100 [&>div]:bg-green-500",
                            status === "warning" &&
                            "bg-yellow-100 [&>div]:bg-yellow-500",
                            status === "danger" &&
                            "bg-red-100 [&>div]:bg-red-500",
                            status === "neutral" &&
                            "bg-gray-100 [&>div]:bg-gray-400"
                          )}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-3 space-y-2 bg-gray-900 text-white max-w-xs">
                      <div className="font-mono text-sm whitespace-pre">
                        {getTooltipText(
                          metrics.current,
                          metrics.target,
                          goal.title,
                          metrics.currentKey,
                          metrics.targetKey
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
          <CardTitle className="text-lg font-bold text-gray-900">Recruitment Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-900">
                  Active Jobs
                </h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-blue-700">
                  {team.activeJobs || 0}
                </span>
                <span className="text-sm text-blue-600 mb-1 font-medium">positions</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-green-900">Hires</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-green-700">
                  {team.totalHires || 0}
                </span>
                <span className="text-sm text-green-600 mb-1 font-medium">this month</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-amber-900">
                  Avg. Time to Fill
                </h3>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-amber-700">
                  {team.averageTimeToFill || 0}
                </span>
                <span className="text-sm text-amber-600 mb-1 font-medium">days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
