import {
  getIntegrationById,
  createCalendarEvent,
  getCalendarEventByExternalId,
  updateCalendarEvent,
  type Integration
} from "../db-integrations";
import { refreshGoogleToken, refreshMicrosoftToken } from "./oauth";

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  attendees?: Array<{ email: string }>;
  status: string;
  hangoutLink?: string;
}

interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  bodyPreview?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  attendees?: Array<{ emailAddress: { address: string } }>;
  webLink?: string;
  isCancelled?: boolean;
}

/**
 * Get valid access token (refresh if needed)
 */
async function getValidAccessToken(integration: Integration): Promise<string> {
  // Check if token is expired
  if (integration.expiresAt && new Date(integration.expiresAt) > new Date()) {
    return integration.accessToken;
  }

  // Token expired, refresh it
  if (!integration.refreshToken) {
    throw new Error("No refresh token available");
  }

  let tokenResponse;
  if (integration.provider === 'google') {
    tokenResponse = await refreshGoogleToken(integration.refreshToken);
  } else {
    tokenResponse = await refreshMicrosoftToken(integration.refreshToken);
  }

  // Update integration with new token
  const { updateIntegration } = await import("../db-integrations");
  await updateIntegration(integration.id, {
    accessToken: tokenResponse.access_token,
    expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000)
  });

  return tokenResponse.access_token;
}

/**
 * Sync Google Calendar events
 */
export async function syncGoogleCalendar(integrationId: number, userId: number): Promise<number> {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.provider !== 'google') {
    throw new Error("Invalid Google integration");
  }

  const accessToken = await getValidAccessToken(integration);

  // Get events from the last 30 days and next 90 days
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 30);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 90);

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${timeMin.toISOString()}&` +
    `timeMax=${timeMax.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Calendar API error: ${error}`);
  }

  const data = await response.json();
  const events: GoogleCalendarEvent[] = data.items || [];

  let syncedCount = 0;

  for (const event of events) {
    try {
      // Skip events without start time
      if (!event.start?.dateTime && !event.start?.date) continue;

      const startTime = new Date(event.start.dateTime || event.start.date!);
      const endTime = new Date(event.end?.dateTime || event.end?.date || startTime);

      const eventData = {
        userId,
        integrationId,
        externalId: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description || null,
        startTime,
        endTime,
        location: event.location || null,
        attendees: event.attendees ? JSON.stringify(event.attendees.map(a => a.email)) : null,
        status: event.status === 'confirmed' ? 'confirmed' as const : 
                event.status === 'tentative' ? 'tentative' as const : 
                'cancelled' as const,
        meetingUrl: event.hangoutLink || null
      };

      // Check if event already exists
      const existing = await getCalendarEventByExternalId(integrationId, event.id);
      
      if (existing) {
        await updateCalendarEvent(existing.id, eventData);
      } else {
        await createCalendarEvent(eventData);
      }

      syncedCount++;
    } catch (error) {
      console.error(`[CalendarSync] Error syncing event ${event.id}:`, error);
    }
  }

  return syncedCount;
}

/**
 * Sync Microsoft Outlook Calendar events
 */
export async function syncMicrosoftCalendar(integrationId: number, userId: number): Promise<number> {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.provider !== 'microsoft') {
    throw new Error("Invalid Microsoft integration");
  }

  const accessToken = await getValidAccessToken(integration);

  // Get events from the last 30 days and next 90 days
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 30);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 90);

  const url = `https://graph.microsoft.com/v1.0/me/calendarview?` +
    `startDateTime=${timeMin.toISOString()}&` +
    `endDateTime=${timeMax.toISOString()}&` +
    `$orderby=start/dateTime`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'outlook.timezone="UTC"'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Microsoft Calendar API error: ${error}`);
  }

  const data = await response.json();
  const events: MicrosoftCalendarEvent[] = data.value || [];

  let syncedCount = 0;

  for (const event of events) {
    try {
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);

      const eventData = {
        userId,
        integrationId,
        externalId: event.id,
        title: event.subject || 'Untitled Event',
        description: event.bodyPreview || null,
        startTime,
        endTime,
        location: event.location?.displayName || null,
        attendees: event.attendees ? JSON.stringify(event.attendees.map(a => a.emailAddress.address)) : null,
        status: event.isCancelled ? 'cancelled' as const : 'confirmed' as const,
        meetingUrl: event.webLink || null
      };

      // Check if event already exists
      const existing = await getCalendarEventByExternalId(integrationId, event.id);
      
      if (existing) {
        await updateCalendarEvent(existing.id, eventData);
      } else {
        await createCalendarEvent(eventData);
      }

      syncedCount++;
    } catch (error) {
      console.error(`[CalendarSync] Error syncing event ${event.id}:`, error);
    }
  }

  return syncedCount;
}

/**
 * Sync calendar based on provider
 */
export async function syncCalendar(integrationId: number, userId: number): Promise<number> {
  const integration = await getIntegrationById(integrationId);
  if (!integration) {
    throw new Error("Integration not found");
  }

  if (integration.provider === 'google') {
    return syncGoogleCalendar(integrationId, userId);
  } else {
    return syncMicrosoftCalendar(integrationId, userId);
  }
}
