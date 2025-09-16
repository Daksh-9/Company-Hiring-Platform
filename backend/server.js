// ---- Top of backend/server.js (replace this header) ----
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const csv = require('csv-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path'); // <-- declare 'path' ONCE, here

// Load env specifically from backend/.env (avoid CRA port conflicts)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ===== MongoDB Connect =====
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hiring_platform';

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// ===== Schemas & Models (inline so you don’t need separate files) =====
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone:     { type: String, required: true, trim: true },
  collegeName: { type: String, trim: true },
  branch:    { type: String, trim: true },
  yearOfStudy: { type: String, trim: true },
  rollNumber:  { type: String, trim: true },
  terms:     { type: Boolean, default: true },
  password:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
  next();
});
const User = mongoose.model('User', userSchema);

const adminSchema = new mongoose.Schema({
  adminID: { type: String, required: true, unique: true, trim: true },
  password:{ type: String, required: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  createdAt: { type: Date, default: Date.now }
});
const Admin = mongoose.model('Admin', adminSchema);

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctAnswer: { type: String, required: true, validate: v => /^[A-D]$/i.test(v) },
  testType: { type: String, enum: ['MCQ', 'Coding', 'Paragraph'], required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  explanation: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, default: 'admin' }
});
const Question = mongoose.model('Question', questionSchema);

const resultSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testType:    { type: String, enum: ['MCQ', 'Coding', 'Paragraph'], required: true },
  score:       { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number
  }],
  totalTimeTaken: { type: Number, default: 0 },
  completedAt:    { type: Date, default: Date.now }
});
const Result = mongoose.model('Result', resultSchema);

const testSessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testType:  { type: String, enum: ['MCQ', 'Coding', 'Paragraph'], required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  currentQuestionIndex: { type: Number, default: 0 },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: String // nullable => skipped
  }],
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  timeLimit: { type: Number, default: 60 }, // minutes
  isActive: { type: Boolean, default: true }
});
const TestSession = mongoose.model('TestSession', testSessionSchema);

// ===== JWT =====
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_ISSUER = 'hiring-platform';
const JWT_AUDIENCE = 'hiring-platform-users';

function signUserToken(user) {
  return jwt.sign(
    { sub: String(user._id), userId: String(user._id), email: user.email, type: 'student' },
    JWT_SECRET,
    { expiresIn: '24h', issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
  );
}
function signAdminToken(admin) {
  return jwt.sign(
    { sub: `admin:${admin.adminID}`, adminID: admin.adminID, type: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h', issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.split(' ')[0]?.toLowerCase() === 'bearer'
    ? authHeader.split(' ')[1]
    : null;
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE, clockTolerance: 5 }, (err, payload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = payload;
    req.userId = payload.userId || payload.sub || payload.id;
    next();
  });
}

function adminOnly(req, res, next) {
  if (req.user?.type === 'admin' || req.user?.adminID) return next();
  return res.status(403).json({ message: 'Admin access only' });
}

// ===== Minimal pages (optional for static HTML demos) =====
app.get('/', (req, res) => res.send('Hiring Platform API running'));
app.get('/api/auth/check', authenticateToken, (req, res) => res.json({ ok: true, user: req.user }));

// ===== Auth APIs used by your React app =====
app.post('/api/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, collegeName, branch, yearOfStudy, rollNumber } = req.body;
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const user = new User({
      firstName, lastName, email, phone, collegeName, branch, yearOfStudy, rollNumber,
      password: 'Student@123',
      terms: true
    });
    await user.save();
    res.status(201).json({ success: true, message: 'User registered successfully', user: { id: user._id, email: user.email } });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/user/login', async (req, res) => {
  try {
    const { userId, password } = req.body; // userId is email
    if (!userId || !password) return res.status(400).json({ message: 'User ID (email) and password are required' });
    const user = await User.findOne({ email: userId.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signUserToken(user);
    res.json({ message: 'Login successful', token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (e) {
    console.error('User login error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { adminID, password } = req.body;
    if (!adminID || !password) return res.status(400).json({ message: 'Admin ID and password are required' });
    const admin = await Admin.findOne({ adminID });
    if (!admin) return res.status(401).json({ message: 'Invalid admin credentials' });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: 'Invalid admin credentials' });
    const token = signAdminToken(admin);
    res.json({ message: 'Login successful', token, adminID: admin.adminID });
  } catch (e) {
    console.error('Admin login error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== User profile (optional) =====
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const u = await User.findById(req.userId).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (e) {
    console.error('Profile error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== MCQ Test Session Routes =====

// START-TEST: resume if active; auto-submit if expired; else create new
app.post('/api/user/start-test/:testType', authenticateToken, async (req, res) => {
  try {
    const { testType } = req.params;
    const { timeLimit = 60 } = req.body; // minutes

    // 1) Look for an active session
    let session = await TestSession
      .findOne({ studentId: req.userId, testType, isActive: true })
      .populate('questions');

    if (session) {
      const elapsedSec = Math.floor((Date.now() - session.startTime) / 1000);
      const totalSec   = (session.timeLimit ?? 60) * 60;
      const remaining  = Math.max(0, totalSec - elapsedSec);

      if (remaining <= 0) {
        // Auto-submit expired session
        const populated = await TestSession.findById(session._id).populate('questions');
        let correct = 0;
        const detailed = [];
        for (const ans of populated.answers) {
          const q = populated.questions.find(qq => String(qq._id) === String(ans.questionId));
          const isCorrect = q && ans.selectedAnswer && ans.selectedAnswer === q.correctAnswer;
          if (isCorrect) correct++;
          detailed.push({ questionId: ans.questionId, selectedAnswer: ans.selectedAnswer || null, isCorrect: !!isCorrect, timeTaken: 0 });
        }
        const result = new Result({
          studentId: populated.studentId,
          testType: populated.testType,
          score: correct,
          totalQuestions: populated.questions.length,
          answers: detailed,
          totalTimeTaken: totalSec
        });
        await result.save();

        populated.isActive = false;
        populated.endTime = new Date();
        await populated.save();

        session = null; // allow new session creation
      } else {
        // Resume
        return res.json({
          message: 'Resuming existing session',
          sessionId: session._id,
          totalQuestions: session.questions.length,
          timeLimit: session.timeLimit
        });
      }
    }

    // 2) Create fresh session
    const questions = await Question.find({ testType }).limit(25);
    if (!questions.length) return res.status(404).json({ message: 'No questions available for this test type' });

    const shuffled = questions.sort(() => 0.5 - Math.random());
    const newSession = new TestSession({
      studentId: req.userId,
      testType,
      questions: shuffled.map(q => q._id),
      timeLimit,
      startTime: new Date(),
      isActive: true,
      currentQuestionIndex: 0,
      answers: []
    });
    await newSession.save();

    return res.json({
      message: 'Test session started successfully',
      sessionId: newSession._id,
      totalQuestions: shuffled.length,
      timeLimit
    });
  } catch (error) {
    console.error('Error starting test session:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET CURRENT QUESTION
app.get('/api/user/test-session/:sessionId/question', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await TestSession.findById(sessionId).populate('questions');
    if (!session || !session.isActive) return res.status(404).json({ message: 'Test session not found or inactive' });
    if (String(session.studentId) !== String(req.userId)) return res.status(403).json({ message: 'Access denied' });

    const q = session.questions[session.currentQuestionIndex];
    if (!q) return res.status(404).json({ message: 'No more questions available' });

    const totalSec = (session.timeLimit ?? 60) * 60;
    const elapsedSec = Math.floor((Date.now() - session.startTime) / 1000);
    const timeRemaining = Math.max(0, totalSec - elapsedSec);

    return res.json({
      question: q,
      questionNumber: session.currentQuestionIndex + 1,
      totalQuestions: session.questions.length,
      timeRemaining
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ANSWER (or SKIP) and ADVANCE
app.post('/api/user/test-session/:sessionId/answer', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { selectedAnswer } = req.body; // string "A"/"B"/"C"/"D" or null

    const session = await TestSession.findById(sessionId).populate('questions');
    if (!session || !session.isActive) return res.status(404).json({ message: 'Test session not found or inactive' });
    if (String(session.studentId) !== String(req.userId)) return res.status(403).json({ message: 'Access denied' });

    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) return res.status(404).json({ message: 'No current question available' });

    const idx = session.answers.findIndex(a => String(a.questionId) === String(currentQ._id));
    if (idx >= 0) session.answers[idx].selectedAnswer = selectedAnswer ?? null;
    else session.answers.push({ questionId: currentQ._id, selectedAnswer: selectedAnswer ?? null });

    session.currentQuestionIndex++;
    await session.save();

    const isLastQuestion = session.currentQuestionIndex >= session.questions.length;
    return res.json({ success: true, isLastQuestion, nextQuestionNumber: session.currentQuestionIndex + 1 });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PREVIOUS (go back one)
app.post('/api/user/test-session/:sessionId/previous', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await TestSession.findById(sessionId).populate('questions');
    if (!session || !session.isActive) return res.status(404).json({ message: 'Test session not found or inactive' });
    if (String(session.studentId) !== String(req.userId)) return res.status(403).json({ message: 'Access denied' });

    if (session.currentQuestionIndex > 0) {
      session.currentQuestionIndex -= 1;
      await session.save();
    }

    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) return res.status(404).json({ message: 'No question available' });

    const totalSec = (session.timeLimit ?? 60) * 60;
    const elapsedSec = Math.floor((Date.now() - session.startTime) / 1000);
    const timeRemaining = Math.max(0, totalSec - elapsedSec);

    return res.json({
      question: currentQ,
      questionNumber: session.currentQuestionIndex + 1,
      totalQuestions: session.questions.length,
      timeRemaining
    });
  } catch (error) {
    console.error('Error moving to previous question:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// SUBMIT TEST
app.post('/api/user/test-session/:sessionId/submit', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await TestSession.findById(sessionId).populate('questions');
    if (!session || !session.isActive) return res.status(404).json({ message: 'Test session not found or inactive' });
    if (String(session.studentId) !== String(req.userId)) return res.status(403).json({ message: 'Access denied' });

    let correct = 0;
    const detailed = [];
    session.answers.forEach(ans => {
      const q = session.questions.find(qq => String(qq._id) === String(ans.questionId));
      const isCorrect = ans.selectedAnswer && ans.selectedAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      detailed.push({ questionId: ans.questionId, selectedAnswer: ans.selectedAnswer ?? null, isCorrect, timeTaken: 0 });
    });

    const result = new Result({
      studentId: session.studentId,
      testType: session.testType,
      score: correct,
      totalQuestions: session.questions.length,
      answers: detailed,
      totalTimeTaken: Math.floor((Date.now() - session.startTime) / 1000)
    });
    await result.save();

    session.isActive = false;
    session.endTime = new Date();
    await session.save();

    return res.json({
      score: correct,
      totalQuestions: session.questions.length,
      percentage: Math.round((correct / session.questions.length) * 100),
      timeTaken: result.totalTimeTaken,
      message: 'Test submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// (Optional) Backward compatible questions fetch
app.get('/api/user/questions/:testType', authenticateToken, async (req, res) => {
  try {
    const { testType } = req.params;
    const questions = await Question.find({ testType }).limit(25);
    res.json({ questions });
  } catch (e) {
    console.error('Error fetching questions:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Backend URL: http://localhost:${PORT}`);
});
