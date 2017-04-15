(function() {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var CountSchema = new Schema({
        count: Number
    });

module.exports = mongoose.model('Count', CountSchema);

})();