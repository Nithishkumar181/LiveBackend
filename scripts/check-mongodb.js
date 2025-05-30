const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/roomBooking';

async function checkMongoDB() {
    console.log('\nMongoDB Connection Test');
    console.log('====================');
    
    try {
        // Try to connect to MongoDB
        console.log('1. Attempting to connect to MongoDB...');
        console.log(`   URI: ${mongoUri}`);
        
        const client = new MongoClient(mongoUri, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            connectTimeoutMS: 10000
        });

        await client.connect();
        console.log('✓ Successfully connected to MongoDB');

        // Test database operations
        console.log('\n2. Testing database operations...');
        const db = client.db();
        
        // Test write operation
        const collection = db.collection('connection_test');
        const testDoc = { test: true, timestamp: new Date() };
        await collection.insertOne(testDoc);
        console.log('✓ Write operation successful');

        // Test read operation
        const result = await collection.findOne({ test: true });
        console.log('✓ Read operation successful');

        // Clean up test data
        await collection.deleteOne({ test: true });
        console.log('✓ Delete operation successful');

        // Close connection
        await client.close();
        console.log('\n✅ All tests passed! MongoDB is working correctly.');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ MongoDB Connection Error:');
        console.error(error);
        
        console.log('\nTroubleshooting steps:');
        console.log('1. Ensure MongoDB is installed and running:');
        console.log('   - Windows: Check Services app for "MongoDB"');
        console.log('   - Linux/Mac: Run "sudo systemctl status mongodb"');
        console.log('2. Verify MongoDB connection string in .env file');
        console.log('3. Check if MongoDB port (default: 27017) is accessible');
        console.log('4. Try connecting to MongoDB using MongoDB Compass');
        
        process.exit(1);
    }
}

// Run the check
checkMongoDB();