require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:5002/hiring_platform';

const [,, adminIDArg, passwordArg, emailArg] = process.argv;

async function main() {
  if (!adminIDArg || !passwordArg) {
    console.error('Usage: node backend/scripts/createAdmin.js <adminID> <password> [email]');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const adminSchema = new mongoose.Schema({
    adminID: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    createdAt: { type: Date, default: Date.now },
  });

  const Admin = mongoose.model('Admin', adminSchema);

  try {
    const existing = await Admin.findOne({ adminID: adminIDArg });
    if (existing) {
      console.log(`Admin with adminID "${adminIDArg}" already exists.`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(passwordArg, 10);

    const admin = new Admin({
      adminID: adminIDArg,
      password: hashed,
      email: emailArg || 'admin@example.com',
    });

    await admin.save();
    console.log(`✅ Admin created: adminID="${adminIDArg}"`);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
