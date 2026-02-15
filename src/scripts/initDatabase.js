import connectDB from '../config/database.js';
import CreditTracker from '../models/CreditTracker.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Initializing database...\n');

await connectDB();

// Initialize credit tracker
const tracker = await CreditTracker.getInstance();
console.log('✅ Credit Tracker initialized:');
console.log(`   - Total searches used: ${tracker.totalSearches}`);
console.log(`   - Remaining searches: ${tracker.remainingSearches}`);
console.log(`   - No-scrape mode: ${tracker.isNoScrapeMode ? 'Active' : 'Inactive'}\n`);

console.log('✅ Database initialization complete!\n');
process.exit(0);
