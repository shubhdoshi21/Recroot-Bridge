import { User } from "../models/User.js";
import { Permission } from "../models/Permission.js";
import { UserPermission } from "../models/UserPermission.js";
import { UserNotificationSettings } from "../models/UserNotificationSettings.js";
import { NotificationChannel } from "../models/NotificationChannel.js";
import { UserNotificationChannel } from "../models/UserNotificationChannel.js";
import { NotificationType } from "../models/NotificationType.js";
import { UserNotificationType } from "../models/UserNotificationType.js";
import { UserActivity } from "../models/UserActivity.js";
import { Recruiter } from "../models/Recruiter.js";
import { Team } from "../models/Team.js";
import { TeamMember } from "../models/TeamMember.js";
import { TeamMemberSkill } from "../models/TeamMemberSkill.js";
import { CompanyContact } from "../models/CompanyContact.js";
import { Job } from "../models/Job.js";
import { JobTemplate } from "../models/JobTemplate.js";
import { JobSkillRequirement } from "../models/JobSkillRequirement.js";
import { Interview } from "../models/Interview.js";
import { InterviewFeedback } from "../models/InterviewFeedback.js";
import { Candidate } from "../models/Candidate.js";
import { CandidateEducation } from "../models/CandidateEducation.js";
import { CandidateExperience } from "../models/CandidateExperience.js";
import { CandidateExtraCurricular } from "../models/CandidateExtraCurricular.js";
import { Skills } from "../models/Skills.js";
import { CandidateSkillMap } from "../models/CandidateSkillMap.js";
import { CandidateCertification } from "../models/CandidateCertification.js";
import { CandidateJobMap } from "../models/CandidateJobMap.js";
import { Client } from "../models/Client.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { Company } from "../models/Company.js";
import { Application } from "../models/Application.js";
import { ApplicationAttachment } from "../models/ApplicationAttachment.js";
import { ApplicationTag } from "../models/ApplicationTag.js";
import { Document } from "../models/Document.js";
import { DocumentTag } from "../models/DocumentTag.js";
import { DocumentTagMap } from "../models/DocumentTagMap.js";
import { DocumentShare } from "../models/DocumentShare.js";
import { DocumentVersion } from "../models/DocumentVersion.js";
import { DocumentCategory } from "../models/DocumentCategory.js";
import { DocumentActivity } from "../models/DocumentActivity.js";
import { CompanyDocument } from "../models/CompanyDocument.js";
import { CandidateDocument } from "../models/CandidateDocument.js";
import { JobDocument } from "../models/JobDocument.js";
import { Note } from "../models/Note.js";
import { NoteTag } from "../models/NoteTag.js";
import { CandidateNote } from "../models/CandidateNote.js";
import { CandidateNoteTag } from "../models/CandidateNoteTag.js";
import { Message } from "../models/Message.js";
import { MessageAttachment } from "../models/MessageAttachment.js";
import { EmailTemplate } from "../models/EmailTemplate.js";
import { EmailTemplateTag } from "../models/EmailTemplateTag.js";
import { NewHire } from "../models/NewHire.js";
import { OnboardingTask } from "../models/OnboardingTask.js";
import { OnboardingTemplate } from "../models/OnboardingTemplate.js";
import { OnboardingTaskTemplate } from "../models/OnboardingTaskTemplate.js"; // import { TemplateTaskMap } from "../models/TemplateTaskMap.js";
import { TeamJob } from "../models/TeamJob.js";
import { RecruiterJob } from "../models/RecruiterJob.js";
import { RecruitmentFunnel } from "../models/RecruitmentFunnel.js";
import { HiringMetrics } from "../models/HiringMetrics.js";
import { BusinessMetrics } from "../models/BusinessMetrics.js";
import { Report } from "../models/Report.js";
import { ScheduledReport } from "../models/ScheduledReport.js";
import { TemplateTaskMap } from "../models/TemplateTaskMap.js";
import { Pipeline } from "../models/Pipeline.js";
import { PipelineStage } from "../models/PipelineStage.js";
import AutomatedMessage from "../models/AutomatedMessage.js";
import { NewHireNote } from "../models/NewHireNote.js";
import { NewHireDocument } from "../models/NewHireDocument.js";
import { OnboardingDocument } from "../models/OnboardingDocument.js";

export const SetupAssociations = () => {
  // Client Relationships
  Client.hasMany(User, {
    foreignKey: "clientId",
  });
  Client.belongsTo(SubscriptionModel, {
    foreignKey: "subscriptionModelId",
  });

  // SubscriptionModel Relationships
  SubscriptionModel.hasMany(Client, {
    foreignKey: "subscriptionModelId",
  });

  // User Relationships
  User.belongsTo(Client, {
    foreignKey: "clientId",
  });
  User.hasOne(Recruiter, {
    foreignKey: "userId",
  });
  User.hasMany(UserActivity, {
    foreignKey: "userId",
  });
  User.hasMany(Message, {
    as: "UserSentMessages",
    foreignKey: "senderId",
  });
  User.hasMany(Message, {
    as: "UserReceivedMessages",
    foreignKey: "recipientId",
  });
  User.hasOne(UserNotificationSettings, {
    foreignKey: "userId",
  });

  // Permission Relationships
  Permission.hasMany(UserPermission, {
    foreignKey: "permissionId",
  });
  UserPermission.belongsTo(Permission, {
    foreignKey: "permissionId",
  });

  // Notification Relationships
  UserNotificationSettings.belongsTo(User, {
    foreignKey: "userId",
  });
  UserNotificationSettings.hasMany(UserNotificationChannel, {
    foreignKey: "userNotificationSettingsId",
  });
  UserNotificationSettings.hasMany(UserNotificationType, {
    foreignKey: "userNotificationSettingsId",
  });
  NotificationChannel.hasMany(UserNotificationChannel, {
    foreignKey: "notificationChannelId",
  });
  NotificationType.hasMany(UserNotificationType, {
    foreignKey: "notificationTypeId",
  });
  UserNotificationChannel.belongsTo(UserNotificationSettings, {
    foreignKey: "userNotificationSettingsId",
  });
  UserNotificationChannel.belongsTo(NotificationChannel, {
    foreignKey: "notificationChannelId",
  });
  UserNotificationType.belongsTo(UserNotificationSettings, {
    foreignKey: "userNotificationSettingsId",
  });
  UserNotificationType.belongsTo(NotificationType, {
    foreignKey: "notificationTypeId",
  });

  // Team Relationships
  Recruiter.belongsTo(User, {
    foreignKey: "userId",
  });
  Recruiter.belongsTo(Team, {
    as: "LeadTeam",
    foreignKey: "id",
  });
  Recruiter.hasMany(TeamMember, {
    foreignKey: "recruiterId",
  });
  Recruiter.hasMany(InterviewFeedback, {
    foreignKey: "recruiterId",
  });
  Recruiter.hasMany(RecruiterJob, {
    foreignKey: "recruiterId",
  });

  Team.belongsTo(Recruiter, {
    as: "Lead",
    foreignKey: "leadId",
  });
  Team.hasMany(TeamMember, {
    foreignKey: "teamId",
  });
  Team.hasMany(Team, {
    as: "Subteams",
    foreignKey: "parentTeamId",
  });
  Team.belongsTo(Team, {
    as: "ParentTeam",
    foreignKey: "parentTeamId",
  });
  Team.hasMany(TeamJob, {
    foreignKey: "teamId",
  });

  TeamMember.belongsTo(Team, {
    foreignKey: "teamId",
  });
  TeamMember.belongsTo(Recruiter, {
    foreignKey: "recruiterId",
  });
  TeamMember.hasMany(TeamMemberSkill, {
    foreignKey: "teamMemberId",
  });

  TeamMemberSkill.belongsTo(TeamMember, {
    foreignKey: "teamMemberId",
  });

  // Company Relationships
  Company.hasMany(Job, {
    foreignKey: "companyId",
  });
  Company.hasMany(Note, {
    foreignKey: "companyId",
  });
  Company.hasMany(CompanyDocument, {
    foreignKey: "companyId",
  });
  Company.hasMany(CompanyContact, {
    foreignKey: "companyId",
    as: "contacts",
  });

  CompanyContact.belongsTo(Company, {
    foreignKey: "companyId",
  });

  // Job Relationships-
  Job.belongsTo(Company, {
    foreignKey: "companyId",
  });
  Job.hasMany(Application, {
    foreignKey: "jobId",
    as: "jobApplications",
  });
  Job.belongsTo(JobTemplate, {
    foreignKey: "jobTemplateId",
  });
  Job.hasMany(JobDocument, {
    foreignKey: "jobId",
  });
  Job.hasMany(JobSkillRequirement, {
    foreignKey: "jobId",
  });
  Job.hasMany(CandidateJobMap, {
    foreignKey: "jobId",
  });
  Job.hasMany(TeamJob, {
    foreignKey: "jobId",
  });
  Job.hasMany(RecruiterJob, {
    foreignKey: "jobId",
  });
  Job.hasMany(NewHire, {
    foreignKey: "jobId",
  });

  JobTemplate.hasMany(Job, {
    foreignKey: "jobTemplateId",
  });

  JobSkillRequirement.belongsTo(Job, {
    foreignKey: "jobId",
  });
  JobSkillRequirement.belongsTo(Skills, {
    foreignKey: "skillId",
  });

  // Interview Relationships
  Interview.belongsTo(Candidate, {
    foreignKey: "candidateId",
    as: "Candidate",
  });
  Interview.belongsTo(Application, {
    foreignKey: "applicationId",
    as: "Application",
  });
  Interview.hasMany(InterviewFeedback, {
    foreignKey: "interviewId",
    as: "feedbacks",
  });

  InterviewFeedback.belongsTo(Interview, {
    foreignKey: "interviewId",
  });
  InterviewFeedback.belongsTo(Recruiter, {
    foreignKey: "recruiterId",
  });

  // Candidate Relationships
  Candidate.hasMany(CandidateEducation, {
    foreignKey: "candidateId",
    as: "CandidateEducations",
  });
  Candidate.hasMany(CandidateExperience, {
    foreignKey: "candidateId",
    as: "CandidateExperiences",
  });
  Candidate.hasMany(CandidateExtraCurricular, {
    foreignKey: "candidateId",
    as: "CandidateExtraCurriculars",
  });
  Candidate.hasMany(CandidateSkillMap, {
    foreignKey: "candidateId",
    as: "CandidateSkillMaps",
  });
  Candidate.hasMany(CandidateCertification, {
    foreignKey: "candidateId",
    as: "CandidateCertifications",
  });
  Candidate.hasMany(Interview, { foreignKey: "candidateId" });
  Candidate.hasMany(CandidateNote, { foreignKey: "candidateId" });
  Candidate.hasMany(Application, { foreignKey: "candidateId" });
  Candidate.hasMany(NewHire, { foreignKey: "candidateId" });
  Candidate.hasMany(CandidateJobMap, {
    foreignKey: "candidateId",
    as: "CandidateJobMaps",
  });
  Candidate.belongsToMany(Job, {
    through: CandidateJobMap,
    foreignKey: "candidateId",
    otherKey: "jobId",
    as: "jobs",
  });

  CandidateEducation.belongsTo(Candidate, {
    foreignKey: "candidateId",
  });
  CandidateEducation.belongsTo(Document, {
    foreignKey: "documentId",
    as: "Document",
  });
  CandidateExperience.belongsTo(Candidate, {
    foreignKey: "candidateId",
  });
  CandidateExperience.belongsTo(Document, {
    foreignKey: "documentId",
    as: "Document",
  });
  CandidateExtraCurricular.belongsTo(Candidate, {
    foreignKey: "candidateId",
  });
  CandidateExtraCurricular.belongsTo(Document, {
    foreignKey: "documentId",
    as: "Document",
  });

  Skills.hasMany(CandidateSkillMap, {
    foreignKey: "skillId",
  });
  Skills.hasMany(JobSkillRequirement, {
    foreignKey: "skillId",
  });

  CandidateSkillMap.belongsTo(Candidate, {
    foreignKey: "candidateId",
  });
  CandidateSkillMap.belongsTo(Skills, {
    foreignKey: "skillId",
  });

  CandidateCertification.belongsTo(Candidate, {
    foreignKey: "candidateId",
  });
  CandidateCertification.belongsTo(Document, {
    foreignKey: "documentId",
    as: "Document",
  });

  CandidateJobMap.belongsTo(Candidate, {
    foreignKey: "candidateId",
  });
  CandidateJobMap.belongsTo(Job, {
    foreignKey: "jobId",
  });

  // Application Relationships
  Application.belongsTo(Candidate, {
    foreignKey: "candidateId",
    // onDelete:"CASCADE",
    // onUpdate:"NO ACTION",
  });
  Application.belongsTo(Job, {
    foreignKey: "jobId",
    as: "job",
    // onDelete:"CASCADE",
    // onUpdate:"NO ACTION",
  });
  Application.hasMany(ApplicationAttachment, {
    foreignKey: "applicationId",
  });
  Application.hasMany(ApplicationTag, {
    foreignKey: "applicationId",
  });
  Application.hasMany(Interview, {
    foreignKey: "applicationId",
    as: "Interviews",
  });

  ApplicationAttachment.belongsTo(Application, {
    foreignKey: "applicationId",
  });
  ApplicationTag.belongsTo(Application, {
    foreignKey: "applicationId",
  });

  // Document Relationships - Updated for Normalized Structure
  Document.belongsTo(User, {
    foreignKey: "uploadedBy",
    as: "uploader",
  });
  Document.belongsTo(Client, {
    foreignKey: "clientId",
  });
  Document.belongsTo(DocumentCategory, {
    foreignKey: "categoryId",
    as: "category",
  });
  Document.hasMany(DocumentShare, {
    foreignKey: "documentId",
  });
  Document.hasMany(DocumentVersion, {
    foreignKey: "documentId",
  });
  Document.hasMany(DocumentActivity, {
    foreignKey: "documentId",
  });
  Document.hasMany(CompanyDocument, {
    foreignKey: "documentId",
  });
  Document.hasMany(CandidateDocument, {
    foreignKey: "documentId",
  });
  Document.hasMany(JobDocument, {
    foreignKey: "documentId",
  });
  Document.belongsToMany(DocumentTag, {
    through: DocumentTagMap,
    foreignKey: "documentId",
    otherKey: "tagId",
    as: "tags",
  });

  // Document Category Relationships
  DocumentCategory.belongsTo(Client, {
    foreignKey: "clientId",
  });
  DocumentCategory.hasMany(Document, {
    foreignKey: "categoryId",
    as: "documents",
  });

  // Document Tag Relationships
  DocumentTag.belongsTo(Client, {
    foreignKey: "clientId",
  });
  DocumentTag.belongsToMany(Document, {
    through: DocumentTagMap,
    foreignKey: "tagId",
    otherKey: "documentId",
    as: "documents",
  });

  // Document Tag Map Relationships
  DocumentTagMap.belongsTo(Document, {
    foreignKey: "documentId",
  });
  DocumentTagMap.belongsTo(DocumentTag, {
    foreignKey: "tagId",
  });

  // Document Share Relationships
  DocumentShare.belongsTo(Document, {
    foreignKey: "documentId",
  });
  DocumentShare.belongsTo(User, {
    foreignKey: "sharedBy",
    as: "sharer",
  });
  DocumentShare.belongsTo(User, {
    foreignKey: "sharedWith",
    as: "recipient",
  });
  DocumentShare.belongsTo(Team, {
    foreignKey: "teamId",
    as: "team",
  });
  Team.hasMany(DocumentShare, {
    foreignKey: "teamId",
    as: "documentShares",
  });

  // Document Version Relationships
  DocumentVersion.belongsTo(Document, {
    foreignKey: "documentId",
  });
  DocumentVersion.belongsTo(User, {
    foreignKey: "createdBy",
    as: "creator",
  });

  // Document Activity Relationships
  DocumentActivity.belongsTo(Document, {
    foreignKey: "documentId",
  });
  DocumentActivity.belongsTo(User, {
    foreignKey: "userId",
  });

  // Notes Relationships
  Note.belongsTo(Company, {
    foreignKey: "companyId",
  });
  Note.hasMany(NoteTag, {
    foreignKey: "noteId",
  });

  NoteTag.belongsTo(Note, {
    foreignKey: "noteId",
  });

  CandidateNote.belongsTo(Candidate, {
    foreignKey: "candidateId",
  });
  CandidateNote.hasMany(CandidateNoteTag, {
    foreignKey: "candidateNoteId",
  });

  CandidateNoteTag.belongsTo(CandidateNote, {
    foreignKey: "candidateNoteId",
  });

  // CandidateNote and Interview relationship
  CandidateNote.belongsTo(Interview, {
    foreignKey: "interviewId",
  });
  Interview.hasMany(CandidateNote, {
    foreignKey: "interviewId",
  });

  // Communication Relationships
  Message.belongsTo(User, {
    as: "MessageSender",
    foreignKey: "senderId",
  });
  Message.belongsTo(User, {
    as: "MessageRecipient",
    foreignKey: "recipientId",
  });
  Message.hasMany(MessageAttachment, {
    foreignKey: "messageId",
  });
  Message.belongsTo(EmailTemplate, {
    foreignKey: "emailTemplateId",
  });

  MessageAttachment.belongsTo(Message, {
    foreignKey: "messageId",
  });

  EmailTemplate.hasMany(EmailTemplateTag, {
    foreignKey: "emailTemplateId",
  });
  EmailTemplate.hasMany(Message, {
    foreignKey: "emailTemplateId",
  });

  EmailTemplateTag.belongsTo(EmailTemplate, {
    foreignKey: "emailTemplateId",
  });

  // Onboarding Relationships
  NewHire.belongsTo(Candidate, {
    foreignKey: "candidateId",
  });
  NewHire.belongsTo(Job, {
    foreignKey: "jobId",
  });
  NewHire.hasMany(OnboardingTask, {
    foreignKey: "newHireId",
  });

  OnboardingTask.belongsTo(NewHire, {
    foreignKey: "newHireId",
  });
  OnboardingTask.belongsTo(OnboardingTaskTemplate, {
    foreignKey: "taskTemplateId",
  });

  OnboardingTemplate.hasMany(TemplateTaskMap, {
    foreignKey: "templateId",
  });


  TemplateTaskMap.belongsTo(OnboardingTemplate, {
    foreignKey: "templateId",
  });
  TemplateTaskMap.belongsTo(OnboardingTaskTemplate, {
    foreignKey: "taskTemplateId",
  });

  OnboardingTaskTemplate.hasMany(TemplateTaskMap, {
    foreignKey: "taskTemplateId",
  });
  OnboardingTaskTemplate.hasMany(OnboardingTask, {
    foreignKey: "taskTemplateId",
  });

  // NewHireNote Relationships
  NewHireNote.belongsTo(Note, { foreignKey: "noteId" });
  NewHireNote.belongsTo(NewHire, { foreignKey: "newHireId" });
  Note.hasMany(NewHireNote, { foreignKey: "noteId" });
  NewHire.hasMany(NewHireNote, { foreignKey: "newHireId" });

  // Job Assignment Relationships
  TeamJob.belongsTo(Team, {
    foreignKey: "teamId",
  });
  TeamJob.belongsTo(Job, {
    foreignKey: "jobId",
  });

  RecruiterJob.belongsTo(Recruiter, {
    foreignKey: "recruiterId",
  });
  RecruiterJob.belongsTo(Job, {
    foreignKey: "jobId",
  });

  // RecruitmentFunnel relationships with Job
  RecruitmentFunnel.belongsToMany(Job, {
    through: "funnel_jobs",
  });
  Job.belongsToMany(RecruitmentFunnel, {
    through: "funnel_jobs",
  });

  // HiringMetrics relationships
  HiringMetrics.belongsToMany(Recruiter, {
    through: "metric_recruiters",
  });
  Recruiter.belongsToMany(HiringMetrics, {
    through: "metric_recruiters",
  });
  HiringMetrics.belongsToMany(Team, {
    through: "metric_teams",
  });
  Team.belongsToMany(HiringMetrics, {
    through: "metric_teams",
  });

  // Analytics Relationships
  Report.hasMany(ScheduledReport, {
    foreignKey: "reportId",
  });
  ScheduledReport.belongsTo(Report, {
    foreignKey: "reportId",
  });

  // Add many-to-many relationship with Candidate
  Job.belongsToMany(Candidate, {
    through: CandidateJobMap,
    foreignKey: "jobId",
    otherKey: "candidateId",
    as: "candidates",
  });

  // Pipeline has many PipelineStages
  Pipeline.hasMany(PipelineStage, { foreignKey: "pipelineId", as: "stages" });
  PipelineStage.belongsTo(Pipeline, {
    foreignKey: "pipelineId",
    as: "pipeline",
  });

  // Job belongs to Pipeline
  Job.belongsTo(Pipeline, { foreignKey: "pipelineId", as: "pipeline" });
  Pipeline.hasMany(Job, { foreignKey: "pipelineId", as: "jobs" });

  // Application belongs to PipelineStage
  Application.belongsTo(PipelineStage, {
    foreignKey: "pipelineStageId",
    as: "stage",
  });
  PipelineStage.hasMany(Application, {
    foreignKey: "pipelineStageId",
    as: "applications",
  });

  // Candidate <-> Skills Many-to-Many Association
  Candidate.belongsToMany(Skills, {
    through: CandidateSkillMap,
    foreignKey: "candidateId",
    otherKey: "skillId",
    as: "Skills",
  });
  Skills.belongsToMany(Candidate, {
    through: CandidateSkillMap,
    foreignKey: "skillId",
    otherKey: "candidateId",
    as: "Candidates",
  });

  // AutomatedMessage Relationships
  // AutomatedMessage belongs to Client (for multi-tenancy)
  AutomatedMessage.belongsTo(Client, {
    foreignKey: "clientId",
    constraints: false, // Make it optional initially
  });
  Client.hasMany(AutomatedMessage, {
    foreignKey: "clientId",
  });

  // AutomatedMessage belongs to User (who created it)
  AutomatedMessage.belongsTo(User, {
    foreignKey: "createdBy",
    as: "creator",
    constraints: false, // Make it optional initially
  });
  User.hasMany(AutomatedMessage, {
    foreignKey: "createdBy",
    as: "createdAutomations",
  });

  CompanyDocument.belongsTo(Document, {
    foreignKey: "documentId",
  });

  // CandidateDocument <-> Candidate association
  CandidateDocument.belongsTo(Candidate, {
    foreignKey: "candidateId",
    as: "candidate",
  });
  Candidate.hasMany(CandidateDocument, {
    foreignKey: "candidateId",
    as: "CandidateDocuments",
  });
  // Onboarding Associations
  OnboardingTemplate.hasMany(TemplateTaskMap, { foreignKey: 'templateId' });
  OnboardingTaskTemplate.hasMany(TemplateTaskMap, { foreignKey: 'taskTemplateId' });

  TemplateTaskMap.belongsTo(OnboardingTemplate, { foreignKey: 'templateId' });
  TemplateTaskMap.belongsTo(OnboardingTaskTemplate, { foreignKey: 'taskTemplateId' });

  NewHire.hasMany(OnboardingTask, { foreignKey: 'newHireId' });
  OnboardingTask.belongsTo(NewHire, { foreignKey: 'newHireId' });
  OnboardingTask.belongsTo(OnboardingTaskTemplate, { foreignKey: 'taskTemplateId' });

  OnboardingTask.belongsTo(TeamMember, { as: 'Assignee', foreignKey: 'assignedTo' });

  NewHire.belongsTo(Company, { foreignKey: "companyId" });
  Company.hasMany(NewHire, { foreignKey: "companyId" });

  // NewHireDocument Relationships
  NewHireDocument.belongsTo(NewHire, { foreignKey: "newHireId" });
  NewHireDocument.belongsTo(Document, { foreignKey: "documentId" });
  NewHireDocument.belongsTo(User, { foreignKey: "addedBy", as: "addedByUser" });

  NewHire.hasMany(NewHireDocument, { foreignKey: "newHireId" });
  Document.hasMany(NewHireDocument, { foreignKey: "documentId" });
  User.hasMany(NewHireDocument, { foreignKey: "addedBy" });

  // OnboardingDocument <-> Document Association
  OnboardingDocument.belongsTo(Document, { foreignKey: "documentId", as: "document" });
  Document.hasMany(OnboardingDocument, { foreignKey: "documentId", as: "onboardingLinks" });

  OnboardingTemplate.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  User.hasMany(OnboardingTemplate, { foreignKey: 'createdBy', as: 'createdTemplates' });

};
