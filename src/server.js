const express = require('express');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const session = require('./config/session');
const routes = require('./routes');

const server = express();

server.use(session);
server.use((req, res, next) => {
  res.locals.session = req.session; // global variable session
  next();
});

server.use(express.urlencoded({ extended: true }));
server.use(express.static('public'));
server.use(methodOverride('_method')); /* must be above routes */
server.use(routes);

server.set('view engine', 'njk');

nunjucks.configure('src/app/views', {
  express: server,
  autoescape: false,
  noCache: true,
});

const port = process.env.PORT || 5000; /* prep to deploy envs */
server.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
