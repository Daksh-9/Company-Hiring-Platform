# Company Hiring Platform

A comprehensive hiring platform with an admin dashboard built using React, Express/Node.js, MongoDB, and Tailwind CSS.

## Features

### Admin Dashboard
- **Secure Login**: Admin authentication with JWT tokens
- **Results Analytics**: Interactive charts and graphs using Chart.js
- **Test Questions Management**: CSV upload functionality for bulk question import
- **Student Management**: View registered students and send bulk emails
- **Full-screen Layout**: Persistent full-height layout using `h-screen`; main content scrolls via `overflow-y-auto`
- **Responsive Design**: Modern UI with Tailwind CSS

### Student Features
- User registration and authentication
- Multiple test types (MCQ, Coding, Paragraph)
- Real-time assessment tracking

## Tech Stack

- **Frontend**: React.js, React Router, Chart.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for CSV processing
- **Email**: Nodemailer for bulk email functionality

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Company-Hiring-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.sx83e.mongodb.net/hiring_platform
   JWT_SECRET=your-secret-key-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   PORT=5001
   ```

4. **Create Default Admin Account**
   ```bash
   # Start the server first
   npm run server
   
   # In another terminal, create the default admin
   curl -X POST http://localhost:5001/api/admin/create-default
   ```
   
   Default admin credentials:
   - Admin ID: `admin`
   - Password: `admin123`

5. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start separately
   npm run server  # Backend only
   npm start       # Frontend only
   ```

## Usage

### Admin Access
1. Navigate to `/admin/login` and sign in.
2. After login, go to `/admin/dashboard`.
3. Dashboard sections (nested routes):
   - **Results**: index route at `/admin/dashboard`
   - **Test Questions**: `/admin/dashboard/test-questions`
   - **Students**: `/admin/dashboard/students`

Layout notes:
- The admin shell uses `h-screen` to fill the viewport and stays full-height across route changes.
- The main content area uses `overflow-y-auto` for scrolling.

### CSV Upload Format
For test questions, use this CSV format:
```csv
question,optionA,optionB,optionC,optionD,correctAnswer,testType
"What is the capital of France?","Paris","London","Berlin","Madrid","A","MCQ"
"Write a function to reverse a string","","","","","","Coding"
"Explain the concept of recursion","","","","","","Paragraph"
```

### Email Configuration
To enable bulk email functionality:
1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an App Password
4. Update the `.env` file with your credentials

## API Endpoints

### Admin Routes
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/create-default` - Create the default admin (`admin` / `admin123`)
- `GET /api/admin/results` - Get assessment results
- `GET /api/admin/questions` - Get all questions
- `POST /api/admin/upload-questions` - Upload questions via CSV
- `GET /api/admin/students` - Get all registered students
- `POST /api/admin/send-mail` - Send bulk emails to students

### User Routes
- `POST /api/signup` - User registration
- `POST /api/test-user` - Create test user (development)

## Project Structure

```
Company-Hiring-Platform/
├── backend/
│   └── server.js                 # Express server with all routes
├── src/
│   ├── components/
│   │   ├── AdminDashboard.js     # Main admin dashboard shell
│   │   ├── AdminResults.js       # Results
│   │   ├── AdminTestQuestions.js # Question management
│   │   ├── AdminStudents.js      # Student management
│   │   ├── LandingPage.js        # Public landing page
│   │   ├── LoginPage.js          # Login (used for admin and user)
│   │   └── Dashboard.js          # Student dashboard
│   ├── App.js                    # App routes
│   ├── index.css                 # Global styles (Tailwind included)
│   └── index.js
├── public/
│   └── index.html
├── package.json
└── tailwind.config.js
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Admin routes require valid JWT tokens
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Restricted file types and size limits

## Development

### Adding New Features
1. Create React components in `src/components/`
2. Add routes in `src/App.js` (React Router v6)
3. Create API endpoints in `backend/server.js`
4. Update MongoDB schemas as needed
5. Use Tailwind utility classes for consistent styling

### Database Schemas
- **User**: Student registration data
- **Admin**: Admin authentication data
- **Question**: Test questions with options
- **Result**: Assessment results and scores

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure your MongoDB URI is correct
2. **Email Not Sending**: Check Gmail app password configuration
3. **File Upload Fails**: Verify CSV format and file size
4. **JWT Errors**: Check JWT_SECRET in environment variables

### Logs
Check the console for detailed error messages and connection status.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.