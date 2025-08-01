# Hiring Platform

A modern job hiring platform with MongoDB backend integration for user registration and management.

## Features

- **User Registration**: Complete signup form with MongoDB storage
- **Password Security**: Bcrypt hashing for secure password storage
- **Form Validation**: Real-time password strength and confirmation validation
- **Responsive Design**: Modern UI with mobile-friendly layout
- **User Types**: Support for Job Seekers, Employers, and Recruiters

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **MongoDB** (running locally or MongoDB Atlas connection)
- **npm** (comes with Node.js)

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install additional backend dependencies**:
   ```bash
   npm install express mongoose cors bcryptjs
   ```

4. **Set up MongoDB**:
   - **Option 1**: Install MongoDB locally
     - Download and install MongoDB Community Server
     - Start MongoDB service
   
   - **Option 2**: Use MongoDB Atlas (Cloud)
     - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
     - Create a cluster and get your connection string
     - Update the connection string in `server.js`

## Configuration

### MongoDB Connection

If using MongoDB Atlas, update the connection string in `server.js`:

```javascript
// Replace with your MongoDB Atlas connection string
mongoose.connect('mongodb+srv://username:password@cluster.mongodb.net/hiring_platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
```

## Running the Application

### Development Mode (Both Frontend and Backend)

```bash
npm run dev
```

This will start both the React frontend (port 3000) and the Node.js backend (port 3001).

### Backend Only

```bash
npm run server
```

### Frontend Only

```bash
npm start
```

## API Endpoints

### POST /api/signup
Registers a new user in the database.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword",
  "userType": "jobseeker",
  "newsletter": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "userType": "jobseeker"
  }
}
```

## Database Schema

### User Collection
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (required, hashed),
  userType: String (enum: ['jobseeker', 'employer', 'recruiter']),
  newsletter: Boolean (default: false),
  createdAt: Date (default: current timestamp)
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **Input Validation**: Server-side validation for all form fields
- **CORS Protection**: Configured for secure cross-origin requests
- **Error Handling**: Comprehensive error handling and user feedback

## File Structure

Company-Hiring-Platform/
├── 📁 backend/
│   └── server.js              # ✅ Node.js + MongoDB backend
├── 📁 src/
│   ├── 📁 components/
│   │   ├── SignupPage.js      # ✅ React signup (MongoDB connected)
│   │   ├── LoginPage.js       # ✅ React login
│   │   ├── LandingPage.js     # ✅ React landing
│   │   └── Dashboard.js       # ✅ React dashboard
│   ├── App.js                 # ✅ React routing
│   ├── App.css                # ✅ React styles
│   ├── index.js               # ✅ React entry point
│   └── index.css              # ✅ Global styles
├── 📁 public/
│   └── index.html             # ✅ React public HTML
├── package.json               # ✅ Updated scripts & dependencies
├── .gitignore                 # ✅ Comprehensive ignore rules
└── README.md                  # ✅ Documentation

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or Atlas connection string is correct
   - Check if the database name is correct

2. **Port Already in Use**
   - Change the port in `server.js` if port 3000 is occupied
   - Update the fetch URL in signup.html accordingly

3. **CORS Errors**
   - The backend is configured with CORS enabled
   - If issues persist, check browser console for specific errors

### Getting Help

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check the terminal for server-side errors
3. Ensure all dependencies are installed correctly
4. Verify MongoDB connection

## Contributing

Feel free to contribute to this project by:
- Adding new features
- Improving the UI/UX
- Fixing bugs
- Adding more validation rules
- Implementing additional security measures

## License

This project is open source and available under the MIT License. 