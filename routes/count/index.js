(function() {
  'use strict';

  var express = require('express');
  var controller = require('./count.controller')    
    
  var router = express.Router();

  router.get('/:id', controller.get);
  router.post('/start', controller.start);
  router.post('/:id/:count', controller.update);
  router.delete('/:id', controller.delete);
  

  module.exports = router;

})();