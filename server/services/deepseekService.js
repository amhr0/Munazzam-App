import axios from 'axios';

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    this.baseURL = process.env.DEEPSEEK_API_BASE || 'https://api.openai.com/v1';
    this.maxRetries = 3;
    this.retryDelay = 1000;
    
    if (!this.apiKey) {
      console.warn('⚠️ DEEPSEEK_API_KEY not found. AI features will be limited.');
    }
  }

  // Retry logic with exponential backoff
  async retryRequest(fn, retries = this.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.response?.status >= 500) {
        console.log(`Retrying... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (this.maxRetries - retries + 1)));
        return this.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  }

  // Chat completion with retry
  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY غير موجود. يرجى إضافته في ملف .env');
    }

    return this.retryRequest(async () => {
      try {
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: options.model || 'gpt-4.1-mini',
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        return response.data.choices[0].message.content;
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.error?.message || error.message;
          
          if (status === 401) throw new Error('مفتاح API غير صالح');
          if (status === 429) throw new Error('تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً');
          if (status === 500) throw new Error('خطأ في خادم DeepSeek');
          
          throw new Error(`خطأ في DeepSeek: ${message}`);
        }
        throw new Error('فشل الاتصال بخدمة DeepSeek');
      }
    });
  }

  // Parse JSON with fallback
  parseJSON(text, fallback) {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON:', text);
      return fallback;
    }
  }

  // Analyze meeting transcript
  async analyzeMeetingTranscript(transcript, meetingTitle = '') {
    const prompt = `قم بتحليل محضر الاجتماع التالي واستخرج المعلومات المهمة:

عنوان الاجتماع: ${meetingTitle}

المحضر:
${transcript}

قم بالرد بصيغة JSON فقط بالشكل التالي:
{
  "summary": "ملخص شامل للاجتماع",
  "decisions": ["قرار 1", "قرار 2"],
  "actionItems": [
    {
      "task": "وصف المهمة",
      "assignee": "المسؤول",
      "deadline": "الموعد النهائي إن وجد",
      "priority": "high/medium/low"
    }
  ],
  "keyPoints": ["نقطة مهمة 1", "نقطة مهمة 2"],
  "nextSteps": ["خطوة قادمة 1", "خطوة قادمة 2"]
}`;

    const messages = [
      { role: 'system', content: 'أنت مساعد ذكي متخصص في تحليل الاجتماعات وإدارة المشاريع.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.chat(messages, { maxTokens: 3000 });
    
    return this.parseJSON(response, {
      summary: response,
      decisions: [],
      actionItems: [],
      keyPoints: [],
      nextSteps: []
    });
  }

  // Analyze interview transcript
  async analyzeInterviewTranscript(transcript, candidateName, position, knowledgeContext = '') {
    const prompt = `قم بتحليل مقابلة التوظيف التالية:

المرشح: ${candidateName}
الوظيفة: ${position}

${knowledgeContext ? `معلومات إضافية:\n${knowledgeContext}\n` : ''}

محضر المقابلة:
${transcript}

قم بالرد بصيغة JSON فقط:
{
  "summary": "ملخص شامل للمقابلة",
  "overallScore": رقم من 1 إلى 10,
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
  "recommendation": "توصية نهائية",
  "ragInsights": "رؤى مستخلصة",
  "technicalSkills": {"score": رقم من 1 إلى 10, "notes": "ملاحظات"},
  "softSkills": {"score": رقم من 1 إلى 10, "notes": "ملاحظات"},
  "culturalFit": {"score": رقم من 1 إلى 10, "notes": "ملاحظات"}
}`;

    const messages = [
      { role: 'system', content: 'أنت مساعد ذكي متخصص في تحليل مقابلات التوظيف وتقييم المرشحين.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.chat(messages, { maxTokens: 3000 });
    
    return this.parseJSON(response, {
      summary: response,
      overallScore: 5,
      strengths: [],
      weaknesses: [],
      recommendation: 'يحتاج مراجعة يدوية',
      ragInsights: '',
      technicalSkills: { score: 5, notes: '' },
      softSkills: { score: 5, notes: '' },
      culturalFit: { score: 5, notes: '' }
    });
  }

  // Analyze speech patterns
  async analyzeSpeechPatterns(transcript) {
    const prompt = `قم بتحليل أنماط الكلام في النص التالي:

${transcript}

قم بالرد بصيغة JSON فقط:
{
  "speechRate": رقم تقديري لسرعة الكلام,
  "confidenceScore": رقم من 0 إلى 100,
  "fillerWordsPercentage": نسبة الكلمات الحشو,
  "emotionalTone": "إيجابي/محايد/سلبي",
  "clarity": رقم من 0 إلى 100,
  "insights": ["ملاحظة 1", "ملاحظة 2"]
}`;

    const messages = [
      { role: 'system', content: 'أنت مساعد ذكي متخصص في تحليل أنماط الكلام والتواصل.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.chat(messages);
    
    return this.parseJSON(response, {
      speechRate: 120,
      confidenceScore: 70,
      fillerWordsPercentage: 5,
      emotionalTone: 'محايد',
      clarity: 75,
      insights: []
    });
  }

  // Generate scorecard suggestions
  async generateScorecardSuggestions(transcript, competencies) {
    const prompt = `بناءً على محضر المقابلة التالي، قم بتقييم المرشح في الكفاءات المحددة:

المحضر:
${transcript}

الكفاءات المطلوب تقييمها:
${competencies.map((c, i) => `${i + 1}. ${c}`).join('\n')}

قم بالرد بصيغة JSON فقط:
{
  "evaluations": [
    {
      "competency": "اسم الكفاءة",
      "suggestedScore": رقم من 1 إلى 10,
      "reasoning": "سبب التقييم",
      "evidence": "أدلة من المحضر"
    }
  ]
}`;

    const messages = [
      { role: 'system', content: 'أنت مساعد ذكي متخصص في تقييم الكفاءات في مقابلات التوظيف.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.chat(messages, { maxTokens: 2500 });
    
    return this.parseJSON(response, {
      evaluations: competencies.map(comp => ({
        competency: comp,
        suggestedScore: 5,
        reasoning: 'يحتاج تقييم يدوي',
        evidence: ''
      }))
    });
  }

  // Analyze email for meeting requests
  async analyzeEmailForMeeting(emailContent) {
    const prompt = `قم بتحليل البريد الإلكتروني التالي وتحديد ما إذا كان يحتوي على طلب اجتماع:

${emailContent}

قم بالرد بصيغة JSON فقط:
{
  "isMeetingRequest": true/false,
  "topic": "موضوع الاجتماع",
  "urgency": "high/medium/low",
  "suggestedDuration": عدد الدقائق,
  "participants": ["أسماء المشاركين"],
  "preferredDates": ["تواريخ مقترحة"]
}`;

    const messages = [
      { role: 'system', content: 'أنت مساعد ذكي متخصص في تحليل البريد الإلكتروني وإدارة المواعيد.' },
      { role: 'user', content: prompt }
    ];

    const response = await this.chat(messages);
    
    return this.parseJSON(response, {
      isMeetingRequest: false,
      topic: '',
      urgency: 'low',
      suggestedDuration: 30,
      participants: [],
      preferredDates: []
    });
  }

  // Transcribe audio (not supported)
  async transcribeAudio(audioFilePath) {
    throw new Error('DeepSeek لا يدعم تحويل الصوت إلى نص. استخدم Whisper API أو خدمة أخرى.');
  }
}

export default new DeepSeekService();
