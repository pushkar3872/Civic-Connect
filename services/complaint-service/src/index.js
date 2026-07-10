require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const complaintRoutes = require('./routes/complaintRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5002;

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'complaint-service',
    timestamp: Date.now(),
  });
});

app.use('/api/complaints', complaintRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Complaint service running on port ${PORT}`);
});
