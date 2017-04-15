function sendInput() {

    // get value from text input
    let url = $('#nameInput').val();

    if (!validateSite(url)) {
	$('#nameOutput').html("Invalid URL");
	return;
    }
    
    // makes call to server
    $.post('/pimpScript',
	   {
	       "url" : url
	   },
	   function(result) {
	$('#nameOutput').html(result);
    });
}

// checks and makes sure site is valid
// note: valid doesn't mean it will work, server checks that
// returns false if not valid
function validateSite(url) {
    var pattern = new RegExp(
	'^(https?:\\/\\/)?'+ // protocol
	'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
	'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
	'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
	'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(url);
}
