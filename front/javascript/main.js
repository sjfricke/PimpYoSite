var _results = {};

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
			setResultPage();
		}
	});

}



function resultScript() {

    var printString = "";
    
    printString += ("\n**************************<br><br>");
    printString += ("SpeedMySite Report:<br><br>");
    printString += ("_______________________________________________<br><br>");
    printString += ("Files found: " + _results.images_total + "<br><br>");
    printString += ("Files found for resizing: " + _results.images_bad + "<br><br>");
    printString += ("Images Resized: <br><br>");
    for(var i = 0; i < _results.images_data[i].length; i++){

		console.log(_results.images_data[i]);
		if (_results.images_data[i].resize ) {
		    printString += ("\t" + _results.images_data[i].image_name + " from " + _results.images_data[i].file_size + " to " + _results.images_data[i].new_file_size + " bytes <br><br>");
		}
    }
    
    printString += ("<br><br>_______________________________________________<br><br>");
    printString += ("Old files size: \t" + _results.old_size + " bytes<br><br>");
    printString += ("New files size: \t" + _results.new_size + " bytes<br><br>");
    printString += ("_______________________________________________<br><br>");
    printString += ("Total size saved: \t" + _results.total_saved + " bytes<br><br>");
    printString += ("\tor\t\t" + (_results.total_saved / 1024).toFixed(3) + " KB<br><br>");
    printString += ("\tor\t\t" + (_results.total_saved / 1024 / 1024).toFixed(3) + " MB<br><br>");

    document.getElementById("report").innerHTML = printString;

    var oldString = "";
    var newString = "";

    for(let i = 0; i < _results.images_data.length; i++) {
	let img = _results.images_data[i];
	if( img.resize) {
	    let newImg = img.file_name.replace("/old/", "/new/");
	    newString +=( "<a href=\'" + newImg + "\'> " + img.image_name +  "  --  saved " + ( parseInt(img.file_size) - img.new_file_size) + " bytes </a><br>" );
	}
	oldString += ( "<a href=\'" + img.src + "\'> " + img.image_name + "</a><br>" );
	
    }
    document.getElementById("newLinks").innerHTML = newString;
    document.getElementById("oldLinks").innerHTML = oldString;
    
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
