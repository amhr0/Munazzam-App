import Meeting from '../models/Meeting.js';
import aiService from './aiService.js';
import fs from 'fs';
import path from 'path';

class MeetingService {
  // Create new meeting
  async createMeeting(userId, meetingData) {
    try {
      const meeting = await Meeting.create({
        userId,
        ...meetingData
      });

      return meeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  // Process audio recording and transcribe
  async processRecording(meetingId, audioFilePath) {
    try {
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) throw new Error('Meeting not found');

      // Update status
      meeting.recording.status = 'processing';
      await meeting.save();

      // Transcribe audio using Whisper
      const transcription = await aiService.transcribeAudio(audioFilePath);

      // Save transcription
      meeting.recording.transcription = transcription;
      meeting.recording.status = 'completed';
      await meeting.save();

      // Start analysis
      await this.analyzeMeeting(meetingId);

      return meeting;
    } catch (error) {
      console.error('Error processing recording:', error);
      
      // Update meeting status to failed
      await Meeting.findByIdAndUpdate(meetingId, {
        'recording.status': 'failed'
      });
      
      throw error;
    }
  }

  // Analyze meeting transcript
  async analyzeMeeting(meetingId) {
    try {
      const meeting = await Meeting.findById(meetingId).populate('userId');
      if (!meeting) throw new Error('Meeting not found');
      if (!meeting.recording.transcription) throw new Error('No transcription available');

      const transcript = meeting.recording.transcription;

      // Check if it's an interview (HR)
      if (meeting.isInterview || meeting.type === 'interview') {
        await this.analyzeInterview(meeting, transcript);
      } else {
        await this.analyzeBusinessMeeting(meeting, transcript);
      }

      return meeting;
    } catch (error) {
      console.error('Error analyzing meeting:', error);
      throw error;
    }
  }

  // Analyze business meeting
  async analyzeBusinessMeeting(meeting, transcript) {
    try {
      const analysis = await aiService.analyzeMeetingTranscript(transcript, meeting.title);

      meeting.analysis = {
        summary: analysis.summary,
        decisions: analysis.decisions,
        actionItems: analysis.actionItems
      };

      await meeting.save();
      return meeting;
    } catch (error) {
      console.error('Error analyzing business meeting:', error);
      throw error;
    }
  }

  // Analyze interview
  async analyzeInterview(meeting, transcript) {
    try {
      const candidateName = meeting.hrAnalysis?.candidateName || 'المرشح';
      const position = meeting.hrAnalysis?.position || 'الوظيفة';

      // Get knowledge base context (RAG)
      // For now, we'll use a placeholder
      const knowledgeContext = '';

      // Analyze interview
      const analysis = await aiService.analyzeInterviewTranscript(
        transcript,
        candidateName,
        position,
        knowledgeContext
      );

      // Analyze speech patterns
      const speechAnalysis = await aiService.analyzeSpeechPatterns(transcript);

      // Update meeting with analysis
      meeting.analysis = {
        summary: analysis.summary,
        ragInsights: analysis.ragInsights,
        behavioralAnalysis: {
          speechRate: speechAnalysis?.speechRate || 0,
          confidenceScore: speechAnalysis?.confidenceScore || 0,
          fillerWordsPercentage: speechAnalysis?.fillerWordsPercentage || 0,
          emotionalTone: 'محايد',
          clarity: speechAnalysis?.confidenceScore || 0
        }
      };

      meeting.hrAnalysis = {
        ...meeting.hrAnalysis,
        overallScore: analysis.overallScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendation: analysis.recommendation
      };

      await meeting.save();

      // Generate scorecard suggestions if competencies are defined
      const defaultCompetencies = [
        'التواصل',
        'حل المشكلات',
        'العمل الجماعي',
        'القيادة',
        'الملاءمة الثقافية'
      ];

      const scorecardSuggestions = await aiService.generateScorecardSuggestions(
        transcript,
        defaultCompetencies
      );

      if (scorecardSuggestions?.evaluations) {
        meeting.analysis.scorecard = scorecardSuggestions.evaluations.map(evaluation => ({
          competency: evaluation.competency,
          score: evaluation.suggestedScore,
          notes: evaluation.reasoning,
          aiSuggestion: evaluation.evidence
        }));
      }

      await meeting.save();
      return meeting;
    } catch (error) {
      console.error('Error analyzing interview:', error);
      throw error;
    }
  }

  // Get user meetings
  async getUserMeetings(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;
      if (filters.isInterview !== undefined) query.isInterview = filters.isInterview;

      const meetings = await Meeting.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      return meetings;
    } catch (error) {
      console.error('Error getting user meetings:', error);
      throw error;
    }
  }

  // Get meeting by ID
  async getMeetingById(meetingId, userId) {
    try {
      const meeting = await Meeting.findOne({
        _id: meetingId,
        userId
      });

      return meeting;
    } catch (error) {
      console.error('Error getting meeting:', error);
      throw error;
    }
  }

  // Update meeting
  async updateMeeting(meetingId, userId, updateData) {
    try {
      const meeting = await Meeting.findOneAndUpdate(
        { _id: meetingId, userId },
        updateData,
        { new: true }
      );

      return meeting;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId, userId) {
    try {
      const meeting = await Meeting.findOneAndDelete({
        _id: meetingId,
        userId
      });

      return meeting;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  // Update scorecard
  async updateScorecard(meetingId, userId, scorecardData) {
    try {
      const meeting = await Meeting.findOne({ _id: meetingId, userId });
      if (!meeting) throw new Error('Meeting not found');

      meeting.analysis.scorecard = scorecardData;
      await meeting.save();

      return meeting;
    } catch (error) {
      console.error('Error updating scorecard:', error);
      throw error;
    }
  }
}

export default new MeetingService();
