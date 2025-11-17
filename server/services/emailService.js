import { google } from 'googleapis';
import Email from '../models/Email.js';
import aiService from './aiService.js';
import calendarService from './calendarService.js';

class EmailService {
  // Get Gmail OAuth2 client
  getGmailOAuth2Client(user) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    if (user.emailIntegrations?.google?.accessToken) {
      oauth2Client.setCredentials({
        access_token: user.emailIntegrations.google.accessToken,
        refresh_token: user.emailIntegrations.google.refreshToken
      });
    }

    return oauth2Client;
  }

  // Fetch and analyze Gmail messages
  async fetchAndAnalyzeGmail(user) {
    try {
      const oauth2Client = this.getGmailOAuth2Client(user);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Get messages from the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const query = `after:${Math.floor(sevenDaysAgo.getTime() / 1000)}`;

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50
      });

      const messages = response.data.messages || [];
      const processedEmails = [];

      for (const message of messages) {
        // Check if already processed
        const existingEmail = await Email.findOne({
          userId: user._id,
          externalId: message.id,
          source: 'google'
        });

        if (existingEmail) continue;

        // Get full message details
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const headers = fullMessage.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const to = headers.find(h => h.name === 'To')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        // Get email body
        let body = '';
        if (fullMessage.data.payload.body.data) {
          body = Buffer.from(fullMessage.data.payload.body.data, 'base64').toString('utf-8');
        } else if (fullMessage.data.payload.parts) {
          const textPart = fullMessage.data.payload.parts.find(p => p.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        }

        // Analyze email for meeting request
        const analysis = await aiService.analyzeEmailForMeeting(`Subject: ${subject}\n\n${body}`);

        const emailData = {
          userId: user._id,
          externalId: message.id,
          source: 'google',
          subject,
          from: { email: from },
          body,
          receivedAt: new Date(date),
          analysis: {
            isMeetingRequest: analysis.isMeetingRequest,
            extractedInfo: {
              topic: analysis.topic,
              urgency: analysis.urgency,
              participants: analysis.participants
            }
          },
          processed: false
        };

        // If it's a meeting request and auto-scheduling is enabled
        if (analysis.isMeetingRequest && user.settings?.autoScheduling?.enabled) {
          const duration = analysis.suggestedDuration || 60;
          const timeSlots = await calendarService.findAvailableTimeSlots(user, duration, 3);
          
          emailData.analysis.suggestedTimeSlots = timeSlots;
          
          // Generate draft reply
          const fromEmail = from.match(/<(.+)>/)?.[1] || from;
          const senderName = from.split('<')[0].trim();
          const draftReply = await aiService.generateMeetingReply(body, timeSlots, senderName);
          
          emailData.analysis.draftReply = draftReply;
        }

        const savedEmail = await Email.create(emailData);
        processedEmails.push(savedEmail);
      }

      return {
        success: true,
        count: processedEmails.length,
        meetingRequests: processedEmails.filter(e => e.analysis.isMeetingRequest).length
      };
    } catch (error) {
      console.error('Error fetching Gmail:', error);
      throw error;
    }
  }

  // Get unprocessed meeting requests
  async getUnprocessedMeetingRequests(userId) {
    try {
      const emails = await Email.find({
        userId,
        'analysis.isMeetingRequest': true,
        processed: false
      }).sort({ receivedAt: -1 });

      return emails;
    } catch (error) {
      console.error('Error getting meeting requests:', error);
      throw error;
    }
  }

  // Send email reply (Gmail)
  async sendGmailReply(user, emailId, replyText) {
    try {
      const email = await Email.findById(emailId);
      if (!email) throw new Error('Email not found');

      const oauth2Client = this.getGmailOAuth2Client(user);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const rawMessage = [
        `To: ${email.from.email}`,
        `Subject: Re: ${email.subject}`,
        `In-Reply-To: ${email.externalId}`,
        '',
        replyText
      ].join('\n');

      const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId: email.externalId
        }
      });

      // Mark email as processed
      email.processed = true;
      email.userAction = 'replied';
      await email.save();

      return { success: true };
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  }

  // Mark email as processed
  async markAsProcessed(emailId, action) {
    try {
      const email = await Email.findByIdAndUpdate(
        emailId,
        {
          processed: true,
          userAction: action
        },
        { new: true }
      );

      return email;
    } catch (error) {
      console.error('Error marking email as processed:', error);
      throw error;
    }
  }
}

export default new EmailService();
