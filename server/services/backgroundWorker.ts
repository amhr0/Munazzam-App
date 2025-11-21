import { transcribeAudio } from "../_core/voiceTranscription";
import { analyzeMeeting } from "./meetingAnalysis";
import { analyzeInterview } from "./interviewAnalysis";
import { 
  getQueuedJobs, 
  updateJob, 
  getMeetingById, 
  updateMeeting,
  getInterviewById,
  updateInterview,
  createTask
} from "../db";

/**
 * Background Worker Service
 * Processes queued jobs for transcription and analysis
 */

let isProcessing = false;
let processingInterval: NodeJS.Timeout | null = null;

/**
 * Start the background worker
 */
export function startBackgroundWorker() {
  if (processingInterval) {
    console.log('[BackgroundWorker] Already running');
    return;
  }

  console.log('[BackgroundWorker] Starting...');
  
  // Process jobs every 10 seconds
  processingInterval = setInterval(async () => {
    if (!isProcessing) {
      await processQueuedJobs();
    }
  }, 10000);

  // Process immediately on start
  processQueuedJobs();
}

/**
 * Stop the background worker
 */
export function stopBackgroundWorker() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    console.log('[BackgroundWorker] Stopped');
  }
}

/**
 * Process all queued jobs
 */
async function processQueuedJobs() {
  if (isProcessing) return;
  
  isProcessing = true;
  
  try {
    const jobs = await getQueuedJobs();
    
    if (jobs.length === 0) {
      return;
    }

    console.log(`[BackgroundWorker] Processing ${jobs.length} jobs`);

    for (const job of jobs) {
      try {
        await processJob(job.id, job.type, job.entityType, job.entityId);
      } catch (error) {
        console.error(`[BackgroundWorker] Failed to process job ${job.id}:`, error);
        await updateJob(job.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('[BackgroundWorker] Error processing queue:', error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Process a single job
 */
async function processJob(
  jobId: number,
  type: string,
  entityType: string,
  entityId: number
) {
  console.log(`[BackgroundWorker] Processing job ${jobId} (${type})`);

  // Update job status to processing
  await updateJob(jobId, {
    status: 'processing',
    progress: 10
  });

  if (type === 'transcription') {
    await processTranscription(jobId, entityType, entityId);
  } else if (type === 'meeting_analysis') {
    await processMeetingAnalysis(jobId, entityId);
  } else if (type === 'interview_analysis') {
    await processInterviewAnalysis(jobId, entityId);
  }
}

/**
 * Process transcription job
 */
async function processTranscription(
  jobId: number,
  entityType: string,
  entityId: number
) {
  try {
    let fileUrl: string | null = null;

    if (entityType === 'meeting') {
      const meeting = await getMeetingById(entityId);
      if (!meeting || !meeting.fileUrl) {
        throw new Error('Meeting or file not found');
      }
      fileUrl = meeting.fileUrl;
    } else if (entityType === 'interview') {
      const interview = await getInterviewById(entityId);
      if (!interview || !interview.fileUrl) {
        throw new Error('Interview or file not found');
      }
      fileUrl = interview.fileUrl;
    }

    if (!fileUrl) {
      throw new Error('File URL not found');
    }

    // Update progress
    await updateJob(jobId, { progress: 30 });

    // Transcribe audio
    const result = await transcribeAudio({
      audioUrl: fileUrl,
      language: 'ar'
    });

    // Check if transcription was successful
    if ('error' in result) {
      throw new Error(result.error);
    }

    // Update progress
    await updateJob(jobId, { progress: 80 });

    // Update entity with transcription
    if (entityType === 'meeting') {
      await updateMeeting(entityId, {
        transcription: result.text,
        status: 'completed'
      });
    } else if (entityType === 'interview') {
      await updateInterview(entityId, {
        transcription: result.text,
        status: 'completed'
      });
    }

    // Complete job
    await updateJob(jobId, {
      status: 'completed',
      progress: 100,
      result: JSON.stringify({ text: result.text }),
      completedAt: new Date()
    });

    console.log(`[BackgroundWorker] Transcription completed for ${entityType} ${entityId}`);
  } catch (error) {
    throw error;
  }
}

/**
 * Process meeting analysis job
 */
async function processMeetingAnalysis(jobId: number, meetingId: number) {
  try {
    const meeting = await getMeetingById(meetingId);
    if (!meeting || !meeting.transcription) {
      throw new Error('Meeting or transcription not found');
    }

    // Update progress
    await updateJob(jobId, { progress: 30 });

    // Analyze meeting
    const analysis = await analyzeMeeting(meeting.transcription);

    // Update progress
    await updateJob(jobId, { progress: 70 });

    // Create tasks from analysis
    for (const task of analysis.tasks) {
      await createTask({
        userId: meeting.userId,
        title: task.task,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: 'todo',
        sourceType: 'meeting',
        sourceId: meetingId
      });
    }

    // Update progress
    await updateJob(jobId, { progress: 90 });

    // Update meeting with analysis
    await updateMeeting(meetingId, {
      analysis: JSON.stringify(analysis),
      status: 'completed'
    });

    // Complete job
    await updateJob(jobId, {
      status: 'completed',
      progress: 100,
      result: JSON.stringify(analysis),
      completedAt: new Date()
    });

    console.log(`[BackgroundWorker] Meeting analysis completed for meeting ${meetingId}`);
  } catch (error) {
    throw error;
  }
}

/**
 * Process interview analysis job
 */
async function processInterviewAnalysis(jobId: number, interviewId: number) {
  try {
    const interview = await getInterviewById(interviewId);
    if (!interview || !interview.transcription) {
      throw new Error('Interview or transcription not found');
    }

    // Update progress
    await updateJob(jobId, { progress: 30 });

    // Analyze interview
    const analysis = await analyzeInterview(
      interview.transcription,
      interview.candidateName,
      interview.position || 'Unknown'
    );

    // Update progress
    await updateJob(jobId, { progress: 80 });

    // Determine recommendation
    let recommendation: "hire" | "no_hire" | "pending" = "pending";
    if (analysis.recommendation.decision === "hire") {
      recommendation = "hire";
    } else if (analysis.recommendation.decision === "no_hire") {
      recommendation = "no_hire";
    }

    // Update interview with analysis
    await updateInterview(interviewId, {
      analysis: JSON.stringify(analysis),
      recommendation,
      status: 'completed'
    });

    // Complete job
    await updateJob(jobId, {
      status: 'completed',
      progress: 100,
      result: JSON.stringify(analysis),
      completedAt: new Date()
    });

    console.log(`[BackgroundWorker] Interview analysis completed for interview ${interviewId}`);
  } catch (error) {
    throw error;
  }
}
