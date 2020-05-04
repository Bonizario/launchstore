const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const db = require('./db');

module.exports = session({
  store: new pgSession({
    pool: db,
  }),
  secret: 'jajaja',
  resave: false,
  saveUninitialized: false,
  // 7 days
  cookie: {
    maxAge: 604800000,
  },
});
