const path = require('path');
const fs = require('fs');

// Path references
const authServiceDir = path.resolve(__dirname, '../services/auth-service');
const authEnvPath = path.join(authServiceDir, '.env');
const authModulesPath = path.join(authServiceDir, 'node_modules');

// Dynamically inject the auth-service node_modules directory to module paths
if (fs.existsSync(authModulesPath)) {
  module.paths.push(authModulesPath);
} else {
  console.error(`Error: Could not find node_modules in auth-service directory at ${authModulesPath}.`);
  console.error('Please run "npm run install:all" at the project root first.');
  process.exit(1);
}

// Load env configuration
try {
  const dotenv = require('dotenv');
  if (fs.existsSync(authEnvPath)) {
    dotenv.config({ path: authEnvPath });
  } else {
    console.error(`Error: Environmental variables file (.env) not found at ${authEnvPath}`);
    process.exit(1);
  }
} catch (err) {
  console.error('Error loading dotenv:', err.message);
  process.exit(1);
}

// Import mongoose and the User model
const mongoose = require('mongoose');
const User = require('../services/auth-service/src/models/User');
const ROLES = require('../services/auth-service/src/constants/roles');

const ADMIN_EMAIL = 'pushkartakale3872@gmail.com';
const ADMIN_PASSWORD = 'Password123';
const ADMIN_NAME = 'Admin User';

async function run() {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(dbUri);
    console.log('Connected successfully to the database.');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  try {
    const emailLower = ADMIN_EMAIL.toLowerCase();
    // Search for existing user
    let user = await User.findOne({ email: emailLower });

    if (user) {
      console.log(`User with email "${ADMIN_EMAIL}" already exists. Updating role to ADMIN and resetting password...`);
      user.role = ROLES.ADMIN;
      user.password = ADMIN_PASSWORD; // Model pre-save hook will handle bcrypt hashing
      await user.save();
      console.log('User role and password updated successfully.');
    } else {
      console.log(`Creating new Admin user with email "${ADMIN_EMAIL}"...`);
      user = await User.create({
        name: ADMIN_NAME,
        email: emailLower,
        password: ADMIN_PASSWORD,
        role: ROLES.ADMIN,
      });
      console.log('New Admin user created successfully.');
    }

    // Success response
    console.log('\n========================================');
    console.log('SUCCESS: Admin Account Configured');
    console.log('----------------------------------------');
    console.log(`ID:    ${user._id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role:  ${user.role}`);
    console.log('========================================\n');

  } catch (err) {
    console.error('An error occurred during execution:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

run();
