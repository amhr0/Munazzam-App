/**
 * Tactical Suggestions Service
 * محرك الاقتراحات التكتيكية الفورية أثناء الاجتماعات
 */

import { invokeLLM } from "../_core/llm";

export interface EmotionData {
  timestamp: number;
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  fearful: number;
  disgusted: number;
  neutral: number;
  attention: number;
  engagement: number;
  confidence: number;
  stress: number;
}

export interface TacticalSuggestion {
  type: "opportunity" | "warning" | "tactic" | "question";
  priority: "critical" | "high" | "medium" | "low";
  message: string;
  reasoning: string;
  action?: string;
}

export interface MeetingContext {
  type: "negotiation" | "presentation" | "interview" | "general";
  participants: string[];
  topic?: string;
}

/**
 * تحليل سياق الاجتماع من النص
 */
export async function analyzeMeetingContext(transcript: string): Promise<MeetingContext> {
  const prompt = `حلل النص التالي وحدد نوع الاجتماع:

النص: "${transcript.substring(0, 500)}"

حدد:
1. نوع الاجتماع (negotiation/presentation/interview/general)
2. المشاركين المحتملين

أعد الإجابة بصيغة JSON فقط.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت محلل اجتماعات خبير. أعد JSON فقط." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "meeting_context",
          strict: true,
          schema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["negotiation", "presentation", "interview", "general"],
                description: "نوع الاجتماع"
              },
              participants: {
                type: "array",
                items: { type: "string" },
                description: "المشاركون المحتملون"
              },
              topic: {
                type: "string",
                description: "موضوع الاجتماع"
              }
            },
            required: ["type", "participants"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return { type: "general", participants: [] };
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("[TacticalSuggestions] Error analyzing context:", error);
    return { type: "general", participants: [] };
  }
}

/**
 * توليد اقتراحات تكتيكية بناءً على المشاعر والسياق
 */
export async function generateTacticalSuggestions(
  context: MeetingContext,
  emotionData: EmotionData[],
  recentTranscript: string
): Promise<TacticalSuggestion[]> {
  // حساب متوسط المشاعر الأخيرة (آخر 30 ثانية)
  const recent = emotionData.slice(-6); // 30 ثانية (5 إطارات/ثانية)
  const avgEmotions = {
    happy: recent.reduce((sum, e) => sum + e.happy, 0) / recent.length,
    engagement: recent.reduce((sum, e) => sum + e.engagement, 0) / recent.length,
    stress: recent.reduce((sum, e) => sum + e.stress, 0) / recent.length,
    confidence: recent.reduce((sum, e) => sum + e.confidence, 0) / recent.length,
    attention: recent.reduce((sum, e) => sum + e.attention, 0) / recent.length,
  };

  const suggestions: TacticalSuggestion[] = [];

  // اقتراحات خاصة بالمفاوضات
  if (context.type === "negotiation") {
    // فرصة: حماس عالي
    if (avgEmotions.happy > 70 && avgEmotions.engagement > 70) {
      suggestions.push({
        type: "opportunity",
        priority: "critical",
        message: "🎯 فرصة ذهبية: الطرف الآخر يظهر حماساً عالياً",
        reasoning: `مستوى السعادة ${avgEmotions.happy.toFixed(0)}% والتفاعل ${avgEmotions.engagement.toFixed(0)}%`,
        action: "الآن وقت مناسب لرفع التقييم أو طلب شروط أفضل"
      });
    }

    // تحذير: تردد
    if (avgEmotions.stress > 60 && avgEmotions.confidence < 50) {
      suggestions.push({
        type: "warning",
        priority: "high",
        message: "⚠️ تم رصد تردد: الطرف الآخر غير مقتنع تماماً",
        reasoning: `مستوى التوتر ${avgEmotions.stress.toFixed(0)}% والثقة ${avgEmotions.confidence.toFixed(0)}%`,
        action: "اشرح القيمة المضافة بشكل أوضح أو قدم ضمانات إضافية"
      });
    }

    // انخفاض الانتباه
    if (avgEmotions.attention < 50) {
      suggestions.push({
        type: "warning",
        priority: "medium",
        message: "👁️ انتباه منخفض: قد تكون المعلومات مملة أو معقدة",
        reasoning: `مستوى الانتباه ${avgEmotions.attention.toFixed(0)}%`,
        action: "انتقل لنقطة أكثر إثارة أو اطرح سؤالاً تفاعلياً"
      });
    }
  }

  // اقتراحات خاصة بالمقابلات
  if (context.type === "interview") {
    // مرشح متوتر لكن واثق
    if (avgEmotions.stress > 60 && avgEmotions.confidence > 60) {
      suggestions.push({
        type: "tactic",
        priority: "medium",
        message: "💡 المرشح متوتر لكن واثق من إجابته",
        reasoning: `التوتر ${avgEmotions.stress.toFixed(0)}% لكن الثقة ${avgEmotions.confidence.toFixed(0)}%`,
        action: "جرب أسئلة تقنية أعمق - المرشح يبدو كفؤاً"
      });
    }

    // مرشح غير واثق
    if (avgEmotions.confidence < 40 && avgEmotions.stress > 70) {
      suggestions.push({
        type: "warning",
        priority: "high",
        message: "🚩 علامة حمراء: المرشح غير واثق وتحت ضغط",
        reasoning: `الثقة ${avgEmotions.confidence.toFixed(0)}% والتوتر ${avgEmotions.stress.toFixed(0)}%`,
        action: "قد لا يكون مناسباً للدور - أو السؤال صعب جداً"
      });
    }
  }

  // اقتراحات خاصة بالعروض التقديمية
  if (context.type === "presentation") {
    // جمهور متفاعل
    if (avgEmotions.engagement > 70 && avgEmotions.attention > 70) {
      suggestions.push({
        type: "opportunity",
        priority: "high",
        message: "✨ الجمهور متفاعل جداً - استمر!",
        reasoning: `التفاعل ${avgEmotions.engagement.toFixed(0)}% والانتباه ${avgEmotions.attention.toFixed(0)}%`,
        action: "هذا وقت مناسب للـ Call-to-Action"
      });
    }

    // جمهور يفقد الاهتمام
    if (avgEmotions.attention < 40 || avgEmotions.engagement < 40) {
      suggestions.push({
        type: "warning",
        priority: "critical",
        message: "⏰ الجمهور يفقد الاهتمام!",
        reasoning: `الانتباه ${avgEmotions.attention.toFixed(0)}% والتفاعل ${avgEmotions.engagement.toFixed(0)}%`,
        action: "غير الموضوع، أضف قصة، أو اطرح سؤالاً"
      });
    }
  }

  // استخدام AI لاقتراحات أكثر ذكاءً بناءً على النص
  if (recentTranscript.length > 50) {
    try {
      const aiSuggestion = await generateAISuggestion(context, avgEmotions, recentTranscript);
      if (aiSuggestion) {
        suggestions.push(aiSuggestion);
      }
    } catch (error) {
      console.error("[TacticalSuggestions] Error generating AI suggestion:", error);
    }
  }

  // ترتيب حسب الأولوية
  return suggestions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * توليد اقتراح ذكي باستخدام AI
 */
async function generateAISuggestion(
  context: MeetingContext,
  emotions: any,
  transcript: string
): Promise<TacticalSuggestion | null> {
  const prompt = `أنت مستشار اجتماعات خبير. حلل الموقف التالي وقدم اقتراحاً تكتيكياً:

نوع الاجتماع: ${context.type}
المشاعر الحالية:
- السعادة: ${emotions.happy.toFixed(0)}%
- التفاعل: ${emotions.engagement.toFixed(0)}%
- التوتر: ${emotions.stress.toFixed(0)}%
- الثقة: ${emotions.confidence.toFixed(0)}%
- الانتباه: ${emotions.attention.toFixed(0)}%

آخر ما قيل: "${transcript.substring(0, 200)}"

قدم اقتراحاً تكتيكياً واحداً فقط (الأهم).`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت مستشار اجتماعات خبير. أعد JSON فقط." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "tactical_suggestion",
          strict: true,
          schema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["opportunity", "warning", "tactic", "question"]
              },
              priority: {
                type: "string",
                enum: ["critical", "high", "medium", "low"]
              },
              message: { type: "string" },
              reasoning: { type: "string" },
              action: { type: "string" }
            },
            required: ["type", "priority", "message", "reasoning"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return null;

    return JSON.parse(content);
  } catch (error) {
    console.error("[TacticalSuggestions] Error generating AI suggestion:", error);
    return null;
  }
}
