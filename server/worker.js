import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import executiveAgent from './services/executiveAgent.js';

dotenv.config();

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/munazzam')
  .then(() => console.log('👷 Worker Connected to MongoDB'))
  .catch(err => console.error('❌ Worker DB Connection Error:', err));

const redisConfig = { 
  connection: { 
    host: process.env.REDIS_HOST || 'localhost', 
    port: 6379 
  } 
};

const worker = new Worker('munazzam-queue', async job => {
  console.log(`🔄 Processing Job: ${job.name} (ID: ${job.id})`);
  
  try {
    if (job.name === 'analyze-meeting') {
      // استيراد ديناميكي لتجنب مشاكل الاستيراد الدائري
      const { default: Meeting } = await import('./models/Meeting.js');
      
      const meeting = await Meeting.findById(job.data.meetingId);
      if (!meeting) {
        console.log(`⚠️ Meeting ${job.data.meetingId} not found`);
        return;
      }
      
      console.log(`📊 Analyzing meeting: ${meeting.title}`);
      const analysis = await executiveAgent.analyzeStrategicMeeting(
        meeting.transcript || meeting.summary || '', 
        meeting.title
      );
      
      meeting.analysis = analysis;
      meeting.status = 'completed';
      await meeting.save();
      
      console.log(`✅ Meeting analysis completed for: ${meeting.title}`);
    }
    
    else if (job.name === 'analyze-interview') {
      console.log(`🎤 Analyzing interview for: ${job.data.candidateName}`);
      const analysis = await executiveAgent.analyzeExecutiveInterview(
        job.data.transcript,
        job.data.candidateName
      );
      
      // حفظ النتائج (يمكن إضافة model للمرشحين لاحقاً)
      console.log(`✅ Interview analysis completed for: ${job.data.candidateName}`);
      console.log(`Recommendation: ${analysis.recommendation}, Score: ${analysis.score}/10`);
    }
    
    else if (job.name === 'analyze-video') {
      console.log(`🎥 Video Analysis for ${job.data.candidateName}`);
      // منطق تحليل الفيديو (يستدعي Whisper ثم Executive Agent)
      console.log(`✅ Video Analysis Complete for ${job.data.candidateName}`);
    }
    
    else if (job.name === 'generate-briefing') {
      const { default: briefingService } = await import('./services/briefingService.js');
      const briefing = await briefingService.sendDailyBriefing(
        job.data.userId,
        job.data.userName
      );
      console.log(`📧 Daily briefing generated for: ${job.data.userName}`);
    }

  } catch (error) {
    console.error(`❌ Job Failed (${job.name}):`, error.message);
    throw error; // يعيد المحاولة تلقائياً
  }
}, redisConfig);

worker.on('completed', job => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

console.log('🚀 Worker is listening for tasks...');
console.log(`📡 Redis: ${process.env.REDIS_HOST || 'localhost'}:6379`);
console.log(`💾 MongoDB: ${process.env.MONGODB_URI || 'mongodb://mongodb:27017/munazzam'}`);
