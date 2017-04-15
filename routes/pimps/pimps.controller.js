//(function() {
//    'use strict';

    var Pimps = require('./pimps.model');


//Basic CRUD
    module.exports = {
	
    //grab all for display
	getAll : function(callback) {
	    Pimps.find( {}, (err, post) => {
		if (err) { reject(err); }
		callback(false, post);
	    });
	},
			  		
			   
    //edit exsisting one
/*     module.exports.update = function(req, res) {
        var id = req.params.id;
        var newCount = req.params.count;
        // Need to do this so mongo doesn't think we're trying to edit the _id
  
	return new Promise((resolve, reject) => {

            Pimps.update({_id: id}, { $set: { count: newCount }}, (err, post) => {
		if (err) { reject(err); }
		resolve(JSON.parse(post));
            });
	});
     };
  */  

    //create a new post
	create : function(data, callback) {
	    console.log("ASDFKLPA");
	    console.dir(data);
	    var pimp = new Pimps(data);
	    pimp.save((err, post) => {
		if (err) { callback(err); }
		callback(false, post);
	    });
	},
    
     //delete a post
	delete : function(id, callback) {
	    Pimps.findOneAndRemove({_id: id}, (err, removedPost) => {
		if (err) { callback(err); }
		callback(false, removedPost);
	    });
	}

    } //module export    
    
//})();
