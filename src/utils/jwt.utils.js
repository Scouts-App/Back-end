require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (data, secret, ttl) => {
  const token = jwt.sign(data, secret, { expiresIn: ttl });

  return token;
};

const verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return "";
  }
};

const generateAuthToken = (data) => {
  const accessToken = generateToken(data, process.env.JWT_AUTH_SECRET, process.env.JWT_AUTH_TTL);
  const refreshToken = generateToken(data, process.env.JWT_AUTH_SECRET, process.env.JWT_AUTH_REFRESH_TTL);

  return {
    accessToken,
    refreshToken,
  };
};

const verifyAuthToken = (token) => {
  return verifyToken(token, process.env.JWT_AUTH_SECRET);
};

module.exports = {
  generateAuthToken,
  verifyAuthToken,
};
