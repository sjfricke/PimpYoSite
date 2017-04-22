// The outline diffinition for each image
module.exports = function() {
    return {
	// The source of each image
	src : "", 

	// Just the image file name
	image_name : "",

	// path the get image when needed
	image_path : "",
	
	// path to image from held to download
	download_path : "",

	// MIME type
	image_type : "",

	// display info of image
	display_width : -1,
	display_height : -1,
	
	// original meta data of image
	old_size : -1,
	old_width : -1,
	old_height : -1,

	// if image needs to be resized
	resize : false,

	// optional new meta data if resize is true
	new_size : -1,
	new_width : -1,
	new_height : -1
    };
}
