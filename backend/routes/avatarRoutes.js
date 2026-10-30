const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController');
const { optionalAuth } = require('../middleware/auth');

// Generation
router.post('/generate', optionalAuth, avatarController.generate);

// CRUD
router.get('/', optionalAuth, avatarController.getAll);
router.post('/', optionalAuth, avatarController.create);
router.get('/:id', optionalAuth, avatarController.getById);
router.put('/:id', optionalAuth, avatarController.update);
router.delete('/:id', optionalAuth, avatarController.delete);

module.exports = router;

