const logAllRoutes = (routes) => {
  routes.map((route) => {
    route.methods.map((method) => {
      console.log(`Mapped {${route.path}, ${method}} route`);
    });
  });
};

module.exports = {
  logAllRoutes,
};
