import { EmailTemplate } from '../models/EmailTemplate.js';
import AutomatedMessage from '../models/AutomatedMessage.js';

export const communicationsRepository = {
  // Email Templates
  async getAllEmailTemplates() {
    return EmailTemplate.findAll();
  },
  async getEmailTemplateById(id) {
    return EmailTemplate.findByPk(id);
  },

  // Automated Messages
  async getAllAutomatedMessages(clientId) {
    return AutomatedMessage.findAll({ where: { clientId } });
  },
  async createAutomatedMessage(data) {
    return AutomatedMessage.create(data);
  },
  async updateAutomatedMessage(id, data, clientId) {
    await AutomatedMessage.update(data, { where: { id, clientId } });
    return AutomatedMessage.findByPk(id);
  },
  async toggleAutomatedMessageStatus(id, clientId) {
    const message = await AutomatedMessage.findOne({ where: { id, clientId } });
    if (!message) throw new Error('Automated message not found');
    const newStatus = message.status === 'Active' ? 'Inactive' : 'Active';
    await message.update({ status: newStatus });
    return message;
  },
  async deleteAutomatedMessage(id, clientId) {
    const message = await AutomatedMessage.findOne({ where: { id, clientId } });
    if (!message) throw new Error('Automated message not found');
    await message.destroy();
    return true;
  },
  async findActiveAutomatedMessage(trigger, clientId) {
    return AutomatedMessage.findOne({ where: { trigger, clientId, status: 'Active' } });
  },
  async findEmailTemplateByName(name) {
    return EmailTemplate.findOne({ where: { name } });
  },
  // Find AutomatedMessage by trigger and clientId (any status)
  async findAutomatedMessageByTrigger(trigger, clientId) {
    return AutomatedMessage.findOne({ where: { trigger, clientId } });
  }
}; 