const { verifyAuthToken } = require('../utils/jwt.utils');
const MESSAGES = require('../constants/messages');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAuthToken(token);
      if (!decoded) {
        res.statusMessage = MESSAGES.UNAUTHORIZED;
        res.status(401).send();
        return;
      }
      req.user = decoded;
      next();
    } else {
      res.statusMessage = MESSAGES.UNAUTHORIZED;
      res.status(401).send();
      return;
    }
  } catch (error) {
    res.status(500).send();
  }
};

module.exports = {
  authenticateUser,
};
