const bcrypt = require("bcrypt");

const saltRounds = 10;

const hash = (data) => {
  return bcrypt.hashSync(data, saltRounds);
};

const compareHash = (input, hash) => {
  return bcrypt.compareSync(input, hash);
};

module.exports = {
  hash,
  compareHash,
};
