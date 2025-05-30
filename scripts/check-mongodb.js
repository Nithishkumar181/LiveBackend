'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

async function checkMongoDB() {
    console.log('\nMongoDB Connection Test');
    console.log('====================');
    
    try {
        // Check if MongoDB URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Try to connect to MongoDB
        console.log('1. Attempting to connect to MongoDB...');
        console.log(`   URI: ${process.env.MONGODB_URI}`);
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            connectTimeoutMS: 10000,
            // No need for useNewUrlParser and useUnifiedTopology in Mongoose 7+
        });

        console.log('✓ Successfully connected to MongoDB');

        // Test database operations
        console.log('\n2. Testing database operations...');
        
        // Test write operation
        const TestModel = mongoose.model('ConnectionTest', new mongoose.Schema({ 
            test: Boolean, 
            timestamp: Date 
        }, {
            strict: true,
            timestamps: true
        }));
        
        const testDoc = new TestModel({ test: true, timestamp: new Date() });
        await testDoc.save();
        console.log('✓ Write operation successful');

        // Test read operation
        const result = await TestModel.findOne({ test: true });
        if (!result) {
            throw new Error('Test document not found');
        }
        console.log('✓ Read operation successful');

        // Clean up test data
        await TestModel.deleteMany({ test: true });
        console.log('✓ Delete operation successful');

        // Drop test collection
        await mongoose.connection.dropCollection('connectiontests');
        console.log('✓ Test collection cleanup successful');

        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ All tests passed! MongoDB is working correctly.');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ MongoDB Connection Error:');
        console.error(error.message || error);
        
        if (error.name === 'MongooseError' || error.name === 'MongoServerError') {
            console.log('\nSpecific Error Details:');
            console.log('- Error Name:', error.name);
            console.log('- Error Code:', error.code || 'N/A');
            console.log('- Error Message:', error.message);
        }
        
        console.log('\nTroubleshooting steps:');
        console.log('1. Ensure MongoDB is installed and running:');
        console.log('   - Windows: Check Services app for "MongoDB"');
        console.log('   - Linux/Mac: Run "sudo systemctl status mongodb"');
        console.log('2. Verify MongoDB connection string in .env file');
        console.log('3. Check if MongoDB port (default: 27017) is accessible');
        console.log('4. Try connecting to MongoDB using MongoDB Compass');
        console.log('5. Ensure you have the latest version of MongoDB installed');
        
        // Clean up if connection was established
        if (mongoose.connection.readyState === 1) {
            try {
                await mongoose.connection.close();
            } catch (closeError) {
                console.error('Error while closing connection:', closeError.message);
            }
        }
        
        process.exit(1);
    }
}

// Run the check
checkMongoDB().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});