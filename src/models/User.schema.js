const mongoose = require('mongoose');
const { hash } = require('../utils/bcrypt.utils');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, indexed: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  const user = this;
  user.password = hash(user.password);
  next();
});

module.exports = UserSchema;
