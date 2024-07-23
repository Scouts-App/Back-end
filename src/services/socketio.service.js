const EVENTS = require("../constants/socketio-events");

const implementSocketIOFunction = (io) => {
  io.on(EVENTS.CONNECTION, (socket) => {
    console.log("id", socket.id);

    socket.on(EVENTS.GET_PAIRS, (data) => {
      console.log("data", data);
      socket.emit(EVENTS.GET_PAIRS, `Hello ${data.pair}`)
    })
  });
};

module.exports = implementSocketIOFunction;
