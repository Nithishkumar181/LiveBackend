# Hotel Booking System Backend

A secure and scalable backend system for hotel room booking management.

## Quick Start

1. Install MongoDB locally or get a MongoDB Atlas connection string
2. Clone the repository
3. Install dependencies:
```bash
npm install
```
4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other configurations
```
5. Run the setup script:
```bash
npm run setup
```
6. Start the development server:
```bash
npm run dev
```

## Prerequisites

- Node.js v14 or higher
- MongoDB v4.4 or higher
- npm v6 or higher

## Setup Instructions

### 1. MongoDB Setup

#### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use default URI: `mongodb://localhost:27017/roomBooking`

#### MongoDB Atlas
1. Create a free account at MongoDB Atlas
2. Create a new cluster
3. Get your connection string
4. Update MONGODB_URI in .env

### 2. Environment Variables

Create a .env file with the following variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
```

### 3. Installation & Setup

```bash
# Install dependencies
npm install

# Run setup script (creates test user and verifies setup)
npm run setup

# Verify database connection
npm run checkdb
```

### 4. Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start

# Debug mode
npm run debug
```

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/admin-login` - User login
- GET `/api/protected` - Protected route example

### Bookings
- GET `/api/bookings` - Get all bookings
- GET `/api/booking/:room_id` - Get specific booking
- POST `/api/add-booking` - Create new booking
- PUT `/api/update-booking/:room_id` - Update booking
- DELETE `/api/delete-booking/:room_id` - Delete booking

## Security Features

1. Authentication:
   - JWT token-based authentication
   - Password hashing using bcrypt
   - Protected routes middleware
   - Token expiration

2. Data Validation:
   - Input validation
   - MongoDB schema validation
   - Request sanitization
   - Error handling

3. API Security:
   - CORS configuration
   - Rate limiting (TODO)
   - Request validation
   - Error handling middleware

## Troubleshooting

### Common Issues

1. MongoDB Connection Errors
```
Error: MongoDB connection error
```
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Run `npm run checkdb` for detailed diagnostics

2. JWT Errors
```
Error: Invalid token
```
- Check JWT_SECRET in .env
- Verify token in Authorization header
- Check token expiration

3. CORS Errors
```
Access-Control-Allow-Origin error
```
- Verify CORS_ORIGIN in .env
- Check frontend URL matches CORS configuration
- Ensure proper headers in requests

### Debug Mode

For detailed logging:
```bash
npm run debug
```

## Error Handling

The API uses a consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Monitoring

- Health check endpoint: GET `/health`
- MongoDB connection status
- Application status
- Environment information

## Future Improvements

1. Add rate limiting
2. Implement refresh tokens
3. Add logging system
4. Add API documentation using Swagger
5. Add unit tests and integration tests
6. Implement caching
7. Add request validation middleware
8. Implement soft delete for bookings