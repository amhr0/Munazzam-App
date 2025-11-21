import { invokeLLM } from "../_core/llm";
import { getMeetingsByUserId, getTasksByUserId, getInterviewsByUserId } from "../db";

export interface DailyBriefingData {
  date: string;
  summary: string;
  stats: {
    totalMeetings: number;
    completedMeetings: number;
    totalInterviews: number;
    completedInterviews: number;
    totalTasks: number;
    completedTasks: number;
    urgentTasks: number;
  };
  urgentTasks: Array<{
    id: number;
    title: string;
    assignedTo: string | null;
    priority: string;
  }>;
  upcomingTasks: Array<{
    id: number;
    title: string;
    assignedTo: string | null;
    priority: string;
    dueDate: Date | null;
  }>;
  recentMeetings: Array<{
    id: number;
    title: string;
    createdAt: Date;
    status: string;
  }>;
  recentInterviews: Array<{
    id: number;
    candidateName: string;
    position: string | null;
    recommendation: string | null;
    createdAt: Date;
  }>;
  recommendations: string[];
}

/**
 * Generate daily briefing for a user
 */
export async function generateDailyBriefing(userId: number): Promise<DailyBriefingData> {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Get last 7 days for context
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  // Fetch data
  const allMeetings = await getMeetingsByUserId(userId);
  const allInterviews = await getInterviewsByUserId(userId);
  const allTasks = await getTasksByUserId(userId);

  // Filter recent data (last 7 days)
  const recentMeetings = allMeetings.filter(m => 
    new Date(m.createdAt) >= last7Days
  ).slice(0, 5);

  const recentInterviews = allInterviews.filter(i => 
    new Date(i.createdAt) >= last7Days
  ).slice(0, 5);

  // Calculate stats
  const stats = {
    totalMeetings: allMeetings.length,
    completedMeetings: allMeetings.filter(m => m.status === 'completed').length,
    totalInterviews: allInterviews.length,
    completedInterviews: allInterviews.filter(i => i.status === 'completed').length,
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter(t => t.status === 'completed').length,
    urgentTasks: allTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
  };

  // Get urgent and upcoming tasks
  const urgentTasks = allTasks
    .filter(t => t.priority === 'urgent' && t.status !== 'completed')
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: t.title,
      assignedTo: t.assignedTo,
      priority: t.priority
    }));

  const upcomingTasks = allTasks
    .filter(t => t.status !== 'completed' && t.dueDate)
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: t.title,
      assignedTo: t.assignedTo,
      priority: t.priority,
      dueDate: t.dueDate
    }));

  // Generate AI summary and recommendations
  const aiContext = `
أنت مساعد إداري ذكي. قم بإنشاء ملخص صباحي للمدير التنفيذي بناءً على البيانات التالية:

## الإحصائيات (آخر 7 أيام):
- الاجتماعات: ${recentMeetings.length} اجتماع (${recentMeetings.filter(m => m.status === 'completed').length} مكتمل)
- المقابلات: ${recentInterviews.length} مقابلة (${recentInterviews.filter(i => i.status === 'completed').length} مكتمل)
- المهام العاجلة: ${urgentTasks.length}
- المهام المعلقة: ${allTasks.filter(t => t.status !== 'completed').length}

## الاجتماعات الأخيرة:
${recentMeetings.map(m => `- ${m.title} (${m.status})`).join('\n')}

## المقابلات الأخيرة:
${recentInterviews.map(i => `- ${i.candidateName} - ${i.position || 'غير محدد'} (${i.recommendation || 'قيد التقييم'})`).join('\n')}

## المهام العاجلة:
${urgentTasks.map(t => `- ${t.title} (${t.assignedTo || 'غير محدد'})`).join('\n')}

قدم:
1. ملخص تنفيذي موجز (2-3 جمل) عن الوضع الحالي
2. 3-5 توصيات عملية لليوم
`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت مساعد إداري خبير. قدم إجاباتك بصيغة JSON صحيحة." },
        { role: "user", content: aiContext }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "daily_briefing",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string", description: "ملخص تنفيذي موجز" },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "توصيات عملية لليوم"
              }
            },
            required: ["summary", "recommendations"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    const aiResult = JSON.parse(content);

    return {
      date: today.toISOString(),
      summary: aiResult.summary,
      stats,
      urgentTasks,
      upcomingTasks,
      recentMeetings: recentMeetings.map(m => ({
        id: m.id,
        title: m.title,
        createdAt: m.createdAt,
        status: m.status
      })),
      recentInterviews: recentInterviews.map(i => ({
        id: i.id,
        candidateName: i.candidateName,
        position: i.position,
        recommendation: i.recommendation,
        createdAt: i.createdAt
      })),
      recommendations: aiResult.recommendations
    };
  } catch (error) {
    console.error("[DailyBriefing] Error generating briefing:", error);
    
    // Fallback without AI
    return {
      date: today.toISOString(),
      summary: `لديك ${urgentTasks.length} مهمة عاجلة و ${recentMeetings.length} اجتماع في الأيام الأخيرة. ${stats.completedTasks} مهمة مكتملة من أصل ${stats.totalTasks}.`,
      stats,
      urgentTasks,
      upcomingTasks,
      recentMeetings: recentMeetings.map(m => ({
        id: m.id,
        title: m.title,
        createdAt: m.createdAt,
        status: m.status
      })),
      recentInterviews: recentInterviews.map(i => ({
        id: i.id,
        candidateName: i.candidateName,
        position: i.position,
        recommendation: i.recommendation,
        createdAt: i.createdAt
      })),
      recommendations: [
        "راجع المهام العاجلة وحدد الأولويات",
        "تابع الاجتماعات المعلقة",
        "راجع تقييمات المقابلات الأخيرة"
      ]
    };
  }
}
