// set of global values to be held during the entire script
//
// Wait, globals? but you shouldn't use globals...
//      well with this being my first large asynch node script it made stuff a lot cleaner
//      If you have a better suggestion to get rid of globals, message me up! I love to learn stuff
module.exports = { 

    // turns on debugging for whole server code
    debug: true,
    
    // the array of each image and the meta data with it
    images : [],
    
    // size of total image files to be compared at end
    size : {
        old : 0,
        new : 0 
    },
    
    // number of images found on the site
    image_count : 0,
    
    // number of images to be resized
    resize_count : 0,
    
    // generic counter to synch up asynch operations
    counter : 0,
    
    //used to return an array of known black list sites
    //"blacklist" refers to sources of images not to check
    //example: google maps
    blackList: [
            "https://maps.googleapis.com",
            "https://maps.gstatic.com"
    ]
    
}
