const mongoose = require('mongoose');

const uri = 'mongodb+srv://pushkar:Pushkar123@cluster0.dzpyhac.mongodb.net/worker_db?retryWrites=true&w=majority&appName=Cluster0';

async function test() {
  await mongoose.connect(uri);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  const Worker = mongoose.connection.db.collection('workers');
  const workers = await Worker.find({}).toArray();
  console.log('Workers:', workers);
  
  await mongoose.disconnect();
}

test().catch(console.error);
