// backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const csv = require('csv-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const crypto = require('crypto'); // Keep for password generation
const axios = require('axios');


const app = express();
const PORT = process.env.PORT || 5001;

// Judge0 API Configuration
const JUDGE0_API_BASE_URL = 'http://172.25.202.101:2358';

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your frontend
    credentials: true // Allow cookies to be sent and received
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dbuser:Vivek123@cluster0.sx83e.mongodb.net/hiring_platform';

console.log('🔗 Attempting to connect to MongoDB Atlas...');
console.log('📍 Using MongoDB Atlas cluster: cluster0.sx83e.mongodb.net');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Database: hiring_platform');
    console.log('👥 Collection: users');
    console.log('🌐 You can now view data in MongoDB Compass');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n💡 To fix this:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. For Windows: Start MongoDB service or run mongod');
    console.log('3. For Mac/Linux: brew services start mongodb-community');
    console.log('4. Or use MongoDB Atlas (cloud) - see README.md for instructions');
});

// User Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    collegeName: {
        type: String,
        trim: true
    },
    branch: {
        type: String,
        trim: true
    },
    yearOfStudy: {
        type: String,
        trim: true
    },
    rollNumber: {
        type: String,
        trim: true
    },
    terms: {
        type: Boolean,
        required: true
    },
    password: { // Add a password field for student login
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paragraphScore: {
        type: Number,
        default: null
    }
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', userSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
    adminID: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Admin = mongoose.model('Admin', adminSchema);

// Question Schema
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    optionA: String,
    optionB: String,
    optionC: String,
    optionD: String,
    correctAnswer: String,
    testType: {
        type: String,
        enum: ['MCQ', 'Coding', 'Paragraph'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Question = mongoose.model('Question', questionSchema);


// Coding Question Schema
const codingQuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    },
    timeLimit: {
        type: Number, // in seconds
        default: 30
    },
    memoryLimit: {
        type: Number, // in KB
        default: 256000
    },
    testCases: [{
        input: {
            type: String,
            required: true
        },
        expectedOutput: {
            type: String,
            required: true
        },
        isHidden: {
            type: Boolean,
            default: false
        }
    }],
    starterCode: {
        python: String,
        c: String,
        cpp: String,
        java: String,
        javascript: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CodingQuestion = mongoose.model('CodingQuestion', codingQuestionSchema);


// Paragraph Question Schema
const paragraphQuestionSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true
    },
    maxScore: {
        type: Number,
        default: 100
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ParagraphQuestion = mongoose.model('ParagraphQuestion', paragraphQuestionSchema);


// Paragraph Result Schema
const paragraphResultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParagraphQuestion', required: true },
    paragraphText: { type: String },
    totalWords: { type: Number },
    totalErrors: { type: Number },
    errorPercent: { type: Number },
    scorePercent: { type: Number },
    result: { type: String, enum: ['Pass', 'Fail'] },
    errorsByType: { type: Object, default: {} },
    score: { type: Number, required: true },
    pass: { type: Boolean, required: true },
    date: { type: Date, default: Date.now }
});

const ParagraphResult = mongoose.model('ParagraphResult', paragraphResultSchema);

// Result Schema
const resultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    testType: {
        type: String,
        enum: ['MCQ', 'Coding', 'Paragraph'],
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

const Result = mongoose.model('Result', resultSchema);

// Coding Submission Schema
const codingSubmissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodingQuestion',
        required: true
    },
    sourceCode: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    languageId: {
        type: Number,
        required: true
    },
    testResults: [{
        testCaseIndex: Number,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        executionTime: Number,
        memoryUsed: Number,
        error: String
    }],
    overallResult: {
        totalTestCases: Number,
        passedTestCases: Number,
        failedTestCases: Number,
        score: Number, // percentage
        executionTime: Number,
        memoryUsed: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'Running', 'Completed', 'Failed'],
        default: 'Pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const CodingSubmission = mongoose.model('CodingSubmission', codingSubmissionSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        // Fallback to checking cookies for student routes if needed
        const cookieToken = req.cookies.token;
        if (!cookieToken) {
            return res.status(401).json({ message: 'Access token required' });
        }
        // If cookie token exists, verify it and proceed
        jwt.verify(cookieToken, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }
            req.user = user;
            next();
        });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Email transporter (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration at startup for clearer diagnostics
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP configuration error:', error.message);
        console.error('💡 Ensure EMAIL_USER and EMAIL_PASS (App Password) are set in .env');
    } else {
        console.log('✅ SMTP transporter is ready to send emails');
    }
});

// API Routes (backend)
// Function to generate a random alphanumeric string
function generateRandomString(length) {
    // Using crypto for better randomness and including alphanumeric characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    // Generate cryptographically secure random bytes
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        // Map each byte to a character in the allowed set
        result += characters.charAt(randomBytes[i] % charactersLength);
    }
    return result;
}


// API Routes (backend)
app.post('/api/signup', async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, collegeName, branch,
            yearOfStudy, rollNumber
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !collegeName || !branch || !yearOfStudy || !rollNumber) {
             console.log('❌ Missing required fields');
            return res.status(400).json({ success: false, message: 'All registration fields are required.' });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
             console.log('❌ Invalid email format');
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }
         console.log('🔍 Checking if user already exists...');
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        // --- Generate unique password ---
        // Take first 4 letters of the first name, lowercase
        const namePart = firstName.substring(0, 4).toLowerCase();
        // Pad with 'x' if name is shorter than 4 letters
        const paddedNamePart = namePart.padEnd(4, 'x');
        // Generate 6 random alphanumeric characters
        const randomPart = generateRandomString(6);
        // Combine parts to form the password
        const generatedPassword = `${paddedNamePart}${randomPart}`;
        // Log the plain password (consider removing in production)
        console.log(`🔑 Generated password for ${email}: ${generatedPassword}`);
        // --- End Generate unique password ---


        console.log('👤 Creating new user...');
        const newUser = new User({
            firstName, lastName, email, phone, collegeName, branch,
            yearOfStudy, rollNumber,
            password: generatedPassword, // Pass the PLAIN password here
            terms: true // Assuming terms are agreed upon
        });

        console.log('💾 Saving user to database (password will be hashed now)...');
        await newUser.save(); // Hashing occurs automatically via the pre-save hook
        console.log('✅ User saved successfully!');
        console.log('📊 User ID:', newUser._id);


        // Send welcome email with the PLAIN generated credentials
        try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Welcome to the Hiring Platform!',
                    // Use the plain generatedPassword variable here
                    text: `Hello ${firstName},\n\nWelcome! Your account has been created.\n\nEmail: ${email}\nPassword: ${generatedPassword}\n\nPlease log in and change your password soon.\n\nBest regards,\nThe Team`,
                    html: `<p>Hello ${firstName},</p><p>Welcome! Your account has been created.</p><p><b>Email:</b> ${email}</p><p><b>Password:</b> ${generatedPassword}</p><p>Please log in and change your password soon.</p><p>Best regards,<br>The Team</p>`
                });
                console.log(`✉️ Welcome email sent to ${email}`);
            } catch (emailError) {
                console.error(`❌ Error sending welcome email to ${email}:`, emailError);
                // Log the error but proceed with the registration success response
            }


        res.status(201).json({
            success: true,
            message: 'User registered successfully. Credentials have been sent via email.',
            user: { id: newUser._id, firstName: newUser.firstName }
        });

    } catch (error) {
        console.error('❌ Signup error:', error);
        if (error.code === 11000) { // Handle potential duplicate email error
             res.status(400).json({
                 success: false,
                 message: 'Email already exists.'
             });
        } else { // Handle other potential errors during save or processing
             res.status(500).json({
                 success: false,
                 message: 'Internal server error during registration.'
             });
        }
    }
});

// Student Login Route
app.post('/api/user/login', async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            return res.status(400).json({ message: 'User ID (email) and password are required' });
        }

        const user = await User.findOne({ email: userId });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the hashed password in the database
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email, role: 'student' }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email
            },
            token: token
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get Student Profile Route (Protected)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userProfile = await User.findById(req.user.userId).select('-password');
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update Student Profile Route (Protected)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const updatedProfile = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true, runValidators: true }).select('-password');
        if (!updatedProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully', user: updatedProfile });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// NEW: Get student's MCQ/Paragraph results
app.get('/api/results', authenticateToken, async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.user.userId })
            .sort({ completedAt: -1 });
        
        res.json({ results });
    } catch (error) {
        console.error('Error fetching student general results:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// NEW PROTECTED ROUTE FOR FETCHING QUESTIONS
app.get('/api/questions/:testType', authenticateToken, async (req, res) => {
    try {
        const { testType } = req.params;
        const questions = await Question.find({ testType });
        res.json({ questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// NEW PROTECTED ROUTE FOR SAVING TEST RESULTS
app.post('/api/test-result', authenticateToken, async (req, res) => {
    try {
        const { testType, score, totalQuestions } = req.body;
        const newResult = new Result({
            studentId: req.user.userId,
            testType,
            score,
            totalQuestions
        });
        await newResult.save();
        res.status(201).json({ message: 'Result saved successfully', result: newResult });
    } catch (error) {
        console.error('Error saving test result:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Student Coding Questions
app.get('/api/coding-questions', authenticateToken, async (req, res) => {
    try {
        const questions = await CodingQuestion.find().select('-testCases.isHidden');
        res.json({ questions });
    } catch (error) {
        console.error('Error fetching coding questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/coding-questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const question = await CodingQuestion.findById(id).select('-testCases.isHidden');
        
        if (!question) {
            return res.status(404).json({ message: 'Coding question not found' });
        }
        
        res.json({ question });
    } catch (error) {
        console.error('Error fetching coding question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Judge0 Code Execution Route
app.post('/api/run', authenticateToken, async (req, res) => {
    try {
        const { source_code, language_id, stdin } = req.body;

        // Validate required fields
        if (!source_code || !language_id) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: source_code and language_id are required'
            });
        }

        console.log('🚀 Executing code with Judge0...');
        console.log('📝 Language ID:', language_id);
        console.log('📄 Source code length:', source_code.length);

        // Prepare submission data for Judge0
        const submissionData = {
            source_code: source_code,
            language_id: parseInt(language_id),
            stdin: stdin || '',
            base64_encoded: false
        };

        // Send request to Judge0 API
        const response = await axios.post(
            `${JUDGE0_API_BASE_URL}/submissions?base64_encoded=false&wait=true`,
            submissionData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000 // 30 second timeout
            }
        );

        console.log('✅ Judge0 execution completed');
        console.log('📊 Status:', response.data.status?.description || 'Unknown');

        // Return Judge0 response with all execution details
        res.json({
            success: true,
            stdout: response.data.stdout || '',
            stderr: response.data.stderr || '',
            compile_output: response.data.compile_output || '',
            status: response.data.status || {},
            time: response.data.time || '',
            memory: response.data.memory || ''
        });

    } catch (error) {
        console.error('❌ Code execution error:', error.message);
        
        // Handle different types of errors
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                error: 'Judge0 service is unavailable',
                message: 'Code execution service is currently down. Please try again later.'
            });
        }
        
        if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                success: false,
                error: 'Request timeout',
                message: 'Code execution took too long. Please try with simpler code.'
            });
        }

        if (error.response) {
            // Judge0 API returned an error
            return res.status(error.response.status).json({
                success: false,
                error: 'Judge0 API error',
                message: error.response.data?.message || 'Code execution failed',
                details: error.response.data
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred during code execution'
        });
    }
});

// Submit and Test Code Solution
app.post('/api/submit-code', authenticateToken, async (req, res) => {
    try {
        const { questionId, sourceCode, language, languageId } = req.body;
        
        // Get the coding question with all test cases
        const question = await CodingQuestion.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Coding question not found' });
        }
        
        // Create submission record
        const submission = new CodingSubmission({
            studentId: req.user.userId,
            questionId,
            sourceCode,
            language,
            languageId,
            status: 'Running'
        });
        await submission.save();
        
        // Test against all test cases
        const testResults = [];
        let passedTestCases = 0;
        let totalExecutionTime = 0;
        let maxMemoryUsed = 0;
        
        for (let i = 0; i < question.testCases.length; i++) {
            const testCase = question.testCases[i];
            
            try {
                // Execute code with test case input
                const response = await axios.post(
                    `${JUDGE0_API_BASE_URL}/submissions?base64_encoded=false&wait=true`,
                    {
                        source_code: sourceCode,
                        language_id: languageId,
                        stdin: testCase.input,
                        base64_encoded: false
                    },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: question.timeLimit * 1000
                    }
                );
                
                const actualOutput = response.data.stdout?.trim() || '';
                const expectedOutput = testCase.expectedOutput.trim();
                const passed = actualOutput === expectedOutput;
                
                if (passed) passedTestCases++;
                
                testResults.push({
                    testCaseIndex: i,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: actualOutput,
                    passed: passed,
                    executionTime: parseFloat(response.data.time) || 0,
                    memoryUsed: parseInt(response.data.memory) || 0,
                    error: response.data.stderr || response.data.compile_output || ''
                });
                
                totalExecutionTime += parseFloat(response.data.time) || 0;
                maxMemoryUsed = Math.max(maxMemoryUsed, parseInt(response.data.memory) || 0);
                
            } catch (error) {
                testResults.push({
                    testCaseIndex: i,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: '',
                    passed: false,
                    executionTime: 0,
                    memoryUsed: 0,
                    error: error.message || 'Execution failed'
                });
            }
        }
        
        // Calculate overall result
        const score = Math.round((passedTestCases / question.testCases.length) * 100);
        const overallResult = {
            totalTestCases: question.testCases.length,
            passedTestCases: passedTestCases,
            failedTestCases: question.testCases.length - passedTestCases,
            score: score,
            executionTime: totalExecutionTime,
            memoryUsed: maxMemoryUsed
        };
        
        // Update submission with results
        submission.testResults = testResults;
        submission.overallResult = overallResult;
        submission.status = 'Completed';
        await submission.save();
        
        res.json({
            success: true,
            submissionId: submission._id,
            testResults: testResults,
            overallResult: overallResult,
            realTimeFeedback: {
                passed: passedTestCases,
                total: question.testCases.length,
                score: score,
                status: score === 100 ? 'All tests passed!' : `${passedTestCases}/${question.testCases.length} tests passed`
            }
        });
        
    } catch (error) {
        console.error('Error submitting code:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error processing code submission',
            error: error.message 
        });
    }
});

// Get coding submissions for admin
app.get('/api/admin/coding-submissions', authenticateToken, async (req, res) => {
    try {
        const submissions = await CodingSubmission.find()
            .populate('studentId', 'firstName lastName email')
            .populate('questionId', 'title difficulty')
            .sort({ submittedAt: -1 });
        
        res.json({ submissions });
    } catch (error) {
        console.error('Error fetching coding submissions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get student's coding submissions
app.get('/api/coding-submissions', authenticateToken, async (req, res) => {
    try {
        const submissions = await CodingSubmission.find({ studentId: req.user.userId })
            .populate('questionId', 'title difficulty')
            .sort({ submittedAt: -1 });
        
        res.json({ submissions });
    } catch (error) {
        console.error('Error fetching student coding submissions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Admin Routes
app.post('/api/admin/login', async (req, res) => {
    try {
        const { adminID, password } = req.body;

        if (!adminID || !password) {
            return res.status(400).json({ message: 'Admin ID and password are required' });
        }

        const admin = await Admin.findOne({ adminID });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const token = jwt.sign({ adminID: admin.adminID, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            adminID: admin.adminID,
            token: token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// REMOVED /api/admin/send-invite route

// Get admin results (COMBINED)
app.get('/api/admin/results', authenticateToken, async (req, res) => {
    try {
        const studentPopulationFields = 'firstName lastName email collegeName branch yearOfStudy';

        // 1. Fetch results from the standard Result collection (MCQ, Paragraph)
        const standardResults = await Result.find()
            .populate('studentId', studentPopulationFields)
            .lean(); // Use .lean() for plain JS objects

        // 2. Fetch results from the CodingSubmission collection
        const codingSubmissions = await CodingSubmission.find({ 
                status: 'Completed', 
                "overallResult.score": { $exists: true } 
            })
            .populate('studentId', studentPopulationFields)
            .lean(); // Use .lean()

        // 3. Normalize coding submissions to match the standard Result format
        const normalizedCodingResults = codingSubmissions.map(submission => {
            return {
                _id: submission._id, // Use submission ID
                studentId: submission.studentId,
                testType: 'Coding', // Manually set testType
                score: submission.overallResult?.score || 0,
                
                // --- Add fields needed by TestTypeResults.js for its coding-specific table ---
                totalQuestions: 1, // Represents 1 coding problem submitted
                questionsAttempted: 1,
                testCases: submission.overallResult?.totalTestCases || 0,
                passedTestCases: submission.overallResult?.passedTestCases || 0,
                
                completedAt: submission.submittedAt
            };
        });
        
        // 4. Combine and send
        const allResults = [...standardResults, ...normalizedCodingResults];

        // Sort all results by date, newest first
        allResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        res.json({ results: allResults });

    } catch (error) {
        console.error('Error fetching all results:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get admin questions
app.get('/api/admin/questions', authenticateToken, async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.json({ questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete all MCQ questions only
app.delete('/api/admin/mcq-questions', authenticateToken, async (req, res) => {
    try {
        const result = await Question.deleteMany({ testType: 'MCQ' });
        console.log(`✅ Deleted ${result.deletedCount} MCQ questions.`);
        res.json({ message: `Successfully deleted ${result.deletedCount} MCQ questions.` });
    } catch (error) {
        console.error('Error deleting MCQ questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin Coding Questions Management
app.get('/api/admin/coding-questions', authenticateToken, async (req, res) => {
    try {
        const questions = await CodingQuestion.find().sort({ createdAt: -1 });
        res.json({ questions });
    } catch (error) {
        console.error('Error fetching coding questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/admin/coding-questions', authenticateToken, async (req, res) => {
    try {
        const { title, description, difficulty, timeLimit, memoryLimit, testCases, starterCode } = req.body;
        
        const newQuestion = new CodingQuestion({
            title,
            description,
            difficulty,
            timeLimit,
            memoryLimit,
            testCases,
            starterCode
        });
        
        await newQuestion.save();
        res.status(201).json({ message: 'Coding question created successfully', question: newQuestion });
    } catch (error) {
        console.error('Error creating coding question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/admin/coding-questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedQuestion = await CodingQuestion.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Coding question not found' });
        }
        
        res.json({ message: 'Coding question updated successfully', question: updatedQuestion });
    } catch (error) {
        console.error('Error updating coding question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/admin/coding-questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedQuestion = await CodingQuestion.findByIdAndDelete(id);
        
        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Coding question not found' });
        }
        
        res.json({ message: 'Coding question deleted successfully' });
    } catch (error) {
        console.error('Error deleting coding question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: delete all coding questions
app.delete('/api/admin/coding-questions', authenticateToken, async (req, res) => {
    try {
        const result = await CodingQuestion.deleteMany({});
        res.json({ message: `Deleted ${result.deletedCount} coding questions` });
    } catch (error) {
        console.error('Error deleting all coding questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Upload coding questions via CSV
app.post('/api/admin/upload-coding-questions', authenticateToken, upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const questions = [];
        const errors = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                try {
                    // Extract test cases from the CSV row
                    const testCases = [];
                    let testCaseIndex = 1;
                    
                    // Look for input/expected_output pairs
                    while (data[`input${testCaseIndex}`] && data[`expected_output${testCaseIndex}`]) {
                        testCases.push({
                            input: data[`input${testCaseIndex}`].trim(),
                            expectedOutput: data[`expected_output${testCaseIndex}`].trim(),
                            isHidden: false
                        });
                        testCaseIndex++;
                    }

                    if (testCases.length === 0) {
                        errors.push(`Row with title "${data.title}" has no test cases`);
                        return;
                    }

                    // Create starter code based on language_id
                    const languageId = parseInt(data.language_id);
                    const starterCode = {
                        python: languageId === 71 ? `def solution():\n    # Your code here\n    pass` : '',
                        c: languageId === 50 ? `#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}` : '',
                        cpp: languageId === 54 ? `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}` : '',
                        java: languageId === 62 ? `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}` : '',
                        javascript: languageId === 63 ? `function solution() {\n    // Your code here\n}` : ''
                    };

                    const question = new CodingQuestion({
                        title: data.title.trim(),
                        description: data.description.trim(),
                        difficulty: data.difficulty || 'Easy',
                        timeLimit: 30,
                        memoryLimit: 256000,
                        testCases: testCases,
                        starterCode: starterCode
                    });
                    
                    questions.push(question);
                } catch (error) {
                    errors.push(`Error processing row with title "${data.title}": ${error.message}`);
                }
            })
            .on('end', async () => {
                try {
                    if (questions.length === 0) {
                        fs.unlinkSync(req.file.path);
                        return res.status(400).json({ 
                            message: 'No valid questions found in CSV',
                            errors: errors
                        });
                    }

                    await CodingQuestion.insertMany(questions);
                    fs.unlinkSync(req.file.path); // Delete uploaded file
                    
                    res.json({
                        message: 'Coding questions uploaded successfully!',
                        count: questions.length,
                        errors: errors.length > 0 ? errors : undefined
                    });
                } catch (error) {
                    console.error('Error saving coding questions:', error);
                    res.status(500).json({ 
                        message: 'Error saving coding questions',
                        error: error.message 
                    });
                }
            })
            .on('error', (error) => {
                console.error('CSV parsing error:', error);
                res.status(500).json({ message: 'Error parsing CSV file' });
            });
    } catch (error) {
        console.error('Error uploading coding questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Upload paragraph questions via CSV (columns: topic, desc, maxScore)
app.post('/api/admin/upload-paragraph-questions', authenticateToken, upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const questions = [];
        const errors = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                try {
                    const topic = (data.topic || '').trim();
                    const desc = (data.desc || '').trim();
                    const maxScore = Number(data.maxScore || 100);
                    if (!topic || !desc) {
                        errors.push('Row missing required fields: topic or desc');
                        return;
                    }
                    questions.push(new ParagraphQuestion({ topic, desc, maxScore }));
                } catch (err) {
                    errors.push(`Error processing row: ${err.message}`);
                }
            })
            .on('end', async () => {
                try {
                    if (questions.length === 0) {
                        fs.unlinkSync(req.file.path);
                        return res.status(400).json({ message: 'No valid paragraph questions found in CSV', errors });
                    }
                    await ParagraphQuestion.insertMany(questions);
                    fs.unlinkSync(req.file.path);
                    res.json({ message: 'Paragraph questions uploaded successfully!', count: questions.length, errors: errors.length ? errors : undefined });
                } catch (error) {
                    console.error('Error saving paragraph questions:', error);
                    res.status(500).json({ message: 'Error saving paragraph questions', error: error.message });
                }
            })
            .on('error', (error) => {
                console.error('CSV parsing error:', error);
                res.status(500).json({ message: 'Error parsing CSV file' });
            });
    } catch (error) {
        console.error('Error uploading paragraph questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: list paragraph questions
app.get('/api/admin/paragraph-questions', authenticateToken, async (req, res) => {
    try {
        const questions = await ParagraphQuestion.find().sort({ createdAt: -1 });
        res.json({ questions });
    } catch (error) {
        console.error('Error fetching paragraph questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: delete one paragraph question
app.delete('/api/admin/paragraph-questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ParagraphQuestion.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Paragraph question not found' });
        }
        res.json({ message: 'Paragraph question deleted' });
    } catch (error) {
        console.error('Error deleting paragraph question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: delete all paragraph questions
app.delete('/api/admin/paragraph-questions', authenticateToken, async (req, res) => {
    try {
        const result = await ParagraphQuestion.deleteMany({});
        res.json({ message: `Deleted ${result.deletedCount} paragraph questions` });
    } catch (error) {
        console.error('Error deleting all paragraph questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Student: list paragraph questions (normalized shape for UI)
app.get('/api/paragraph-questions', authenticateToken, async (req, res) => {
    try {
        const questions = await ParagraphQuestion.find().sort({ createdAt: 1 });
        const normalized = questions.map((q) => ({
            id: String(q._id),
            title: q.topic,
            description: q.desc,
            wordLimit: 200,
            timeLimit: 25
        }));
        res.json(normalized);
    } catch (error) {
        console.error('Error fetching paragraph questions (student):', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Student: evaluate paragraph(s) via LanguageTool and save result
app.post('/api/evaluate-paragraph', authenticateToken, async (req, res) => {
    try {
        const { answers, studentId: studentIdBody, questionId, text } = req.body;
        const effectiveStudentId = studentIdBody || req.user.userId;

        const evaluateOne = async (contentText) => {
            const content = String(contentText || '');
            const words = content.trim().split(/\s+/).filter(Boolean);
            const wordCount = words.length || 1;

            const ltResponse = await axios.post('https://api.languagetool.org/v2/check',
                new URLSearchParams({ language: 'en-US', text: content }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
            );
            const matches = Array.isArray(ltResponse.data?.matches) ? ltResponse.data.matches : [];
            const errors = matches.length;
            const errorPercent = Math.max(0, Math.min(100, (errors / wordCount) * 100));
            const score = Math.max(0, Math.min(100, Math.round(100 - errorPercent)));
            const passed = score > 40;
            const errorsByType = { misspelling: 0, grammar: 0, style: 0, other: 0 };
            for (const m of matches) {
                const issueType = m?.rule?.issueType || m?.rule?.category?.id || '';
                const typeLower = String(issueType).toLowerCase();
                if (typeLower.includes('missp')) errorsByType.misspelling++;
                else if (typeLower.includes('gram')) errorsByType.grammar++;
                else if (typeLower.includes('style')) errorsByType.style++;
                else errorsByType.other++;
            }
            const resultLabel = passed ? 'Pass' : 'Fail';
            return { score, errors, wordCount, passed, errorPercent, scorePercent: score, resultLabel, errorsByType };
        };

        // Single submission path
        if (questionId && typeof text === 'string') {
            const evalRes = await evaluateOne(text);
            await new ParagraphResult({
                studentId: effectiveStudentId,
                questionId,
                paragraphText: text,
                totalWords: evalRes.wordCount,
                totalErrors: evalRes.errors,
                errorPercent: evalRes.errorPercent,
                scorePercent: evalRes.scorePercent,
                result: evalRes.resultLabel,
                errorsByType: evalRes.errorsByType,
                score: evalRes.score,
                pass: evalRes.passed
            }).save();

            await new Result({
                studentId: effectiveStudentId,
                testType: 'Paragraph',
                score: evalRes.score,
                totalQuestions: 1
            }).save();

            await User.findByIdAndUpdate(effectiveStudentId, { paragraphScore: evalRes.score });

            return res.json({
                success: true,
                score: evalRes.score,
                pass: evalRes.passed,
                total_errors: evalRes.errors,
                total_words: evalRes.wordCount,
                error_percent: evalRes.errorPercent,
                score_percent: evalRes.scorePercent,
                errors_by_type: evalRes.errorsByType,
                result: evalRes.resultLabel
            });
        }

        // Multiple answers path (compat for multi-prompt UI)
        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'No answers provided' });
        }

        const results = [];
        for (const ans of answers) {
            const r = await evaluateOne(ans.text);
            results.push({ promptId: ans.promptId, ...r });
            await new ParagraphResult({
                studentId: effectiveStudentId,
                questionId: ans.promptId,
                paragraphText: ans.text,
                totalWords: r.wordCount,
                totalErrors: r.errors,
                errorPercent: r.errorPercent,
                scorePercent: r.scorePercent,
                result: r.resultLabel,
                errorsByType: r.errorsByType,
                score: r.score,
                pass: r.passed
            }).save();
        }
        
        const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
        await new Result({ studentId: effectiveStudentId, testType: 'Paragraph', score: avgScore, totalQuestions: results.length }).save();
        await User.findByIdAndUpdate(effectiveStudentId, { paragraphScore: avgScore });
        
        return res.json({
            message: 'Paragraph test evaluated and saved',
            score: avgScore,
            details: results.map(r => ({
                promptId: r.promptId,
                errors: r.errors,
                wordCount: r.wordCount,
                errorPercent: r.errorPercent,
                scorePercent: r.scorePercent,
                result: r.resultLabel,
                errorsByType: r.errorsByType,
                score: r.score,
                passed: r.passed
            }))
        });
    } catch (error) {
        console.error('Error evaluating paragraph:', error.message || error);
        if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({ message: 'LanguageTool timeout. Try again.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Upload questions via CSV
app.post('/api/admin/upload-questions', authenticateToken, upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const questions = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                const question = new Question({
                    question: data.question,
                    optionA: data.optionA || '',
                    optionB: data.optionB || '',
                    optionC: data.optionC || '',
                    optionD: data.optionD || '',
                    correctAnswer: data.correctAnswer || '',
                    testType: data.testType
                });
                questions.push(question);
            })
            .on('end', async () => {
                try {
                    await Question.insertMany(questions);
                    fs.unlinkSync(req.file.path); // Delete uploaded file
                    res.json({
                        message: 'Questions uploaded successfully',
                        count: questions.length
                    });
                } catch (error) {
                    console.error('Error saving questions:', error);
                    res.status(500).json({ message: 'Error saving questions' });
                }
            });
    } catch (error) {
        console.error('Error uploading questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get admin students
app.get('/api/admin/students', authenticateToken, async (req, res) => {
    try {
        const students = await User.find().sort({ createdAt: -1 });
        res.json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Send mail to all students
app.post('/api/admin/send-mail', authenticateToken, async (req, res) => {
    try {
        const { subject, message, to } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Subject and message are required' });
        }

        // If a specific recipient is provided, send a single email
        if (to) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to,
                    subject,
                    text: message,
                    html: `<p>${String(message).replace(/\n/g, '<br>')}</p>`
                });
                return res.json({ success: true, sentCount: 1 });
            } catch (err) {
                console.error(`Error sending email to ${to}:`, err);
                return res.status(500).json({ success: false, message: 'Failed to send email' });
            }
        }

        // Otherwise, send to all students
        const students = await User.find({}, 'email firstName lastName');
        let sentCount = 0;

        for (const student of students) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: student.email,
                    subject,
                    text: `Dear ${student.firstName} ${student.lastName},\n\n${message}`,
                    html: `<p>Dear ${student.firstName} ${student.lastName},</p><p>${message.replace(/\n/g, '<br>')}</p>`
                });
                sentCount++;
            } catch (emailError) {
                console.error(`Error sending email to ${student.email}:`, emailError);
            }
        }

        return res.json({ success: true, sentCount });
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Test endpoint to manually add a user
app.post('/api/test-user', async (req, res) => {
    try {
        const testUser = new User({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '+1234567890',
            collegeName: 'Test College',
            branch: 'Test Branch',
            yearOfStudy: '1',
            rollNumber: 'TST123',
            password: 'testPassword123', // Add a password for the test user
            terms: true
        });

        await testUser.save();
        console.log('✅ Test user created:', testUser._id);
        res.json({ success: true, message: 'Test user created', userId: testUser._id });
    } catch (error) {
        console.error('❌ Test user creation failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create default admin account
app.post('/api/admin/create-default', async (req, res) => {
    try {
        const existingAdmin = await Admin.findOne({ adminID: 'admin' });
        if (existingAdmin) {
            return res.json({ message: 'Default admin already exists' });
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new Admin({
            adminID: 'admin',
            password: hashedPassword,
            email: 'admin@example.com'
        });

        await admin.save();
        res.json({ message: 'Default admin created successfully' });
    } catch (error) {
        console.error('Error creating default admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});