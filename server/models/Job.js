import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobType: {
      type: DataTypes.STRING,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    department: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    openings: {
      type: DataTypes.INTEGER,
      // defaultValue: 1,
    },
    salaryMin: {
      type: DataTypes.INTEGER,
    },
    salaryMax: {
      type: DataTypes.INTEGER,
    },
    experienceLevel: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    requirements: {
      type: DataTypes.TEXT,
    },
    responsibilities: {
      type: DataTypes.TEXT,
    },
    benefits: {
      type: DataTypes.TEXT,
    },
    jobStatus: {
      type: DataTypes.STRING,
      // defaultValue: "new",
      validate: {
        isIn: {
          args: [["new", "active", "closing soon", "closed", "draft"]],
          msg: "Status must be one of: new, active, closing soon, closed, draft",
        },
      },
    },
    applicants: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    postedDate: {
      type: DataTypes.STRING,
    },
    deadline: {
      type: DataTypes.STRING,
    },
    workType: {
      type: DataTypes.STRING,
    },
    requiredSkills: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue("requiredSkills");
        if (rawValue) {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            console.log("Error parsing requiredSkills:", e);
            return [];
          }
        }
        return [];
      },
      set(value) {
        if (value) {
          this.setDataValue("requiredSkills", JSON.stringify(value));
        } else {
          this.setDataValue("requiredSkills", null);
        }
      },
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Required skills must be valid JSON.");
            }
          }
        },
      },
    },
    requiredExperience: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [["junior", "mid", "senior", "lead"]],
          msg: "Experience level must be one of: junior, mid, senior, lead",
        },
      },
    },
    requiredEducation: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [["high school", "associate", "bachelor", "master", "phd"]],
          msg: "Education level must be one of: high school, associate, bachelor, master, phd",
        },
      },
    },
    applicationStages: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue("applicationStages");
        if (rawValue) {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            console.log("Error parsing applicationStages:", e);
            return [];
          }
        }
        return [];
      },
      set(value) {
        if (value) {
          this.setDataValue("applicationStages", JSON.stringify(value));
        } else {
          this.setDataValue("applicationStages", null);
        }
      },
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Application stages must be valid JSON.");
            }
          }
        },
      },
    },
    applications: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    conversionRate: {
      type: DataTypes.FLOAT,
      // defaultValue: 0,
    },
    jobTemplateId: {
      type: DataTypes.INTEGER,
      references: {
        model: "job_templates",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    indexes: [
      {
        fields: ["companyId"],
      },
      {
        fields: ["jobTitle"],
      },
      {
        fields: ["jobType"],
      },
      {
        fields: ["department"],
      },
      {
        unique: true,
        fields: ["jobTitle", "companyId"],
      },
    ],
    instanceMethods: {
      toJSON: function () {
        const values = { ...this.get() };
        // Parse applicationStages if it's a string
        if (
          values.applicationStages &&
          typeof values.applicationStages === "string"
        ) {
          try {
            values.applicationStages = JSON.parse(values.applicationStages);
          } catch (e) {
            console.log("Error parsing application stages in toJSON:", e);
            values.applicationStages = [];
          }
        }
        return values;
      },
    },
  }
);
