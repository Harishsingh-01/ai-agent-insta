import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class SearchService {
    constructor() {
        this.apiKey = process.env.SCRAPINGDOG_API_KEY;
        this.baseUrl = 'https://api.scrapingdog.com/google';
    }

    /**
     * Fetch trending topics related to AI, student life, and career
     */
    async searchTrends(query, country = 'in') {
        try {
            const url = `${this.baseUrl}?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&country=${country}&results=10`;

            console.log(`🔍 Searching: "${query}"`);
            const response = await axios.get(url, {
                timeout: 30000
            });

            if (response.data && response.data.organic_data) {
                return this.parseResults(response.data.organic_data);
            }

            return [];
        } catch (error) {
            console.error(`❌ Search Error for "${query}": ${error.message}`);
            return [];
        }
    }

    /**
     * Parse search results and extract relevant information
     */
    parseResults(results) {
        return results.slice(0, 10).map(result => ({
            title: result.title || '',
            snippet: result.snippet || result.description || '',
            url: result.link || '',
            keywords: this.extractKeywords(result.title, result.snippet)
        }));
    }

    /**
     * Extract keywords from title and snippet
     */
    extractKeywords(title = '', snippet = '') {
        const text = `${title} ${snippet}`.toLowerCase();
        const keywords = new Set();

        // AI-related keywords
        const aiTerms = ['ai', 'chatgpt', 'gemini', 'artificial intelligence', 'ml', 'automation', 'claude', 'midjourney', 'ai tool'];
        // Student-related keywords
        const studentTerms = ['student', 'college', 'study', 'exam', 'course', 'learning', 'education', 'university', 'jee', 'neet'];
        // Career-related keywords
        const careerTerms = ['career', 'job', 'internship', 'interview', 'resume', 'skill', 'placement', 'salary', 'freelance', 'startup'];
        // Money-related keywords
        const moneyTerms = ['money', 'earn', 'income', 'passive', 'side hustle', 'investment', 'paisa', 'kamao'];

        const allTerms = [...aiTerms, ...studentTerms, ...careerTerms, ...moneyTerms];

        allTerms.forEach(term => {
            if (text.includes(term)) {
                keywords.add(term);
            }
        });

        return Array.from(keywords);
    }

    /**
     * Get predefined search queries for different categories
     */
    getSearchQueries() {
        return [
            'AI tools for students India 2026',
            'student productivity hacks career growth',
            'how to earn money as student India',
            'ChatGPT student tips tricks',
            'college career opportunities India',
            'best AI apps for studying',
            'student side hustle ideas India',
            'interview preparation AI tools'
        ];
    }

    /**
     * Select queries based on remaining credits
     */
    selectQueries(maxQueries = 2) {
        const queries = this.getSearchQueries();
        const shuffled = queries.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, maxQueries);
    }
}

export default new SearchService();
