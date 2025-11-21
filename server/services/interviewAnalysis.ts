import { invokeLLM } from "../_core/llm";
import { ragService } from "./rag";

export interface InterviewAnalysisResult {
  candidateProfile: {
    strengths: string[];
    weaknesses: string[];
    overallImpression: string;
  };
  behavioralSignals: {
    honesty: "low" | "medium" | "high";
    confidence: "low" | "medium" | "high";
    hesitation: "low" | "medium" | "high";
    consistency: "low" | "medium" | "high";
  };
  keyFindings: Array<{
    finding: string;
    evidence: string;
    impact: "positive" | "negative" | "neutral";
  }>;
  redFlags: Array<{
    flag: string;
    severity: "low" | "medium" | "high";
    explanation: string;
  }>;
  recommendation: {
    decision: "hire" | "no_hire" | "further_evaluation";
    confidence: "low" | "medium" | "high";
    reasoning: string;
    conditions?: string;
  };
}

/**
 * Analyze interview transcription using AI with RAG context
 */
export async function analyzeInterview(
  transcription: string,
  candidateName: string,
  position: string
): Promise<InterviewAnalysisResult> {
  const context = ragService.getInterviewAnalysisContext();

  const prompt = `${context}

## معلومات المقابلة:
- اسم المرشح: ${candidateName}
- المنصب: ${position}

## نص المقابلة:
${transcription}

## المطلوب:
قم بتحليل هذه المقابلة بناءً على منهجيات Topgrading و Who وقدم النتائج بصيغة JSON التالية:

\`\`\`json
{
  "candidateProfile": {
    "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
    "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
    "overallImpression": "انطباع عام شامل"
  },
  "behavioralSignals": {
    "honesty": "low|medium|high",
    "confidence": "low|medium|high",
    "hesitation": "low|medium|high",
    "consistency": "low|medium|high"
  },
  "keyFindings": [
    {
      "finding": "اكتشاف مهم",
      "evidence": "الدليل من المقابلة",
      "impact": "positive|negative|neutral"
    }
  ],
  "redFlags": [
    {
      "flag": "علامة تحذيرية",
      "severity": "low|medium|high",
      "explanation": "شرح تفصيلي"
    }
  ],
  "recommendation": {
    "decision": "hire|no_hire|further_evaluation",
    "confidence": "low|medium|high",
    "reasoning": "السبب التفصيلي للتوصية",
    "conditions": "شروط التوظيف (اختياري)"
  }
}
\`\`\`

تأكد من أن التحليل موضوعي ومبني على الأدلة من المقابلة.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت محلل مقابلات وظيفية خبير. قدم إجاباتك بصيغة JSON صحيحة فقط." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "interview_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              candidateProfile: {
                type: "object",
                properties: {
                  strengths: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                  overallImpression: { type: "string" }
                },
                required: ["strengths", "weaknesses", "overallImpression"],
                additionalProperties: false
              },
              behavioralSignals: {
                type: "object",
                properties: {
                  honesty: { type: "string", enum: ["low", "medium", "high"] },
                  confidence: { type: "string", enum: ["low", "medium", "high"] },
                  hesitation: { type: "string", enum: ["low", "medium", "high"] },
                  consistency: { type: "string", enum: ["low", "medium", "high"] }
                },
                required: ["honesty", "confidence", "hesitation", "consistency"],
                additionalProperties: false
              },
              keyFindings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    finding: { type: "string" },
                    evidence: { type: "string" },
                    impact: { type: "string", enum: ["positive", "negative", "neutral"] }
                  },
                  required: ["finding", "evidence", "impact"],
                  additionalProperties: false
                }
              },
              redFlags: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    flag: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                    explanation: { type: "string" }
                  },
                  required: ["flag", "severity", "explanation"],
                  additionalProperties: false
                }
              },
              recommendation: {
                type: "object",
                properties: {
                  decision: { type: "string", enum: ["hire", "no_hire", "further_evaluation"] },
                  confidence: { type: "string", enum: ["low", "medium", "high"] },
                  reasoning: { type: "string" },
                  conditions: { type: "string" }
                },
                required: ["decision", "confidence", "reasoning"],
                additionalProperties: false
              }
            },
            required: ["candidateProfile", "behavioralSignals", "keyFindings", "redFlags", "recommendation"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    return JSON.parse(content) as InterviewAnalysisResult;
  } catch (error) {
    console.error("[InterviewAnalysis] Error:", error);
    throw new Error("Failed to analyze interview");
  }
}
