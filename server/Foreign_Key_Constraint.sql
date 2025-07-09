-- User related foreign keys
ALTER TABLE users ALTER COLUMN clientid INT NOT NULL;

-- UserPermission foreign keys
ALTER TABLE user_permissions ALTER COLUMN userid INT NOT NULL;
ALTER TABLE user_permissions ALTER COLUMN permissionid INT NOT NULL;

-- UserNotificationSettings foreign keys
ALTER TABLE user_notification_settings ALTER COLUMN userid INT NOT NULL;

-- UserNotificationChannel foreign keys
ALTER TABLE user_notification_channels ALTER COLUMN usernotificationsettingsid INT NOT NULL;
ALTER TABLE user_notification_channels ALTER COLUMN notificationchannelid INT NOT NULL;

-- UserNotificationType foreign keys
ALTER TABLE user_notification_types ALTER COLUMN usernotificationsettingsid INT NOT NULL;
ALTER TABLE user_notification_types ALTER COLUMN notificationtypeid INT NOT NULL;

-- UserActivity foreign keys
ALTER TABLE user_activities ALTER COLUMN userid INT NOT NULL;

-- Recruiter foreign keys
ALTER TABLE recruiters ALTER COLUMN userid INT NOT NULL;

-- Team foreign keys
ALTER TABLE teams ALTER COLUMN leadid INT NOT NULL;

-- TeamMember foreign keys
ALTER TABLE team_members ALTER COLUMN teamid INT NOT NULL;
ALTER TABLE team_members ALTER COLUMN recruiterid INT NOT NULL;

-- TeamMemberSkill foreign keys
ALTER TABLE team_member_skills ALTER COLUMN teammemberid INT NOT NULL;

-- CompanyContact foreign keys
ALTER TABLE company_contacts ALTER COLUMN companyid INT NOT NULL;

-- Job foreign keys
ALTER TABLE jobs ALTER COLUMN companyid INT NOT NULL;
ALTER TABLE jobs ALTER COLUMN jobtemplateid INT NOT NULL;

-- JobSkillRequirement foreign keys
ALTER TABLE job_skill_requirements ALTER COLUMN jobid INT NOT NULL;
ALTER TABLE job_skill_requirements ALTER COLUMN skillid INT NOT NULL;

-- CandidateEducation foreign keys
ALTER TABLE candidate_educations ALTER COLUMN candidateid INT NOT NULL;

-- CandidateExperience foreign keys
ALTER TABLE candidate_experiences ALTER COLUMN candidateid INT NOT NULL;

-- CandidateExtraCurricular foreign keys
ALTER TABLE candidate_extra_curriculars ALTER COLUMN candidateid INT NOT NULL;

-- CandidateSkillMap foreign keys
ALTER TABLE candidate_skill_maps ALTER COLUMN candidateid INT NOT NULL;
ALTER TABLE candidate_skill_maps ALTER COLUMN skillid INT NOT NULL;

-- CandidateCertification foreign keys
ALTER TABLE candidate_certifications ALTER COLUMN candidateid INT NOT NULL;

-- CandidateJobMap foreign keys
ALTER TABLE candidate_job_maps ALTER COLUMN candidateid INT NOT NULL;
ALTER TABLE candidate_job_maps ALTER COLUMN jobid INT NOT NULL;

-- Application foreign keys
ALTER TABLE applications ALTER COLUMN candidateid INT NOT NULL;
ALTER TABLE applications ALTER COLUMN jobid INT NOT NULL;

-- ApplicationAttachment foreign keys
ALTER TABLE application_attachments ALTER COLUMN applicationid INT NOT NULL;

-- ApplicationTag foreign keys
ALTER TABLE application_tags ALTER COLUMN applicationid INT NOT NULL;

-- Interview foreign keys
ALTER TABLE interviews ALTER COLUMN candidateid INT NOT NULL;
ALTER TABLE interviews ALTER COLUMN applicationid INT NOT NULL;

-- InterviewFeedback foreign keys
ALTER TABLE interview_feedbacks ALTER COLUMN interviewid INT NOT NULL;
ALTER TABLE interview_feedbacks ALTER COLUMN recruiterid INT NOT NULL;

-- DocumentShare foreign keys
ALTER TABLE document_shares ALTER COLUMN documentid INT NOT NULL;
ALTER TABLE document_shares ALTER COLUMN userid INT NOT NULL;

-- DocumentTag foreign keys
ALTER TABLE document_tags ALTER COLUMN documentid INT NOT NULL;

-- CompanyDocument foreign keys
ALTER TABLE company_documents ALTER COLUMN companyid INT NOT NULL;
ALTER TABLE company_documents ALTER COLUMN documentid INT NOT NULL;

-- CandidateDocument foreign keys
ALTER TABLE candidate_documents ALTER COLUMN candidateid INT NOT NULL;
ALTER TABLE candidate_documents ALTER COLUMN documentid INT NOT NULL;

-- JobDocument foreign keys
ALTER TABLE job_documents ALTER COLUMN jobid INT NOT NULL;
ALTER TABLE job_documents ALTER COLUMN documentid INT NOT NULL;

-- Note foreign keys
ALTER TABLE notes ALTER COLUMN companyid INT NOT NULL;

-- NoteTag foreign keys
ALTER TABLE note_tags ALTER COLUMN noteid INT NOT NULL;

-- CandidateNote foreign keys
ALTER TABLE candidate_notes ALTER COLUMN candidateid INT NOT NULL;

-- CandidateNoteTag foreign keys
ALTER TABLE candidate_note_tags ALTER COLUMN candidatenoteid INT NOT NULL;

-- Message foreign keys
ALTER TABLE messages ALTER COLUMN senderid INT NOT NULL;
ALTER TABLE messages ALTER COLUMN recipientid INT NOT NULL;

-- MessageAttachment foreign keys
ALTER TABLE message_attachments ALTER COLUMN messageid INT NOT NULL;

-- EmailTemplateTag foreign keys
ALTER TABLE email_template_tags ALTER COLUMN emailtemplateid INT NOT NULL;

-- NewHire foreign keys
ALTER TABLE new_hires ALTER COLUMN candidateid INT NOT NULL;
ALTER TABLE new_hires ALTER COLUMN jobid INT NOT NULL;

-- OnboardingTask foreign keys
ALTER TABLE onboarding_tasks ALTER COLUMN newhireid INT NOT NULL;
ALTER TABLE onboarding_tasks ALTER COLUMN tasktemplateid INT NOT NULL;

-- TemplateTaskMap foreign keys
ALTER TABLE template_task_maps ALTER COLUMN templateid INT NOT NULL;
ALTER TABLE template_task_maps ALTER COLUMN tasktemplateid INT NOT NULL;

-- TeamJob foreign keys
ALTER TABLE team_jobs ALTER COLUMN teamid INT NOT NULL;
ALTER TABLE team_jobs ALTER COLUMN jobid INT NOT NULL;

-- RecruiterJob foreign keys
ALTER TABLE recruiter_jobs ALTER COLUMN recruiterid INT NOT NULL;
ALTER TABLE recruiter_jobs ALTER COLUMN jobid INT NOT NULL;

-- ScheduledReport foreign keys
ALTER TABLE scheduled_reports ALTER COLUMN reportid INT NOT NULL;
