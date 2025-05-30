const mongoose = require('mongoose');

const checkDbConnection = async () => {
    try {
        // Check connection state
        const state = mongoose.connection.readyState;
        
        if (state === 1) {
            return true; // Connected
        }

        if (state === 0) {
            // Disconnected, try to reconnect
            console.log('MongoDB disconnected, attempting to reconnect...');
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            return true;
        }

        if (state === 2) {
            // Connecting
            await new Promise(resolve => setTimeout(resolve, 5000));
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
                message: 'Database connection is not available'
            });
        }
        next();
    } catch (error) {
        console.error('Database middleware error:', error);
        res.status(503).json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

module.exports = {
    checkDbConnection,
    ensureDbConnection
};