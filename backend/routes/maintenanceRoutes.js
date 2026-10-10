const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', maintenanceController.getMaintenances);
router.get('/:id', maintenanceController.getMaintenanceById);
router.post('/', authorize('admin', 'manager', 'technician'), maintenanceController.createMaintenance);
router.put('/:id', authorize('admin', 'manager', 'technician'), maintenanceController.updateMaintenance);

module.exports = router;
