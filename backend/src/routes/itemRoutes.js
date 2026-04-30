const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/item.controller');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);

router.post('/', authenticateToken, ItemController.createItem);
router.put('/:id', authenticateToken, ItemController.updateItem);

module.exports = router;