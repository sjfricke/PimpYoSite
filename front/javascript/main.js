function sendInput() {

    // get value from text input
    let url = $('#nameInput').val();

    if (!validateSite(url)) {
	$('#nameOutput').html("Invalid URL");
	return;
    }

    var threshold = 10; // 10%
    threshold = validateThreshold(threshold);
    if (threshold < 0) {
	$('#nameOutput').html("Invalid Threshold");
	return;
    }
    
    // makes call to server
    $.post('/pimpScript',
	   {
	       "url" : url,
	       "threshold" : threshold
	   },
	   function(result) {
	       //if (error) { alert(error); }
	       console.log(result);
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

// front line defense to bad threshold input
// returns threshold or -1 if bad
function validateThreshold(threshold) {
    if (threshold) {
	if (threshold == NaN  || threshold <= 0) {
	    console.log("--threshold needs to be a positive value representing the percentage");
	    return -1;
	} else {
	    return ((threshold / 100) + 1); //valid threshold as a inclusive percent (ex: 110%)
	}
    } else {
	return ((10 / 100) + 1); //default - 110%
    }
}
