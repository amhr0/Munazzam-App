import { invokeLLM } from "../_core/llm";
import { ragService } from "./rag";

export interface MeetingAnalysisResult {
  summary: string;
  decisions: Array<{
    decision: string;
    responsible: string;
    deadline?: string;
  }>;
  tasks: Array<{
    task: string;
    assignedTo: string;
    priority: "low" | "medium" | "high" | "urgent";
  }>;
  risks: Array<{
    risk: string;
    severity: "low" | "medium" | "high";
  }>;
  fluff: Array<{
    topic: string;
    reason: string;
  }>;
  recommendations: string[];
}

/**
 * Analyze meeting transcription using AI with RAG context
 */
export async function analyzeMeeting(transcription: string): Promise<MeetingAnalysisResult> {
  const context = ragService.getMeetingAnalysisContext();

  const prompt = `${context}

## نص الاجتماع:
${transcription}

## المطلوب:
قم بتحليل هذا الاجتماع وقدم النتائج بصيغة JSON التالية:

\`\`\`json
{
  "summary": "ملخص تنفيذي مختصر للاجتماع (2-3 جمل)",
  "decisions": [
    {
      "decision": "القرار المتخذ",
      "responsible": "اسم المسؤول",
      "deadline": "الموعد النهائي (اختياري)"
    }
  ],
  "tasks": [
    {
      "task": "وصف المهمة",
      "assignedTo": "اسم المكلف",
      "priority": "low|medium|high|urgent"
    }
  ],
  "risks": [
    {
      "risk": "وصف المخاطرة",
      "severity": "low|medium|high"
    }
  ],
  "fluff": [
    {
      "topic": "الموضوع",
      "reason": "لماذا يعتبر كلام فارغ"
    }
  ],
  "recommendations": [
    "توصية مبنية على أفضل الممارسات"
  ]
}
\`\`\`

تأكد من أن التحليل دقيق ومبني على محتوى الاجتماع الفعلي.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت محلل اجتماعات خبير. قدم إجاباتك بصيغة JSON صحيحة فقط." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "meeting_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              decisions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    decision: { type: "string" },
                    responsible: { type: "string" },
                    deadline: { type: "string" }
                  },
                  required: ["decision", "responsible"],
                  additionalProperties: false
                }
              },
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    task: { type: "string" },
                    assignedTo: { type: "string" },
                    priority: { type: "string", enum: ["low", "medium", "high", "urgent"] }
                  },
                  required: ["task", "assignedTo", "priority"],
                  additionalProperties: false
                }
              },
              risks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    risk: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] }
                  },
                  required: ["risk", "severity"],
                  additionalProperties: false
                }
              },
              fluff: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    reason: { type: "string" }
                  },
                  required: ["topic", "reason"],
                  additionalProperties: false
                }
              },
              recommendations: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["summary", "decisions", "tasks", "risks", "fluff", "recommendations"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    return JSON.parse(content) as MeetingAnalysisResult;
  } catch (error) {
    console.error("[MeetingAnalysis] Error:", error);
    throw new Error("Failed to analyze meeting");
  }
}
