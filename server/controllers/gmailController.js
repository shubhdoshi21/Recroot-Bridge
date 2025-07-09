import {
  fetchInbox,
  fetchMessage,
  sendMail,
  starMessage,
  unstarMessage,
  archiveMessage,
  unarchiveMessage,
  fetchLabels,
} from "../repositories/gmailRepository.js";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import { Buffer } from "buffer";
import { extractAttachments, getAttachment } from "../services/gmailService.js";

export async function getInbox(req, res) {
  const { accessToken, refreshToken } = req.user;
  const { pageToken } = req.query;
  console.log("[GMAIL][getInbox] req.user:", req.user, "pageToken:", pageToken);
  try {
    const result = await fetchInbox(
      accessToken,
      refreshToken,
      ["INBOX"],
      pageToken
    );
    console.log("[GMAIL][getInbox] result:", result);
    res.json(result);
  } catch (err) {
    console.log("[GMAIL][getInbox] ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

export async function getMessageController(req, res) {
  const { accessToken, refreshToken } = req.user;
  const { id } = req.params;
  try {
    const message = await fetchMessage(accessToken, refreshToken, id);
    // Extract attachment metadata
    const attachments = extractAttachments(message.payload || {});
    res.json({ ...message, attachments });
  } catch (err) {
    console.log("[GMAIL][getMessage] ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

export async function sendMessageController(req, res) {
  const { accessToken, refreshToken } = req.user;
  // Support both JSON and multipart/form-data
  const isMultipart = req.is("multipart/form-data");
  try {
    let raw;
    if (isMultipart) {
      // Use formidable or multer to parse files (assume multer middleware is used)
      const { subject, message, recipients, cc, bcc } = req.body;
      const files = req.files || [];
      // Normalize recipients/cc/bcc to comma-separated strings
      let toRecipients = recipients;
      if (Array.isArray(recipients)) {
        toRecipients = recipients.join(",");
      } else if (typeof recipients === "object" && recipients !== null) {
        toRecipients = Object.values(recipients).join(",");
      }
      let ccRecipients = cc;
      if (Array.isArray(cc)) {
        ccRecipients = cc.join(",");
      } else if (typeof cc === "object" && cc !== null) {
        ccRecipients = Object.values(cc).join(",");
      }
      let bccRecipients = bcc;
      if (Array.isArray(bcc)) {
        bccRecipients = bcc.join(",");
      } else if (typeof bcc === "object" && bcc !== null) {
        bccRecipients = Object.values(bcc).join(",");
      }
      // Backend validation for recipients
      if (!toRecipients || toRecipients.trim() === "") {
        return res.status(400).json({
          error: "At least one recipient is required to send an email.",
        });
      }
      // Build MIME message with attachments
      const mailOptions = {
        from: req.user.email,
        to: toRecipients,
        subject,
        text: message,
        attachments: files.map((file) => ({
          filename: file.originalname,
          content: file.buffer,
        })),
      };
      if (ccRecipients && ccRecipients.trim() !== "")
        mailOptions.cc = ccRecipients;
      if (bccRecipients && bccRecipients.trim() !== "")
        mailOptions.bcc = bccRecipients;
      console.log("[GMAIL][sendMessage][mailOptions]", mailOptions);
      // Use nodemailer to build the MIME message
      const transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
      });
      const info = await transporter.sendMail(mailOptions);
      console.log(
        "[GMAIL][sendMessage][nodemailer info.message]",
        info.message
      );
      // Collect the stream into a Buffer
      const getStreamBuffer = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", reject);
        });
      const messageBuffer = await getStreamBuffer(info.message);
      raw = messageBuffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
      console.log("[GMAIL][sendMessage][raw type]", typeof raw);
      console.log(
        "[GMAIL][sendMessage][raw preview]",
        raw && raw.slice ? raw.slice(0, 100) : raw
      );
    } else {
      // JSON: expect { raw } (already base64-encoded MIME)
      raw = req.body.raw;
      console.log("[GMAIL][sendMessage][raw from JSON]", raw);
    }
    const result = await sendMail(accessToken, refreshToken, raw);
    res.json(result);
  } catch (err) {
    console.log("[GMAIL][sendMessage] ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

export async function starMessageController(req, res) {
  const { accessToken, refreshToken } = req.user;
  const { id } = req.params;
  console.log("[GMAIL][starMessage] req.user:", req.user, "id:", id);
  try {
    const result = await starMessage(accessToken, refreshToken, id);
    console.log("[GMAIL][starMessage] result:", result);
    res.json(result);
  } catch (err) {
    console.log("[GMAIL][starMessage] ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

export async function unstarMessageController(req, res) {
  const { accessToken, refreshToken } = req.user;
  const { id } = req.params;
  console.log("[GMAIL][unstarMessage] req.user:", req.user, "id:", id);
  try {
    const result = await unstarMessage(accessToken, refreshToken, id);
    console.log("[GMAIL][unstarMessage] result:", result);
    res.json(result);
  } catch (err) {
    console.log("[GMAIL][unstarMessage] ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

export async function archiveMessageController(req, res) {
  const { accessToken, refreshToken } = req.user;
  const { id } = req.params;
  console.log("[GMAIL][archiveMessage] req.user:", req.user, "id:", id);
  try {
    const result = await archiveMessage(accessToken, refreshToken, id);
    console.log("[GMAIL][archiveMessage] result:", result);
    res.json(result);
  } catch (err) {
    console.log("[GMAIL][archiveMessage] ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

export async function unarchiveMessageController(req, res) {
  const { accessToken, refreshToken } = req.user;
  const { id } = req.params;
  console.log("[GMAIL][unarchiveMessage] req.user:", req.user, "id:", id);
  try {
    const result = await unarchiveMessage(accessToken, refreshToken, id);
    console.log("[GMAIL][unarchiveMessage] result:", result);
    res.json(result);
  } catch (err) {
    console.log("[GMAIL][unarchiveMessage] ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

export async function getLabelsController(req, res) {
  const { accessToken, refreshToken } = req.user;
  console.log("[GMAIL][getLabels] req.user:", req.user);
  try {
    const labels = await fetchLabels(accessToken, refreshToken);
    res.json({ labels });
  } catch (err) {
    console.log("[GMAIL][getLabels] ERROR:", err);

    // Handle network errors and other non-HTTP errors
    let status = 500;
    let errorMessage = "Failed to fetch labels";

    if (
      err.code === "ENOTFOUND" ||
      err.code === "ECONNREFUSED" ||
      err.code === "ETIMEDOUT"
    ) {
      status = 503; // Service Unavailable
      errorMessage =
        "Gmail service is currently unavailable. Please check your internet connection and try again.";
    } else if (err.status) {
      status = err.status;
      errorMessage = err.message || errorMessage;
    } else if (err.response && err.response.status) {
      status = err.response.status;
      errorMessage = err.message || errorMessage;
    }

    res.status(status).json({
      error: errorMessage,
      details: err.response?.data || err.stack || err,
    });
  }
}

export async function getMessagesByLabelController(req, res) {
  const { accessToken, refreshToken } = req.user;
  const { labelId } = req.params;
  const { pageToken } = req.query;
  try {
    const result = await fetchInbox(
      accessToken,
      refreshToken,
      [labelId],
      pageToken
    );
    res.json(result);
  } catch (err) {
    console.log("[GMAIL][getMessagesByLabel] ERROR:", err);

    // Handle network errors and other non-HTTP errors
    let status = 500;
    let errorMessage = "Failed to fetch messages for label";

    if (
      err.code === "ENOTFOUND" ||
      err.code === "ECONNREFUSED" ||
      err.code === "ETIMEDOUT"
    ) {
      status = 503; // Service Unavailable
      errorMessage =
        "Gmail service is currently unavailable. Please check your internet connection and try again.";
    } else if (err.status) {
      status = err.status;
      errorMessage = err.message || errorMessage;
    } else if (err.response && err.response.status) {
      status = err.response.status;
      errorMessage = err.message || errorMessage;
    }

    res.status(status).json({
      error: errorMessage,
      details: err.response?.data || err.stack || err,
    });
  }
}

// New: Download attachment endpoint
export async function downloadAttachmentController(req, res) {
  const { accessToken, refreshToken } = req.user;
  const { messageId, attachmentId } = req.params;
  try {
    const data = await getAttachment(
      accessToken,
      refreshToken,
      messageId,
      attachmentId
    );
    // data.data is base64url encoded
    const buffer = Buffer.from(data.data, "base64");
    res.setHeader("Content-Disposition", `attachment; filename=attachment`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(buffer);
  } catch (err) {
    console.log("[GMAIL][downloadAttachment] ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
