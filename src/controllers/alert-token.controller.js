const MESSAGES = require('../constants/messages');
const alertTokenService = require('../services/alert-token.service');

class AlertTokenController {
  async index(req, res) {
    try {
      let { page = 1, size = 30 } = req.query;
      if (page < 1) page = 1;
      const conditions = {
        user: req.user._id,
      };
      const alertTokens = await alertTokenService.findAll(page, size, conditions);
      res.json(alertTokens);
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async show(req, res) {
    try {
      const id = req.params.id;
      const alertToken = await alertTokenService.findOne({ _id: id, user: req.user._id });
      if (!alertToken) {
        res.statusMessage = MESSAGES.RESOURCE_NOT_FOUND;
        return res.status(400).send();
      }

      res.json(alertToken);
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async create(req, res) {
    try {
      // const alertToken = await alertTokenService.findOne({ user: req.user._id });
      // if (alertToken) {
      //   res.statusMessage = MESSAGES.ALREADY_EXIST;
      //   return res.status(400).send();
      // }

      await alertTokenService.createOne({ ...req.body, user: req.user._id });
      res.status(201).send();
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const alertToken = await alertTokenService.findOne({ _id: id, user: req.user._id });
      if (!alertToken) {
        res.statusMessage = MESSAGES.RESOURCE_NOT_FOUND;
        return res.status(400).send();
      }

      await alertTokenService.updateOne(id, req.body);
      res.status(201).send();
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      const alertToken = await alertTokenService.findOne({ _id: id, user: req.user._id });
      if (!alertToken) {
        res.statusMessage = MESSAGES.RESOURCE_NOT_FOUND;
        return res.status(400).send();
      }

      await alertTokenService.deleteById(id);
      res.status(201).send();
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }
}

module.exports = new AlertTokenController();
