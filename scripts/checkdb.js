require('dotenv').config();
const mongoose = require('mongoose');

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Successfully connected to MongoDB!');
  console.log('Connection state:', mongoose.connection.readyState);
  process.exit(0);
})
.catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  console.error('Please ensure that:');
  console.error('1. MongoDB is installed and running locally');
  console.error('2. The MongoDB URI in .env is correct');
  console.error('3. MongoDB is listening on the default port (27017)');
  process.exit(1);
});