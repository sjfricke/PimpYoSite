const fs = require('fs'); //used to read and write to file
const request = require('request'); //used to download
const resizeImg = require('resize-img');

var __globals = require("./globals"); //used to hold local variables across application;
const DEBUG = __globals.debug;

// These functions are exported to modulize the files
// Have created functions to use global array
module.exports = {
    
    download: function(index, callback){
        
        var uri = __globals.images[index].src;
        var file_name = __globals.images[index].file_name;
        var image_name = __globals.images[index].image_name;        
        
//        if (DEBUG){console.log("\turi: " + uri);}
  //      if (DEBUG){console.log("\tfile name: " + file_name);}
        
        request.head(uri, function(err, res, body){
            
//        if (DEBUG){console.log("attempting: " + image_name);} // res.headers['content-type']
            
            // file size in bytes, note 1024 not 1000 from bytes to KB
            __globals.images[index].file_size = res.headers['content-length'];            
            
            //downloads and sends callback when done
            request(uri).pipe(fs.createWriteStream("front/" + file_name))
            .on('close', function(){
                callback(image_name);
            })
            .on('error', function(err){
                console.error("DOWNLOAD ERROR:");
                console.error(err);
            });
      });
    },
    
    checkSize: function(threshold, callback) {
        var fix_list = [];
        for (var i = 0; i < __globals.images.length; i++) {
              
	    //gets actual photo size
	    var probe = require('probe-image-size');
	    let dimensions = fs.readFileSync("front/" + __globals.images[i].file_name);
	    dimensions = (probe.sync(dimensions));
	    __globals.images[i].old_width = dimensions.width;
            __globals.images[i].old_height = dimensions.height;
            __globals.images[i].file_type = dimensions.type;

	    if (__globals.images[i].display_width <= 0 || __globals.images[i].display_height <= 0) {

		__globals.images[i].resize = false; // ignore invalid display sizes
		
            } else if ((__globals.images[i].old_width >= __globals.images[i].display_width * threshold) &&  //checks if size is out of size range
                       (__globals.images[i].old_height >= __globals.images[i].display_height * threshold)   //give 10% margin by default
            ) {
                __globals.images[i].resize = true;
                __globals.size.old += parseInt(__globals.images[i].file_size); //to compare to size resized
                __globals.resize_count++;
                __globals.images[i].new_width = Math.floor(__globals.images[i].display_width * threshold);
                __globals.images[i].new_height = Math.floor(__globals.images[i].display_height * threshold);
		
            } else {

		__globals.images[i].resize = false; //better to have false then undefined

	    }
            console.log(__globals.images[i].resize);
            // prints out width and heights of display and download size
            console.log(__globals.images[i].image_name + "\n\t\t width: " + __globals.images[i].old_width + " should be: " + __globals.images[i].display_width + "\n\t\t height: " + __globals.images[i].old_height + " should be: " + __globals.images[i].display_height);
	}
        callback();
    },    
    
    //directory passed in is new directory to place new photos
    resize: function(directory, threshold, callback) {
        
        __globals.images.forEach(function(element, index, array) {
            if (!element.resize) {
                callback(); //skip image, its already a good size
            } else {                
                //console.dir(element);
                resizeImg(fs.readFileSync("front/" + element.file_name), {width : element.new_width, height : element.new_height} )
                .then(function(buf){
                    fs.writeFileSync("front/" + directory + element.image_name, buf);
                    
                    if (DEBUG){console.log("Resized file wrote to: " + directory + element.image_name);}
                    
                    __globals.images[index].new_file_size = buf.byteLength;   
                    __globals.size.new += buf.byteLength;   
                    
                    callback(element);
                }).catch(function (err) {
                     console.error("Error Resizing " + err);
                });   
            }
        });
        
    } 
    
}
