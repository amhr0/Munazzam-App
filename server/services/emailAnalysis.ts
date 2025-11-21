import {
  getIntegrationById,
  createEmail,
  getEmailByExternalId,
  getUnanalyzedEmails,
  updateEmail,
  type Integration
} from "../db-integrations";
import { invokeLLM } from "../_core/llm";
import { createTask } from "../db";

interface GoogleEmail {
  id: string;
  threadId: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ mimeType: string; body?: { data?: string } }>;
  };
  internalDate: string;
}

interface MicrosoftEmail {
  id: string;
  subject: string;
  from: { emailAddress: { address: string } };
  toRecipients: Array<{ emailAddress: { address: string } }>;
  bodyPreview: string;
  body: { content: string; contentType: string };
  receivedDateTime: string;
}

interface ExtractedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

/**
 * Get valid access token (refresh if needed)
 */
async function getValidAccessToken(integration: Integration): Promise<string> {
  if (integration.expiresAt && new Date(integration.expiresAt) > new Date()) {
    return integration.accessToken;
  }

  if (!integration.refreshToken) {
    throw new Error("No refresh token available");
  }

  const { refreshGoogleToken, refreshMicrosoftToken } = await import("./oauth");
  const { updateIntegration } = await import("../db-integrations");

  let tokenResponse;
  if (integration.provider === 'google') {
    tokenResponse = await refreshGoogleToken(integration.refreshToken);
  } else {
    tokenResponse = await refreshMicrosoftToken(integration.refreshToken);
  }

  await updateIntegration(integration.id, {
    accessToken: tokenResponse.access_token,
    expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000)
  });

  return tokenResponse.access_token;
}

/**
 * Decode base64url (Gmail uses this encoding)
 */
function decodeBase64Url(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

/**
 * Extract email body from Gmail message
 */
function extractGmailBody(payload: GoogleEmail['payload']): string {
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
  }

  return '';
}

/**
 * Sync Gmail messages
 */
export async function syncGmail(integrationId: number, userId: number): Promise<number> {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.provider !== 'google') {
    throw new Error("Invalid Google integration");
  }

  const accessToken = await getValidAccessToken(integration);

  // Get recent emails (last 7 days)
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
  const query = `after:${sevenDaysAgo}`;

  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`;

  const listResponse = await fetch(listUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!listResponse.ok) {
    const error = await listResponse.text();
    throw new Error(`Gmail API error: ${error}`);
  }

  const listData = await listResponse.json();
  const messages = listData.messages || [];

  let syncedCount = 0;

  for (const message of messages) {
    try {
      // Check if email already exists
      const existing = await getEmailByExternalId(integrationId, message.id);
      if (existing) continue;

      // Get full message details
      const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`;
      const messageResponse = await fetch(messageUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!messageResponse.ok) continue;

      const emailData: GoogleEmail = await messageResponse.json();
      const headers = emailData.payload.headers;

      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
      const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
      const body = extractGmailBody(emailData.payload);

      await createEmail({
        userId,
        integrationId,
        externalId: message.id,
        subject,
        from,
        to,
        body: body.substring(0, 10000), // Limit body size
        receivedAt: new Date(parseInt(emailData.internalDate)),
        analyzed: 0,
        extractedTasks: null
      });

      syncedCount++;
    } catch (error) {
      console.error(`[EmailSync] Error syncing Gmail message ${message.id}:`, error);
    }
  }

  return syncedCount;
}

/**
 * Sync Microsoft Outlook emails
 */
export async function syncOutlookEmail(integrationId: number, userId: number): Promise<number> {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.provider !== 'microsoft') {
    throw new Error("Invalid Microsoft integration");
  }

  const accessToken = await getValidAccessToken(integration);

  // Get recent emails (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const url = `https://graph.microsoft.com/v1.0/me/messages?` +
    `$filter=receivedDateTime ge ${sevenDaysAgo.toISOString()}&` +
    `$orderby=receivedDateTime desc&` +
    `$top=50`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Outlook API error: ${error}`);
  }

  const data = await response.json();
  const messages: MicrosoftEmail[] = data.value || [];

  let syncedCount = 0;

  for (const message of messages) {
    try {
      // Check if email already exists
      const existing = await getEmailByExternalId(integrationId, message.id);
      if (existing) continue;

      const to = message.toRecipients.map(r => r.emailAddress.address).join(', ');

      await createEmail({
        userId,
        integrationId,
        externalId: message.id,
        subject: message.subject || 'No Subject',
        from: message.from.emailAddress.address,
        to,
        body: message.body.content.substring(0, 10000), // Limit body size
        receivedAt: new Date(message.receivedDateTime),
        analyzed: 0,
        extractedTasks: null
      });

      syncedCount++;
    } catch (error) {
      console.error(`[EmailSync] Error syncing Outlook message ${message.id}:`, error);
    }
  }

  return syncedCount;
}

/**
 * Analyze email and extract tasks using AI
 */
export async function analyzeEmailForTasks(emailId: number, userId: number): Promise<ExtractedTask[]> {
  const { getDb } = await import("../db");
  const { emails } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const emailResult = await db.select().from(emails).where(eq(emails.id, emailId)).limit(1);
  const email = emailResult[0];
  
  if (!email) throw new Error("Email not found");

  const prompt = `أنت مساعد ذكي متخصص في تحليل رسائل البريد الإلكتروني واستخراج المهام والإجراءات المطلوبة.

قم بتحليل البريد الإلكتروني التالي واستخرج أي مهام أو إجراءات مطلوبة:

الموضوع: ${email.subject}
من: ${email.from}
المحتوى:
${email.body?.substring(0, 2000)}

استخرج المهام بصيغة JSON فقط. إذا لم تجد مهام، أرجع مصفوفة فارغة.
كل مهمة يجب أن تحتوي على:
- title: عنوان المهمة (مختصر وواضح)
- description: وصف تفصيلي
- priority: الأولوية (low, medium, high, urgent)
- dueDate: تاريخ الاستحقاق إن وُجد (بصيغة ISO)`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت مساعد متخصص في استخراج المهام من الإيميلات. أرجع JSON فقط." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "extracted_tasks",
          strict: true,
          schema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                    dueDate: { type: "string" }
                  },
                  required: ["title", "description", "priority"],
                  additionalProperties: false
                }
              }
            },
            required: ["tasks"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr || '{"tasks":[]}');
    const tasks: ExtractedTask[] = result.tasks || [];

    // Save extracted tasks to email
    await updateEmail(emailId, {
      analyzed: 1,
      extractedTasks: JSON.stringify(tasks)
    });

    // Create tasks in the system
    for (const task of tasks) {
      await createTask({
        userId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: 'todo',
        sourceId: emailId,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        assignedTo: null
      });
    }

    return tasks;
  } catch (error) {
    console.error('[EmailAnalysis] Error analyzing email:', error);
    await updateEmail(emailId, { analyzed: 1, extractedTasks: '[]' });
    return [];
  }
}

/**
 * Analyze all unanalyzed emails for a user
 */
export async function analyzeAllUnanalyzedEmails(userId: number): Promise<number> {
  const unanalyzed = await getUnanalyzedEmails(userId);
  let analyzedCount = 0;

  for (const email of unanalyzed) {
    try {
      await analyzeEmailForTasks(email.id, userId);
      analyzedCount++;
    } catch (error) {
      console.error(`[EmailAnalysis] Error analyzing email ${email.id}:`, error);
    }
  }

  return analyzedCount;
}
