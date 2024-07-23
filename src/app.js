const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const implementSocketIOFunction = require('./services/socketio.service');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const routes = require('./routes/v1');

const app = express();
const httpServer = createServer(app);
var io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// implementSocketIOFunction(io);

app.use(morgan('tiny'));
app.use(compression());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

module.exports = {
  httpServer,
  app,
};
