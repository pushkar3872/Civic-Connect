const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const ROLES = require('../constants/roles');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.use(verifyToken, authorizeRoles(ROLES.ADMIN));

router.get('/dashboard', analyticsController.getDashboard);
router.get('/complaints', analyticsController.getComplaintsAnalytics);
router.get('/workers', analyticsController.getWorkersAnalytics);
router.get('/trends', analyticsController.getTrendsAnalytics);

module.exports = router;
