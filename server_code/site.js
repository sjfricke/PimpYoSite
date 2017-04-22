// The outline diffinition for each image
module.exports = function(){ 
    return {   
	// id and url for instance of pimp
	id: 0,

	// url of site getting pimped
	url: "",

	// number of images found on the site
	count_image : 0,
	
	// number of images to be resized
	count_resize : 0,

	// size of total image files to be compared at end
	size_old : 0,
	size_new : 0,
	size_saved : 0,

	// threshold used to determine to resize image
	threshold: 1.1, 

	// directory to hold images
	new_directory : "",

	// directory to hold images downloaded
	// will be deleted in timly fashion by server after used
	old_directory : "",
	
	// the array of each image and the meta data with it
	images : [],

	// TODO see if still need a dirty bit counter
	counter : 0
    };
}
