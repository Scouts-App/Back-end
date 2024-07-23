const MESSAGES = require('../constants/messages');
const userService = require('../services/user.service');
const { compareHash } = require('../utils/bcrypt.utils');
const { generateAuthToken } = require('../utils/jwt.utils');

class AuthController {
  async register(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.statusMessage = MESSAGES.AUTH_INFO_REQUIRED;
        res.status(400).send();
        return;
      }
      const isExisted = await userService.findUserByEmail(email);
      if (isExisted) {
        res.statusMessage = MESSAGES.USER_EXISTED;
        res.status(429).send();
        return;
      }

      const newUser = await userService.createUser(req.body);
      newUser.password = undefined;
      const token = generateAuthToken({ _id: newUser._id, email: req.body.email });
      res.json({
        user: newUser,
        ...token,
      });
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.statusMessage = MESSAGES.AUTH_INFO_REQUIRED;
        res.status(400).send();
        return;
      }

      const user = await userService.findUserByEmail(email);
      if (!user) {
        res.statusMessage = MESSAGES.USER_NOT_FOUND;
        res.status(400).send();
        return;
      }

      if (!compareHash(password, user.password)) {
        res.statusMessage = MESSAGES.PASSWORD_INCORRECT;
        res.status(400).send();
        return;
      }

      user.password = undefined;
      const token = generateAuthToken({ _id: newUser._id, email: req.body.email });
      res.json({
        user,
        ...token,
      });
    } catch (error) {
      res.statusMessage = MESSAGES.SERVER_INTERNAL_ERROR;
      res.status(500).send();
    }
  }
}

module.exports = new AuthController();
