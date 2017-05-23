var Nightmare = require('nightmare'); //used to run the headless browser
var nightmare = Nightmare({ show: false }); //default is true
const sanitize = require("sanitize-filename"); //used to make sure file names are correct
const fs = require('fs-extra'); //used to make directory checking eaiser

var image_process = require("./image_process.js"); //set of image processing functions
var __globals = require("./globals.js"); //used to hold local variables across application;

var known_black_list = __globals.blackList;
const DEBUG = __globals.debug;

module.exports = (SITE) => {
    return new Promise((resolve, reject) => {
	console.log("started Promise");
	SITE.io.emit("stage", {"remain" : "92%", "message": "Time to spot up this site yo"});
/********************************************
Nightmare (headless browser) sequence
********************************************/
    nightmare
    // First go to site
	.goto(SITE.url)
    
    // inject jquery to be able to evaluate DOM
	.inject('js', 'server_code/jquery.min.js') //TODO, not force pages with jQuery to load
    
    // runs a console expression on site to extract image details
	.evaluate(function(known_black_list){
	    var all_images = [];

	    // loops through and gets all the images on page useing jQuery
	    $('*').each(function(){
		var backImg;
		var good_img = true;
		var temp_object = {}; // need to be reset each loop #async
		
		// image is inline of html
		if ($(this).is('img') ) {
		    
		    //check if image url is on the known black list of URLs
		    for(var i = 0; i < known_black_list.length; i++) {
			if ( $(this)[0].src.indexOf(known_black_list[i]) != -1) {
			    good_img = false;
			    break; //found image on list
			}
		    }
		    if (good_img) {
			//temp_object.image = $(this);
			temp_object.src = ( $(this)[0].src );
			if (temp_object.src.endsWith(".gif")) { return; } //don't add gif to list
			if (temp_object.src.endsWith(".svg")) { return; } //don't add svg to list
			temp_object.display_width = $(this)[0].clientWidth;
			temp_object.display_height = $(this)[0].clientHeight;
			
			all_images.push(temp_object);
		    }
		    
		} else {
		    //image is embedded as a background image via css
		    //uses regex to grab image url from it
		    backImg = $(this).css('background-image');
		    if (backImg != 'none') {
			
			//temp_object.image = $(this);
			temp_object.display_width = $(this)[0].clientWidth;
			temp_object.display_height = $(this)[0].clientHeight;
			
			var bg_url = $(this).css('background-image');
			bg_url = /^url\((['"]?)(.*)\1\)$/.exec(bg_url);
			temp_object.src = ( bg_url[2] );
			
			if (temp_object.src.endsWith(".gif")) { return; } //don't add gif to list
			if (temp_object.src.endsWith(".svg")) { return; } //don't add svg to list
			
			all_images.push(temp_object);
		    }
		}
		//dont push to all_image each time as most of the * are not images
	    });
	    
	    return all_images;
	    
	}, known_black_list)
    
    // ends nightmare
	.end()
	.then(function (result) {

	    // Creates instance of site
	    var _site = require("./site.js")();

	    _site.id = SITE.id;
	    _site.url = SITE.url;
	    _site.threshold = SITE.threshold;
	    
	    /* result contains array of images with object
	       {
 	         display_height: Number,
    	         display_width: Number,
    	         src : String 
    	       }
    	    */

	    _site.count_image = result.length;
	    
	    for (let i = 0; i < _site.count_image; i++) {
		_site.images.push( require("./image")() );
		_site.images[i].display_width = result[i].display_width;
		_site.images[i].display_height = result[i].display_height;
		_site.images[i].src = result[i].src;
	    }
	    
	    //io - found X images
	    SITE.io.emit("stage", {"remain" : "80%", "message": "We got the good, times to examine"});
	    
	    // creates directory to store files
	    _site.new_directory = "results/" + SITE.id + "/";
	    _site.old_directory = "downloads/" + SITE.id + "/";
	    
	    // dir has now been created, including the directory it is to be placed in
	    // front appended as it can't be in URL to get image
	    fs.ensureDirSync("front/" + _site.new_directory, function (err) { console.log(err); })
	    fs.ensureDirSync( _site.old_directory, function (err) { console.log(err); })

	    for (var i = 0; i < _site.count_image; i++) {

		// makes sure there is a valid src for the iamge
		if (_site.images[i].src != 'undefined' || _site.images[i].src != null){

		    //console.log(i + ": ");
		    // io - path to image

		    // need to make sure its a valid file name, idk how its saved on the server anyways... TODO
		    _site.images[i].image_name = sanitize(_site.images[i].src.substring(_site.images[i].src.lastIndexOf("/") + 1));

		    // creates full file paths
		    _site.images[i].image_path = _site.new_directory + _site.images[i].image_name;
		    _site.images[i].download_path = _site.old_directory + _site.images[i].image_name;

		    // sets file size to -1 to easy validate if not changed
		    _site.images[i].old_size = -1;

		    _site.counter = 0; //reset counter incase

		    SITE.io.emit("stage", {"remain" : "70%", "message": "Illegally downloading photos"});
		    // downloads each image by passing in index of loop
		    image_process.download(_site.images[i], (return_image) => {

			//counts to wait to sync/barrier async for all images to download before resizing
			_site.counter++;

			//io - download
			console.log(return_image + " saved! \t" + _site.counter + " of " + _site.count_image);

			// Barrier - All files have been downloaded
			if (_site.counter == _site.count_image) {

			    _site.counter = 0; //reset counter
			    console.log("\n**************************\n");

			    SITE.io.emit("stage", {"remain" : "50%", "message": "Dang, you got big files boiii"});
			    // checks each image for needed to be resized or not
			    // since only last download calls it, we are now essetially blocking
			    image_process.checkSize(_site);
			    
			    console.log("\n**************************\n");
			    
			    SITE.io.emit("stage", {"remain" : "30%", "message": "Let me fix these for you"});
			    // resizes all images marked as too big
			    image_process.resize(_site, (element, resized) => {

			    if (resized) { _site.counter++; }

				// acts as synching barrier for resize
				if (_site.counter == _site.count_resize || _site.count_resize == 0) {

				    //done, report time
				    console.log("\n**************************\n");
				    console.log("SpeedMySite Report:");
				    console.log("_______________________________________________");
				    console.log("Files found: " + _site.count_image);
				    console.log("Files found for resizing: " + _site.count_resize);
				    console.log("Images Resized: ");
				    for(var i = 0; i < _site.count_image; i++){
				
						if (_site.images[i].resize) {
						    console.log("\t" + _site.images[i].image_name + " from " + _site.images[i].old_size + " to " + _site.images[i].new_size + " bytes");
						}
				    }

				    SITE.io.emit("stage", {"remain" : "0%", "message": "We did it Reddit!"});
				    _site.size_saved = (_site.size_old - _site.size_new);
				    
				    console.log("_______________________________________________");
				    console.log("Old files size: \t" + _site.size_old + " bytes");
				    console.log("New files size: \t" + _site.size_new + " bytes");
				    console.log("_______________________________________________");
				    console.log("Total size saved: \t" + _site.size_saved + " bytes");
				    console.log("\tor\t\t" + (_site.size_saved / 1024).toFixed(3) + " KB");
				    console.log("\tor\t\t" + (_site.size_saved / 1024 / 1024).toFixed(3) + " MB");
				    console.log("ALL GOOD:");
				    
				    resolve(_site);
				}
			    })
			    
			} // counter == count_image 
		    }); // download
		} else {
		    // on bad src
		    // TODO
		}
	    } // for(i < count_image) 
	    
	    console.log("\n**************************\n"); //barrier after file and url display
	}).catch(function (error) {
	    console.log(error);
//	    reject("Search failed: " + error);
	}); //end of Nightmare    
    }); // promise
}// module.export


//Work around to check if jquery is there or not
//.evaluate(function () {if (typeof jQuery != 'undefined') { return jQuery.fn.jquery; } else {  return  jQuery.fn.jquery; }})
