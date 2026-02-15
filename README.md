# 🎯 Viral Student AI Growth Agent

An autonomous AI-powered system that generates 5 viral Instagram Reel ideas daily for the **Indian student niche**, blending AI, Student Life, and Career Growth.

## 🚀 Features

- **Smart Credit Management**: Uses SearchScraper API only 3 days/week to maximize 100 search credits
- **Intelligent Reuse Mode**: Repurposes trends from last 7 days on non-search days
- **30-Day Deduplication**: Ensures no repeated hooks for 30 days
- **Hinglish Content**: Scroll-stopping content optimized for Indian Gen-Z
- **Automated Scheduling**: Daily execution at 6 PM IST via node-cron
- **Beautiful Email Reports**: Styled HTML emails with complete strategy breakdown
- **MongoDB Tracking**: Persistent storage of trends, ideas, and credit usage

## 📋 Tech Stack

- **LLM**: OpenRouter (Gemini 2.0 Flash)
- **Search API**: ScrapingDog
- **Database**: MongoDB Atlas
- **Email**: Gmail SMTP
- **Scheduler**: node-cron

## 📁 Project Structure

```
viral-student-agent/
├── src/
│   ├── models/
│   │   ├── Trend.js           # Trend storage with keywords
│   │   ├── Idea.js             # Generated reel ideas
│   │   └── CreditTracker.js    # Search credit management
│   ├── services/
│   │   ├── searchService.js    # ScrapingDog integration
│   │   ├── aiService.js        # OpenRouter Gemini integration
│   │   └── emailService.js     # Gmail SMTP service
│   ├── core/
│   │   └── agent.js            # Main orchestration logic
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── scripts/
│   │   └── initDatabase.js     # Database initialization
│   ├── index.js                # Entry point with cron scheduler
│   └── test.js                 # Manual test execution
├── .env                        # Environment configuration
├── package.json
└── README.md
```

## 🔧 Installation

### 1. Clone and Install

```bash
cd d:\ai-agent\viral-student-agent
npm install
```

### 2. Environment Variables

The `.env` file is already configured with your credentials. Verify it contains:

```env
MONGODB_URI=mongodb+srv://...
OPENROUTER_API_KEY=sk-or-v1-...
SCRAPINGDOG_API_KEY=...
GMAIL_USER=harishchaudhary790@gmail.com
GMAIL_APP_PASSWORD=pgun ionp pjue ggyg
RECIPIENT_EMAIL=harishchaudhary790@gmail.com
```

### 3. Initialize Database

```bash
npm run init-db
```

This creates the credit tracker with 100 searches.

## 🎮 Usage

### Start the Agent (Scheduled Mode)

```bash
npm start
```

The agent will run in the background and execute daily at **6:00 PM IST**.

### Manual Test Execution

```bash
npm test
```

Run immediately without waiting for scheduled time.

## 📊 How It Works

### Daily Workflow

1. **Credit Check** (6:00 PM IST)
   - Check if today is a search day (Mon/Wed/Fri)
   - Verify remaining credits (must be > 10 for safety)

2. **Trend Fetching**
   - **Search Mode** (Mon/Wed/Fri): Fetch 2 fresh queries from ScrapingDog
   - **Reuse Mode** (Other days): Get trends from last 7 days in MongoDB

3. **Deduplication**
   - Fetch all hooks from last 30 days
   - Pass to Gemini to force unique content

4. **Idea Generation**
   - Gemini generates 5 ideas in JSON format
   - Each includes: Hook, Script, Format, Caption, Hashtags, CTA, Emotional Trigger

5. **Database Storage**
   - Save ideas with unique hook constraint
   - Skip duplicates automatically

6. **Email Report**
   - Send beautifully formatted HTML email
   - Attach JSON file with complete data

## 🎨 Output Schema

Each daily report includes:

```json
{
  "date": "2026-02-14",
  "searchUsedToday": true,
  "remainingSearches": 98,
  "trendKeywords": ["ai", "chatgpt", "student", "career"],
  "ideas": [
    {
      "hook": "Ye AI tool miss kiya toh pachtaoge! 😱",
      "script": "[Show phone screen] Bhai, ChatGPT toh sab use karte...",
      "format": "Tutorial",
      "caption": "AI se padhai karo, placement le jao 🚀 #AIForStudents",
      "hashtags": ["#AIForStudents", "#CareerGrowth", ...],
      "cta": "Save this for exams!",
      "emotionalTrigger": "FOMO",
      "viralReasoning": "Students fear missing career opportunities"
    }
  ],
  "collabSuggestion": "Tech YouTubers with student audience",
  "monetizationAngle": "AI tool affiliate marketing",
  "bestPostingTime": "7:00 PM - 9:00 PM IST"
}
```

## 💡 Credit Management

- **Total Credits**: 100 searches
- **Daily Limit**: 2 searches on active days (Mon/Wed/Fri)
- **Safety Reserve**: 10 searches (triggers no-scrape mode)
- **Automatic Fallback**: Switches to reuse mode when credits low

## 🔒 Security

- `.env` file includes sensitive credentials (already in `.gitignore`)
- Gmail App Password used (not regular password)
- MongoDB Atlas connection with authentication

## 📧 Email Format

Recipients receive:
- Formatted HTML email with all 5 ideas
- Visual breakdown of hook, script, caption, hashtags
- Credit usage summary
- Collaboration and monetization suggestions
- JSON attachment for programmatic access

## 🐛 Troubleshooting

### Email Not Sending
- Verify Gmail App Password (remove spaces: `pgunionppjueggyg`)
- Check 2FA is enabled on Gmail account

### Database Connection Error
- Verify MongoDB URI is correct
- Check network allows MongoDB Atlas connections

### Search API Failing
- Verify ScrapingDog API key is valid
- Check remaining credits on ScrapingDog dashboard

### Gemini Not Generating
- Verify OpenRouter API key
- Check OpenRouter account has credits

## 📝 Logs

The system logs all operations to console:
- ✅ Success indicators
- ⚠️ Warnings for duplicate hooks
- ❌ Errors with stack traces
- 📊 Credit usage tracking

## 🎯 Next Steps

1. **Monitor First Week**: Check email reports daily
2. **Adjust Keywords**: Update search queries in `searchService.js` if needed
3. **Refine Prompts**: Tweak AI prompts in `aiService.js` for better output
4. **Track Performance**: Monitor which ideas actually go viral

## 📄 License

ISC

---

**Created by**: Viral Student AI Agent 🤖  
**Last Updated**: February 2026
