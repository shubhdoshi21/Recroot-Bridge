// import { sequelize } from "../config/sequelize.js"
// import { SetupAssociations } from "./Association.js"

// Import all models
import { Client } from "./Client.js";
import { User } from "./User.js";
import { Permission } from "./Permission.js";
import { UserPermission } from "./UserPermission.js";
import { UserNotificationSettings } from "./UserNotificationSettings.js";
import { NotificationChannel } from "./NotificationChannel.js";
import { UserNotificationChannel } from "./UserNotificationChannel.js";
import { NotificationType } from "./NotificationType.js";
import { UserNotificationType } from "./UserNotificationType.js";
import { UserActivity } from "./UserActivity.js";
import { Recruiter } from "./Recruiter.js";
import { Team } from "./Team.js";
import { TeamMember } from "./TeamMember.js";
import { TeamMemberSkill } from "./TeamMemberSkill.js";
import { Company } from "./Company.js";
import { CompanyContact } from "./CompanyContact.js";
import { Job } from "./Job.js";
import { JobTemplate } from "./JobTemplate.js";
import { JobSkillRequirement } from "./JobSkillRequirement.js";
import { Candidate } from "./Candidate.js";
import { CandidateEducation } from "./CandidateEducation.js";
import { CandidateExperience } from "./CandidateExperience.js";
import { CandidateExtraCurricular } from "./CandidateExtraCurricular.js";
import { Skills } from "./Skills.js";
import { CandidateSkillMap } from "./CandidateSkillMap.js";
import { CandidateCertification } from "./CandidateCertification.js";
import { CandidateJobMap } from "./CandidateJobMap.js";
import { Application } from "./Application.js";
import { ApplicationAttachment } from "./ApplicationAttachment.js";
import { ApplicationTag } from "./ApplicationTag.js";
import { Interview } from "./Interview.js";
import { InterviewFeedback } from "./InterviewFeedback.js";
import { Document } from "./Document.js";
import { DocumentTag } from "./DocumentTag.js";
import { DocumentShare } from "./DocumentShare.js";
import { CompanyDocument } from "./CompanyDocument.js";
import { CandidateDocument } from "./CandidateDocument.js";
import { JobDocument } from "./JobDocument.js";
import { Note } from "./Note.js";
import { NoteTag } from "./NoteTag.js";
import { CandidateNote } from "./CandidateNote.js";
import { CandidateNoteTag } from "./CandidateNoteTag.js";
import { Message } from "./Message.js";
import { MessageAttachment } from "./MessageAttachment.js";
import { EmailTemplate } from "./EmailTemplate.js";
import { EmailTemplateTag } from "./EmailTemplateTag.js";
import { NewHire } from "./NewHire.js";
import { OnboardingTask } from "./OnboardingTask.js";
import { OnboardingTemplate } from "./OnboardingTemplate.js";
import { OnboardingTaskTemplate } from "./OnboardingTaskTemplate.js";
import { TemplateTaskMap } from "./TemplateTaskMap.js";
import { TeamJob } from "./TeamJob.js";
import { RecruiterJob } from "./RecruiterJob.js";
import { RecruitmentFunnel } from "./RecruitmentFunnel.js";
import { HiringMetrics } from "./HiringMetrics.js";
import { BusinessMetrics } from "./BusinessMetrics.js";
import { Report } from "./Report.js";
import { ScheduledReport } from "./ScheduledReport.js";
import { Pipeline } from "./Pipeline.js"
import { PipelineStage } from "./PipelineStage.js"
import { DocumentActivity } from "./DocumentActivity.js"
import { DocumentCategory } from "./DocumentCategory.js"
import { DocumentTagMap } from "./DocumentTagMap.js"
import { DocumentVersion } from "./DocumentVersion.js"
import { NewHireNote } from "./NewHireNote.js";
import { NewHireDocument } from "./NewHireDocument.js";
import { OnboardingDocument } from "./OnboardingDocument.js";

// Setup all associations
// SetupAssociations()

// // Test database connection
// const testConnection = async () => {
//   try {
//     await sequelize.authenticate()
//     console.log("Database connection has been established successfully.")
//   } catch (error) {
//     console.log("Unable to connect to the database:", error)
//   }
// }

// Export models and connection
export {
  // sequelize,
  // testConnection,
  Client,
  User,
  Permission,
  UserPermission,
  UserNotificationSettings,
  NotificationChannel,
  UserNotificationChannel,
  NotificationType,
  UserNotificationType,
  UserActivity,
  Recruiter,
  Team,
  TeamMember,
  TeamMemberSkill,
  Company,
  CompanyContact,
  Job,
  JobTemplate,
  JobSkillRequirement,
  Candidate,
  CandidateEducation,
  CandidateExperience,
  CandidateExtraCurricular,
  Skills,
  CandidateSkillMap,
  CandidateCertification,
  CandidateJobMap,
  Application,
  ApplicationAttachment,
  ApplicationTag,
  Interview,
  InterviewFeedback,
  Document,
  DocumentTag,
  DocumentShare,
  CompanyDocument,
  CandidateDocument,
  JobDocument,
  Note,
  NoteTag,
  CandidateNote,
  CandidateNoteTag,
  Message,
  MessageAttachment,
  EmailTemplate,
  EmailTemplateTag,
  NewHire,
  OnboardingTask,
  OnboardingTemplate,
  OnboardingTaskTemplate,
  TemplateTaskMap,
  TeamJob,
  RecruiterJob,
  RecruitmentFunnel,
  HiringMetrics,
  BusinessMetrics,
  Report,
  ScheduledReport,
  Pipeline,
  PipelineStage,
  DocumentActivity,
  DocumentCategory,
  DocumentTagMap,
  DocumentVersion,
  NewHireNote,
  NewHireDocument,
  OnboardingDocument
};
