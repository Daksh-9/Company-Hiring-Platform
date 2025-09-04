const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Admin Dashboard...\n');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ Created uploads directory');
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.sx83e.mongodb.net/hiring_platform

# JWT Secret (change this to a secure random string)
JWT_SECRET=your-secret-key-here

# Email Configuration (for bulk email functionality)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Port
PORT=5001
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
  console.log('⚠️  Please update the .env file with your actual credentials');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Update the .env file with your MongoDB URI and other credentials');
console.log('2. Run: npm run server');
console.log('3. Create default admin account: curl -X POST http://localhost:5001/api/admin/create-default');
console.log('4. Start the application: npm run dev');
console.log('5. Access admin dashboard at: http://localhost:3000/admin/login');
console.log('   Default credentials: admin / admin123\n');

console.log('🎉 Setup complete!');
