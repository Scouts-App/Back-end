const MESSAGES = require('../constants/messages');
const watchListService = require('../services/watch-list.service');

class WatchListController {
  async index(req, res) {
    try {
      let { page = 1, size = 30 } = req.query;
      if (page < 1) page = 1;
      const conditions = {
        user: req.user._id,
      };
      const watchLists = await watchListService.findAll(page, size, conditions);
      res.json(watchLists);
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async create(req, res) {
    try {
      // const watchList = await watchListService.findOne({ user: req.user._id });
      // if (watchList) {
      //   res.statusMessage = MESSAGES.ALREADY_EXIST;
      //   return res.status(400).send();
      // }

      await watchListService.createOne({ ...req.body, user: req.user._id });
      res.status(201).send();
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const watchList = await watchListService.findOne({ _id: id, user: req.user._id });
      if (!watchList) {
        res.statusMessage = MESSAGES.RESOURCE_NOT_FOUND;
        return res.status(400).send();
      }

      await watchListService.updateOne(id, req.body);
      res.status(201).send();
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      const watchList = await watchListService.findOne({ _id: id, user: req.user._id });
      if (!watchList) {
        res.statusMessage = MESSAGES.RESOURCE_NOT_FOUND;
        return res.status(400).send();
      }

      await watchListService.deleteById(id);
      res.status(201).send();
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }
}

module.exports = new WatchListController();
