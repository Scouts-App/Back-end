const { WatchList } = require('../models');

class WatchListService {
  async findAll(page, size, conditions) {
    const skip = (page - 1) * size;
    const watchLists = await WatchList.find(conditions).skip(skip).limit(size);
    return watchLists;
  }

  findOne(conditions = {}) {
    return WatchList.findOne(conditions);
  }

  updateOne(id, data) {
    return WatchList.findByIdAndUpdate(id, data, { new: true });
  }

  deleteById(id) {
    return WatchList.deleteOne({ _id: id });
  }

  createOne(data) {
    return WatchList.create(data);
  }
}

module.exports = new WatchListService();
