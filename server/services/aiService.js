import deepseekService from './deepseekService.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

class AIService {
  constructor() {
    this.deepseek = deepseekService;
  }

  // Analyze email for meeting requests
  async analyzeEmailForMeeting(emailContent) {
    return await this.deepseek.analyzeEmailForMeeting(emailContent);
  }

  // Analyze meeting transcript
  async analyzeMeetingTranscript(transcript, meetingTitle = '') {
    return await this.deepseek.analyzeMeetingTranscript(transcript, meetingTitle);
  }

  // Analyze interview transcript
  async analyzeInterviewTranscript(transcript, candidateName, position, knowledgeContext = '') {
    return await this.deepseek.analyzeInterviewTranscript(transcript, candidateName, position, knowledgeContext);
  }

  // Analyze speech patterns
  async analyzeSpeechPatterns(transcript) {
    return await this.deepseek.analyzeSpeechPatterns(transcript);
  }

  // Generate scorecard suggestions
  async generateScorecardSuggestions(transcript, competencies) {
    return await this.deepseek.generateScorecardSuggestions(transcript, competencies);
  }

  // Transcribe audio using OpenAI Whisper
  async transcribeAudio(audioFilePath) {
    // التأكد من وجود مفتاح OpenAI
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('مفتاح OPENAI_API_KEY غير موجود. يرجى إضافته في ملف .env لتفعيل خدمة تحويل الصوت.');
    }

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));
      formData.append('model', 'whisper-1');
      formData.append('language', 'ar'); // تحديد اللغة العربية (اختياري)

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return response.data.text;
    } catch (error) {
      console.error('Whisper API Error:', error.response?.data || error.message);
      throw new Error('فشل في تحويل الملف الصوتي إلى نص. تأكد من صحة مفتاح OpenAI API.');
    }
  }
}

export default new AIService();
