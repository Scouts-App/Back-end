const mongoose = require('mongoose');
const { alertTokenType, alertTokenTriggerType } = require('../constants/enum');

const AlertTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: mongoose.Schema.Types.Mixed, required: true },
    type: { type: Number, required: true, default: alertTokenType.PRICE_RISES_ABOVE },
    price: { type: String, required: true },
    trigger: { type: Number, required: true, default: alertTokenTriggerType.ONLY_ONCE },
    expiration: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

module.exports = AlertTokenSchema;
