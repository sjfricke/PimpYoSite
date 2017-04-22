const fs = require('fs'); //used to read and write to file
const request = require('request'); //used to download
const resizeImg = require('resize-img');

var __globals = require("./globals"); //used to hold local variables across application;
const DEBUG = __globals.debug;

// These functions are exported to modulize the files
// Have created functions to use global array
module.exports = {
    
    download: function(image, callback){
        
        var uri = image.src;
        var download_path = image.download_path;
	var image_name = image.image_name; // used for debugging from caller
	
	// if (DEBUG){console.log("\turi: " + uri);}
	// if (DEBUG){console.log("\tfile name: " + file_name);}
        
        request.head(uri, function(err, res, body){
            
	    // if (DEBUG){console.log("attempting: " + image_name);} // res.headers['content-type']
            
            // file size in bytes, note 1024 not 1000 from bytes to KB
            image.old_size = res.headers['content-length'];            
            
            //downloads and sends callback when done
            request(uri).pipe(fs.createWriteStream(download_path))
            .on('close', function(){
                callback(image_name); //image_name used to debug
            })
            .on('error', function(err){
                console.error("DOWNLOAD ERROR:");
                console.error(err);
            });
      });
    },
    
    checkSize: function(_site) {

        for (var i = 0; i < _site.images.length; i++) {
              
	    //gets actual photo size
	    var probe = require('probe-image-size');
	    let dimensions = fs.readFileSync(_site.images[i].download_path);
	    dimensions = (probe.sync(dimensions));
	    _site.images[i].old_width = dimensions.width;
            _site.images[i].old_height = dimensions.height;
            _site.images[i].image_type = dimensions.type;

	    if (_site.images[i].display_width <= 0 || _site.images[i].display_height <= 0) {

		_site.images[i].resize = false; // ignore invalid display sizes
		
            } else if ((_site.images[i].old_width >= _site.images[i].display_width * _site.threshold) &&  //checks if size is out of size range
                       (_site.images[i].old_height >= _site.images[i].display_height * _site.threshold)   //give 10% margin by default
            ) {
                _site.images[i].resize = true;
//                _site.size_old += parseInt(_site.images[i].old_size); //to compare to size resized
                _site.count_resize++;
                _site.images[i].new_width = Math.floor(_site.images[i].display_width * _site.threshold);
                _site.images[i].new_height = Math.floor(_site.images[i].display_height * _site.threshold);
		
            } else {

		_site.images[i].resize = false; //better to have false then undefined

	    }
	    _site.size_old += parseInt(_site.images[i].old_size); //to compare to size resized
            console.log(_site.images[i].resize);
            // prints out width and heights of display and download size
            console.log(_site.images[i].image_name + "\n\t\t width: " + _site.images[i].old_width + " should be: " + _site.images[i].display_width + "\n\t\t height: " + _site.images[i].old_height + " should be: " + _site.images[i].display_height);
	}
        return;
    },    
    
    //directory passed in is new directory to place new photos
    resize: function(_site, callback) {
        
        _site.images.forEach(function(element, index, array) {
            if (!element.resize) {
                callback(); //skip image, its already a good size
            } else {                
                //console.dir(element);
                resizeImg(fs.readFileSync(element.download_path), {width : element.new_width, height : element.new_height} )
                .then(function(buf){
                    fs.writeFileSync("front/" + element.image_path, buf);
                    
                    if (DEBUG){console.log("Resized file wrote to: " + element.image_path);}
                    
                   element.new_size = buf.byteLength;   
                   _site.size_new += buf.byteLength;   
                    
                    callback(element);
                }).catch(function (err) {
                     console.error("Error Resizing " + err);
                });   
            }
        });
        
    } 
    
}
