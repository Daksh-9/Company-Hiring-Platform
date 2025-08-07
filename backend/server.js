require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

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
        if (!firstName || !lastName || !email || !phone || !collegeName || !branch || !yearOfStudy || !rollNumber) {
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
            terms: true
        });

        console.log('💾 Saving user to database...');
        await newUser.save();
        console.log('✅ User saved successfully!');
        console.log('📊 User ID:', newUser._id);
        // console.log('🎓 Student details:', {
        //     collegeName: newUser.collegeName,
        //     branch: newUser.branch,
        //     yearOfStudy: newUser.yearOfStudy,
        //     rollNumber: newUser.rollNumber
        // });

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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 