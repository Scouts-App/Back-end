const MESSAGES = require('../constants/messages');
const graphService = require('../services/graph.service');

class GraphController {
  async getAllPairData(req, res) {
    try {
      const resData = await graphService.getAllPair();
      if (resData) {
        res.json({
          data: resData,
        });
      }
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async getTopPairs(req, res) {
    try {
      const resData = await graphService.getTopPairs(400);
      if (resData) {
        res.json({
          data: resData,
        });
      }
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async getAllTokens(req, res) {
    try {
      const resData = await graphService.getAllTokens();
      if (resData) {
        res.json({
          data: resData,
        });
      }
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async getPairTransactions(req, res) {
    try {
      const urlParams = new URLSearchParams(req.query);
      const pairAddress = (urlParams.get('pair_address') || '').toLowerCase();
      const dexType = (urlParams.get('dex_type') || '').toLowerCase();
      if (!pairAddress && !dexType) {
        res.statusMessage = 'NOK';
        res.status(400).send();
        return;
      } else {
        const resData = await graphService.getPairTransactions(dexType, pairAddress);
        if (resData) {
          res.json({
            data: resData,
          });
        }
      }
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async getSwapTransactions(req, res) {
    try {
      const urlParams = new URLSearchParams(req.query);
      const pairAddress = (urlParams.get('pair_address') || '').toLowerCase();
      const startTime = urlParams.get('start_time') || 0;
      const dexType = (urlParams.get('dex_type') || '').toLowerCase();
      if (!pairAddress && !dexType) {
        res.statusMessage = 'NOK';
        res.status(400).send();
        return;
      } else {
        const resData = await graphService.getSwapTransactions(dexType, pairAddress, startTime);
        if (resData) {
          res.json({
            data: resData,
          });
        }
      }
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async getBulkPairs(req, res) {
    try {
      const { poolList } = req.query;
      if (!poolList || poolList.length == 0) {
        res.statusMessage = 'NOK';
        res.status(400).send();
        return;
      } else {
        const resData = await graphService.getBulkPairData(poolList);
        if (resData) {
          res.json({
            data: resData,
          });
        }
      }
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async trendingTokens(req, res) {
    try {
      const { page = 1, size = 10 } = req.query;
      const skip = page <= 1 ? 0 : (page - 1) * size;
      const data = await graphService.getTrendingTokens(skip, Number(size));
      data.sort((a, b) => (Number(a.dailyVolumeUSD) > Number(b.dailyVolumeUSD) ? -1 : 1));
      res.json(data.slice(0, size));
    } catch (error) {
      console.log(error);
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async topTraders(req, res) {
    try {
      const { page = 1, size = 10, totalVolumeUSD = 0 } = req.query;
      const skip = page <= 1 ? 0 : (page - 1) * size;
      const data = await graphService.getTopTraders(skip, Number(size), Number(totalVolumeUSD));
      data.sort((a, b) => (Number(a.totalVolumeUSD) > Number(b.totalVolumeUSD) ? -1 : 1));
      res.json(data.slice(0, size));
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async newPair(req, res) {
    try {
      const { page = 1, size = 10, totalVolumeUSD = 0 } = req.query;
      const skip = page <= 1 ? 0 : (page - 1) * size;
      const data = await graphService.getNewPairListing(skip, Number(size));
      data.sort((a, b) => (Number(a.createdAtTimestamp) > Number(b.createdAtTimestamp) ? -1 : 1));
      res.json(data.slice(0, size));
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }
}

module.exports = new GraphController();
