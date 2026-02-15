import connectDB from './config/database.js';
import ViralAgent from './core/agent.js';

console.log('🧪 ===== MANUAL TEST EXECUTION =====\n');

// Connect to database
await connectDB();

// Create and run agent
const agent = new ViralAgent();

try {
    const result = await agent.execute();
    console.log('\n✅ Test completed successfully!');
    console.log('\n📊 Result Summary:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}
