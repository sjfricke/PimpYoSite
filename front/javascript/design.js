var startPageSwap;

$(document).ready(function(){
    var header = $('body');

    var __current = 0;

    function nextBackground() {

        if (__current == 0) { 
            header.css('background-image', "url('" + hex_1_base64 + "')");
            __current++;
        } else if (__current == 1) {
            header.css('background-image', "url('" + hex_2_base64 + "')");
            __current++;
        } else {
            header.css('background-image', "url('" + hex_3_base64 + "')");
            __current = 0;
        }

    }
    
    startPageSwap = setInterval(nextBackground, 1000);

    header.css('background-image', "url('" + hex_1_base64 + "')");
    header.css('background-position', "center");
    header.css('background-size', "contain");
});


function setLoadingScreen() {

    clearInterval(startPageSwap); // clears animation

    // swaps dom up
    $("body").css("background", "");
    document.getElementById("startPage").style.display = "none";
    document.getElementById("loadingPage").style.display = "block";
    document.getElementById("loadingBar").style.display = "block";

}

function setResultPage() {
    document.getElementById("loadingPage").style.display = "none";
    document.getElementById("loadingBar").style.display = "none";
    document.getElementById("resultPage").style.display = "inline";

    resultScript();
}
