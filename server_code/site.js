// The outline diffinition for each image
module.exports = { 
       
    // id and url for instance of pimp
    id: 0,

    // url of site getting pimped
    url: "",

    // number of images found on the site
    count_image : 0,
    
    // number of images to be resized
    count_resize : 0,

    // size of total image files to be compared at end
    size_old : 0.
    size_new : 0,
    size_saved : 0,

    // threshold used to determine to resize image
    threshold: 1.1, 

    // directory to hold images
    new_directory : "",

    // the array of each image and the meta data with it
    images : []

}
