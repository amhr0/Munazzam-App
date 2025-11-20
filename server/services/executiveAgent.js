import axios from 'axios';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExecutiveAgent {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    this.baseURL = process.env.DEEPSEEK_API_BASE || 'https://api.openai.com/v1';
    // مسار مجلد الكتب
    this.knowledgePath = path.join(__dirname, '../../knowledge_base');
    this.cachedWisdom = null;
  }

  // تحميل "دستور الشركة" من ملفات PDF
  async loadCorporateWisdom() {
    if (this.cachedWisdom) return this.cachedWisdom;

    console.log('📚 Reading Knowledge Base (PDFs)...');
    let wisdom = "MANAGEMENT KNOWLEDGE BASE:\n";
    
    try {
      if (fs.existsSync(this.knowledgePath)) {
        const files = fs.readdirSync(this.knowledgePath).filter(f => f.endsWith('.pdf'));
        for (const file of files) {
          const dataBuffer = fs.readFileSync(path.join(this.knowledgePath, file));
          const data = await pdf(dataBuffer);
          // نأخذ زبدة الكتاب (أول 5000 حرف) لتوفير الموارد
          wisdom += `SOURCE [${file}]: ${data.text.substring(0, 5000).replace(/\s+/g, ' ')}\n\n`;
        }
      }
      this.cachedWisdom = wisdom;
      return wisdom;
    } catch (e) {
      console.error('Warning: Failed to load some PDFs:', e.message);
      return "";
    }
  }

  // المحرك المركزي للذكاء الاصطناعي
  async executeAI(systemPrompt, userPrompt) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview', // موديل ذكي جداً للتحليل
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: "json_object" }, // ضمان هيكلية الرد
          temperature: 0.2
        },
        { headers: { 'Authorization': `Bearer ${this.apiKey}` }, timeout: 120000 }
      );
      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('AI Execution Error:', error.message);
      throw new Error('المستشار الذكي مشغول حالياً، حاول لاحقاً.');
    }
  }

  // 1. تحليل الاجتماعات الاستراتيجي (Deep Work)
  async analyzeStrategicMeeting(transcript, title) {
    const wisdom = await this.loadCorporateWisdom();
    const systemPrompt = `
      أنت "الرئيس التنفيذي للعمليات" (COO). مرجعيتك: ${wisdom}
      مهمتك: تدقيق الاجتماع، كشف الكلام الفارغ، واستخراج قرارات صارمة.
      قواعد: اربط المشاكل بحلول من الكتب (مثل Deep Work, Atomic Habits).
    `;
    const userPrompt = `الاجتماع: ${title}\nالنص: ${transcript.substring(0, 20000)}\nالمطلوب JSON: { "executive_summary": "", "bs_detection": "نسبة الكلام الفارغ", "decisions": [], "action_plan": [{"task":"", "owner":"", "deadline":""}] }`;
    
    return this.executeAI(systemPrompt, userPrompt);
  }

  // 2. تحليل المقابلات والسلوك (Talent Intelligence)
  async analyzeExecutiveInterview(transcript, candidateName) {
    const wisdom = await this.loadCorporateWisdom();
    const systemPrompt = `
      أنت خبير توظيف ومحلل سلوكي. مرجعيتك: ${wisdom} (خاصة كتب: Who, Topgrading, Body Language).
      مهمتك: كشف شخصية المرشح الحقيقية. ابحث عن إشارات الكذب، التردد، والذكاء العاطفي.
    `;
    const userPrompt = `المرشح: ${candidateName}\nالنص: ${transcript.substring(0, 20000)}\nالمطلوب JSON: { "recommendation": "HIRE/NO_HIRE", "score": 0-10, "behavioral_analysis": "تحليل لغة الجسد والنبرة", "red_flags": [] }`;
    
    return this.executeAI(systemPrompt, userPrompt);
  }

  // 3. المساعد الصباحي (Briefing)
  async generateMorningBriefing(userName, dataContext) {
    const systemPrompt = `أنت مساعد شخصي ذكي. مرجعيتك كتاب Atomic Habits لتنظيم الوقت.`;
    const userPrompt = `المدير: ${userName}\nالبيانات: ${dataContext}\nالمطلوب JSON: { "message": "رسالة صباحية محفزة باللهجة السعودية البيضاء", "top_priorities": [] }`;
    return this.executeAI(systemPrompt, userPrompt);
  }
}

export default new ExecutiveAgent();
