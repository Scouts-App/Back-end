const express = require('express');
const watchListController = require('../../controllers/watch-list.controller');
const { authenticateUser } = require('../../middlewares/authenticate.middleware');
const router = express.Router();

router.get('/', authenticateUser, watchListController.index);
router.post('/', authenticateUser, watchListController.create);
router.patch('/:id', authenticateUser, watchListController.update);
router.delete('/:id', authenticateUser, watchListController.delete);

module.exports = router;
