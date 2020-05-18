const express = require('express');
const routes = express.Router();
const CardController = require('../app/controllers/CardController');

routes.get('/', CardController.index)
  .post('/:id/add-one', CardController.addOne)
  .post('/:id/remove-one', CardController.removeOne)
  .post('/:id/delete', CardController.delete);

module.exports = routes;
