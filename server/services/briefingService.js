import executiveAgent from './executiveAgent.js';

class BriefingService {
  async sendDailyBriefing(userId, userName) {
    try {
      // جمع البيانات من مصادر مختلفة
      const dataContext = `
        - المستخدم: ${userName}
        - التاريخ: ${new Date().toLocaleDateString('ar-SA')}
        - الوقت: ${new Date().toLocaleTimeString('ar-SA')}
      `;
      
      // يطلب من العقل المدبر صياغة الرسالة
      const briefing = await executiveAgent.generateMorningBriefing(userName, dataContext);
      
      return briefing;
    } catch (error) {
      console.error('Briefing Service Error:', error);
      return {
        message: `صباح الخير يا ${userName}! ابدأ يومك بنشاط وتفاؤل.`,
        top_priorities: []
      };
    }
  }

  async getWeeklySummary(userId) {
    // يمكن إضافة ملخص أسبوعي هنا
    return {
      meetings_count: 0,
      decisions_made: 0,
      action_items_completed: 0
    };
  }
}

export default new BriefingService();
