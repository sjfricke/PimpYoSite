
(function() {
  'use strict';

  var express = require('express');
  var router = express.Router();

  router.use('/count', require('./count'));    

  module.exports = router;

})();


