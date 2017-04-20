// The outline diffinition for each image
module.exports = { 
    
    // The source of each image
    src : "", 

    // Just the image file name
    image_name : "",

    // path to image from server relative to index.html
    file_path : "",

    // MIME type
    file_type : "",

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

}
