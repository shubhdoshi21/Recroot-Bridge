import {
  listMessages,
  getMessage,
  sendMessage,
  modifyMessageLabels,
  listLabels,
} from "../services/gmailService.js";
import nodemailer from "nodemailer";
import { Buffer } from "buffer";

export async function fetchInbox(
  accessToken,
  refreshToken,
  labelIds,
  pageToken
) {
  return listMessages(accessToken, refreshToken, labelIds, pageToken);
}

export async function fetchMessage(accessToken, refreshToken, messageId) {
  return getMessage(accessToken, refreshToken, messageId);
}

export async function sendMail(accessToken, refreshToken, emailData) {
  try {
    // Check if emailData is a raw MIME message or structured data
    if (typeof emailData === "string") {
      // Raw MIME message (existing functionality)
      return sendMessage(accessToken, refreshToken, emailData);
    } else {
      // Structured email data (for automation)
      const { to, subject, message, cc, bcc, attachments = [] } = emailData;

      // Build MIME message with nodemailer
      const mailOptions = {
        from: process.env.GMAIL_FROM_EMAIL || "noreply@company.com",
        to: to,
        subject: subject,
        html: message,
        attachments: attachments.map((file) => ({
          filename: file.originalname || file.name,
          content: file.buffer || file,
        })),
      };

      if (cc) mailOptions.cc = cc;
      if (bcc) mailOptions.bcc = bcc;

      // Use nodemailer to build the MIME message
      const transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
      });

      const info = await transporter.sendMail(mailOptions);

      // Collect the stream into a Buffer
      const getStreamBuffer = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", reject);
        });

      const messageBuffer = await getStreamBuffer(info.message);
      const raw = messageBuffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      // Send using Gmail API
      return sendMessage(accessToken, refreshToken, raw);
    }
  } catch (error) {
    console.log("[GMAIL][sendMail] Error:", error);
    throw error;
  }
}

export async function starMessage(accessToken, refreshToken, messageId) {
  return modifyMessageLabels(
    accessToken,
    refreshToken,
    messageId,
    ["STARRED"],
    []
  );
}

export async function unstarMessage(accessToken, refreshToken, messageId) {
  return modifyMessageLabels(
    accessToken,
    refreshToken,
    messageId,
    [],
    ["STARRED"]
  );
}

export async function archiveMessage(accessToken, refreshToken, messageId) {
  return modifyMessageLabels(
    accessToken,
    refreshToken,
    messageId,
    [],
    ["INBOX"]
  );
}

export async function unarchiveMessage(accessToken, refreshToken, messageId) {
  return modifyMessageLabels(
    accessToken,
    refreshToken,
    messageId,
    ["INBOX"],
    []
  );
}

export async function fetchLabels(accessToken, refreshToken) {
  return listLabels(accessToken, refreshToken);
}
