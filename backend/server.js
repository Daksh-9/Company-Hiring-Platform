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
const pdf = require('pdf-parse'); // Add this line

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
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

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Helper function to parse questions from a PDF text
function parseQuestionsFromText(text) {
  // NOTE: This is a placeholder. You must customize this function
  // to match the specific format of your PDF questions.
  const questions = [];
  const lines = text.split('\n');
  let currentQuestion = null;

  for (const line of lines) {
    if (line.match(/^\d+\.\s/)) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: line.trim().substring(line.indexOf('.') + 1).trim(),
        options: [],
        correctAnswer: '',
        testType: 'MCQ'
      };
    } else if (currentQuestion && line.match(/^[A-D]\)/)) {
      currentQuestion.options.push(line.trim().substring(line.indexOf(')') + 1).trim());
    } else if (currentQuestion && line.match(/^Answer:\s*([A-D])/)) {
      currentQuestion.correctAnswer = line.match(/^Answer:\s*([A-D])/)[1];
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions.map(q => ({
    question: q.question,
    optionA: q.options[0],
    optionB: q.options[1],
    optionC: q.options[2],
    optionD: q.options[3],
    correctAnswer: q.correctAnswer,
    testType: q.testType
  }));
}

// API Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            phone, 
            collegeName,
            branch,
            yearOfStudy,
            rollNumber
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        console.log('🔍 Checking if user already exists...');
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }
        console.log('👤 Creating new user...');
        // Create new user with all fields
        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            collegeName,
            branch,
            yearOfStudy,
            rollNumber,
            password: 'Student@123', // Set a default password on signup
            terms: true
        });

        console.log('💾 Saving user to database...');
        await newUser.save();
        console.log('✅ User saved successfully!');
        console.log('📊 User ID:', newUser._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                collegeName: newUser.collegeName,
                branch: newUser.branch,
                yearOfStudy: newUser.yearOfStudy,
                rollNumber: newUser.rollNumber
            }
        });

    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
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

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email
            }
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

        const token = jwt.sign({ adminID: admin.adminID }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            adminID: admin.adminID
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get admin results
app.get('/api/admin/results', authenticateToken, async (req, res) => {
    try {
        const results = await Result.find().populate('studentId', 'firstName lastName email');
        res.json({ results });
    } catch (error) {
        console.error('Error fetching results:', error);
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

// New DELETE endpoint to delete all questions of a specific type
app.delete('/api/admin/questions/delete-by-type/:testType', authenticateToken, async (req, res) => {
  try {
    const { testType } = req.params;
    const result = await Question.deleteMany({ testType });
    res.json({ message: `Successfully deleted ${result.deletedCount} questions of type ${testType}` });
  } catch (error) {
    console.error('Error deleting questions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// New DELETE endpoint to delete a single question by its ID
app.delete('/api/admin/questions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Question.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload questions via CSV
app.post('/api/admin/upload-questions', authenticateToken, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Check if the request is to replace existing questions
    const { replace } = req.query;
    if (replace === 'true') {
      console.log('🔄 Deleting existing CSV questions before upload...');
      await Question.deleteMany({ testType: 'MCQ' }); // Assuming CSVs are for MCQ
    }

    const questions = [];
    const results = [];

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

// Add a new API route for PDF uploads
app.post('/api/admin/upload-pdf-questions', authenticateToken, upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if the request is to replace existing questions
    const { replace } = req.query;
    if (replace === 'true') {
      console.log('🔄 Deleting existing PDF questions before upload...');
      await Question.deleteMany({ testType: 'MCQ' }); // Assuming PDFs are for MCQ
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);

    const parsedQuestions = parseQuestionsFromText(data.text);

    await Question.insertMany(parsedQuestions);
    fs.unlinkSync(req.file.path); // Delete the temp file
    res.json({
      message: `Successfully uploaded ${parsedQuestions.length} questions`,
      count: parsedQuestions.length
    });
  } catch (error) {
    console.error('Error uploading PDF questions:', error);
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

// Add a new API route to fetch questions for a specific test type
app.get('/api/user/questions/:testType', authenticateToken, async (req, res) => {
    try {
        const { testType } = req.params;
        const questions = await Question.find({ testType }).limit(25); // Limit to 25 questions as per your MCQTest component
        res.json({ questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
