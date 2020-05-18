const express = require('express');
const routes = express.Router();
const CardController = require('../app/controllers/CardController');

routes.get('/', CardController.index);

module.exports = routes;
