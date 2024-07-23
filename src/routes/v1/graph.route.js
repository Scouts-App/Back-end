const express = require('express');
const graphController = require('../../controllers/graph.controller');
const router = express.Router();

router.get('/all-pair', graphController.getAllPairData);
router.get('/all-token', graphController.getAllTokens);
router.get('/top-pair', graphController.getTopPairs);
router.get('/bulk-pair', graphController.getBulkPairs);
router.get('/pair-transaction', graphController.getPairTransactions);
router.get('/swap-transaction', graphController.getSwapTransactions);
router.get('/trending-tokens', graphController.trendingTokens);
router.get('/top-traders', graphController.topTraders);
router.get('/new-pairs', graphController.newPair);

module.exports = router;
