const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://pushkar:Pushkar123@cluster0.dzpyhac.mongodb.net/complaint_db?retryWrites=true&w=majority&appName=Cluster0';

async function syncAll() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const Worker = mongoose.model('Worker', new mongoose.Schema({}, { strict: false }));
  const Complaint = mongoose.model('Complaint', new mongoose.Schema({}, { strict: false }));

  const workers = await Worker.find({});
  console.log(`Found ${workers.length} workers. Syncing tasks...`);

  for (const w of workers) {
    const active = await Complaint.countDocuments({ 
      assignedWorker: w._id, 
      status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'REWORK_REQUIRED'] } 
    });
    
    const completed = await Complaint.countDocuments({ 
      assignedWorker: w._id, 
      status: { $in: ['COMPLETED_BY_WORKER', 'VERIFIED_BY_ADMIN', 'CLOSED'] } 
    });

    await Worker.updateOne({ _id: w._id }, { $set: { activeTasks: active, completedTasks: completed } });
    console.log(`Updated worker ${w.name}: Active=${active}, Done=${completed}`);
  }

  console.log('All workers synced successfully!');
  process.exit(0);
}

syncAll().catch(console.error);
