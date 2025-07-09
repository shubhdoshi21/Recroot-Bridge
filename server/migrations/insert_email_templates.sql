INSERT INTO email_templates
(name, description, subject, content, category, lastUpdated, createdBy, createdAt,updatedAt)
VALUES
-- 1
('Application Received Confirmation',
 'Sent to candidate when their application is received.',
 'We''ve received your application for {{job_title}}',
 'Thank you for applying for the {{job_title}} position at {{company_name}}. We have received your application and our team will review it shortly. We appreciate your interest in joining our company and will be in touch soon regarding next steps.',
 'Candidate Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 2
('Interview Invitation',
 'Invite candidate to interview with details.',
 'Interview Invitation for {{job_title}} at {{company_name}}',
 'We are pleased to invite you to interview for the {{job_title}} position at {{company_name}}. Please find the interview details below:\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nLocation: {{interview_location}}\n\nIf you have any questions or need to reschedule, please let us know. We look forward to meeting you!',
 'Candidate Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 3
('Interview Confirmation',
 'Confirmation of scheduled interview.',
 'Interview Confirmation for {{job_title}} at {{company_name}}',
 'This is a confirmation for your upcoming interview for the {{job_title}} position at {{company_name}}.\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nLocation: {{interview_location}}\n\nPlease let us know if you have any questions or require further information.',
 'Candidate Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 4
('Application Rejection',
 'Rejection notice for candidates not selected.',
 'Update on your application for {{job_title}}',
 'Thank you for your interest in the {{job_title}} position at {{company_name}}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe appreciate the time you took to apply and wish you the best in your future endeavors.',
 'Candidate Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 5
('Offer Letter Email',
 'Offer letter and next steps for selected candidate.',
 'Congratulations! Your Offer for {{job_title}} at {{company_name}}',
 'Congratulations! We are excited to offer you the position of {{job_title}} at {{company_name}}. Please find your official offer letter attached.\n\nIf you have any questions or need clarification, feel free to reach out. We look forward to welcoming you to our team.',
 'Offer Process', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 6
('Welcome Email',
 'Welcome new hire to the company.',
 'Welcome to {{company_name}}!',
 'Welcome to {{company_name}}! We are excited to have you join us as a {{job_title}}.\n\nYour first day is scheduled for {{start_date}}. If you have any questions before then, please feel free to reach out.\n\nWe look forward to working with you!',
 'Onboarding', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 7
('First Day Instructions',
 'Instructions for new hire''s first day.',
 'Your First Day at {{company_name}}',
 'We are looking forward to your first day at {{company_name}}!\n\nPlease arrive at {{company_location}} by {{start_time}}.\n\nBring a valid ID and any required documents. If you have questions, contact your manager or HR representative.',
 'Onboarding', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 8
('IT Setup Information',
 'IT setup details for new hire.',
 'Your IT Setup Information for {{company_name}}',
 'To help you get started, here is your IT setup information for {{company_name}}:\n\n- Email: {{company_email}}\n- Temporary password: {{temp_password}}\n- IT support contact: {{it_support_contact}}\n\nPlease log in and change your password on your first day. If you need assistance, our IT team is here to help.',
 'Onboarding', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 9
('Interview Feedback Request',
 'Request feedback from interviewers.',
 'Interview Feedback Request for {{candidate_name}}',
 'We kindly request your feedback for the recent interview with {{candidate_name}} for the {{job_title}} position.\n\nYour input is valuable in helping us make informed hiring decisions. Please complete the feedback form at your earliest convenience.',
 'Internal Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 10
('New Hire Announcement',
 'Announce new hire to the team.',
 'Announcing {{candidate_name}} as our new {{job_title}}!',
 'We are excited to announce that {{candidate_name}} has joined {{company_name}} as our new {{job_title}}.\n\nPlease join us in welcoming {{candidate_name}} to the team!',
 'Internal Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 11
('Offer Negotiation Response',
 'Response to candidate offer negotiation.',
 'Response to Your Offer Negotiation for {{job_title}}',
 'Thank you for discussing your offer for the {{job_title}} position at {{company_name}}. We appreciate your openness and have reviewed your requests.\n\nPlease see our response attached. If you have further questions or wish to continue the discussion, let us know.',
 'Offer Process', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 12
('Offer Acceptance Confirmation',
 'Confirmation of candidate offer acceptance.',
 'Offer Acceptance Confirmation for {{job_title}}',
 'We are delighted to confirm your acceptance of the {{job_title}} position at {{company_name}}. Our team will be in touch soon with onboarding details and next steps.\n\nWelcome to the team!',
 'Offer Process', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 13
('Recruitment Status Update',
 'Update to internal team on recruitment progress.',
 'Recruitment Status Update: {{job_title}}',
 'Here is the latest update on our recruitment efforts for {{job_title}} at {{company_name}}:\n\n- Applications received: {{applications_received}}\n- Interviews scheduled: {{interviews_scheduled}}\n- Offers extended: {{offers_extended}}\n\nIf you have questions or need more details, please contact the HR team.',
 'Internal Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 14
('Candidate Shortlisted',
 'Notify candidate they have been shortlisted.',
 'You''ve Been Shortlisted for {{job_title}}',
 'Congratulations! You have been shortlisted for the {{job_title}} position at {{company_name}}. Our team will contact you soon with next steps.',
 'Candidate Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 15
('Reference Check Request',
 'Request references from candidate.',
 'Reference Check Request for {{job_title}} Application',
 'As part of our recruitment process for the {{job_title}} position at {{company_name}}, we kindly request you to provide references. Please reply to this email with the names and contact details of your references.',
 'Candidate Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 16
('Onboarding Task Assignment',
 'Notify new hire of assigned onboarding tasks.',
 'Your Onboarding Tasks at {{company_name}}',
 'Welcome to {{company_name}}! To help you get started, we have assigned you a set of onboarding tasks. Please log in to your onboarding portal to view and complete them. If you have any questions, reach out to your HR contact.',
 'Onboarding', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 17
('Probation Period Reminder',
 'Remind new hire about probation period review.',
 'Probation Period Review Reminder',
 'This is a reminder that your probation period at {{company_name}} will be reviewed on {{probation_review_date}}. Please ensure you have completed all required tasks and discuss any questions with your manager.',
 'Onboarding', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 18
('Policy Update Notification',
 'Notify employees of a new or updated policy.',
 'Important Policy Update at {{company_name}}',
 'We would like to inform you of an important policy update at {{company_name}}. Please review the updated policy attached and contact HR if you have any questions.',
 'Internal Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 19
('Birthday Greeting',
 'Send birthday wishes to employee.',
 'Happy Birthday from {{company_name}}!',
 'Happy Birthday, {{employee_name}}! Wishing you a wonderful year ahead. Enjoy your special day!\n\nBest wishes,\nThe {{company_name}} Team',
 'Internal Communications', GETDATE(), 'system', GETDATE(),GETDATE()),

-- 20
('Work Anniversary Congratulations',
 'Congratulate employee on work anniversary.',
 'Congratulations on Your Work Anniversary!',
 'Congratulations, {{employee_name}}, on your {{years}} year(s) with {{company_name}}! Thank you for your dedication and contributions. We look forward to many more years together.',
 'Internal Communications', GETDATE(), 'system', GETDATE(),GETDATE()); 