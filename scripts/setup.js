require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function setupDatabase() {
    console.log('\n=== Database Setup ===\n');

    try {
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ MongoDB Connected');

        // Create test user
        console.log('\n2. Setting up test user...');
        const testUser = {
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10)
        };

        // Remove existing test user if exists
        await User.deleteOne({ email: testUser.email });

        // Create new test user
        const user = new User(testUser);
        await user.save();
        console.log('✓ Test user created successfully');
        console.log('  Email:', testUser.email);
        console.log('  Password: password123');

        console.log('\n✅ Setup completed successfully!');
        console.log('\nYou can now:');
        console.log('1. Start the server: npm run dev');
        console.log('2. Login with the test credentials above');
        console.log('3. Run database checks: npm run checkdb');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        
        if (error.name === 'MongooseError' || error.name === 'MongoError') {
            console.log('\nTroubleshooting steps:');
            console.log('1. Ensure MongoDB is installed and running:');
            console.log('   - Windows: Check Services app for "MongoDB"');
            console.log('   - Linux/Mac: Run "sudo systemctl status mongodb"');
            console.log('2. Verify MongoDB connection string in .env file');
            console.log('3. Check if MongoDB port (default: 27017) is accessible');
            console.log('4. Try running: npm run checkdb');
        }
        
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

console.log('Starting database setup...');
setupDatabase().catch(error => {
    console.error('Fatal error during setup:', error);
    process.exit(1);
});