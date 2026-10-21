const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, categoryController.getCategories);
router.post('/', protect, authorize('admin', 'manager'), categoryController.createCategory);
router.put('/:id', protect, authorize('admin', 'manager'), categoryController.updateCategory);

module.exports = router;

