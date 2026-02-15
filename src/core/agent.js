import Trend from '../models/Trend.js';
import Idea from '../models/Idea.js';
import CreditTracker from '../models/CreditTracker.js';
import searchService from '../services/searchService.js';
import aiService from '../services/aiService.js';
import emailService from '../services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

class ViralAgent {
    constructor() {
        this.searchDays = process.env.SEARCH_DAYS.split(',').map(d => parseInt(d));
        this.dailySearchLimit = parseInt(process.env.DAILY_SEARCH_LIMIT) || 2;
        this.deduplicationDays = parseInt(process.env.DEDUPLICATION_DAYS) || 30;
        this.ideasPerDay = parseInt(process.env.IDEAS_PER_DAY) || 5;
    }

    /**
     * Main execution function - runs daily at 6 PM IST
     */
    async execute() {
        try {
            console.log('\n🚀 ===== VIRAL AGENT EXECUTION STARTED =====');
            console.log(`⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`);

            // Step 1: Check if today is a search day
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const isSearchDay = this.searchDays.includes(dayOfWeek);

            console.log(`📅 Today is: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`);
            console.log(`🔍 Search Day: ${isSearchDay ? 'YES ✅' : 'NO ♻️ (Reuse mode)'}\n`);

            // Step 2: Get credit tracker
            const creditTracker = await CreditTracker.getInstance();
            console.log(`💳 Remaining Searches: ${creditTracker.remainingSearches}/${process.env.MAX_TOTAL_SEARCHES}`);
            console.log(`🚨 No-Scrape Mode: ${creditTracker.isNoScrapeMode ? 'ACTIVE' : 'Inactive'}\n`);

            let trends = [];
            let searchUsedToday = false;

            // Step 3: Fetch or reuse trends
            if (isSearchDay && creditTracker.canSearch(this.dailySearchLimit)) {
                // SEARCH MODE: Fetch fresh trends
                trends = await this.fetchFreshTrends(creditTracker);
                searchUsedToday = true;
            } else {
                // REUSE MODE: Get trends from last 7 days
                trends = await this.getRecentTrends();
                console.log(`♻️ Reusing ${trends.length} trends from the last 7 days\n`);
            }

            if (trends.length === 0) {
                console.warn('⚠️ No trends available. Using fallback keywords.');
                trends = [{ keywords: ['AI tools', 'student productivity', 'career growth', 'ChatGPT'] }];
            }

            // Step 4: Get existing hooks for deduplication
            const existingHooks = await this.getExistingHooks();
            console.log(`📋 Checking against ${existingHooks.length} existing hooks (last ${this.deduplicationDays} days)\n`);

            // Step 5: Generate ideas
            console.log(`🤖 Generating ${this.ideasPerDay} viral ideas...\n`);
            let generatedIdeas;

            if (searchUsedToday) {
                generatedIdeas = await aiService.generateIdeas(trends, existingHooks, this.ideasPerDay);
            } else {
                // Use re-angle mode for more creativity when reusing trends
                generatedIdeas = await aiService.reAngleTrends(trends, existingHooks, this.ideasPerDay);
            }

            // Step 6: Save ideas to database
            const savedIdeas = await this.saveIdeas(generatedIdeas, today);
            console.log(`✅ Saved ${savedIdeas.length} ideas to database\n`);

            // Step 7: Prepare report data
            const reportData = this.prepareReportData(
                today,
                savedIdeas,
                searchUsedToday,
                creditTracker.remainingSearches,
                trends
            );

            // Step 8: Send email report
            console.log('📧 Sending email report...\n');
            await emailService.sendDailyReport(reportData);

            console.log('🎉 ===== EXECUTION COMPLETED SUCCESSFULLY =====\n');
            return reportData;

        } catch (error) {
            console.error('❌ EXECUTION FAILED:', error.message);
            console.error(error.stack);
            throw error;
        }
    }

    /**
     * Fetch fresh trends using SearchScraper API
     */
    async fetchFreshTrends(creditTracker) {
        console.log('🔍 SEARCH MODE: Fetching fresh trends...\n');

        const queries = searchService.selectQueries(this.dailySearchLimit);
        const allResults = [];
        const usedKeywords = [];

        for (const query of queries) {
            const results = await searchService.searchTrends(query);
            allResults.push(...results);

            results.forEach(r => {
                if (r.keywords) usedKeywords.push(...r.keywords);
            });
        }

        // Update credit tracker
        await creditTracker.useCredits(queries.length, [...new Set(usedKeywords)]);
        console.log(`✅ Used ${queries.length} search credits\n`);

        // Save trends to database
        const savedTrends = [];
        for (const result of allResults) {
            if (result.keywords && result.keywords.length > 0) {
                const trend = await Trend.create({
                    date: new Date(),
                    keywords: result.keywords,
                    title: result.title,
                    snippet: result.snippet,
                    source: 'scraped'
                });
                savedTrends.push(trend);
            }
        }

        console.log(`💾 Saved ${savedTrends.length} new trends to database\n`);
        return savedTrends;
    }

    /**
     * Get recent trends from last 7 days
     */
    async getRecentTrends() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trends = await Trend.find({
            createdAt: { $gte: sevenDaysAgo }
        })
            .sort({ createdAt: -1 })
            .limit(20);

        return trends;
    }

    /**
     * Get existing hooks from last N days for deduplication
     */
    async getExistingHooks() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.deduplicationDays);

        const ideas = await Idea.find({
            createdAt: { $gte: cutoffDate }
        })
            .select('hook')
            .sort({ createdAt: -1 });

        return ideas.map(idea => idea.hook);
    }

    /**
     * Save generated ideas to database
     */
    async saveIdeas(generatedIdeas, date) {
        const savedIdeas = [];

        for (const ideaData of generatedIdeas) {
            try {
                const idea = await Idea.create({
                    date,
                    hook: ideaData.hook,
                    script: ideaData.script,
                    format: ideaData.format,
                    caption: ideaData.caption,
                    hashtags: ideaData.hashtags,
                    cta: ideaData.cta,
                    emotionalTrigger: ideaData.emotionalTrigger,
                    viralReasoning: ideaData.viralReasoning,
                    trendKeywords: ideaData.trendKeywords || []
                });
                savedIdeas.push(idea);
            } catch (error) {
                // Handle duplicate hook error
                if (error.code === 11000) {
                    console.warn(`⚠️ Duplicate hook detected, skipping: "${ideaData.hook.substring(0, 50)}..."`);
                } else {
                    console.error('❌ Error saving idea:', error.message);
                }
            }
        }

        return savedIdeas;
    }

    /**
     * Prepare report data for email
     */
    prepareReportData(date, ideas, searchUsedToday, remainingSearches, trends) {
        const trendKeywords = [...new Set(
            trends.flatMap(t => t.keywords || [])
        )].slice(0, 10);

        // Generate collaboration suggestion
        const collabSuggestion = this.generateCollabSuggestion(trendKeywords);

        // Generate monetization angle
        const monetizationAngle = this.generateMonetizationAngle(trendKeywords);

        return {
            date: date.toISOString().split('T')[0],
            searchUsedToday,
            remainingSearches,
            trendKeywords,
            ideas: ideas.map(idea => ({
                hook: idea.hook,
                script: idea.script,
                format: idea.format,
                caption: idea.caption,
                hashtags: idea.hashtags,
                cta: idea.cta,
                emotionalTrigger: idea.emotionalTrigger,
                viralReasoning: idea.viralReasoning
            })),
            collabSuggestion,
            monetizationAngle,
            bestPostingTime: '7:00 PM - 9:00 PM IST (Peak student engagement)'
        };
    }

    /**
     * Generate collaboration suggestion based on keywords
     */
    generateCollabSuggestion(keywords) {
        if (keywords.includes('ai') || keywords.includes('chatgpt')) {
            return 'Collaborate with tech YouTubers or AI tool reviewers who have student audience (100K-500K followers)';
        } else if (keywords.includes('career') || keywords.includes('job')) {
            return 'Partner with career coaches, HR professionals, or placement trainers for expert insights';
        } else if (keywords.includes('money') || keywords.includes('earn')) {
            return 'Collaborate with finance influencers or successful student entrepreneurs';
        }
        return 'Cross-promote with student lifestyle pages or college meme accounts (engagement-focused)';
    }

    /**
     * Generate monetization angle based on keywords
     */
    generateMonetizationAngle(keywords) {
        if (keywords.includes('ai') || keywords.includes('tool')) {
            return 'Affiliate marketing for AI tools (many offer 20-30% commissions). Create comparison reels and add affiliate links.';
        } else if (keywords.includes('course') || keywords.includes('learning')) {
            return 'Promote online courses with affiliate links or create your own mini-course on Gumroad ($5-15 range).';
        } else if (keywords.includes('job') || keywords.includes('resume')) {
            return 'Offer resume review services (₹199-499) or placement prep consultations. Upsell to group sessions.';
        }
        return 'Build engaged audience → Launch digital products (templates, guides, notion dashboards) priced ₹99-299';
    }
}

export default ViralAgent;
