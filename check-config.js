#!/usr/bin/env node

// Simple diagnostic script to check configuration before deployment
require('dotenv').config();

console.log('='.repeat(60));
console.log('🔍 PRE-DEPLOYMENT CONFIGURATION CHECK');
console.log('='.repeat(60));

let hasErrors = false;

// Check Node version
console.log('\n📦 Node.js Version:', process.version);
const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
if (nodeVersion < 14) {
  console.error('❌ Node.js version 14 or higher required');
  hasErrors = true;
} else {
  console.log('✅ Node.js version is compatible');
}

// Check MONGODB_URI
console.log('\n🗄️  MongoDB Configuration:');
if (process.env.MONGODB_URI) {
  console.log('✅ MONGODB_URI is set');
  // Mask password for security
  const maskedUri = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log('   URI:', maskedUri);
} else {
  console.error('❌ MONGODB_URI is NOT set');
  hasErrors = true;
}

// Check N8N_WEBHOOK_URL
console.log('\n🪝 n8n Webhook Configuration:');
if (process.env.N8N_WEBHOOK_URL) {
  console.log('✅ N8N_WEBHOOK_URL is set');
  console.log('   URL:', process.env.N8N_WEBHOOK_URL);
} else {
  console.error('❌ N8N_WEBHOOK_URL is NOT set');
  hasErrors = true;
}

// Check PORT
console.log('\n🌐 Server Configuration:');
const port = process.env.PORT || 3000;
console.log('✅ PORT:', port);

// Check required dependencies
console.log('\n📚 Checking Dependencies:');
const requiredPackages = ['express', 'mongoose', 'axios', 'cors', 'body-parser', 'dotenv'];
const packageJson = require('./package.json');

requiredPackages.forEach(pkg => {
  if (packageJson.dependencies[pkg]) {
    console.log(`✅ ${pkg}: ${packageJson.dependencies[pkg]}`);
  } else {
    console.error(`❌ ${pkg} is missing from dependencies`);
    hasErrors = true;
  }
});

// Final verdict
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('❌ CONFIGURATION CHECK FAILED');
  console.error('Please fix the errors above before deploying');
  process.exit(1);
} else {
  console.log('✅ CONFIGURATION CHECK PASSED');
  console.log('Your application is ready for deployment!');
}
console.log('='.repeat(60) + '\n');
