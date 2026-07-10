// Removed dotenv dependency

const mongoose = require('./services/auth-service/node_modules/mongoose');
const { DEPARTMENTS } = require('./services/worker-service/src/constants/departments');

const AUTH_URI = process.env.AUTH_DB_URI || 'mongodb+srv://pushkar:Pushkar123@cluster0.dzpyhac.mongodb.net/auth_db?retryWrites=true&w=majority&appName=Cluster0';
const WORKER_URI = process.env.WORKER_DB_URI || 'mongodb+srv://pushkar:Pushkar123@cluster0.dzpyhac.mongodb.net/worker_db?retryWrites=true&w=majority&appName=Cluster0';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String
}, { strict: false });

const workerSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  email: String,
  phone: String,
  department: String,
  availability: Boolean
}, { strict: false });

async function migrate() {
  console.log('Connecting to databases...');
  const authDb = mongoose.createConnection(AUTH_URI);
  const workerDb = mongoose.createConnection(WORKER_URI);

  const User = authDb.model('User', userSchema);
  const Worker = workerDb.model('Worker', workerSchema);

  try {
    console.log('Fetching WORKER users from auth_db...');
    const users = await User.find({ role: 'WORKER' });
    console.log(`Found ${users.length} worker(s) in auth_db.`);

    for (const user of users) {
      const existingWorker = await Worker.findOne({ 
        $or: [
          { userId: user._id },
          { email: user.email }
        ]
      });

      if (existingWorker) {
        console.log(`Skipping existing worker: ${user.email}`);
        continue;
      }

      console.log(`Migrating missing worker: ${user.email}...`);
      await Worker.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: DEPARTMENTS[0] || 'Road Maintenance', // Default department
        availability: true,
      });
      console.log(`Successfully migrated ${user.email}`);
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
