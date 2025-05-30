require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testSystem() {
    console.log('\n=== System Test Started ===\n');

    // 1. Test MongoDB Connection
    try {
        console.log('1. Testing MongoDB Connection...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✓ MongoDB Connected');
        
        // Test database operations
        const testDoc = { test: true, timestamp: new Date() };
        const collection = mongoose.connection.collection('test');
        await collection.insertOne(testDoc);
        await collection.deleteOne({ test: true });
        console.log('✓ Database operations working\n');
    } catch (error) {
        console.error('✗ MongoDB Error:', error.message);
        process.exit(1);
    }

    // 2. Test User Model
    try {
        console.log('2. Testing User Model...');
        const testUser = {
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10)
        };

        // Clean up any existing test user
        await User.deleteOne({ email: testUser.email });

        // Create test user
        const user = new User(testUser);
        await user.save();
        console.log('✓ User Model working\n');

        // Clean up
        await User.deleteOne({ email: testUser.email });
    } catch (error) {
        console.error('✗ User Model Error:', error.message);
        process.exit(1);
    }

    // 3. Test API Endpoints
    try {
        console.log('3. Testing API Endpoints...');
        
        // Test server health
        console.log('   Testing /health endpoint...');
        const healthResponse = await axios.get(`${API_URL}/health`);
        console.log('   ✓ Health check passed');

        // Test auth routes
        console.log('   Testing /test endpoint...');
        const testResponse = await axios.get(`${API_URL}/test`);
        console.log('   ✓ Test route working');

        // Test registration
        console.log('   Testing registration...');
        const registerResponse = await axios.post(`${API_URL}/register`, {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('   ✓ Registration working');

        // Test login
        console.log('   Testing login...');
        const loginResponse = await axios.post(`${API_URL}/admin-login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('   ✓ Login working');

        // Clean up test user
        await User.deleteOne({ email: 'test@example.com' });
        console.log('   ✓ Test cleanup completed\n');

    } catch (error) {
        console.error('✗ API Test Error:', {
            message: error.message,
            response: error.response?.data
        });
        
        console.log('\nTroubleshooting steps:');
        console.log('1. Ensure the server is running (npm run dev)');
        console.log('2. Check server logs for errors');
        console.log('3. Verify MongoDB is running and accessible');
        console.log('4. Check .env configuration');
        process.exit(1);
    }

    console.log('=== All Tests Passed ===\n');
    process.exit(0);
}

// Run tests
console.log('Starting system tests...');
testSystem().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});