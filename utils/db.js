const mongoose = require('mongoose');

const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected successfully');
            return true;
        } catch (error) {
            if (i === retries - 1) {
                console.error('MongoDB connection failed after retries:', error);
                throw error;
            }
            console.log(`MongoDB connection attempt ${i + 1} failed, retrying in ${delay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};

const checkDbConnection = async () => {
    try {
        const state = mongoose.connection.readyState;
        
        if (state === 1) {
            return true; // Connected
        }

        if (state === 0) {
            // Disconnected, try to reconnect
            console.log('MongoDB disconnected, attempting to reconnect...');
            return await connectWithRetry();
        }

        if (state === 2) {
            // Connecting
            await new Promise(resolve => setTimeout(resolve, 10000));
            return checkDbConnection();
        }

        return false;
    } catch (error) {
        console.error('Database connection error:', error);
        return false;
    }
};

const ensureDbConnection = async (req, res, next) => {
    try {
        const isConnected = await checkDbConnection();
        if (!isConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database service temporarily unavailable'
            });
        }
        next();
    } catch (error) {
        console.error('Database middleware error:', error);
        res.status(503).json({
            success: false,
            message: 'Database service temporarily unavailable'
        });
    }
};

// Set up mongoose connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

module.exports = {
    checkDbConnection,
    ensureDbConnection,
    connectWithRetry
};