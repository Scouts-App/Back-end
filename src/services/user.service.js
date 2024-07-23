const { User } = require('../models');

class UserService {
  findUserByEmail(email) {
    console.log('email', email)
    return User.findOne({ email });
  }

  createUser(user) {
    return User.create(user);
  }
}

module.exports = new UserService();
