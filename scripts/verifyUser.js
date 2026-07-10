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

async function run() {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  console.log(`Connecting to database...`);
  try {
    await mongoose.connect(dbUri);
    console.log('Connected successfully.');
    
    // Fetch all users
    const users = await User.find({}, '_id email role name');
    
    console.log('\n========================================');
    console.log(`USERS FOUND IN DATABASE: ${users.length}`);
    console.log('----------------------------------------');
    if (users.length === 0) {
      console.log('No users found in this database.');
    } else {
      users.forEach((user, idx) => {
        console.log(`${idx + 1}. [${user.role}] Name: ${user.name} | Email: ${user.email} | ID: ${user._id}`);
      });
    }
    console.log('========================================\n');

  } catch (err) {
    console.error('An error occurred:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

run();
