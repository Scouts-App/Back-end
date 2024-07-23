const { AlertToken } = require('../models');

class AlertTokenService {
  async findAll(page, size, conditions) {
    const skip = (page - 1) * size;
    const watchLists = await AlertToken.find(conditions).skip(skip).limit(size);
    return watchLists;
  }

  findOne(conditions = {}) {
    return AlertToken.findOne(conditions);
  }

  updateOne(id, data) {
    return AlertToken.findByIdAndUpdate(id, data, { new: true });
  }

  deleteById(id) {
    return AlertToken.deleteOne({ _id: id });
  }

  createOne(data) {
    return AlertToken.create(data);
  }
}

module.exports = new AlertTokenService();
