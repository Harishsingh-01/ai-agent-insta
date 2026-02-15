import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    hook: {
        type: String,
        required: true,
        unique: true // Enforce unique hooks for deduplication
    },
    script: {
        type: String,
        required: true
    },
    format: {
        type: String,
        enum: ['POV', 'Listicle', 'Green_Screen', 'Skit', 'Tutorial', 'Split_Screen', 'Before_After'],
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    hashtags: [{
        type: String
    }],
    cta: {
        type: String,
        required: true
    },
    emotionalTrigger: {
        type: String,
        enum: ['FOMO', 'Growth', 'Anxiety', 'Ease', 'Curiosity', 'Urgency'],
        required: true
    },
    viralReasoning: {
        type: String,
        required: true
    },
    trendKeywords: [{
        type: String
    }],
    collabSuggestion: String,
    monetizationAngle: String
}, {
    timestamps: true
});

// Index for deduplication checks (last 30 days)
ideaSchema.index({ createdAt: -1 });
ideaSchema.index({ hook: 1 });
ideaSchema.index({ date: -1 });

export default mongoose.model('Idea', ideaSchema);
