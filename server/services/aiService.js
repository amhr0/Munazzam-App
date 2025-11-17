import deepseekService from './deepseekService.js';

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

  // Transcribe audio
  async transcribeAudio(audioFilePath) {
    // DeepSeek doesn't support audio transcription
    // You'll need to integrate another service like Whisper
    throw new Error('تحويل الصوت إلى نص غير متاح حالياً. يرجى استخدام خدمة Whisper أو خدمة أخرى.');
  }
}

export default new AIService();
