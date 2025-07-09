ALTER TABLE [users] ADD CONSTRAINT DF_users_isActive DEFAULT 1 FOR [isActive];

ALTER TABLE [recruiters] ADD CONSTRAINT DF_recruiters_activeJobs DEFAULT 0 FOR [activeJobs];
ALTER TABLE [recruiters] ADD CONSTRAINT DF_recruiters_candidates DEFAULT 0 FOR [candidates];
ALTER TABLE [recruiters] ADD CONSTRAINT DF_recruiters_hires DEFAULT 0 FOR [hires];
ALTER TABLE [recruiters] ADD CONSTRAINT DF_recruiters_hireRate DEFAULT 0 FOR [hireRate];
ALTER TABLE [recruiters] ADD CONSTRAINT DF_recruiters_averageTimeToHire DEFAULT 0 FOR [averageTimeToHire];
ALTER TABLE [recruiters] ADD CONSTRAINT DF_recruiters_CandidateSatisfactionRate DEFAULT 0 FOR [CandidateSatisfactionRate];

ALTER TABLE [candidate_notes] ADD CONSTRAINT DF_candidate_notes_isPinned DEFAULT 0 FOR [isPinned];
ALTER TABLE [candidate_notes] ADD CONSTRAINT DF_candidate_notes_isPrivate DEFAULT 0 FOR [isPrivate];

ALTER TABLE [applications] ADD CONSTRAINT DF_applications_status DEFAULT 'Applied' FOR [status];
ALTER TABLE [applications] ADD CONSTRAINT DF_applications_appliedDate DEFAULT (GETDATE()) FOR [appliedDate];
ALTER TABLE [applications] ADD CONSTRAINT DF_applications_currentStage DEFAULT 1 FOR [currentStage];
ALTER TABLE [applications] ADD CONSTRAINT DF_applications_isShortlisted DEFAULT 0 FOR [isShortlisted];
ALTER TABLE [applications] ADD CONSTRAINT DF_applications_lastUpdated DEFAULT (GETDATE()) FOR [lastUpdated];

ALTER TABLE [business_metrics] ADD CONSTRAINT DF_business_metrics_currentValue DEFAULT 0 FOR [currentValue];
ALTER TABLE [business_metrics] ADD CONSTRAINT DF_business_metrics_previousValue DEFAULT 0 FOR [previousValue];
ALTER TABLE [business_metrics] ADD CONSTRAINT DF_business_metrics_changePercentage DEFAULT 0 FOR [changePercentage];
ALTER TABLE [business_metrics] ADD CONSTRAINT DF_business_metrics_updatedAt DEFAULT (GETDATE()) FOR [updatedAt];

ALTER TABLE [candidates] ADD CONSTRAINT DF_candidates_status DEFAULT 'Active' FOR [status];
ALTER TABLE [candidates] ADD CONSTRAINT DF_candidates_dateAdded DEFAULT (GETDATE()) FOR [dateAdded];

ALTER TABLE [candidate_documents] ADD CONSTRAINT DF_candidate_documents_addedDate DEFAULT (GETDATE()) FOR [addedDate];
ALTER TABLE [candidate_documents] ADD CONSTRAINT DF_candidate_documents_isConfidential DEFAULT 0 FOR [isConfidential];

ALTER TABLE [candidate_experiences] ADD CONSTRAINT DF_candidate_experiences_isCurrentRole DEFAULT 0 FOR [isCurrentRole];

ALTER TABLE [users] ADD CONSTRAINT DF_users_createdAt DEFAULT (GETDATE()) FOR [createdAt];

ALTER TABLE [email_templates] ADD CONSTRAINT DF_email_templates_lastUpdated DEFAULT (GETDATE()) FOR [lastUpdated];
ALTER TABLE [email_templates] ADD CONSTRAINT DF_email_templates_createdAt DEFAULT (GETDATE()) FOR [createdAt];

ALTER TABLE [onboarding_templates] ADD CONSTRAINT DF_onboarding_templates_lastUpdated DEFAULT (GETDATE()) FOR [lastUpdated];
ALTER TABLE [onboarding_templates] ADD CONSTRAINT DF_onboarding_templates_createdAt DEFAULT (GETDATE()) FOR [createdAt];

ALTER TABLE [application_attachments] ADD CONSTRAINT DF_application_attachments_uploadedAt DEFAULT (GETDATE()) FOR [uploadedAt];
ALTER TABLE [job_documents] ADD CONSTRAINT DF_job_documents_addedDate DEFAULT (GETDATE()) FOR [addedDate];

ALTER TABLE [company_documents] ADD CONSTRAINT DF_company_documents_addedDate DEFAULT (GETDATE()) FOR [addedDate];

ALTER TABLE [messages] ADD CONSTRAINT DF_messages_sentDate DEFAULT (GETDATE()) FOR [sentDate];

ALTER TABLE [user_permissions] ADD CONSTRAINT DF_user_permissions_grantedAt DEFAULT (GETDATE()) FOR [grantedAt];

ALTER TABLE [job_skill_requirements] ADD CONSTRAINT DF_job_skill_requirements_isRequired DEFAULT 1 FOR [isRequired];
ALTER TABLE [job_skill_requirements] ADD CONSTRAINT DF_job_skill_requirements_minimumProficiency DEFAULT 1 FOR [minimumProficiency];


ALTER TABLE [jobs] ADD CONSTRAINT DF_jobs_openings DEFAULT 1 FOR [openings];
ALTER TABLE [jobs] ADD CONSTRAINT DF_jobs_jobStatus DEFAULT 'Open' FOR [jobStatus];
ALTER TABLE [jobs] ADD CONSTRAINT DF_jobs_applicants DEFAULT 0 FOR [applicants];
ALTER TABLE [jobs] ADD CONSTRAINT DF_jobs_applications DEFAULT 0 FOR [applications];
ALTER TABLE [jobs] ADD CONSTRAINT DF_jobs_conversionRate DEFAULT 0 FOR [conversionRate];

ALTER TABLE [interview_feedbacks] ADD CONSTRAINT DF_interview_feedbacks_recommendHire DEFAULT 0 FOR [recommendHire];
ALTER TABLE [interview_feedbacks] ADD CONSTRAINT DF_interview_feedbacks_submittedAt DEFAULT (GETDATE()) FOR [submittedAt];


ALTER TABLE [interviews] ADD CONSTRAINT DF_interviews_interviewStatus DEFAULT 'Scheduled' FOR [interviewStatus];

ALTER TABLE [hiring_metrics] ADD CONSTRAINT DF_hiring_metrics_timeToHire DEFAULT 0 FOR [timeToHire];
ALTER TABLE [hiring_metrics] ADD CONSTRAINT DF_hiring_metrics_costPerHire DEFAULT 0 FOR [costPerHire];
ALTER TABLE [hiring_metrics] ADD CONSTRAINT DF_hiring_metrics_offerAcceptanceRate DEFAULT 0 FOR [offerAcceptanceRate];


ALTER TABLE [document_shares] ADD CONSTRAINT DF_document_shares_permission DEFAULT 'read' FOR [permission];
ALTER TABLE [document_shares] ADD CONSTRAINT DF_document_shares_sharedAt DEFAULT (GETDATE()) FOR [sharedAt];

ALTER TABLE [documents] ADD CONSTRAINT DF_documents_isTemplate DEFAULT 0 FOR [isTemplate];
ALTER TABLE [documents] ADD CONSTRAINT DF_documents_isShared DEFAULT 0 FOR [isShared];

ALTER TABLE [company_contacts] ADD CONSTRAINT DF_company_contacts_isPrimary DEFAULT 0 FOR [isPrimary];

ALTER TABLE [companies] ADD CONSTRAINT DF_companies_jobs DEFAULT 0 FOR [jobs];
ALTER TABLE [companies] ADD CONSTRAINT DF_companies_candidates DEFAULT 0 FOR [candidates];
ALTER TABLE [companies] ADD CONSTRAINT DF_companies_openJobs DEFAULT 0 FOR [openJobs];
ALTER TABLE [companies] ADD CONSTRAINT DF_companies_createdAt DEFAULT (GETDATE()) FOR [createdAt];
ALTER TABLE [companies] ADD CONSTRAINT DF_companies_updatedAt DEFAULT (GETDATE()) FOR [updatedAt];

ALTER TABLE [clients] ADD CONSTRAINT DF_clients_isTrial DEFAULT 0 FOR [isTrial];
ALTER TABLE [clients] ADD CONSTRAINT DF_clients_isActive DEFAULT 1 FOR [isActive];
ALTER TABLE [clients] ADD CONSTRAINT DF_clients_createdAt DEFAULT (GETDATE()) FOR [createdAt];
ALTER TABLE [clients] ADD CONSTRAINT DF_clients_updatedAt DEFAULT (GETDATE()) FOR [updatedAt];

ALTER TABLE [candidate_skill_maps] ADD CONSTRAINT DF_candidate_skill_maps_proficiencyLevel DEFAULT 1 FOR [proficiencyLevel];


ALTER TABLE [user_notification_types] ADD CONSTRAINT DF_user_notification_types_isEnabled DEFAULT 1 FOR [isEnabled];

ALTER TABLE [user_notification_settings] ADD CONSTRAINT DF_user_notification_settings_quietHoursEnabled DEFAULT 0 FOR [quietHoursEnabled];
ALTER TABLE [user_notification_settings] ADD CONSTRAINT DF_user_notification_settings_lastUpdated DEFAULT (GETDATE()) FOR [lastUpdated];

ALTER TABLE [user_notification_channels] ADD CONSTRAINT DF_user_notification_channels_isEnabled DEFAULT 1 FOR [isEnabled];

ALTER TABLE [user_activities] ADD CONSTRAINT DF_user_activities_timestamp DEFAULT (GETDATE()) FOR [timestamp];

ALTER TABLE [template_task_maps] ADD CONSTRAINT DF_template_task_maps_sequence DEFAULT 1 FOR [sequence];

ALTER TABLE [team_member_skills] ADD CONSTRAINT DF_team_member_skills_proficiencyLevel DEFAULT 1 FOR [proficiencyLevel];

ALTER TABLE [team_members] ADD CONSTRAINT DF_team_members_joinDate DEFAULT (GETDATE()) FOR [joinDate];
ALTER TABLE [team_members] ADD CONSTRAINT DF_team_members_hires DEFAULT 0 FOR [hires];
ALTER TABLE [team_members] ADD CONSTRAINT DF_team_members_timeToHire DEFAULT 0 FOR [timeToHire];
ALTER TABLE [team_members] ADD CONSTRAINT DF_team_members_offerAcceptanceRate DEFAULT 0 FOR [offerAcceptanceRate];

ALTER TABLE [team_jobs] ADD CONSTRAINT DF_team_jobs_assignedDate DEFAULT (GETDATE()) FOR [assignedDate];
ALTER TABLE [team_jobs] ADD CONSTRAINT DF_team_jobs_targetHires DEFAULT 1 FOR [targetHires];

ALTER TABLE [teams] ADD CONSTRAINT DF_teams_activeJobs DEFAULT 0 FOR [activeJobs];
ALTER TABLE [teams] ADD CONSTRAINT DF_teams_openRequisitions DEFAULT 0 FOR [openRequisitions];
ALTER TABLE [teams] ADD CONSTRAINT DF_teams_hires DEFAULT 0 FOR [hires];
ALTER TABLE [teams] ADD CONSTRAINT DF_teams_timeToHire DEFAULT 0 FOR [timeToHire];
ALTER TABLE [teams] ADD CONSTRAINT DF_teams_offerAcceptanceRate DEFAULT 0 FOR [offerAcceptanceRate];

ALTER TABLE [scheduled_reports] ADD CONSTRAINT DF_scheduled_reports_active DEFAULT 1 FOR [active];

ALTER TABLE [reports] ADD CONSTRAINT DF_reports_charts DEFAULT 1 FOR [charts];
ALTER TABLE [reports] ADD CONSTRAINT DF_reports_tables DEFAULT 1 FOR [tables];
ALTER TABLE [reports] ADD CONSTRAINT DF_reports_createdAt DEFAULT (GETDATE()) FOR [createdAt];

ALTER TABLE [recruitment_funnels] ADD CONSTRAINT DF_recruitment_funnels_applicants DEFAULT 0 FOR [applicants];
ALTER TABLE [recruitment_funnels] ADD CONSTRAINT DF_recruitment_funnels_screened DEFAULT 0 FOR [screened];
ALTER TABLE [recruitment_funnels] ADD CONSTRAINT DF_recruitment_funnels_interviewed DEFAULT 0 FOR [interviewed];
ALTER TABLE [recruitment_funnels] ADD CONSTRAINT DF_recruitment_funnels_offered DEFAULT 0 FOR [offered];
ALTER TABLE [recruitment_funnels] ADD CONSTRAINT DF_recruitment_funnels_accepted DEFAULT 0 FOR [accepted];
ALTER TABLE [recruitment_funnels] ADD CONSTRAINT DF_recruitment_funnels_rejected DEFAULT 0 FOR [rejected];

ALTER TABLE [recruiter_jobs] ADD CONSTRAINT DF_recruiter_jobs_assignedDate DEFAULT (GETDATE()) FOR [assignedDate];
ALTER TABLE [recruiter_jobs] ADD CONSTRAINT DF_recruiter_jobs_targetCandidates DEFAULT 5 FOR [targetCandidates];
ALTER TABLE [recruiter_jobs] ADD CONSTRAINT DF_recruiter_jobs_candidatesReviewed DEFAULT 0 FOR [candidatesReviewed];
ALTER TABLE [recruiter_jobs] ADD CONSTRAINT DF_recruiter_jobs_interviewsScheduled DEFAULT 0 FOR [interviewsScheduled];

ALTER TABLE [onboarding_templates] ADD CONSTRAINT DF_onboarding_templates_itemCount DEFAULT 0 FOR [itemCount];

ALTER TABLE [onboarding_tasks] ADD CONSTRAINT DF_onboarding_tasks_status DEFAULT 'Pending' FOR [status];
ALTER TABLE [onboarding_tasks] ADD CONSTRAINT DF_onboarding_tasks_priority DEFAULT 1 FOR [priority];

ALTER TABLE [notification_types] ADD CONSTRAINT DF_notification_types_isActive DEFAULT 1 FOR [isActive];

ALTER TABLE [notification_channels] ADD CONSTRAINT DF_notification_channels_isActive DEFAULT 1 FOR [isActive];

ALTER TABLE [notes] ADD CONSTRAINT DF_notes_isPinned DEFAULT 0 FOR [isPinned];
ALTER TABLE [notes] ADD CONSTRAINT DF_notes_isPrivate DEFAULT 0 FOR [isPrivate];

ALTER TABLE [new_hires] ADD CONSTRAINT DF_new_hires_status DEFAULT 'Pending' FOR [status];
ALTER TABLE [new_hires] ADD CONSTRAINT DF_new_hires_progress DEFAULT 0 FOR [progress];

ALTER TABLE [messages] ADD CONSTRAINT DF_messages_isRead DEFAULT 0 FOR [isRead];
ALTER TABLE [messages] ADD CONSTRAINT DF_messages_isStarred DEFAULT 0 FOR [isStarred];
ALTER TABLE [messages] ADD CONSTRAINT DF_messages_isArchived DEFAULT 0 FOR [isArchived];

ALTER TABLE [job_templates] ADD CONSTRAINT DF_job_templates_openings DEFAULT 1 FOR [openings];
ALTER TABLE [job_templates] ADD CONSTRAINT DF_job_templates_isUserCreated DEFAULT 1 FOR [isUserCreated];