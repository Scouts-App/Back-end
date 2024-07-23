require('dotenv').config();
const listEndpoints = require('express-list-endpoints');
const port = process.env.PORT || 3001;
const { httpServer, app } = require('./app');
const connectDB = require('./config/db.conf');
const { logAllRoutes } = require('./utils/misc.utils');

connectDB()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`App is listening on port ${port}`);
      logAllRoutes(listEndpoints(app));
    });
  })
  .catch((error) => {
    console.error('[ERROR]', error);
  });
