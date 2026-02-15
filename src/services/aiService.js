import { OpenRouter } from '@openrouter/sdk';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
    constructor() {
        this.client = new OpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY
        });
        this.model = 'google/gemini-2.5-flash-lite';
    }

    /**
     * Generate viral Instagram Reel ideas in Hinglish
     */
    async generateIdeas(trends, existingHooks, count = 5) {
        const trendKeywords = this.aggregateKeywords(trends);
        const prompt = this.buildPrompt(trendKeywords, existingHooks, count);

        try {
            console.log('🤖 Generating ideas with Gemini...');

            const completion = await this.client.chat.send({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a viral content strategist specializing in Indian Gen-Z Instagram Reels. You create scroll-stopping Hinglish content for students focused on AI, career growth, and money.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.9,
                max_tokens: 2500
            });

            const response = completion.choices[0].message.content;
            return this.parseIdeas(response, trendKeywords);
        } catch (error) {
            console.error(`❌ AI Generation Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Build the prompt for idea generation
     */
    buildPrompt(keywords, existingHooks, count) {
        const hookExamples = existingHooks.slice(0, 5).map(h => `- "${h}"`).join('\n');

        return `You are creating ${count} viral Instagram Reel ideas for Indian students (18-25) in HINGLISH.

TRENDING KEYWORDS: ${keywords.join(', ')}

RULES:
1. Hook in HINGLISH (Hindi + English mix)
2. Avoid these recent hooks:
${hookExamples || '(No previous hooks)'}
3. Focus: AI tools, Student productivity, Career FOMO, Money making
4. Gen-Z slang, emojis, urgency

CRITICAL SCRIPT REQUIREMENTS:
- NO GENERIC ADVICE! Scripts MUST contain REAL, SPECIFIC information
- Use EXACT tool names (e.g., "Perplexity AI", "Claude 3.5", "Notion AI" - NOT "an AI tool")
- Include REAL numbers/statistics (e.g., "saves 3 hours daily", "₹20,000/month earning potential")
- Give EXACT steps (e.g., "Go to perplexity.ai → Type your query → Click 'Pro Search'")
- Name specific websites, apps, Chrome extensions with EXACT URLs when relevant
- Mention real courses, creators, platforms by NAME
- Use concrete examples students can IMMEDIATELY action
- Script should be 30-45 seconds when spoken at natural pace
- Include [visual cues in brackets] showing what appears on screen

BAD Script Example: "Use AI tools to improve productivity"
GOOD Script Example: "[Screen recording] Open Perplexity.ai → paste your assignment topic → it gives you 5 research sources in 10 seconds! [Show real search] I saved 2 hours using this for my project submission!"

CRITICAL ENUM VALUES - USE EXACTLY AS WRITTEN:

format - MUST BE ONE OF THESE (copy exactly):
- POV
- Listicle
- Green_Screen
- Tutorial
- Skit
- Split_Screen

emotionalTrigger - MUST BE ONE OF THESE (copy exactly):
- FOMO
- Growth
- Anxiety
- Ease
- Curiosity
- Urgency

YOU MUST USE ONLY THESE EXACT VALUES. NO OTHER VALUES WILL WORK.

Return ONLY a valid JSON array. NO explanations. NO markdown. EXACT format:

[
  {
    "hook": "Hinglish hook with specific detail",
    "script": "30-45 sec script with [visual cues]. Must include SPECIFIC tool names, EXACT numbers, REAL steps that audience can follow immediately. NO generic statements!",
    "format": "POV",
    "caption": "Caption with emojis mentioning specific tools/numbers",
    "hashtags": ["#AIForStudents", "#CareerGrowth", "#StudentLife", "#AITools", "#Productivity", "#GenZ", "#StudyTips", "#CareerGoals", "#TechForStudents", "#FutureReady"],
    "cta": "Save this for later!",
    "emotionalTrigger": "FOMO",
    "viralReasoning": "One line why this goes viral"
  }
]

Return ${count} ideas. Each script MUST have specific, actionable, real information. Use different format and emotionalTrigger for variety. ONLY JSON array.`;
    }

    /**
     * Parse AI response into structured ideas
     */
    parseIdeas(response, trendKeywords) {
        try {
            // Remove markdown code blocks if present
            let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');

            // Extract JSON array from response
            const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('No JSON array found in response');
            }

            const ideas = JSON.parse(jsonMatch[0]);

            // Validate required fields
            const requiredFields = ['hook', 'script', 'format', 'caption', 'hashtags', 'cta', 'emotionalTrigger', 'viralReasoning'];
            ideas.forEach((idea, index) => {
                requiredFields.forEach(field => {
                    if (!idea[field]) {
                        throw new Error(`Idea ${index + 1} missing required field: ${field}`);
                    }
                });
            });

            // Add trend keywords to each idea
            return ideas.map(idea => ({
                ...idea,
                trendKeywords: trendKeywords.slice(0, 5)
            }));
        } catch (error) {
            console.error('❌ Failed to parse AI response:', error.message);
            console.log('Raw response (first 500 chars):', response.substring(0, 500));
            throw new Error('Failed to parse AI-generated ideas');
        }
    }

    /**
     * Aggregate and deduplicate keywords from trends
     */
    aggregateKeywords(trends) {
        const allKeywords = new Set();
        trends.forEach(trend => {
            if (trend.keywords) {
                trend.keywords.forEach(kw => allKeywords.add(kw));
            }
        });
        return Array.from(allKeywords).slice(0, 15); // Top 15 keywords
    }

    /**
     * Re-angle existing trends with fresh perspectives
     */
    async reAngleTrends(oldTrends, existingHooks, count = 5) {
        const keywords = oldTrends.flatMap(t => t.keywords || []);
        const uniqueKeywords = [...new Set(keywords)].slice(0, 10);

        const prompt = `Create ${count} FRESH Instagram Reel ideas for Indian students in HINGLISH.

TREND KEYWORDS: ${uniqueKeywords.join(', ')}

AVOID these hooks:
${existingHooks.slice(0, 10).map(h => `- "${h}"`).join('\n')}

SCRIPT MUST HAVE REAL INFORMATION:
- Use EXACT tool names (Perplexity AI, Claude, Notion AI, etc.)
- Include REAL numbers (saves X hours, earn ₹X amount)
- Give EXACT steps students can follow
- 30-45 sec script with [visual cues]

CRITICAL ENUM VALUES - USE EXACTLY:

format: POV, Listicle, Green_Screen, Tutorial, Skit, Split_Screen
emotionalTrigger: FOMO, Growth, Anxiety, Ease, Curiosity, Urgency

NO OTHER VALUES ALLOWED!

Return ONLY JSON array with EXACT field names:

[
  {
    "hook": "Hinglish hook with specific details",
    "script": "30-45 sec script with SPECIFIC tool names, EXACT numbers, REAL actionable steps [visual cues]",
    "format": "POV",
    "caption": "Caption with emojis",
    "hashtags": ["#AIForStudents", "#CareerGrowth", "#StudentLife", "#AITools", "#Productivity", "#GenZ", "#StudyTips", "#CareerGoals", "#TechForStudents", "#FutureReady"],
    "cta": "Save this!",
    "emotionalTrigger": "FOMO",
    "viralReasoning": "Why this goes viral"
  }
]

Return ${count} ideas with SPECIFIC, ACTIONABLE information. ONLY JSON array.`;

        try {
            const completion = await this.client.chat.send({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a viral content strategist specializing in Indian Gen-Z Instagram Reels.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.95, // Higher temperature for more creativity
                max_tokens: 2500
            });

            const response = completion.choices[0].message.content;
            return this.parseIdeas(response, uniqueKeywords);
        } catch (error) {
            console.error(`❌ Re - angle Error: ${error.message} `);
            throw error;
        }
    }
}

export default new AIService();
