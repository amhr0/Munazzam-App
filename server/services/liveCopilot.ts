import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";
import { ragService } from "./rag";
import { analyzeMeetingContext, generateTacticalSuggestions, type EmotionData, type MeetingContext } from "./tacticalSuggestions";
import { registerEmotionHandler } from "./liveCopilot-emotion-handler";

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

const activeSessions = new Map<string, LiveSession>();

/**
 * Initialize Socket.io server for live interview copilot
 */
export function initializeLiveCopilot(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Configure properly in production
      methods: ["GET", "POST"]
    },
    path: "/socket.io"
  });

  const copilotNamespace = io.of("/live-copilot");

  copilotNamespace.on("connection", (socket) => {
    console.log(`[LiveCopilot] Client connected: ${socket.id}`);

    // Register emotion data handler
    registerEmotionHandler(socket, activeSessions);

    // Start new interview session
    socket.on("start-session", async (data: { 
      userId: number; 
      candidateName: string; 
      position: string;
    }) => {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const session: LiveSession = {
        sessionId,
        userId: data.userId,
        candidateName: data.candidateName,
        position: data.position,
        transcript: [],
        suggestions: [],
        redFlags: [],
        tacticalSuggestions: [],
        emotionData: [],
        startTime: Date.now()
      };

      activeSessions.set(sessionId, session);
      socket.join(sessionId);

      socket.emit("session-started", { sessionId });
      console.log(`[LiveCopilot] Session started: ${sessionId}`);

      // Send initial suggestions
      const initialSuggestions = await generateInitialQuestions(data.position);
      socket.emit("suggestions", { suggestions: initialSuggestions });
    });

    // Process audio chunk (real-time streaming)
    socket.on("audio-chunk", async (data: {
      sessionId: string;
      audioData: string; // base64
      speaker: 'interviewer' | 'candidate';
    }) => {
      try {
        const session = activeSessions.get(data.sessionId);
        if (!session) {
          socket.emit("error", { message: "Session not found" });
          return;
        }

        // Convert base64 to buffer and save temporarily
        const audioBuffer = Buffer.from(data.audioData, 'base64');
        const tempFileName = `/tmp/audio-${Date.now()}.webm`;
        const fs = await import('fs/promises');
        await fs.writeFile(tempFileName, audioBuffer);

        // Upload to S3 for transcription
        const { storagePut } = await import("../storage");
        const uploadResult = await storagePut(
          `live-sessions/${data.sessionId}/audio-${Date.now()}.webm`,
          audioBuffer,
          'audio/webm'
        );

        // Transcribe
        const transcription = await transcribeAudio({
          audioUrl: uploadResult.url,
          language: 'ar'
        });

        const transcriptText = typeof transcription === 'object' && 'text' in transcription 
          ? transcription.text 
          : '';

        // Add to transcript
        session.transcript.push({
          speaker: data.speaker,
          text: transcriptText,
          timestamp: Date.now()
        });

        // Emit transcription
        socket.emit("transcription", {
          speaker: data.speaker,
          text: transcriptText,
          timestamp: Date.now()
        });

        // Analyze if it's candidate speaking
        if (data.speaker === 'candidate' && transcriptText) {
          const analysis = await analyzeResponse(session, transcriptText);


          
          // Send suggestions
          if (analysis.suggestions.length > 0) {
            session.suggestions.push(...analysis.suggestions);
            socket.emit("suggestions", { suggestions: analysis.suggestions });
          }

          // Send red flags
          if (analysis.redFlags.length > 0) {
            session.redFlags.push(...analysis.redFlags);
            socket.emit("red-flags", { redFlags: analysis.redFlags });
          }
        }

        // Cleanup temp file
        await fs.unlink(tempFileName).catch(() => {});
      } catch (error) {
        console.error('[LiveCopilot] Error processing audio:', error);
        socket.emit("error", { message: "Failed to process audio" });
      }
    });

    // End session
    socket.on("end-session", async (data: { sessionId: string }) => {
      const session = activeSessions.get(data.sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      // Generate final summary
      const summary = await generateSessionSummary(session);
      
      socket.emit("session-ended", { 
        sessionId: data.sessionId,
        summary,
        duration: Date.now() - session.startTime
      });

      // Save session to database
      await saveSessionToDatabase(session, summary);

      activeSessions.delete(data.sessionId);
      socket.leave(data.sessionId);
      console.log(`[LiveCopilot] Session ended: ${data.sessionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[LiveCopilot] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Generate initial interview questions based on position
 */
async function generateInitialQuestions(position: string): Promise<Array<{
  type: 'question';
  content: string;
  timestamp: number;
}>> {
  const prompt = `أنت مساعد توظيف خبير. اقترح 3 أسئلة افتتاحية قوية لمقابلة وظيفية لمنصب: ${position}

الأسئلة يجب أن تكون:
- مفتوحة (تتطلب إجابات تفصيلية)
- تكشف عن الخبرة الحقيقية
- مبنية على منهجية Topgrading`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت خبير في التوظيف والمقابلات السلوكية." },
        { role: "user", content: prompt }
      ]
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === 'string' ? content : '';
    const questions = contentStr.split('\n').filter(q => q.trim().length > 10);

    return questions.slice(0, 3).map(q => ({
      type: 'question' as const,
      content: q.replace(/^\d+[\.\)]\s*/, '').trim(),
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('[LiveCopilot] Error generating initial questions:', error);
    return [];
  }
}

/**
 * Analyze candidate response in real-time
 */
async function analyzeResponse(
  session: LiveSession, 
  responseText: string
): Promise<{
  suggestions: Array<{ type: 'question' | 'concern' | 'insight'; content: string; timestamp: number }>;
  redFlags: Array<{ flag: string; severity: 'low' | 'medium' | 'high'; timestamp: number }>;
}> {
  // Get context from recent transcript
  const recentTranscript = session.transcript.slice(-5).map(t => 
    `${t.speaker === 'interviewer' ? 'المُقابِل' : 'المرشح'}: ${t.text}`
  ).join('\n');

  // Get relevant knowledge from RAG
  const knowledgeContext = ragService.getInterviewAnalysisContext();

  const prompt = `أنت مساعد ذكي للمقابلات الوظيفية. قم بتحليل إجابة المرشح التالية:

**السياق:**
المنصب: ${session.position}
المرشح: ${session.candidateName}

**النقاش الأخير:**
${recentTranscript}

**الإجابة الحالية:**
${responseText}

**المعرفة ذات الصلة:**
${knowledgeContext}

قم بتحليل الإجابة وتقديم:
1. أسئلة متابعة مقترحة (2-3 أسئلة)
2. علامات حمراء إن وجدت (تناقضات، إجابات مبهمة، تهرب)
3. رؤى حول جودة الإجابة

أرجع JSON فقط.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت خبير في تحليل المقابلات الوظيفية. أرجع JSON فقط." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "response_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              followUpQuestions: {
                type: "array",
                items: { type: "string" }
              },
              redFlags: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    flag: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] }
                  },
                  required: ["flag", "severity"],
                  additionalProperties: false
                }
              },
              insights: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["followUpQuestions", "redFlags", "insights"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr);

    const suggestions: Array<{ type: 'question' | 'concern' | 'insight'; content: string; timestamp: number }> = [];
    const timestamp = Date.now();

    // Add follow-up questions
    result.followUpQuestions.forEach((q: string) => {
      suggestions.push({ type: 'question', content: q, timestamp });
    });

    // Add insights
    result.insights.forEach((i: string) => {
      suggestions.push({ type: 'insight', content: i, timestamp });
    });

    // Add concerns from red flags
    result.redFlags.forEach((rf: any) => {
      if (rf.severity === 'high' || rf.severity === 'medium') {
        suggestions.push({ type: 'concern', content: rf.flag, timestamp });
      }
    });

    return {
      suggestions,
      redFlags: result.redFlags.map((rf: any) => ({
        ...rf,
        timestamp
      }))
    };
  } catch (error) {
    console.error('[LiveCopilot] Error analyzing response:', error);
    return { suggestions: [], redFlags: [] };
  }
}

/**
 * Generate session summary
 */
async function generateSessionSummary(session: LiveSession): Promise<string> {
  const fullTranscript = session.transcript.map(t => 
    `${t.speaker === 'interviewer' ? 'المُقابِل' : 'المرشح'}: ${t.text}`
  ).join('\n\n');

  const prompt = `قم بإنشاء ملخص شامل لجلسة المقابلة التالية:

**المنصب:** ${session.position}
**المرشح:** ${session.candidateName}
**المدة:** ${Math.round((Date.now() - session.startTime) / 60000)} دقيقة

**النص الكامل:**
${fullTranscript}

**العلامات الحمراء المكتشفة:**
${session.redFlags.map(rf => `- [${rf.severity}] ${rf.flag}`).join('\n')}

قدم ملخصًا يتضمن:
1. نقاط القوة الرئيسية
2. نقاط الضعف والمخاوف
3. التوصية النهائية (تعيين / لا تعيين / مقابلة إضافية)`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت خبير في تقييم المقابلات الوظيفية." },
        { role: "user", content: prompt }
      ]
    });

    const content = response.choices[0]?.message?.content;
    return typeof content === 'string' ? content : '';
  } catch (error) {
    console.error('[LiveCopilot] Error generating summary:', error);
    return 'فشل في إنشاء الملخص';
  }
}

/**
 * Save session to database
 */
async function saveSessionToDatabase(session: LiveSession, summary: string): Promise<void> {
  try {
    const { createInterview } = await import("../db");
    
    const evaluationData = {
      redFlags: session.redFlags,
      suggestions: session.suggestions,
      duration: Date.now() - session.startTime
    };

    await createInterview({
      userId: session.userId,
      candidateName: session.candidateName,
      position: session.position,
      status: 'completed',
      transcription: JSON.stringify(session.transcript),
      analysis: `${summary}\n\n**بيانات التقييم:**\n${JSON.stringify(evaluationData, null, 2)}`
    });
  } catch (error) {
    console.error('[LiveCopilot] Error saving session:', error);
  }
}
