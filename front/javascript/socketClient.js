var socket = io();

socket.on('stage', function(data){
    document.getElementById("loadingBar").style.width = data.remain;

    document.getElementById("loadingMessage").innerHTML = data.message;
    
    //console.log(data);
});
