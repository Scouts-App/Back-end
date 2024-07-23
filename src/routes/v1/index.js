const express = require('express');
const authRoute = require('./auth.route');
const graphRoute = require('./graph.route');
const watchListRoute = require('./watch-list.route');
const alertTokenRoute = require('./alert-token.route');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/amm',
    route: graphRoute,
  },
  {
    path: '/watch-list',
    route: watchListRoute,
  },
  {
    path: '/alert-tokens',
    route: alertTokenRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
