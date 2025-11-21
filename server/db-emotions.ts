/**
 * Database helpers for Emotion Analysis
 */

import { eq, and, desc } from 'drizzle-orm';
import { getDb } from './db';
import { emotionAnalysis, type InsertEmotionAnalysis, type EmotionAnalysis } from '../drizzle/schema';

/**
 * Save emotion analysis frame
 */
export async function saveEmotionFrame(data: InsertEmotionAnalysis): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot save emotion frame: database not available');
    return;
  }

  try {
    await db.insert(emotionAnalysis).values(data);
  } catch (error) {
    console.error('[Database] Failed to save emotion frame:', error);
    throw error;
  }
}

/**
 * Save multiple emotion frames (batch insert)
 */
export async function saveEmotionFrames(frames: InsertEmotionAnalysis[]): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot save emotion frames: database not available');
    return;
  }

  try {
    if (frames.length > 0) {
      await db.insert(emotionAnalysis).values(frames);
    }
  } catch (error) {
    console.error('[Database] Failed to save emotion frames:', error);
    throw error;
  }
}

/**
 * Get emotion analysis for an entity
 */
export async function getEmotionAnalysis(
  entityType: 'meeting' | 'interview',
  entityId: number
): Promise<EmotionAnalysis[]> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot get emotion analysis: database not available');
    return [];
  }

  try {
    const results = await db
      .select()
      .from(emotionAnalysis)
      .where(
        and(
          eq(emotionAnalysis.entityType, entityType),
          eq(emotionAnalysis.entityId, entityId)
        )
      )
      .orderBy(emotionAnalysis.timestamp);

    return results;
  } catch (error) {
    console.error('[Database] Failed to get emotion analysis:', error);
    return [];
  }
}

/**
 * Get emotion summary for an entity
 */
export async function getEmotionSummary(
  entityType: 'meeting' | 'interview',
  entityId: number
): Promise<{
  averageEmotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    fearful: number;
    disgusted: number;
    neutral: number;
  };
  averageAttention: number;
  averageEngagement: number;
  averageConfidence: number;
  averageStress: number;
} | null> {
  const frames = await getEmotionAnalysis(entityType, entityId);

  if (frames.length === 0) {
    return null;
  }

  const totals = frames.reduce(
    (acc, frame) => ({
      happy: acc.happy + (frame.happy || 0),
      sad: acc.sad + (frame.sad || 0),
      angry: acc.angry + (frame.angry || 0),
      surprised: acc.surprised + (frame.surprised || 0),
      fearful: acc.fearful + (frame.fearful || 0),
      disgusted: acc.disgusted + (frame.disgusted || 0),
      neutral: acc.neutral + (frame.neutral || 0),
      attention: acc.attention + (frame.attentionScore || 0),
      engagement: acc.engagement + (frame.engagement || 0),
      confidence: acc.confidence + (frame.confidence || 0),
      stress: acc.stress + (frame.stress || 0),
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

  return {
    averageEmotions: {
      happy: Math.round(totals.happy / count),
      sad: Math.round(totals.sad / count),
      angry: Math.round(totals.angry / count),
      surprised: Math.round(totals.surprised / count),
      fearful: Math.round(totals.fearful / count),
      disgusted: Math.round(totals.disgusted / count),
      neutral: Math.round(totals.neutral / count),
    },
    averageAttention: Math.round(totals.attention / count),
    averageEngagement: Math.round(totals.engagement / count),
    averageConfidence: Math.round(totals.confidence / count),
    averageStress: Math.round(totals.stress / count),
  };
}

/**
 * Delete emotion analysis for an entity
 */
export async function deleteEmotionAnalysis(
  entityType: 'meeting' | 'interview',
  entityId: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot delete emotion analysis: database not available');
    return;
  }

  try {
    await db
      .delete(emotionAnalysis)
      .where(
        and(
          eq(emotionAnalysis.entityType, entityType),
          eq(emotionAnalysis.entityId, entityId)
        )
      );
  } catch (error) {
    console.error('[Database] Failed to delete emotion analysis:', error);
    throw error;
  }
}
