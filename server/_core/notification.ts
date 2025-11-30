/**
 * Simple notification system using email
 * Sends notifications to the admin email address
 */

import { sendEmail } from "../services/emailService";
import { ENV } from "./env";

export type NotifyOwnerInput = {
  title: string;
  content: string;
};

/**
 * Send notification to admin via email
 * @param input - Notification title and content
 * @returns true if notification was sent successfully, false otherwise
 */
export async function notifyOwner(input: NotifyOwnerInput): Promise<boolean> {
  const { title, content } = input;

  // Validate input
  if (!title || !content) {
    console.error("[Notification] Missing title or content");
    return false;
  }

  // Send email to admin
  try {
    const adminEmail = ENV.gmailUser; // Use the same email as sender
    
    if (!adminEmail) {
      console.error("[Notification] Admin email not configured");
      return false;
    }

    await sendEmail({
      to: adminEmail,
      subject: `[منظم] ${title}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${title}</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${content}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            هذه رسالة تلقائية من نظام منظم
          </p>
        </div>
      `,
    });

    console.log(`[Notification] Email sent to admin: ${title}`);
    return true;
  } catch (error) {
    console.error("[Notification] Failed to send email:", error);
    return false;
  }
}
