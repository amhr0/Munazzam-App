/**
 * Emotion Data Handler for Live Copilot
 * معالج بيانات المشاعر للمساعد الخفي
 */

import type { Socket } from "socket.io";
import { analyzeMeetingContext, generateTacticalSuggestions, type EmotionData, type MeetingContext } from "./tacticalSuggestions";

interface LiveSession {
  sessionId: string;
  userId: number;
  candidateName: string;
  position: string;
  transcript: Array<{
    speaker: 'interviewer' | 'candidate';
    text: string;
    timestamp: number;
  }>;
  suggestions: Array<{
    type: 'question' | 'concern' | 'insight';
    content: string;
    timestamp: number;
  }>;
  redFlags: Array<{
    flag: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
  }>;
  tacticalSuggestions: Array<{
    type: 'opportunity' | 'warning' | 'tactic' | 'question';
    priority: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    reasoning: string;
    action?: string;
    timestamp: number;
  }>;
  emotionData: EmotionData[];
  meetingContext?: MeetingContext;
  startTime: number;
}

/**
 * معالج بيانات المشاعر من Chrome Extension
 */
export async function handleEmotionData(
  socket: Socket,
  session: LiveSession,
  emotionData: EmotionData
) {
  try {
    // إضافة بيانات المشاعر
    session.emotionData.push(emotionData);

    // تحليل سياق الاجتماع إذا لم يتم بعد
    if (!session.meetingContext && session.transcript.length > 5) {
      const fullTranscript = session.transcript.map(t => t.text).join(' ');
      session.meetingContext = await analyzeMeetingContext(fullTranscript);
      
      console.log(`[LiveCopilot] Meeting context detected: ${session.meetingContext.type}`);
    }

    // توليد اقتراحات تكتيكية كل 10 ثوانٍ
    const shouldGenerateSuggestions = session.emotionData.length % 50 === 0; // 50 إطار = ~10 ثوانٍ
    
    if (shouldGenerateSuggestions && session.meetingContext && session.transcript.length > 0) {
      const recentTranscript = session.transcript
        .slice(-5)
        .map(t => t.text)
        .join(' ');

      const tacticalSuggestions = await generateTacticalSuggestions(
        session.meetingContext,
        session.emotionData,
        recentTranscript
      );

      if (tacticalSuggestions.length > 0) {
        // إضافة timestamp
        const suggestionsWithTimestamp = tacticalSuggestions.map(s => ({
          ...s,
          timestamp: Date.now()
        }));

        session.tacticalSuggestions.push(...suggestionsWithTimestamp);

        // إرسال للعميل
        socket.emit("tactical-suggestions", { 
          suggestions: suggestionsWithTimestamp 
        });

        console.log(`[LiveCopilot] Generated ${tacticalSuggestions.length} tactical suggestions`);
      }
    }

    // إرسال بيانات المشاعر للعميل (للرسوم البيانية)
    socket.emit("emotion-update", { emotion: emotionData });

  } catch (error) {
    console.error('[LiveCopilot] Error handling emotion data:', error);
  }
}

/**
 * تسجيل معالج emotion-data في Socket.io
 */
export function registerEmotionHandler(
  socket: Socket,
  activeSessions: Map<string, LiveSession>
) {
  socket.on("emotion-data", async (data: {
    sessionId: string;
    emotion: EmotionData;
  }) => {
    const session = activeSessions.get(data.sessionId);
    if (!session) {
      socket.emit("error", { message: "Session not found" });
      return;
    }

    await handleEmotionData(socket, session, data.emotion);
  });
}
