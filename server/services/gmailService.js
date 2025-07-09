import { google } from "googleapis";

function getGmailClient(accessToken, refreshToken) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oAuth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.gmail({ version: "v1", auth: oAuth2Client });
}

export async function listMessages(
  accessToken,
  refreshToken,
  labelIds = ["INBOX"],
  pageToken = null
) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const params = {
    userId: "me",
    labelIds,
    maxResults: 20,
  };
  if (pageToken) params.pageToken = pageToken;
  const res = await gmail.users.messages.list(params);
  return {
    messages: res.data.messages || [],
    nextPageToken: res.data.nextPageToken,
    resultSizeEstimate: res.data.resultSizeEstimate,
  };
}

export async function getMessage(accessToken, refreshToken, messageId) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return res.data;
}

export async function sendMessage(accessToken, refreshToken, rawMessage) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: rawMessage },
  });
  return res.data;
}

export async function modifyMessageLabels(
  accessToken,
  refreshToken,
  messageId,
  addLabelIds = [],
  removeLabelIds = []
) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const res = await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds,
      removeLabelIds,
    },
  });
  return res.data;
}

export async function listLabels(accessToken, refreshToken) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const res = await gmail.users.labels.list({ userId: "me" });
  return res.data.labels || [];
}

export async function getAttachment(
  accessToken,
  refreshToken,
  messageId,
  attachmentId
) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const res = await gmail.users.messages.attachments.get({
    userId: "me",
    messageId,
    id: attachmentId,
  });
  return res.data;
}

// Helper to extract attachment metadata from a message payload
export function extractAttachments(payload) {
  const attachments = [];
  function walkParts(parts) {
    if (!parts) return;
    for (const part of parts) {
      if (part.filename && part.body && part.body.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
          attachmentId: part.body.attachmentId,
        });
      }
      if (part.parts) walkParts(part.parts);
    }
  }
  walkParts(payload.parts);
  return attachments;
}
