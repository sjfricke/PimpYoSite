//(function() {
//    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var PimpsSchema = new Schema({
	id: Number,
	url: String,
	threshold: Number,
	count_image: Number,
	count_resize: Number,
	images: Array,
	size_old: Number,
	size_new: Number,
	size_saved: Number,
	old_directory: String,
	new_directory: String
    });

module.exports = mongoose.model('Pimps', PimpsSchema);

//})();

/*threshold: Number,
	images_total: Number,
	images_bad: Number,
	images_data: Array,
	old_size: Number,
	new_size: Number,
	total_saved: Numbe*/