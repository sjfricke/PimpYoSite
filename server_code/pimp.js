var Nightmare = require('nightmare'); //used to run the headless browser
var nightmare = Nightmare({ show: false }); //default is true
var sanitize = require("sanitize-filename"); //used to make sure file names are correct
var fs = require('fs-extra'); //used to make directory checking eaiser

var image_process = require("./image_process.js"); //set of image processing functions
var __globals = require("./globals.js"); //used to hold local variables across application;

var known_black_list = __globals.blackList;
const DEBUG = __globals.debug;

module.exports = (SITE) => {
    console.log("start pimp");
  //  return new Promise((resolve, reject) => {
    console.log("starting return:  " + DEBUG);
    console.dir(SITE);

    console.log(known_black_list);
//    return "TESTTT";
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
	    return "test";

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
			temp_object.image = $(this);
			temp_object.src = ( $(this)[0].src );
			if (temp_object.src.endsWith(".gif")) { return; } //don't add gif to list
			temp_object.display_width = $(this)[0].clientWidth;
			temp_object.display_height = $(this)[0].clientHeight;
			
			all_images.push(temp_object);
		    }
		    
		} else {
		    //image is embedded as a background image via css
		    //uses regex to grab image url from it
		    backImg = $(this).css('background-image');
		    if (backImg != 'none') {
			
			temp_object.image = $(this);
			temp_object.display_width = $(this)[0].clientWidth;
			temp_object.display_height = $(this)[0].clientHeight;
			
			var bg_url = $(this).css('background-image');
			bg_url = /^url\((['"]?)(.*)\1\)$/.exec(bg_url);
			temp_object.src = ( bg_url[2] );
			
			if (temp_object.src.endsWith(".gif")) { return; } //don't add gif to list
			
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
	    console.log("Images found");
	    __globals.images = result;
	    __globals.image_count = result.length;
	    
	    if (DEBUG) {
		console.log("**************************\n");
		console.log(__globals.image_count + " images found");
		console.log("\n**************************\n");
	    }
	    
	    // creates directory to store files
	    var directory_old = "results/" + SITE.id + "/old/";
	    var directory_new = "results/" + SITE.id + "/new/";
	    
	    // dir has now been created, including the directory it is to be placed in
	    fs.ensureDirSync(directory_old, function (err) { console.log(err); })
	    fs.ensureDirSync(directory_new, function (err) { console.log(err); })

	    for (var i = 0; i < __globals.image_count; i++) {

		// makes sure there is a valid src for the iamge
		if (__globals.images[i].src != 'undefined' || __globals.images[i].src != null){

		    if (DEBUG){console.log(i + ": ");}

		    // need to make sure its a valid file name, idk how its saved on the server anyways... TODO
		    __globals.images[i].image_name = sanitize(__globals.images[i].src.substring(__globals.images[i].src.lastIndexOf("/") + 1));

		    // creates full file name
		    __globals.images[i].file_name = directory_old + __globals.images[i].image_name;

		    // sets file size to -1 to easy validate if not changed
		    __globals.images[i].file_size = -1;

		    __globals.counter = 0; //reset counter

		    // downloads each image by passing in index of loop
		    console.log("download");
		    image_process.download(i, (return_image) => {

			//counts to wait to sync/barrier async for all images to download before resizing
			__globals.counter++;
			if (DEBUG){console.log(return_image + " saved! \t" + __globals.counter + " of " + __globals.image_count);}

			// All files have been downloaded
			if (__globals.counter == __globals.image_count) {

			    __globals.counter = 0; //reset counter
			    if (DEBUG){console.log("\n**************************\n");}

			    // checks each image for needed to be resized or not
			    image_process.checkSize(SITE.threshold, () => {
				if (DEBUG){console.log("\n**************************\n");}

				// resizes all images marked as too big
				image_process.resize(directory_new, SITE.threshold, (element) => {

				    __globals.counter++;

				    if (__globals.counter == __globals.resize_count) {
					//done, report time
					if (DEBUG){console.log("\n**************************\n");}
					console.log("SpeedMySite Report:");
					console.log("_______________________________________________");
					console.log("Files found: " + __globals.image_count);
					console.log("Files found for resizing: " + __globals.resize_count);
					console.log("Images Resized: ");
					for(var i = 0; i < __globals.image_count; i++){
					    if (__globals.images[i].resize) {
						console.log("\t" + __globals.images[i].image_name + " from " + __globals.images[i].file_size + " to " + __globals.images[i].new_file_size + " bytes");
					    }
					}
					console.log("_______________________________________________");
					console.log("Old files size: \t" + __globals.size.old + " bytes");
					console.log("New files size: \t" + __globals.size.new + " bytes");
					console.log("_______________________________________________");
					var total_saved = (__globals.size.old - __globals.size.new);
					console.log("Total size saved: \t" + total_saved + " bytes");
					console.log("\tor\t\t" + (total_saved / 1024).toFixed(3) + " KB");
					console.log("\tor\t\t" + (total_saved / 1024 / 1024).toFixed(3) + " MB");
					//resolve("All good");
				    }


				})
			    });
			}

		    });
		}
	    }
	    if (DEBUG){console.log("\n**************************\n");} //barrier after file and url display
	})
	.catch(function (error) {
	    return('Search failed:' +  error);
	    //reject("Search failed: " + error);
	}); //end of Nightmare


    //Work around to check if jquery is there or not
    //.evaluate(function () {if (typeof jQuery != 'undefined') { return jQuery.fn.jquery; } else {  return  jQuery.fn.jquery; }})

    
    //    }); // promise
}// module.export
