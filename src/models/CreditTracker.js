import mongoose from 'mongoose';

const creditTrackerSchema = new mongoose.Schema({
    totalSearches: {
        type: Number,
        default: 0
    },
    remainingSearches: {
        type: Number,
        default: 100
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    },
    searchHistory: [{
        date: Date,
        queriesUsed: Number,
        keywords: [String]
    }],
    isNoScrapeMode: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Singleton pattern - only one document should exist
creditTrackerSchema.statics.getInstance = async function () {
    let tracker = await this.findOne();
    if (!tracker) {
        tracker = await this.create({
            totalSearches: 0,
            remainingSearches: 100,
            isNoScrapeMode: false
        });
    }
    return tracker;
};

creditTrackerSchema.methods.canSearch = function (queriesNeeded = 1) {
    const safetyReserve = parseInt(process.env.SAFETY_RESERVE) || 10;
    return this.remainingSearches - queriesNeeded >= safetyReserve && !this.isNoScrapeMode;
};

creditTrackerSchema.methods.useCredits = async function (queriesUsed, keywords = []) {
    this.totalSearches += queriesUsed;
    this.remainingSearches -= queriesUsed;

    // Activate no-scrape mode if running low
    const safetyReserve = parseInt(process.env.SAFETY_RESERVE) || 10;
    if (this.remainingSearches <= safetyReserve) {
        this.isNoScrapeMode = true;
    }

    this.searchHistory.push({
        date: new Date(),
        queriesUsed,
        keywords
    });

    await this.save();
};

export default mongoose.model('CreditTracker', creditTrackerSchema);
