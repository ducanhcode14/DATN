const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', incidentController.getIncidents);
router.get('/:id', incidentController.getIncidentById);
router.post('/', incidentController.createIncident); // Bất kỳ user nào đăng nhập đều có thể báo sự cố
router.patch('/:id', authorize('admin', 'manager', 'technician'), incidentController.updateIncident);

module.exports = router;
