import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const SubscriptionModel = sequelize.define(
  "SubscriptionModel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subscriptionPlan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
    },
    isTrial: {
      type: DataTypes.BOOLEAN,
    //   defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
    //   defaultValue: true,
    },
    maxUsersAllowed: {
      type: DataTypes.INTEGER,
    },
    maxJobPostsAllowed: {
      type: DataTypes.INTEGER,
    },
    usageStats: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Usage stats must be valid JSON.");
            }
          }
        },
      },
    },
    billingCycle: {
      type: DataTypes.STRING,
    },
    paymentStatus: {
      type: DataTypes.STRING,
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
    },
    nextBillingDate: {
      type: DataTypes.DATE,
    },
    preferences: {
      type: DataTypes.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Preferences must be valid JSON.");
            }
          }
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "subscription_models",
    timestamps: true,
  }
);
