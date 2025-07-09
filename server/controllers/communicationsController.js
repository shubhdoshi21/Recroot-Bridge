import { communicationsService } from '../services/communicationsService.js';

// Email Templates
export const getAllEmailTemplates = async (req, res) => {
  try {
    const templates = await communicationsService.getAllEmailTemplates();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email templates', details: err.message });
  }
};

export const getEmailTemplateById = async (req, res) => {
  try {
    const template = await communicationsService.getEmailTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Email template not found' });
    }
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email template', details: err.message });
  }
};

// Automated Messages
export const getAllAutomatedMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User authentication required', message: 'Please log in to access automated messages' });
    }
    if (!req.user.clientId) {
      return res.status(400).json({ error: 'Client ID not found', message: 'User account is not associated with a client. Please contact your admin.' });
    }
    const messages = await communicationsService.getAllAutomatedMessages(req.user.clientId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch automated messages', details: err.message });
  }
};

export const createAutomatedMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User authentication required', message: 'Please log in to create automated messages' });
    }
    if (!req.user.clientId) {
      return res.status(400).json({ error: 'Client ID not found', message: 'User account is not associated with a client. Please contact your admin.' });
    }
    if (!req.user.id) {
      return res.status(400).json({ error: 'User ID not found', message: 'User account is incomplete. Please contact your admin.' });
    }
    const data = { ...req.body, sentCount: 0, clientId: req.user.clientId, createdBy: req.user.id };
    const message = await communicationsService.createAutomatedMessage(data);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create automated message', details: err.message });
  }
};

export const updateAutomatedMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User authentication required', message: 'Please log in to update automated messages' });
    }
    if (!req.user.clientId) {
      return res.status(400).json({ error: 'Client ID not found', message: 'User account is not associated with a client. Please contact your admin.' });
    }
    const updated = await communicationsService.updateAutomatedMessage(req.params.id, req.body, req.user.clientId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update automated message', details: err.message });
  }
};

export const toggleAutomatedMessageStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User authentication required', message: 'Please log in to toggle automated message status' });
    }
    if (!req.user.clientId) {
      return res.status(400).json({ error: 'Client ID not found', message: 'User account is not associated with a client. Please contact your admin.' });
    }
    const message = await communicationsService.toggleAutomatedMessageStatus(req.params.id, req.user.clientId);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle automated message status', details: err.message });
  }
};

export const deleteAutomatedMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    if (!req.user.clientId) {
      return res.status(400).json({ error: 'Client ID not found' });
    }
    await communicationsService.deleteAutomatedMessage(req.params.id, req.user.clientId);
    res.json({ success: true, message: 'Automated message deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete automated message', details: err.message });
  }
};

// Automation
export const triggerCandidateAutomation = async (req, res) => {
  try {
    // Debug log for incoming request body
    // console.log('[AUTOMATION][DEBUG] Incoming body:', req.body);
    if (!req.user) {
      return res.status(401).json({ error: 'User authentication required', message: 'Please log in to trigger automations' });
    }
    if (!req.user.clientId) {
      return res.status(400).json({ error: 'Client ID not found', message: 'User account is not associated with a client. Please contact your admin.' });
    }
    const { triggerType, context } = req.body;
    const { accessToken, refreshToken } = req.user;
    const results = await communicationsService.triggerCandidateAutomation({ triggerType, context, tokens: { accessToken, refreshToken }, clientId: req.user.clientId });
    res.json({ success: true, message: `Automation triggered for ${triggerType}`, results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger automation', details: err.message });
  }
};

export const getVariablesForContext = async (req, res) => {
  try {
    const { candidateId, jobId, senderId, companyId } = req.query;
    const context = {
      candidateId: candidateId ? parseInt(candidateId) : null,
      jobId: jobId ? parseInt(jobId) : null,
      senderId: senderId ? parseInt(senderId) : null,
      companyId: companyId ? parseInt(companyId) : null,
    };
    const variables = await communicationsService.getVariablesForContext(context);
    res.json({ success: true, variables });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch variables for context', details: err.message });
  }
};

export const testAutomation = async (req, res) => {
  try {
    const result = await communicationsService.testAutomation(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to test automation', details: err.message });
  }
};

// Automation Triggers List
export const getAutomationTriggers = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    const triggers = await communicationsService.getAutomationTriggers(req.user.clientId);
    res.json({ success: true, triggers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch automation triggers', details: err.message });
  }
};

// Automation Variables List
export const getAutomationVariablesList = async (req, res) => {
  try {
    const variables = await communicationsService.getAutomationVariablesList();
    res.json({ success: true, variables });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch automation variables list', details: err.message });
  }
};

// Automation Message (GET/POST)
export const getAutomationMessage = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    const { trigger } = req.query;
    const message = await communicationsService.getAutomationMessage(trigger, req.user.clientId);
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch automation message', details: err.message });
  }
};

export const postAutomationMessage = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    const { trigger } = req.body;
    const message = await communicationsService.getAutomationMessage(trigger, req.user.clientId);
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch automation message', details: err.message });
  }
};

// Automation Edit Message (POST/PUT)
export const editAutomationMessage = async (req, res) => {
  try {
    if (!req.user || !req.user.clientId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    const { trigger, subject, message, template } = req.body;
    const updated = await communicationsService.editAutomationMessage(trigger, req.user.clientId, { subject, message, template });
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit automation message', details: err.message });
  }
};

export const sendEmail = async (req, res) => {
  try {
    // Helper to robustly parse emails from string/array
    function parseEmails(field) {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const arr = JSON.parse(field);
          if (Array.isArray(arr)) return arr;
        } catch {}
        return field.split(',').map(e => e.trim()).filter(Boolean);
      }
      return [];
    }

    const subject = req.body.subject;
    const message = req.body.message;
    const recipients = parseEmails(req.body.recipients);
    const cc = parseEmails(req.body.cc);
    const bcc = parseEmails(req.body.bcc);
    const clientId = req.user && req.user.clientId;
    const user = req.user || {};
    const senderName = user.fullName || user.name || user.email || 'No Reply';
    // If files are present, use them as attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer,
        mimetype: file.mimetype,
      }));
    } else if (req.body.attachments) {
      // fallback for JSON payloads
      attachments = req.body.attachments;
    }
    const result = await communicationsService.sendDirectEmail(
      { subject, message, recipients, cc, bcc, attachments, senderName },
      clientId
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
}; 