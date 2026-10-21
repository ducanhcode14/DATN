const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, locationController.getLocations);
router.post('/', protect, authorize('admin', 'manager'), locationController.createLocation);
router.put('/:id', protect, authorize('admin', 'manager'), locationController.updateLocation);

module.exports = router;

