var _results = {};

function sendInput() {
    
    // get value from text input
    var url = $('#nameInput').val();

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

    // waits until after quick front side validation scan
    setLoadingScreen();
    
	// makes call to server
	$.post('/pimpScript',
	{
		"url" : url,
		"threshold" : threshold
	},
	function(result, statusText, xhr) {
		_results = result;

		// reloads pages on error
		if (xhr.status != 200) {
			alert(result);
			location.reload();
		} else {
			//window.open('/results/' + results.id);
		    console.dir(result);
		    setResultPage();
		}
	});

}

function resultScript() {

    var printString = "";
    
    printString += ("Files found: <span style='color:red;'>" + _results.count_image + "</span><br>");
    printString += ("Files found for resizing: <span style='color:red;'>" + _results.count_resize + "</span><br>");
    printString += ("Pimped Yo Site from <span style='color:red;'>" + _results.size_old + "</span> bytes");
    printString += ("<span class='rainbowText'> =====>>>> </span> <span style='color:red;'>" + _results.size_new + "</span> bytes<br>");
    printString += ("Total size saved: <span style='color:red;'>" + _results.size_saved + "</span> bytes ");
    printString += ("or <span style='color:green;'>" + (_results.size_saved / 1024).toFixed(3) + "</span> KB ");
    printString += ("or <span style='color:blue;'>" + (_results.size_saved / 1024 / 1024).toFixed(3) + "</span> MB");

    document.getElementById("reportStatus").innerHTML = printString;

    printString = "<table class='table table-striped'><thead align='center'><tr style='text-align:center;font-size:150%;'>";
    printString += "<th class='center'>Image</th><th class='center'>Old Size</th><th class='center'>Old Link</th><th class='center'>New Size</th><th class='center'>New Link</th></tr></thead>";

    for(var i = 0; i < _results.images.length; i++){
		if (_results.images[i].resize ) {
			printString += ("<tr><td>" + _results.images[i].image_name + "</td>");
			printString += ("<td>" + _results.images[i].old_size + "</td>");
			printString += ("<td><a href='" + _results.images[i].src + "' target='_blank'>Old Link</a></td>");
			printString += ("<td>" + _results.images[i].new_size + "</td>");
			printString += ("<td><a href='" + _results.images[i].image_path + "' target='_blank'>Pimped Image</a></td></tr>");
		}
    }
    
    document.getElementById("report").innerHTML = printString;

  //   var oldString = "";
  //   var newString = "";

  //   for(var i = 0; i < _results.images.length; i++) {
	
		// var img = _results.images[i];
		// if( img.resize ) {
		//     //var newImg = img.file_name.replace("/old/", "/new/");
		//     newString +=( "<a href=\'" + img.image_path + "\'> " + img.image_name +  "  --  saved " + ( parseInt(img.old_size) - img.new_size) + " bytes </a><br>" );
		// }

		// oldString += ( "<a href=\'" + img.src + "\'> " + img.image_name + "</a><br>" );
  //   }

  //   document.getElementById("newLinks").innerHTML = newString;
  //   document.getElementById("oldLinks").innerHTML = oldString;
    
};

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
