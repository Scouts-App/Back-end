const express = require('express');
const alertTokenController = require('../../controllers/alert-token.controller');
const { authenticateUser } = require('../../middlewares/authenticate.middleware');
const router = express.Router();

router.get('/', authenticateUser, alertTokenController.index);
router.post('/', authenticateUser, alertTokenController.create);
router.get('/:id', authenticateUser, alertTokenController.show);
router.patch('/:id', authenticateUser, alertTokenController.update);
router.delete('/:id', authenticateUser, alertTokenController.delete);

module.exports = router;
