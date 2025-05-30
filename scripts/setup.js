require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { connectWithRetry } = require('../utils/db');

async function setupAdmin() {
    try {
        console.log('\nInitial Setup');
        console.log('=============');

        // Connect to database
        console.log('1. Connecting to database...');
        await connectWithRetry();
        console.log('✓ Database connected');

        // Create admin user
        console.log('\n2. Setting up admin user...');
        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin123!@#';

        // Check if admin exists
        let admin = await User.findOne({ email: adminEmail });
        
        if (admin) {
            console.log('ℹ Admin user already exists');
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            // Create admin
            admin = new User({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            await admin.save();
            console.log('✓ Admin user created');
        }

        console.log('\nAdmin Credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        
        console.log('\n✅ Setup completed successfully!');
    } catch (error) {
        console.error('\n❌ Setup failed:', error);
    } finally {
        // Close database connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
}

// Run setup
setupAdmin().catch(console.error);