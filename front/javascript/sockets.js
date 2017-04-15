var socket = io.connect();

socket.on('connect', function(data) { 
});

io.emit('playerUpdate', {"player" : currentPlayer, "device" : device}); 