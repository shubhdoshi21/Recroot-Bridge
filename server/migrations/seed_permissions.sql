-- Seed default permissions
-- This migration adds all the default permissions to the permissions table

INSERT INTO permissions
    (name)
VALUES
    -- Dashboard permissions
    ( 'dashboard.view'),
    ( 'dashboard.edit_widgets'),
    ( 'dashboard.view_analytics'),

    -- Candidate permissions
    ( 'candidates.view'),
    ( 'candidates.create'),
    ( 'candidates.edit'),
    ( 'candidates.delete'),
    ( 'candidates.bulk_upload'),

    -- Job permissions
    ( 'jobs.view'),
    ( 'jobs.create'),
    ( 'jobs.edit'),
    ( 'jobs.delete'),
    ( 'jobs.publish'),

    -- Settings permissions
    ( 'settings.view'),
    ( 'settings.edit_system'),
    ( 'settings.manage_users'),
    ( 'settings.manage_integrations'),

    -- Company permissions
    ( 'companies.view'),
    ( 'companies.create'),
    ( 'companies.edit'),
    ( 'companies.delete'),

    -- Recruiter permissions
    ( 'recruiters.view'),
    ( 'recruiters.create'),
    ( 'recruiters.edit'),
    ( 'recruiters.delete'),

    -- Team permissions
    ( 'teams.view'),
    ( 'teams.create'),
    ( 'teams.edit'),
    ( 'teams.delete'),

    -- Document permissions
    ( 'documents.view'),
    ( 'documents.create'),
    ( 'documents.edit'),
    ( 'documents.delete'),
    ( 'documents.share'),

    -- Interview permissions
    ( 'interviews.view'),
    ( 'interviews.create'),
    ( 'interviews.edit'),
    ( 'interviews.delete'),

    -- Communication permissions
    ( 'communications.view'),
    ( 'communications.create'),
    ( 'communications.edit'),

    -- Analytics permissions
    ( 'analytics.view'),
    ( 'analytics.export'),

    -- Onboarding permissions
    ( 'onboarding.view'),
    ( 'onboarding.create'),
    ( 'onboarding.edit'),
    ( 'onboarding.delete'),

    -- New Hire permissions
    ( 'new_hires.view'),
    ( 'new_hires.create'),
    ( 'new_hires.edit'),
    ( 'new_hires.delete'),

    -- Onboarding Task permissions
    ( 'onboarding_task.view'),
    ( 'onboarding_task.create'),
    ( 'onboarding_task.edit'),
    ( 'onboarding_task.delete'),
    ( 'onboarding_task.assign'),

    -- Onboarding Template permissions
    ( 'onboarding_template.view'),
    ( 'onboarding_template.create'),
    ( 'onboarding_template.edit'),
    ( 'onboarding_template.delete'),
    ( 'onboarding_template.assign'),

    -- Task Template permissions
    ( 'task_template.view'),
    ( 'task_template.create'),
    ( 'task_template.edit'),
    ( 'task_template.delete'),

    -- Onboarding Document permissions
    ( 'onboarding_document.view'),
    ( 'onboarding_document.upload'),
    ( 'onboarding_document.download'),
    ( 'onboarding_document.delete'); 