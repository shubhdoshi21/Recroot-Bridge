import nodemailer from "nodemailer";
import { config } from "../config/config.js";

// Create reusable transporter object using SMTP transport
export const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// Generate a random temporary password
const generateTempPassword = () => {
  // Generate a random 12-character password with mixed case, numbers, and special characters
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const sendVerificationEmail = async (email, username, otp) => {
  try {
    const mailOptions = {
      from: `"RecrootBridge" <${config.email.user}>`,
      to: email,
      subject: "Email Verification",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .otp { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome to RecrootBridge!</h2>
            </div>
            <p>Hello ${username},</p>
            <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
            <div class="otp">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendOAuthWelcomeEmail = async (
  email,
  fullName,
  tempPassword,
  resetToken
) => {
  try {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: config.emailFrom,
      to: email,
      subject: "Welcome to RecrootBridge - Your Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to RecrootBridge!</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for signing up with RecrootBridge using social authentication. Your account has been successfully created.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444; margin-top: 0;">Your Temporary Password</h3>
            <p style="font-size: 16px; font-weight: bold; color: #2c3e50;">${tempPassword}</p>
            <p style="color: #666; font-size: 14px;">Please use this temporary password to log in to your account.</p>
          </div>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444; margin-top: 0;">Important: Reset Your Password</h3>
            <p>For security reasons, we recommend that you reset your password immediately after your first login.</p>
            <p>Click the button below to set your new password:</p>
            <a href="${resetLink}" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; margin: 10px 0;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${resetLink}</p>
          </div>
          
          <p style="color: #666;">This link will expire in 24 hours for security reasons.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">If you didn't create this account, please ignore this email or contact support.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OAuth welcome email sent to:", email);
  } catch (error) {
    console.log("Error sending OAuth welcome email:", error);
    throw new Error("Failed to send welcome email: " + error.message);
  }
};

export const sendPasswordResetEmail = async (email, fullName, resetLink) => {
  try {
    const mailOptions = {
      from: `"RecrootBridge" <${config.email.user}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .button { 
              display: inline-block;
              padding: 12px 24px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Reset Your Password</h2>
            </div>
            <p>Hello ${fullName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendRoleChangeEmail = async (
  email,
  fullName,
  oldRole,
  newRole
) => {
  try {
    const mailOptions = {
      from: `"RecrootBridge" <${config.email.user}>`,
      to: email,
      subject: "Your Role Has Been Updated",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .role-change { 
              background-color: #f5f5f5; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0;
              text-align: center;
            }
            .old-role { color: #666; }
            .new-role { 
              color: #4CAF50; 
              font-weight: bold; 
              font-size: 1.2em;
            }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Role Update Notification</h2>
            </div>
            <p>Hello ${fullName},</p>
            <p>This email is to inform you that your role in RecrootBridge has been updated.</p>
            
            <div class="role-change">
              <p>Your role has been changed from:</p>
              <p class="old-role">${oldRole}</p>
              <p>to:</p>
              <p class="new-role">${newRole}</p>
            </div>

            <p>This change may affect your access and permissions within the system.</p>
            <p>If you have any questions or concerns about this change, please contact your company admin.</p>
            
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Role change notification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending role change notification email:", error);
    throw new Error("Failed to send role change notification email");
  }
};

export const sendDocumentShareEmail = async (recipientEmail, documentName, senderName, shareLink, message = "") => {
  try {
    const fromName = senderName ? `${senderName} via RecrootBridge` : "RecrootBridge";
    const mailOptions = {
      from: `"${fromName}" <${config.email.user}>`,
      to: recipientEmail,
      subject: `A document has been shared with you on RecrootBridge`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Document Shared with You</h2>
            </div>
            <p>Hello,</p>
            <p><b>${senderName}</b> has shared a document with you on RecrootBridge.</p>
            <p><b>Document:</b> ${documentName}</p>
            ${message ? `<p><b>Message:</b> ${message}</p>` : ""}
            <div style="text-align: center;">
              <a href="${shareLink}" class="button">View Document</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${shareLink}</p>
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Document share email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending document share email:", error);
    throw new Error("Failed to send document share email");
  }
};

export const sendTeamDocumentShareEmail = async ({
  recipientEmail,
  recipientName,
  teamName,
  documentName,
  documentDescription,
  documentTags = [],
  senderName,
  shareLink,
  message = "",
  companyLogoUrl = null,
  companyName = "RecrootBridge"
}) => {
  try {
    const fromName = senderName ? `${senderName} via ${companyName}` : companyName;
    const mailOptions = {
      from: `"${fromName}" <${config.email.user}>`,
      to: recipientEmail,
      subject: `A document has been shared with your team (${teamName}) on ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; background: #f9f9f9; }
            .container { max-width: 600px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { max-width: 120px; margin-bottom: 12px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; font-size: 16px; margin: 24px 0; font-weight: bold; }
            .tags { margin: 8px 0; }
            .tag { display: inline-block; background: #e0e7ff; color: #3730a3; border-radius: 4px; padding: 2px 8px; font-size: 12px; margin-right: 4px; }
            .meta { color: #555; font-size: 14px; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${companyLogoUrl ? `<img src="${companyLogoUrl}" class="logo" alt="${companyName} Logo" />` : ""}
              <h2>Document Shared with Your Team</h2>
            </div>
            <p>Hi ${recipientName || "there"},</p>
            <p><b>${senderName}</b> has shared a document with your team <b>${teamName}</b> on ${companyName}.</p>
            <div class="meta"><b>Document:</b> ${documentName}</div>
            ${documentDescription ? `<div class="meta"><b>Description:</b> ${documentDescription}</div>` : ""}
            ${documentTags && documentTags.length ? `<div class="tags">${documentTags.map(tag => `<span class='tag'>${tag}</span>`).join(' ')}</div>` : ""}
            ${message ? `<div class="meta"><b>Message from ${senderName}:</b> ${message}</div>` : ""}
            <div style="text-align: center;">
              <a href="${shareLink}" class="button">View Document</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${shareLink}</p>
            <div class="footer">
              <p>This is an automated message, please do not reply.<br/>If you have questions, contact your team lead or ${senderName}.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Team document share email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending team document share email:", error);
    throw new Error("Failed to send team document share email");
  }
};

export const sendUserDocumentShareEmail = async ({
  recipientEmail,
  recipientName,
  documentName,
  documentDescription,
  documentTags = [],
  senderName,
  shareLink,
  message = "",
  companyLogoUrl = null,
  companyName = "RecrootBridge"
}) => {
  try {
    const fromName = senderName ? `${senderName} via ${companyName}` : companyName;
    const mailOptions = {
      from: `"${fromName}" <${config.email.user}>`,
      to: recipientEmail,
      subject: `A document has been shared with you on ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; background: #f9f9f9; }
            .container { max-width: 600px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { max-width: 120px; margin-bottom: 12px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; font-size: 16px; margin: 24px 0; font-weight: bold; }
            .tags { margin: 8px 0; }
            .tag { display: inline-block; background: #e0e7ff; color: #3730a3; border-radius: 4px; padding: 2px 8px; font-size: 12px; margin-right: 4px; }
            .meta { color: #555; font-size: 14px; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${companyLogoUrl ? `<img src="${companyLogoUrl}" class="logo" alt="${companyName} Logo" />` : ""}
              <h2>Document Shared with You</h2>
            </div>
            <p>Hi ${recipientName || "there"},</p>
            <p><b>${senderName}</b> has shared a document with you on ${companyName}.</p>
            <div class="meta"><b>Document:</b> ${documentName}</div>
            ${documentDescription ? `<div class="meta"><b>Description:</b> ${documentDescription}</div>` : ""}
            ${documentTags && documentTags.length ? `<div class="tags">${documentTags.map(tag => `<span class='tag'>${tag}</span>`).join(' ')}</div>` : ""}
            ${message ? `<div class="meta"><b>Message from ${senderName}:</b> ${message}</div>` : ""}
            <div style="text-align: center;">
              <a href="${shareLink}" class="button">View Document</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${shareLink}</p>
            <div class="footer">
              <p>This is an automated message, please do not reply.<br/>If you have questions, contact ${senderName}.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("User document share email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending user document share email:", error);
    throw new Error("Failed to send user document share email");
  }
};

// Base HTML email template
function getBaseEmailHtml({ subject, message, companyName = 'RecrootBridge' }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(37,99,235,0.08); border: 1.5px solid #e0e7ef; padding: 0 0 32px 0; overflow: hidden; }
    .header {
      background: linear-gradient(90deg, #2563eb 0%, #6366f1 100%);
      padding: 32px 0 16px 0;
      text-align: center;
    }
    .company {
      font-size: 22px; font-weight: 700; color: #fff; letter-spacing: 1px; margin-bottom: 4px;
    }
    .title { font-size: 22px; color: #fff; font-weight: 400; margin-bottom: 0; letter-spacing: 0; }
    .divider { border: none; border-top: 1.5px solid #e0e7ff; margin: 0 0 0 0; }
    .content { font-size: 17px; color: #334155; line-height: 1.7; padding: 32px 40px 0 40px; }
    .footer { margin-top: 48px; font-size: 13px; color: #a0aec0; text-align: center; padding-bottom: 16px; }
    @media (max-width: 600px) {
      .container { padding: 0 0 24px 0; }
      .content { padding: 24px 12px 0 12px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company">${companyName}</div>
      <div class="title">${subject}</div>
    </div>
    <hr class="divider" />
    <div class="content">
      ${message}
    </div>
    <div class="footer">
      &copy; ${year} RecrootBridge. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

export const sendAutomationEmail = async (recipientEmail, subject, message, senderName, companyName = "RecrootBridge") => {
  try {
    // Always use 'Sender Name via RecrootBridge' for the from field
    // console.log('companyName', companyName)
    const fromName = senderName ? `${senderName} | ${companyName}` : companyName;
    // Convert any remaining \n to <br/> for HTML safety
    const html = getBaseEmailHtml({ subject, message: message.replace(/\n/g, '<br/>'), companyName });
    const mailOptions = {
      from: `"${fromName}" <${config.email.user}>`,
      to: recipientEmail,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Automation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending automation email:", error);
    throw error;
  }
};

export const sendCustomEmail = async ({
  recipientEmail,
  subject,
  message,
  senderName,
  companyName = "RecrootBridge",
  cc = [],
  bcc = [],
  attachments = []
}) => {
  try {
    // Ultimate normalization: first all CRLF/CR to LF, then all LF to CRLF
    function normalizeLineEndings(str) {
      if (!str) return str;
      str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n'); // all CRLF and CR to LF
      return str.replace(/\n/g, '\r\n'); // all LF to CRLF
    }
    subject = normalizeLineEndings(subject);
    message = normalizeLineEndings(message);
    const text = normalizeLineEndings(message);
    const fromName = senderName ? `${senderName} | ${companyName}` : companyName;
    // For HTML, convert \n to <br/> first, then normalize
    let htmlRaw = getBaseEmailHtml({ subject, message: message.replace(/\r\n|\r|\n/g, '<br/>'), companyName });
    const html = normalizeLineEndings(htmlRaw);
    const mailOptions = {
      from: `"${fromName}" <${config.email.user}>`,
      to: recipientEmail,
      subject,
      text, // normalized
      html, // normalized
      cc: cc.length > 0 ? cc : undefined,
      bcc: bcc.length > 0 ? bcc : undefined,
      attachments: attachments.length > 0 ? attachments : undefined
    };
    // Debug: log outgoing subject, message, and hex of text
    // console.log('DEBUG OUTGOING EMAIL:', { subject, message });
    // console.log('DEBUG HEX:', Buffer.from(text).toString('hex'));
    const info = await transporter.sendMail(mailOptions);
    console.log("Custom email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending custom email:", error);
    throw error;
  }
};

export { generateTempPassword };
