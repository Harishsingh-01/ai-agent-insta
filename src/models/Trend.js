import mongoose from 'mongoose';

const trendSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  keywords: [{
    type: String,
    required: true
  }],
  title: String,
  snippet: String,
  source: {
    type: String,
    enum: ['scraped', 'reused'],
    required: true
  },
  category: {
    type: String,
    enum: ['AI_Tools', 'Career_Hacks', 'Student_Productivity', 'Money_Making', 'FOMO'],
    default: 'Student_Productivity'
  },
  usedInIdeas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  }]
}, {
  timestamps: true
});

// Index for efficient querying of recent trends
trendSchema.index({ createdAt: -1 });
trendSchema.index({ keywords: 1 });

export default mongoose.model('Trend', trendSchema);
