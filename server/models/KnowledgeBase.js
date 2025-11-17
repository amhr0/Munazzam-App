import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema({
  bookTitle: {
    type: String,
    required: true
  },
  bookAuthor: String,
  category: {
    type: String,
    enum: ['hiring', 'behavioral', 'meetings', 'communication', 'general'],
    required: true
  },
  chunkText: {
    type: String,
    required: true
  },
  chunkIndex: Number,
  pageNumber: Number,
  embedding: [Number], // Vector embedding
  metadata: {
    language: String,
    chapter: String,
    section: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index for faster searches
knowledgeChunkSchema.index({ bookTitle: 1, category: 1 });
knowledgeChunkSchema.index({ 'metadata.keywords': 1 });

export default mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
