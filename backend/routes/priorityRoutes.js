const express = require('express');
const router = express.Router();
const priorityController = require('../controllers/priorityController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/evaluate', authorize('admin', 'manager'), priorityController.evaluatePriority);
router.get('/ranking', authorize('admin', 'manager'), priorityController.getRanking);
router.get('/recommended', authorize('admin', 'manager'), priorityController.getRecommended);
router.get('/criteria', priorityController.getCriteria);
router.put('/criteria', authorize('admin', 'manager'), priorityController.updateCriteriaWeights);

module.exports = router;

