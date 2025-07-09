import { api } from "../config/api";

class CommunicationService {
  // --- Automated Messages ---

  async fetchAutomatedMessages() {
    const url = api.communications.automatedMessages.getAll();
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch automated messages");
    return response.json();
  }

  async createAutomatedMessage(data) {
    const res = await fetch(api.communications.automatedMessages.create(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create automated message");
    return res.json();
  }

  async updateAutomatedMessage(id, data) {
    const url = api.communications.automatedMessages.update(id);
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update automated message");
    return response.json();
  }

  async toggleAutomatedMessageStatus(id) {
    const res = await fetch(api.communications.automatedMessages.toggleStatus(id), {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to toggle status");
    return res.json();
  }

  async deleteAutomatedMessage(id) {
    const res = await fetch(api.communications.automatedMessages.delete(id), {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete automated message");
    return res.json();
  }

  // --- Automation ---

  async triggerAutomation(data) {
    const response = await fetch(api.communications.automation.trigger(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to trigger automation");
    return response.json();
  }

  async getVariablesForContext(params) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${api.communications.automation.variables()}?${queryString}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get variables");
    return response.json();
  }

  async testAutomation(data) {
    const response = await fetch(api.communications.automation.test(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to test automation");
    return response.json();
  }

  async getAutomationTriggers() {
    const response = await fetch(api.communications.automation.triggers(), {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get automation triggers");
    return response.json();
  }

  async getAvailableVariablesList() {
    const response = await fetch(api.communications.automation.variablesList(), {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get available variables");
    return response.json();
  }

  async updateAutomationMessage({ automationId, subject, message }) {
    const response = await fetch(api.communications.automation.message(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ automationId, subject, message }),
    });
    if (!response.ok) throw new Error("Failed to update automation message");
    return response.json();
  }

  async fetchEmailTemplates() {
    const url = api.communications.emailTemplates.getAll();
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch email templates");
    return response.json();
  }

  async sendEmail(data) {
    const url = api.communications.sendEmail();
    let response;
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData();
      // Append all fields except attachments
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "attachments") {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else {
            formData.append(key, value);
          }
        }
      });
      // Append files
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
      response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
    } else {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
    }
    if (!response.ok) throw new Error("Failed to send email");
    return response.json();
  }
}

export const communicationService = new CommunicationService();
