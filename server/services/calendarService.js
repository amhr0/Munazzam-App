import { google } from 'googleapis';
import CalendarEvent from '../models/CalendarEvent.js';

class CalendarService {
  // Get Google Calendar OAuth2 client
  getGoogleOAuth2Client(user) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    if (user.calendarIntegrations?.google?.accessToken) {
      oauth2Client.setCredentials({
        access_token: user.calendarIntegrations.google.accessToken,
        refresh_token: user.calendarIntegrations.google.refreshToken
      });
    }

    return oauth2Client;
  }

  // Sync Google Calendar events
  async syncGoogleCalendar(user) {
    try {
      const oauth2Client = this.getGoogleOAuth2Client(user);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: oneMonthAgo.toISOString(),
        timeMax: oneMonthLater.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.data.items || [];

      // Save or update events in database
      for (const event of events) {
        const eventData = {
          userId: user._id,
          title: event.summary || 'No Title',
          description: event.description || '',
          startTime: event.start.dateTime || event.start.date,
          endTime: event.end.dateTime || event.end.date,
          location: event.location || '',
          source: 'google',
          externalId: event.id,
          attendees: event.attendees?.map(a => ({
            email: a.email,
            name: a.displayName,
            responseStatus: a.responseStatus
          })) || [],
          isAllDay: !event.start.dateTime
        };

        await CalendarEvent.findOneAndUpdate(
          { userId: user._id, externalId: event.id, source: 'google' },
          eventData,
          { upsert: true, new: true }
        );
      }

      return { success: true, count: events.length };
    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      throw error;
    }
  }

  // Sync Microsoft Calendar events
  async syncMicrosoftCalendar(user) {
    try {
      // This would use Microsoft Graph API
      // Implementation similar to Google Calendar
      // For now, returning placeholder
      return { success: true, count: 0, message: 'Microsoft Calendar sync not yet implemented' };
    } catch (error) {
      console.error('Error syncing Microsoft Calendar:', error);
      throw error;
    }
  }

  // Find available time slots
  async findAvailableTimeSlots(user, durationMinutes = 60, numberOfSlots = 3) {
    try {
      const now = new Date();
      const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      // Get all events in the next 2 weeks
      const events = await CalendarEvent.find({
        userId: user._id,
        startTime: { $gte: now, $lte: twoWeeksLater }
      }).sort({ startTime: 1 });

      const availableSlots = [];
      const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM

      // Generate potential time slots
      for (let day = 0; day < 14 && availableSlots.length < numberOfSlots; day++) {
        const currentDay = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
        
        // Skip weekends
        if (currentDay.getDay() === 0 || currentDay.getDay() === 6) continue;

        // Check each hour in working hours
        for (let hour = workingHours.start; hour < workingHours.end && availableSlots.length < numberOfSlots; hour++) {
          const slotStart = new Date(currentDay);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

          // Check if this slot conflicts with any existing event
          const hasConflict = events.some(event => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            return (slotStart < eventEnd && slotEnd > eventStart);
          });

          if (!hasConflict && slotStart > now) {
            availableSlots.push({
              start: slotStart,
              end: slotEnd
            });
          }
        }
      }

      return availableSlots.slice(0, numberOfSlots);
    } catch (error) {
      console.error('Error finding available slots:', error);
      throw error;
    }
  }

  // Create calendar event
  async createEvent(user, eventData) {
    try {
      const event = await CalendarEvent.create({
        userId: user._id,
        ...eventData,
        source: eventData.source || 'manual'
      });

      // If user has Google Calendar integration, sync to Google
      if (user.calendarIntegrations?.google?.enabled && eventData.syncToGoogle) {
        await this.createGoogleCalendarEvent(user, eventData);
      }

      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Create event in Google Calendar
  async createGoogleCalendarEvent(user, eventData) {
    try {
      const oauth2Client = this.getGoogleOAuth2Client(user);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: 'Asia/Riyadh'
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: 'Asia/Riyadh'
        },
        attendees: eventData.attendees?.map(a => ({ email: a.email }))
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return response.data;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }

  // Get all events for a user
  async getUserEvents(userId, startDate, endDate) {
    try {
      const query = { userId };
      
      if (startDate && endDate) {
        query.startTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const events = await CalendarEvent.find(query).sort({ startTime: 1 });
      return events;
    } catch (error) {
      console.error('Error getting user events:', error);
      throw error;
    }
  }
}

export default new CalendarService();
