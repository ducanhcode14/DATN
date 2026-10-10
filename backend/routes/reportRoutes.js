const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/:type', reportController.getReportData);

module.exports = router;
