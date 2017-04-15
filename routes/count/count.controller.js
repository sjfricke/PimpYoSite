(function() {
    'use strict';

    var Count = require('./count.model');


//Basic CRUD
    
    //grab all for display
    module.exports.get = function(req, res) { 
        Count.find({_id: req.params.id}, function (err, post) {
            if (err) {
                console.error(err);
                return res.status(500).send(err);
            }
            res.json(post);
        });
    };

    //edit exsisting one
     module.exports.update = function(req, res) {
        var id = req.params.id;
        var newCount = req.params.count;
        // Need to do this so mongo doesn't think we're trying to edit the _id
  
        Count.update({_id: id}, { $set: { count: newCount }}, function(err, post) {
          if (err) {
                console.error(err);
                return res.status(500).send(err);
          }  
          res.json(post);
        });
     };
    
    //create a new post
    module.exports.start = function(req, res) {
        var count = new Count({count: 0});
        count.save(function(err, post) {
          if (err) {
                console.error(err);
                return res.status(500).send(err);
          }
          res.json(post);
        });
     };
    
     //delete a post
     module.exports.delete = function(req, res) {
         var id = req.params.id;
         Count.findOneAndRemove({_id: id}, function(err, removedPost) {
          if (err) {
            console.error(err);
            return res.status(500).send(err);
          }
          res.json(removedPost);
        });
     };
  

    
    
})();