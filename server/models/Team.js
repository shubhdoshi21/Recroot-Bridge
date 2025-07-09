import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Team = sequelize.define(
  "Team",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "A team with this name already exists",
      },
      validate: {
        notEmpty: {
          msg: "Team name cannot be empty",
        },
        len: {
          args: [2, 100],
          msg: "Team name must be between 2 and 100 characters",
        },
      },
    },
    department: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.STRING,
    },
    leadId: {
      type: DataTypes.INTEGER,
      references: {
        model: "recruiters",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "NO ACTION",
    },
    parentTeamId: {
      type: DataTypes.INTEGER,
      references: {
        model: "teams",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    description: {
      type: DataTypes.STRING,
    },
    activeJobs: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    hires: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    goals: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                throw new Error("Goals must be an array");
              }

              // Validate each goal has required fields and valid values
              parsed.forEach((goal) => {
                if (!goal.title) {
                  throw new Error("Each goal must have a title");
                }

                // Validate goal title is one of the allowed values
                const validTitles = [
                  "HIRING_VELOCITY",
                  "TIME_TO_FILL",
                  "OFFER_ACCEPTANCE",
                  "CANDIDATE_QUALITY",
                  "DIVERSITY_HIRING",
                  "COST_PER_HIRE",
                  "CANDIDATE_EXPERIENCE",
                  "SOURCING_EFFECTIVENESS",
                ];
                if (!validTitles.includes(goal.title)) {
                  throw new Error(
                    `Goal title must be one of: ${validTitles.join(", ")}`
                  );
                }

                // Validate required fields based on goal type
                switch (goal.title) {
                  case "HIRING_VELOCITY":
                    if (typeof goal.monthlyHiringTarget !== "number")
                      throw new Error("monthlyHiringTarget must be a number");
                    if (typeof goal.currentHires !== "number")
                      throw new Error("currentHires must be a number");
                    if (typeof goal.averageTimeToClose !== "number")
                      throw new Error("averageTimeToClose must be a number");
                    if (typeof goal.targetTimeToClose !== "number")
                      throw new Error("targetTimeToClose must be a number");
                    break;
                  case "TIME_TO_FILL":
                    if (typeof goal.averageDaysToFill !== "number")
                      throw new Error("averageDaysToFill must be a number");
                    if (typeof goal.targetDaysToFill !== "number")
                      throw new Error("targetDaysToFill must be a number");
                    if (typeof goal.screeningTime !== "number")
                      throw new Error("screeningTime must be a number");
                    if (typeof goal.targetScreeningTime !== "number")
                      throw new Error("targetScreeningTime must be a number");
                    break;
                  case "OFFER_ACCEPTANCE":
                    if (typeof goal.acceptanceRate !== "number")
                      throw new Error("acceptanceRate must be a number");
                    if (typeof goal.targetAcceptanceRate !== "number")
                      throw new Error("targetAcceptanceRate must be a number");
                    if (typeof goal.declinedOffers !== "number")
                      throw new Error("declinedOffers must be a number");
                    if (typeof goal.totalOffersCount !== "number")
                      throw new Error("totalOffersCount must be a number");
                    break;
                  case "CANDIDATE_QUALITY":
                    if (typeof goal.qualifiedCandidateRate !== "number")
                      throw new Error(
                        "qualifiedCandidateRate must be a number"
                      );
                    if (typeof goal.targetQualifiedRate !== "number")
                      throw new Error("targetQualifiedRate must be a number");
                    if (typeof goal.interviewPassRate !== "number")
                      throw new Error("interviewPassRate must be a number");
                    if (typeof goal.targetPassRate !== "number")
                      throw new Error("targetPassRate must be a number");
                    break;
                  case "DIVERSITY_HIRING":
                    if (typeof goal.currentDiversityRate !== "number")
                      throw new Error("currentDiversityRate must be a number");
                    if (typeof goal.targetDiversityRate !== "number")
                      throw new Error("targetDiversityRate must be a number");
                    if (typeof goal.diverseApplications !== "number")
                      throw new Error("diverseApplications must be a number");
                    if (typeof goal.totalApplications !== "number")
                      throw new Error("totalApplications must be a number");
                    break;
                  case "COST_PER_HIRE":
                    if (typeof goal.currentCostPerHire !== "number")
                      throw new Error("currentCostPerHire must be a number");
                    if (typeof goal.targetCostPerHire !== "number")
                      throw new Error("targetCostPerHire must be a number");
                    if (typeof goal.totalRecruitmentBudget !== "number")
                      throw new Error(
                        "totalRecruitmentBudget must be a number"
                      );
                    if (typeof goal.spentBudget !== "number")
                      throw new Error("spentBudget must be a number");
                    break;
                  case "CANDIDATE_EXPERIENCE":
                    if (typeof goal.satisfactionScore !== "number")
                      throw new Error("satisfactionScore must be a number");
                    if (typeof goal.targetSatisfactionScore !== "number")
                      throw new Error(
                        "targetSatisfactionScore must be a number"
                      );
                    if (typeof goal.feedbackResponseRate !== "number")
                      throw new Error("feedbackResponseRate must be a number");
                    if (typeof goal.targetResponseRate !== "number")
                      throw new Error("targetResponseRate must be a number");
                    break;
                  case "SOURCING_EFFECTIVENESS":
                    if (typeof goal.qualifiedCandidatesPerSource !== "number")
                      throw new Error(
                        "qualifiedCandidatesPerSource must be a number"
                      );
                    if (typeof goal.targetCandidatesPerSource !== "number")
                      throw new Error(
                        "targetCandidatesPerSource must be a number"
                      );
                    if (typeof goal.sourceConversionRate !== "number")
                      throw new Error("sourceConversionRate must be a number");
                    if (typeof goal.targetConversionRate !== "number")
                      throw new Error("targetConversionRate must be a number");
                    break;
                }
              });
            } catch (e) {
              throw new Error("Invalid goals format: " + e.message);
            }
          }
        },
      },
    },
    timeToHire: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    offerAcceptanceRate: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    monthlyHires: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Monthly hires data must be valid JSON.");
            }
          }
        },
      },
    },
    recentActivity: {
      type: DataTypes.TEXT,
      // defaultValue: "[]",
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                throw new Error("Recent activity must be an array");
              }
              parsed.forEach((activity) => {
                if (
                  !activity.date ||
                  !activity.action ||
                  !activity.description
                ) {
                  throw new Error(
                    "Each activity must have date, action, and description"
                  );
                }
              });
            } catch (e) {
              throw new Error(
                "Recent activity must be valid JSON array with required fields: " +
                  e.message
              );
            }
          }
        },
      },
    },
  },
  {
    tableName: "teams",
    timestamps: true,
    // Enforce uniqueness of team name per lead (which is associated with a user/client)
    indexes: [
      {
        unique: true,
        fields: ["name", "leadId"], // This enforces unique team name per lead (and thus per client via lead's user)
        // NOTE: For true client-wide uniqueness, a clientId field would be required on Team
      },
      {
        fields: ["department"],
      },
      {
        fields: ["leadId"],
      },
      {
        fields: ["parentTeamId"],
      },
    ],
  }
);
