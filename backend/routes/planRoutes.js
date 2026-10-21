const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', planController.getPlans);
router.get('/:id', planController.getPlanById);
router.post('/', authorize('admin', 'manager'), planController.createPlan);
router.put('/:id', authorize('admin', 'manager'), planController.updatePlan);
router.patch('/:id/items/:itemId', authorize('admin', 'manager', 'technician'), planController.updatePlanItem);

module.exports = router;

