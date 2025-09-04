# Company Hiring Platform

# Company Hiring Platform

A comprehensive full-stack hiring and student assessment platform with a modern admin dashboard, built using React.js, Express/Node.js, MongoDB, and Tailwind CSS. This platform enables secure user registration, multiple test types, real-time assessment tracking, and detailed analytics through an admin interface.

***

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Adding New Features](#adding-new-features)
- [Database Schemas](#database-schemas)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

***

## Project Overview

The Company Hiring Platform is designed to streamline the recruitment and assessment process for undergraduate students. It offers a user-friendly interface for students to register and complete various assessments including multiple choice questions (MCQ), coding tests, and paragraph answers. An extensive admin dashboard provides secure authentication and powerful tools to manage questions, students, and to view detailed test analytics with interactive charts.

The platform uses JWT for secure authentication, supports bulk question uploads through CSV files, and integrates email functionality for communicating with students.

***

## Features

### Admin Dashboard
- Secure login with JWT authentication
- Results analytics with interactive charts via Chart.js
- Test questions management including bulk CSV upload
- Student management with registration overview and bulk email capabilities
- Responsive, full-screen layout using Tailwind CSS

### Student Portal
- User registration and authentication
- Multiple assessment types: MCQ, coding, and paragraph
- Real-time test progress and score tracking

***

## Tech Stack

| Layer        | Technologies                          |
|--------------|------------------------------------|
| Frontend     | React.js, React Router DOM, Tailwind CSS, Chart.js |
| Backend      | Node.js, Express.js                  |
| Database     | MongoDB with Mongoose                |
| Authentication | JWT (JSON Web Tokens), bcrypt for password hashing |
| File Upload  | Multer for handling CSV uploads     |
| Email        | Nodemailer for bulk email            |

***

## Project Structure

```
Company-Hiring-Platform/
├── backend/
│   └── server.js              # Express server with API routes and middleware
├── src/
│   ├── components/            # React components for UI
│   │   ├── AdminDashboard.js    # Main admin dashboard shell
│   │   ├── AdminResults.js      # Results analytics dashboard
│   │   ├── AdminTestQuestions.js # Question management panel
│   │   ├── AdminStudents.js     # Student list and management dashboard
│   │   ├── LandingPage.js       # Public landing page
│   │   ├── LoginPage.js         # Login page for users and admins
│   │   └── Dashboard.js         # Student dashboard for assessments
│   ├── App.js                 # App routing setup
│   ├── index.css              # Global styles including Tailwind CSS
│   └── index.js               # React app entrypoint
├── public/
│   └── index.html             # Static HTML entrypoint
├── package.json               # Project dependencies and scripts
└── tailwind.config.js         # Tailwind CSS configuration
```

***

## Installation & Setup

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd Company-Hiring-Platform
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Create `.env` file** in the root directory with these environment variables:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.sx83e.mongodb.net/hiring_platform
   JWT_SECRET=your-secret-key-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   PORT=5001
   ```

4. **Create Default Admin Account**
   - Start the backend server:
     ```
     npm run server
     ```
   - In another terminal, create default admin user:
     ```
     curl -X POST http://localhost:5001/api/admin/create-default
     ```
   - Default admin credentials:
     - Admin ID: `admin`
     - Password: `admin123`

5. **Start the application**
   - Run both frontend and backend concurrently:
     ```
     npm run dev
     ```
   - Or run separately:
     ```
     npm run server    # Backend only
     npm start         # Frontend only
     ```

***

## Usage

- Admin Login: Navigate to `/admin/login` and enter the credentials.
- Admin Dashboard Sections:
  - Results overview: `/admin/dashboard`
  - Manage Test Questions: `/admin/dashboard/test-questions`
  - Manage Students: `/admin/dashboard/students`
- Student Registration and Login: Accessible via public landing page and login routes.
- Students can attempt various tests, and their scores are tracked in real time.

***

## Security Features

- Passwords are securely hashed using bcrypt before database storage.
- JWT-based authentication protects both user and admin routes.
- Server-side input validations prevent malformed or malicious data.
- File upload endpoints restrict allowed file types and sizes.
- Session tokens are securely managed and expiration handled.
- Anti-cheating mechanisms included in assessment modules (detailed in code).

***

## API Endpoints

### Admin Routes
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/create-default` - Create default admin user
- `GET /api/admin/results` - Fetch assessment results
- `GET /api/admin/questions` - Retrieve all questions
- `POST /api/admin/upload-questions` - Upload bulk questions via CSV
- `GET /api/admin/students` - List all registered students
- `POST /api/admin/send-mail` - Send bulk emails to students

### User Routes
- `POST /api/signup` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Fetch authenticated user profile
- `PUT /api/user/profile` - Update user profile

***

## Adding New Features

To extend the platform:
1. Create or update React components inside `src/components/`.
2. Add or modify application routes in `src/App.js` using React Router.
3. Implement new backend API endpoints or update existing ones in `backend/server.js`.
4. Adjust or create new MongoDB schemas as required.
5. Use Tailwind CSS utility classes for consistent styling.

***

## Database Schemas

- **User**: Stores student registration and profile details.
- **Admin**: Stores admin authentication details.
- **Question**: Stores test questions of various types (MCQ, Coding, Paragraph).
- **Result**: Stores assessment results and associated metadata.

***

## Troubleshooting

- Ensure correct MongoDB URI in `.env`.
- Verify Gmail app password configuration for email features.
- Confirm CSV file format compliance for question uploads.
- Check JWT_SECRET correctness to avoid authentication errors.
- Monitor console for runtime errors and database connection logs.

***

## Contributing

Contributions are welcome! Please:
1. Fork the repository.
2. Create a new feature branch.
3. Make your changes with proper testing.
4. Submit a pull request describing your changes.

***

## License

This project is licensed under the MIT License.

***

## About

This platform is designed specifically to test undergraduate students efficiently and securely, providing streamlined assessment and administrative tools.

***

This README aims to provide a clear and detailed overview of the project, its structure, features, and usage for developers and stakeholders alike.

[1](https://github.com/Daksh-9/Company-Hiring-Platform)
