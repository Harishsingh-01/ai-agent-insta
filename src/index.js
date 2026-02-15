import cron from 'node-cron';
import connectDB from './config/database.js';
import ViralAgent from './core/agent.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize database connection
await connectDB();

// Create agent instance
const agent = new ViralAgent();

// Schedule daily execution at 6:00 PM IST
const cronSchedule = process.env.CRON_SCHEDULE || '0 18 * * *';

console.log('🎯 Viral Student AI Agent Started');
console.log(`⏰ Scheduled to run daily at: ${cronSchedule} (IST)`);
console.log(`📧 Reports will be sent to: ${process.env.RECIPIENT_EMAIL}`);
console.log(`🔍 Search days: ${process.env.SEARCH_DAYS.split(',').map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(d)]).join(', ')}\n`);

// Schedule the cron job
cron.schedule(cronSchedule, async () => {
    try {
        await agent.execute();
    } catch (error) {
        console.error('❌ Scheduled execution failed:', error.message);
    }
}, {
    timezone: process.env.TIMEZONE || 'Asia/Kolkata'
});

console.log('✅ Agent is running and waiting for scheduled time...\n');
console.log('💡 Tip: Run "npm test" to execute immediately for testing\n');

// Keep the process running
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});
