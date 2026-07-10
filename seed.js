const mongoose = require('./services/auth-service/node_modules/mongoose');
const bcrypt = require('./services/auth-service/node_modules/bcryptjs');

const AUTH_URI = process.env.AUTH_DB_URI || 'mongodb+srv://pushkar:Pushkar123@cluster0.dzpyhac.mongodb.net/auth_db?retryWrites=true&w=majority&appName=Cluster0';
const WORKER_URI = process.env.WORKER_DB_URI || 'mongodb+srv://pushkar:Pushkar123@cluster0.dzpyhac.mongodb.net/worker_db?retryWrites=true&w=majority&appName=Cluster0';

// Define schemas manually to avoid needing to boot the whole app inside the seed
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['CITIZEN', 'ADMIN', 'WORKER'], default: 'CITIZEN' },
}, { timestamps: true });

const workerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  department: { type: String, required: true },
  availability: { type: Boolean, default: true },
  activeTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
}, { timestamps: true });

async function seedDatabase() {
  console.log('Connecting to Auth Database...');
  const authDb = mongoose.createConnection(AUTH_URI);
  const User = authDb.model('User', userSchema);

  console.log('Connecting to Worker Database...');
  const workerDb = mongoose.createConnection(WORKER_URI);
  const Worker = workerDb.model('Worker', workerSchema);

  try {
    console.log('Clearing old users and workers...');
    await User.deleteMany({});
    await Worker.deleteMany({});

    const hashedPassword = await bcrypt.hash('Password123', 12);

    console.log('Creating Admin User...');
    const admin = await User.create({
      name: 'Real Super Admin',
      email: 'dadasahebtakale085@gmail.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'ADMIN',
    });

    console.log('Creating Citizen User...');
    await User.create({
      name: 'Real Citizen',
      email: 'mywork3872@gmail.com',
      password: hashedPassword,
      phone: '0987654321',
      role: 'CITIZEN',
    });

    console.log('Creating Worker Users...');
    const workersData = [
      { name: 'Real Worker', email: 'pushkartakale3872@gmail.com', dept: 'Sanitation' },
    ];

    for (const w of workersData) {
      const user = await User.create({
        name: w.name,
        email: w.email,
        password: hashedPassword,
        role: 'WORKER',
      });

      await Worker.create({
        userId: user._id,
        name: w.name,
        email: w.email,
        department: w.dept,
      });
    }

    console.log('Database successfully seeded!');
    console.log('Admin Login: dadasahebtakale085@gmail.com / Password123');
    console.log('Worker Login: pushkartakale3872@gmail.com / Password123');
    console.log('Citizen Login: mywork3872@gmail.com / Password123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
