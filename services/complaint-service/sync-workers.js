const mongoose = require('mongoose');

const WORKER_DB = 'mongodb+srv://pushkar:Pushkar123@cluster0.dzpyhac.mongodb.net/worker_db?retryWrites=true&w=majority&appName=Cluster0';
const COMPLAINT_DB = 'mongodb+srv://pushkar:Pushkar123@cluster0.dzpyhac.mongodb.net/complaint_db?retryWrites=true&w=majority&appName=Cluster0';

async function syncAll() {
  console.log('Connecting to databases...');
  const workerConn = await mongoose.createConnection(WORKER_DB).asPromise();
  const complaintConn = await mongoose.createConnection(COMPLAINT_DB).asPromise();
  console.log('Connected to both databases.');

  const Worker = workerConn.model('Worker', new mongoose.Schema({}, { strict: false }));
  const Complaint = complaintConn.model('Complaint', new mongoose.Schema({}, { strict: false }));

  const workers = await Worker.find({});
  console.log(`Found ${workers.length} workers. Syncing tasks...`);

  for (const w of workers) {
    let active = await Complaint.countDocuments({ 
      assignedWorker: w._id, 
      status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'REWORK_REQUIRED'] } 
    });
    
    let completed = await Complaint.countDocuments({ 
      assignedWorker: w._id, 
      status: { $in: ['COMPLETED_BY_WORKER', 'VERIFIED_BY_ADMIN', 'CLOSED'] } 
    });

    // Fallback for string IDs if any
    if (active === 0 && completed === 0) {
      active += await Complaint.countDocuments({ 
        assignedWorker: w._id.toString(), 
        status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'REWORK_REQUIRED'] } 
      });
      completed += await Complaint.countDocuments({ 
        assignedWorker: w._id.toString(), 
        status: { $in: ['COMPLETED_BY_WORKER', 'VERIFIED_BY_ADMIN', 'CLOSED'] } 
      });
    }

    await Worker.updateOne({ _id: w._id }, { $set: { activeTasks: active, completedTasks: completed } });
    console.log(`Updated worker ${w.name}: Active=${active}, Done=${completed}`);
  }

  console.log('All workers synced successfully!');
  process.exit(0);
}

syncAll().catch(console.error);
