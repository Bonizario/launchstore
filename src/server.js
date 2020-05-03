const express = require('express');
const nunjucks = require('nunjucks');
const routes = require('./routes');
const methodOverride = require('method-override');

const server = express();

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
