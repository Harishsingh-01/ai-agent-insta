import express from 'express';
import cron from 'node-cron';
import connectDB from './config/database.js';
import ViralAgent from './core/agent.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3000;

// Track service status
let serviceStatus = {
    dbConnected: false,
    schedulerActive: false,
    lastExecution: null,
    nextExecution: null,
    startTime: new Date()
};

// Initialize database connection
try {
    await connectDB();
    serviceStatus.dbConnected = true;
} catch (error) {
    console.error('❌ Database connection failed:', error.message);
}

// Create agent instance
const agent = new ViralAgent();

// Schedule daily execution at 6:00 PM IST
const cronSchedule = process.env.CRON_SCHEDULE || '0 18 * * *';

console.log('🎯 Viral Student AI Agent Started');
console.log(`⏰ Scheduled to run daily at: ${cronSchedule} (IST)`);
console.log(`📧 Reports will be sent to: ${process.env.RECIPIENT_EMAIL}`);
console.log(`🔍 Search days: ${process.env.SEARCH_DAYS.split(',').map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(d)]).join(', ')}\n`);

// Calculate next execution time (6 PM IST today or tomorrow)
function getNextExecutionTime() {
    const now = new Date();
    const today6PM = new Date();
    today6PM.setHours(18, 0, 0, 0); // 6 PM

    if (now > today6PM) {
        // If past 6 PM, next run is tomorrow
        today6PM.setDate(today6PM.getDate() + 1);
    }

    return today6PM;
}

serviceStatus.nextExecution = getNextExecutionTime();

// Schedule the cron job
const scheduledTask = cron.schedule(cronSchedule, async () => {
    try {
        console.log('⏰ Executing scheduled task...');
        await agent.execute();
        serviceStatus.lastExecution = new Date();
        serviceStatus.nextExecution = getNextExecutionTime();
        console.log('✅ Scheduled task completed successfully');
    } catch (error) {
        console.error('❌ Scheduled execution failed:', error.message);
    }
}, {
    timezone: process.env.TIMEZONE || 'Asia/Kolkata'
});

serviceStatus.schedulerActive = true;

// Health check endpoint - simple response for cron jobs
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Viral Student AI Agent',
        status: 'running',
        endpoints: {
            health: '/health'
        }
    });
});

// Start HTTP server
app.listen(PORT, () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
    console.log(`📡 Health endpoint: http://localhost:${PORT}/health\n`);
});

console.log('✅ Agent is running and waiting for scheduled time...\n');
console.log('💡 Tip: Run "npm test" to execute immediately for testing\n');

// Keep the process running & graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    scheduledTask.stop();
    process.exit(0);
});
