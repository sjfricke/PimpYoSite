var startPageSwap;

$(document).ready(function(){
    var header = $('body');

    var __current = 0;

    function nextBackground() {

    if (__current == 0) { 
    header.css('background-image', "url('images/hex_1.png')");
    __current++;
    } else if (__current == 1) {
    header.css('background-image', "url('images/hex_2.png')");
    __current++;
    } else {
    header.css('background-image', "url('images/hex_3.png')");
    __current = 0;
    }

    }
    
    startPageSwap = setInterval(nextBackground, 1000);

    header.css('background-image', "url('images/hex_1.png')");
    header.css('background-position', "center");
    header.css('background-size', "cover");
});


function setLoadingScreen() {

    clearInterval(startPageSwap); // clears animation

    // swaps dom up
    $("body").css("background", "");
    document.getElementById("startPage").style.display = "none";
    document.getElementById("loadingPage").style.display = "inline";
    document.getElementById("loadingBar").style.display = "inline";
}

function setResultPage() {
    document.getElementById("loadingPage").style.display = "none";
    document.getElementById("loadingBar").style.display = "none";
    document.getElementById("resultPage").style.display = "inline";

    resultScript();
}
