/**
 * Emotion Analysis Service
 * تحليل تعابير الوجه والمشاعر باستخدام Computer Vision
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export interface EmotionFrame {
  timestamp: number; // milliseconds in video
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    fearful: number;
    disgusted: number;
    neutral: number;
  };
  dominantEmotion: string;
  attentionScore: number;
  eyeContact: boolean;
  headPose: string;
  bodyLanguage: {
    posture: string;
    gestures: string[];
  };
  engagement: number;
  confidence: number;
  stress: number;
}

export interface EmotionAnalysisResult {
  frames: EmotionFrame[];
  summary: {
    averageEmotions: {
      happy: number;
      sad: number;
      angry: number;
      surprised: number;
      fearful: number;
      disgusted: number;
      neutral: number;
    };
    dominantEmotions: { emotion: string; percentage: number }[];
    averageAttention: number;
    averageEngagement: number;
    averageConfidence: number;
    averageStress: number;
    redFlags: string[];
    insights: string[];
  };
}

/**
 * Analyze video for emotions and attention
 */
export async function analyzeVideoEmotions(
  videoPath: string,
  sampleRate: number = 1000 // Extract frame every N milliseconds
): Promise<EmotionAnalysisResult> {
  console.log('[EmotionAnalysis] Starting video analysis:', videoPath);

  try {
    // Check if video file exists
    await fs.access(videoPath);

    // Run Python script for emotion analysis
    const frames = await runPythonAnalysis(videoPath, sampleRate);

    // Calculate summary statistics
    const summary = calculateSummary(frames);

    console.log('[EmotionAnalysis] Analysis complete:', {
      framesAnalyzed: frames.length,
      dominantEmotion: summary.dominantEmotions[0]?.emotion,
      averageEngagement: summary.averageEngagement,
    });

    return {
      frames,
      summary,
    };
  } catch (error) {
    console.error('[EmotionAnalysis] Error analyzing video:', error);
    throw error;
  }
}

/**
 * Run Python script for emotion detection
 */
async function runPythonAnalysis(
  videoPath: string,
  sampleRate: number
): Promise<EmotionFrame[]> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'emotion_detector.py');
    const python = spawn('python3', [scriptPath, videoPath, sampleRate.toString()]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('[EmotionAnalysis] Python stderr:', data.toString());
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('[EmotionAnalysis] Python script failed:', stderr);
        reject(new Error(`Python script exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const frames = JSON.parse(stdout);
        resolve(frames);
      } catch (error) {
        console.error('[EmotionAnalysis] Failed to parse Python output:', error);
        reject(new Error('Failed to parse emotion analysis results'));
      }
    });

    python.on('error', (error) => {
      console.error('[EmotionAnalysis] Failed to spawn Python process:', error);
      reject(error);
    });
  });
}

/**
 * Calculate summary statistics from frames
 */
function calculateSummary(frames: EmotionFrame[]): EmotionAnalysisResult['summary'] {
  if (frames.length === 0) {
    return {
      averageEmotions: {
        happy: 0,
        sad: 0,
        angry: 0,
        surprised: 0,
        fearful: 0,
        disgusted: 0,
        neutral: 0,
      },
      dominantEmotions: [],
      averageAttention: 0,
      averageEngagement: 0,
      averageConfidence: 0,
      averageStress: 0,
      redFlags: [],
      insights: [],
    };
  }

  // Calculate averages
  const totals = frames.reduce(
    (acc, frame) => ({
      happy: acc.happy + frame.emotions.happy,
      sad: acc.sad + frame.emotions.sad,
      angry: acc.angry + frame.emotions.angry,
      surprised: acc.surprised + frame.emotions.surprised,
      fearful: acc.fearful + frame.emotions.fearful,
      disgusted: acc.disgusted + frame.emotions.disgusted,
      neutral: acc.neutral + frame.emotions.neutral,
      attention: acc.attention + frame.attentionScore,
      engagement: acc.engagement + frame.engagement,
      confidence: acc.confidence + frame.confidence,
      stress: acc.stress + frame.stress,
    }),
    {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      fearful: 0,
      disgusted: 0,
      neutral: 0,
      attention: 0,
      engagement: 0,
      confidence: 0,
      stress: 0,
    }
  );

  const count = frames.length;

  const averageEmotions = {
    happy: Math.round(totals.happy / count),
    sad: Math.round(totals.sad / count),
    angry: Math.round(totals.angry / count),
    surprised: Math.round(totals.surprised / count),
    fearful: Math.round(totals.fearful / count),
    disgusted: Math.round(totals.disgusted / count),
    neutral: Math.round(totals.neutral / count),
  };

  // Calculate dominant emotions
  const emotionCounts: Record<string, number> = {};
  frames.forEach((frame) => {
    const emotion = frame.dominantEmotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  const dominantEmotions = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      emotion,
      percentage: Math.round((count / frames.length) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Detect red flags
  const redFlags: string[] = [];
  const insights: string[] = [];

  if (averageEmotions.angry > 20) {
    redFlags.push('مستوى عالٍ من الغضب تم اكتشافه');
  }

  if (averageEmotions.fearful > 20) {
    redFlags.push('علامات خوف أو قلق واضحة');
  }

  if (totals.attention / count < 50) {
    redFlags.push('مستوى انتباه منخفض');
  }

  if (totals.engagement / count < 40) {
    redFlags.push('مستوى تفاعل ضعيف');
  }

  if (totals.stress / count > 70) {
    redFlags.push('مستوى توتر عالٍ');
  }

  // Generate insights
  if (averageEmotions.happy > 50) {
    insights.push('المرشح يظهر مشاعر إيجابية بشكل عام');
  }

  if (totals.confidence / count > 70) {
    insights.push('المرشح يظهر ثقة عالية بالنفس');
  }

  if (totals.engagement / count > 70) {
    insights.push('مستوى تفاعل ممتاز طوال المقابلة');
  }

  if (averageEmotions.neutral > 60) {
    insights.push('المرشح يحافظ على هدوء وحياد جيد');
  }

  return {
    averageEmotions,
    dominantEmotions,
    averageAttention: Math.round(totals.attention / count),
    averageEngagement: Math.round(totals.engagement / count),
    averageConfidence: Math.round(totals.confidence / count),
    averageStress: Math.round(totals.stress / count),
    redFlags,
    insights,
  };
}

/**
 * Analyze single frame (for real-time analysis)
 */
export async function analyzeSingleFrame(
  frameBase64: string
): Promise<EmotionFrame> {
  // This would call a simpler, faster model for real-time analysis
  // For now, return mock data
  return {
    timestamp: Date.now(),
    emotions: {
      happy: Math.random() * 100,
      sad: Math.random() * 20,
      angry: Math.random() * 10,
      surprised: Math.random() * 30,
      fearful: Math.random() * 15,
      disgusted: Math.random() * 10,
      neutral: Math.random() * 40,
    },
    dominantEmotion: 'neutral',
    attentionScore: Math.random() * 100,
    eyeContact: Math.random() > 0.5,
    headPose: 'forward',
    bodyLanguage: {
      posture: 'upright',
      gestures: [],
    },
    engagement: Math.random() * 100,
    confidence: Math.random() * 100,
    stress: Math.random() * 50,
  };
}
