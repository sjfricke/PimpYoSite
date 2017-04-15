//(function() {
//    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var PimpsSchema = new Schema({
	id: Number,
	url: String,
	images_total: Number,
	images_bad: Number,
	images_data: Array,
	old_size: Number,
	new_size: Number,
	total_saved: Number,
	old_directory: String,
	new_directory: String
    });

module.exports = mongoose.model('Pimps', PimpsSchema);

//})();
