require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'file-service',
    timestamp: Date.now(),
  });
});

app.use('/api/files', fileRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`File service running on port ${PORT}`);
});
