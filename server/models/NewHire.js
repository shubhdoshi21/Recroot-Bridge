import { DataTypes } from "sequelize"
import { sequelize } from "../config/sequelize.js";

export const NewHire = sequelize.define(
  "NewHire",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "candidates",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "jobs",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "NO ACTION",
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      // defaultValue: "Pending",
    },
    progress: {
      type: DataTypes.INTEGER,
      // defaultValue: 0,
    },
    managerId: {
      type: DataTypes.INTEGER,
    },
    workLocation: {
      type: DataTypes.STRING,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    },
  },
  {
    tableName: "new_hires",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["candidateId", "jobId"],
      },
      {
        fields: ["candidateId"],
      },
      {
        fields: ["jobId"],
      }
    ],
  }
);

NewHire.recalculateProgressAndStatus = async function (newHireId) {
  const { OnboardingTask } = await import("./OnboardingTask.js");
  const newHire = await this.findByPk(newHireId);
  if (!newHire) return;
  const tasks = await OnboardingTask.findAll({ where: { newHireId } });
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  let progress = 0;
  let status = 'not-started';
  if (total > 0) {
    progress = Math.round((completed / total) * 100);
    if (completed === 0) status = 'not-started';
    else if (completed === total) status = 'completed';
    else status = 'in-progress';
  }
  await newHire.update({ progress, status });
};
