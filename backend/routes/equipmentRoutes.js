const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', equipmentController.getEquipments);
router.get('/:id', equipmentController.getEquipmentById);
router.post('/', authorize('admin', 'manager'), equipmentController.createEquipment);
router.put('/:id', authorize('admin', 'manager', 'technician'), equipmentController.updateEquipment);
router.delete('/:id', authorize('admin', 'manager'), equipmentController.deleteEquipment);

module.exports = router;
