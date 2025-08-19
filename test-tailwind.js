const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Tailwind CSS Configuration...\n');

// Check if required files exist
const files = [
  'tailwind.config.js',
  'postcss.config.js',
  'src/index.css'
];

let allFilesExist = true;

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check package.json for required dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const devDeps = packageJson.devDependencies || {};

const requiredDeps = ['tailwindcss', 'postcss', 'autoprefixer'];
let allDepsInstalled = true;

requiredDeps.forEach(dep => {
  if (devDeps[dep]) {
    console.log(`✅ ${dep} installed (${devDeps[dep]})`);
  } else {
    console.log(`❌ ${dep} not installed`);
    allDepsInstalled = false;
  }
});

// Check if Tailwind directives are in index.css
const indexCss = fs.readFileSync('src/index.css', 'utf8');
const hasTailwindDirectives = indexCss.includes('@tailwind base') && 
                              indexCss.includes('@tailwind components') && 
                              indexCss.includes('@tailwind utilities');

if (hasTailwindDirectives) {
  console.log('✅ Tailwind directives found in src/index.css');
} else {
  console.log('❌ Tailwind directives missing in src/index.css');
}

console.log('\n📋 Summary:');
if (allFilesExist && allDepsInstalled && hasTailwindDirectives) {
  console.log('🎉 Tailwind CSS is properly configured!');
  console.log('\nTo test it:');
  console.log('1. Run: npm start');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Check if admin components are styled correctly');
} else {
  console.log('⚠️  Some issues found. Please check the errors above.');
}
