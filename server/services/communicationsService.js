import { communicationsRepository } from '../repositories/communicationsRepository.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import AutomatedMessage from '../models/AutomatedMessage.js';
import { Candidate } from '../models/Candidate.js';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Company } from '../models/Company.js';
import { Message } from '../models/Message.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { sendAutomationEmail, sendCustomEmail } from './emailService.js';
import { Client } from '../models/Client.js';

// --- Template filling (original logic) ---
function fillTemplate(template, variables) {
  if (!template) return '';
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    const trimmedKey = key.trim();
    return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match;
  });
}

// --- Variable gathering helpers (from original service) ---
async function getCandidateVariables(candidateId) {
  const candidate = await Candidate.findByPk(candidateId);
  if (!candidate) return {};
  return {
    candidate_name: candidate.name,
    candidate_email: candidate.email,
    candidate_phone: candidate.phone || '',
    candidate_location: candidate.location || '',
    candidate_position: candidate.position || '',
    candidate_company: candidate.currentCompany || '',
    candidate_experience: candidate.totalExperience ? `${candidate.totalExperience} years` : '',
    candidate_notice_period: candidate.noticePeriod || '',
    candidate_expected_salary: candidate.expectedSalary ? `$${candidate.expectedSalary}` : '',
    candidate_linkedin: candidate.linkedInProfile || '',
    candidate_github: candidate.githubProfile || '',
    candidate_portfolio: candidate.portfolioUrl || '',
  };
}

async function getJobVariables(jobId) {
  const job = await Job.findByPk(jobId, { include: [{ model: Company }] });
  if (!job) return {};
  return {
    job_title: job.jobTitle,
    job_type: job.jobType || '',
    job_department: job.department || '',
    job_location: job.location || '',
    job_salary_min: job.salaryMin ? `$${job.salaryMin}` : '',
    job_salary_max: job.salaryMax ? `$${job.salaryMax}` : '',
    job_experience_level: job.experienceLevel || '',
    job_work_type: job.workType || '',
    job_deadline: job.deadline || '',
    job_description: job.description || '',
    company_name: job.Company?.name || '',
    company_industry: job.Company?.industry || '',
    company_location: job.Company?.location || '',
    company_website: job.Company?.website || '',
  };
}

async function getSenderVariables(senderId) {
  const sender = await User.findByPk(senderId);
  if (!sender) return {};
  return {
    sender_name: sender.fullName,
    sender_first_name: sender.firstName || sender.fullName?.split(' ')[0] || '',
    sender_last_name: sender.lastName || sender.fullName?.split(' ').slice(1).join(' ') || '',
    sender_email: sender.email,
    sender_phone: sender.phone || '',
  };
}

async function getCompanyVariables(companyId) {
  const company = await Company.findByPk(companyId);
  if (!company) return {};
  return {
    company_name: company.name,
    company_industry: company.industry || '',
    company_size: company.size || '',
    company_location: company.location || '',
    company_website: company.website || '',
    company_phone: company.phone || '',
    company_email: company.email || '',
    company_address: `${company.addressLine1 || ''} ${company.addressLine2 || ''}`.trim(),
    company_city: company.city || '',
    company_state: company.stateProvince || '',
    company_country: company.country || '',
  };
}

// --- Helper for robust trigger matching (from original service) ---
function getPossibleTriggers(triggerType) {
  if (!triggerType) return [];
  return [
    triggerType,
    triggerType.toLowerCase(),
    triggerType.toLowerCase().replace(/_/g, ' '),
    triggerType.toLowerCase().replace(/\s+/g, '_'),
    triggerType.charAt(0).toUpperCase() + triggerType.slice(1).toLowerCase(),
    triggerType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
  ];
}

export const communicationsService = {
  // Email Templates
  async getAllEmailTemplates() {
    return communicationsRepository.getAllEmailTemplates();
  },
  async getEmailTemplateById(id) {
    return communicationsRepository.getEmailTemplateById(id);
  },

  // Automated Messages
  async getAllAutomatedMessages(clientId) {
    return communicationsRepository.getAllAutomatedMessages(clientId);
  },
  async createAutomatedMessage(data) {
    return communicationsRepository.createAutomatedMessage(data);
  },
  async updateAutomatedMessage(id, data, clientId) {
    return communicationsRepository.updateAutomatedMessage(id, data, clientId);
  },
  async toggleAutomatedMessageStatus(id, clientId) {
    return communicationsRepository.toggleAutomatedMessageStatus(id, clientId);
  },
  async deleteAutomatedMessage(id, clientId) {
    return communicationsRepository.deleteAutomatedMessage(id, clientId);
  },

  // Automation
  async triggerCandidateAutomation({ triggerType, context, tokens, clientId }) {
    // 1. Find the active automated message(s) for this trigger and client (robust matching)
    const possibleTriggers = getPossibleTriggers(triggerType);
    const autoMsgs = await AutomatedMessage.findAll({
      where: {
        trigger: possibleTriggers,
        clientId,
        status: 'Active',
      },
    });
    if (!autoMsgs || autoMsgs.length === 0) {
      return { success: false, message: `No active automated message for trigger '${triggerType}' and client ${clientId}` };
    }
    // 2. For each matching automation, gather variables and send
    const results = [];
    for (const autoMsg of autoMsgs) {
      // ... variable gathering and email sending logic as before ...
      let variables = {};
      if (context.candidateId) {
        Object.assign(variables, await getCandidateVariables(context.candidateId));
      }
      if (context.jobId) {
        Object.assign(variables, await getJobVariables(context.jobId));
      }
      console.log('senderId', context.senderId);
      if (context.senderId) {
        Object.assign(variables, await getSenderVariables(context.senderId));
      }
      if (context.companyId) {
        Object.assign(variables, await getCompanyVariables(context.companyId));
      }
      if (context.interviewId) {
        Object.assign(variables, {
          interview_id: context.interviewId,
          interview_type: context.interview_type || '',
          interview_date: context.interview_date || '',
          interview_time: context.interview_time || '',
          interview_location: context.interview_location || '',
          interview_notes: context.interview_notes || '',
        });
      }
      if (context.applicationId) {
        Object.assign(variables, {
          application_id: context.applicationId,
          application_date: context.application_date || '',
          application_status: context.application_status || '',
        });
      }
      if (context.customVariables) {
        Object.assign(variables, context.customVariables);
      }
      // Debug log for context before merging variables
    //   console.log('[AUTOMATION][DEBUG] context before variable merge:', context);
      const skipKeys = [
        'candidateId', 'jobId', 'senderId', 'companyId', 'interviewId', 'applicationId', 'customVariables'
      ];
      Object.keys(context).forEach(key => {
        if (!skipKeys.includes(key) && context[key] !== undefined && context[key] !== null && context[key] !== '') {
          variables[key] = context[key];
        }
      });
      // Always prioritize direct context value for recipient email
      let recipientEmail = context.candidate_email || context.sender_email || variables.candidate_email || variables.sender_email;
      // Debug log for recipient email
    //   console.log('[AUTOMATION][DEBUG] recipientEmail selected:', recipientEmail);
      // Fetch client name and add to variables BEFORE template filling
      let clientName = '';
      if (clientId) {
        const client = await Client.findByPk(clientId);
        if (client && client.companyName) {
          clientName = client.companyName;
        }
      }
      variables.client_name = clientName;
      // Debug log for variables before template filling
      console.log('[AUTOMATION][DEBUG] variables before fillTemplate:', variables);
      // Now call fillTemplate for subject and message
      let subject = fillTemplate(autoMsg.subject, variables);
      let message = fillTemplate(autoMsg.message, variables);
      // If a template is referenced, use it
      if (autoMsg.template) {
        const template = await communicationsRepository.findEmailTemplateByName(autoMsg.template);
        if (template) {
          subject = fillTemplate(template.subject || subject, variables);
          message = fillTemplate(template.content || message, variables);
        }
      }
      variables.platformName = 'RecrootBridge';
      let senderName = variables.sender_name || variables.platformName;
      const emailResult = await sendAutomationEmail(recipientEmail, subject, message, senderName, variables.client_name);
      // Look up senderId and recipientId by email if not provided
      let senderId = context.senderId;
      let recipientId = context.candidateId;
      if (!senderId && context.sender_email) {
        const sender = await User.findOne({ where: { email: context.sender_email } });
        senderId = sender ? sender.id : null;
      }
      if (!recipientId && context.candidate_email) {
        const candidate = await Candidate.findOne({ where: { email: context.candidate_email } });
        recipientId = candidate ? candidate.id : null;
      }
      // Only create Message if both IDs are present
      if (senderId && recipientId) {
        await Message.create({
          senderId,
          recipientId,
          subject,
          content: message,
          sentDate: new Date(),
          emailTemplateId: autoMsg.template ? (await communicationsRepository.findEmailTemplateByName(autoMsg.template))?.id : null,
        });
      } else {
        console.warn('[AUTOMATION][WARN] Could not log Message: senderId or recipientId missing', { senderId, recipientId });
      }
      await autoMsg.update({
        sentCount: (autoMsg.sentCount || 0) + 1,
        lastRun: new Date().toISOString(),
      });
      results.push({ success: true, message: 'Automation triggered and email sent', emailResult });
    }
    return { success: true, results };
  },

  async getVariablesForContext(context) {
    // Return a list of available variables for the given context
    const variables = [
      'candidate_name', 'candidate_email', 'candidate_phone', 'candidate_location', 'candidate_position',
      'candidate_company', 'candidate_experience', 'candidate_notice_period', 'candidate_expected_salary',
      'candidate_linkedin', 'candidate_github', 'candidate_portfolio',
      'job_title', 'job_type', 'job_department', 'job_location', 'job_salary_min', 'job_salary_max',
      'job_experience_level', 'job_work_type', 'job_deadline', 'job_description',
      'company_name', 'company_industry', 'company_size', 'company_location', 'company_website',
      'company_phone', 'company_email', 'company_address', 'company_city', 'company_state', 'company_country',
      'interview_id', 'interview_type', 'interview_date', 'interview_time', 'interview_location', 'interview_notes',
      'application_id', 'application_date', 'application_status',
      // Add more as needed
    ];
    if (context && context.customVariables) {
      variables.push(...Object.keys(context.customVariables));
    }
    return variables;
  },

  async testAutomation(data) {
    // Simulate the automation logic without sending an email
    const { triggerType, context, clientId } = data;
    const autoMsg = await communicationsRepository.findActiveAutomatedMessage(triggerType, clientId);
    if (!autoMsg) {
      return { success: false, message: `No active automated message for trigger '${triggerType}' and client ${clientId}` };
    }
    // Gather variables as above
    const variables = {};
    if (context.candidateId) {
      const candidate = await Candidate.findByPk(context.candidateId);
      if (candidate) {
        variables.candidate_name = candidate.name;
        variables.candidate_email = candidate.email;
        variables.candidate_phone = candidate.phone || '';
        variables.candidate_location = candidate.location || '';
        variables.candidate_position = candidate.position || '';
        variables.candidate_company = candidate.currentCompany || '';
        variables.candidate_experience = candidate.totalExperience ? `${candidate.totalExperience} years` : '';
        variables.candidate_notice_period = candidate.noticePeriod || '';
        variables.candidate_expected_salary = candidate.expectedSalary ? `$${candidate.expectedSalary}` : '';
        variables.candidate_linkedin = candidate.linkedInProfile || '';
        variables.candidate_github = candidate.githubProfile || '';
        variables.candidate_portfolio = candidate.portfolioUrl || '';
      }
    }
    if (context.jobId) {
      const job = await Job.findByPk(context.jobId);
      if (job) {
        variables.job_title = job.jobTitle;
        variables.job_type = job.jobType || '';
        variables.job_department = job.department || '';
        variables.job_location = job.location || '';
        variables.job_salary_min = job.salaryMin ? `$${job.salaryMin}` : '';
        variables.job_salary_max = job.salaryMax ? `$${job.salaryMax}` : '';
        variables.job_experience_level = job.experienceLevel || '';
        variables.job_work_type = job.workType || '';
        variables.job_deadline = job.deadline || '';
        variables.job_description = job.description || '';
      }
    }
    if (context.senderId) {
      const sender = await User.findByPk(context.senderId);
      if (sender) {
        variables.sender_name = sender.fullName;
        variables.sender_first_name = sender.firstName || sender.fullName?.split(' ')[0] || '';
        variables.sender_last_name = sender.lastName || sender.fullName?.split(' ').slice(1).join(' ') || '';
        variables.sender_email = sender.email;
        variables.sender_phone = sender.phone || '';
      }
    }
    if (context.companyId) {
      const company = await Company.findByPk(context.companyId);
      if (company) {
        variables.company_name = company.name;
        variables.company_industry = company.industry || '';
        variables.company_size = company.size || '';
        variables.company_location = company.location || '';
        variables.company_website = company.website || '';
        variables.company_phone = company.phone || '';
        variables.company_email = company.email || '';
        variables.company_address = `${company.addressLine1 || ''} ${company.addressLine2 || ''}`.trim();
        variables.company_city = company.city || '';
        variables.company_state = company.stateProvince || '';
        variables.company_country = company.country || '';
      }
    }
    if (context.interviewId) {
      const interview = await Interview.findByPk(context.interviewId);
      if (interview) {
        variables.interview_id = interview.id;
        variables.interview_type = interview.type || '';
        variables.interview_date = interview.date || '';
        variables.interview_time = interview.time || '';
        variables.interview_location = interview.location || '';
        variables.interview_notes = interview.notes || '';
      }
    }
    if (context.applicationId) {
      const application = await Application.findByPk(context.applicationId);
      if (application) {
        variables.application_id = application.id;
        variables.application_date = application.date || '';
        variables.application_status = application.status || '';
      }
    }
    if (context.customVariables) {
      Object.assign(variables, context.customVariables);
    }
    // Debug log for recipient variables
    console.log('[AUTOMATION][DEBUG] variables for recipient:', variables);
    let recipientEmail = variables.candidate_email || variables.sender_email;
    if (!recipientEmail) {
      return { success: false, message: 'No recipient email found for automation.' };
    }
    // Fetch client name and add to variables BEFORE template filling
    let clientName = '';
    if (clientId) {
      const client = await Client.findByPk(clientId);
      if (client && client.name) {
        clientName = client.name;
      }
    }
    variables.client_name = clientName;
    // Now call fillTemplate for subject and message
    let subject = fillTemplate(autoMsg.subject, variables);
    let message = fillTemplate(autoMsg.message, variables);
    // If a template is referenced, use it
    if (autoMsg.template) {
      const template = await communicationsRepository.findEmailTemplateByName(autoMsg.template);
      if (template) {
        subject = fillTemplate(template.subject || subject, variables);
        message = fillTemplate(template.content || message, variables);
      }
    }
    // Do NOT send a real email or log anything in testAutomation
    // Just return the preview
    return {
      success: true,
      preview: {
        subject,
        message,
        variables
      }
    };
  },

  async sendDirectEmail({ subject, message, recipients, cc, bcc, attachments, senderName }, clientId) {
    // Normalize line endings to CRLF to prevent SMTP 'bare CR' errors
    function normalizeLineEndings(str) {
      if (!str) return str;
      return str.replace(/\r\n|\r|\n/g, '\r\n');
    }
    subject = normalizeLineEndings(subject);
    message = normalizeLineEndings(message);
    let clientName = 'RecrootBridge';
    if (clientId) {
      const client = await Client.findByPk(clientId);
      if (client && client.companyName) {
        clientName = client.companyName;
      }
    }
    let results = [];
    for (const recipient of recipients) {
      const result = await sendCustomEmail({
        recipientEmail: recipient,
        subject,
        message,
        senderName: senderName || 'No Reply',
        companyName: clientName,
        cc,
        bcc,
        attachments
      });
      results.push(result);
    }
    return { results };
  },
};