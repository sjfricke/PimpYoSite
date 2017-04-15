//-------------------------Module "Importing"-----------------------------//
var express = require('express'); //used as routing framework
var app = express(); //creates an instance of express

//modules required (same idea of #includes or Imports)
var path = require('path'); //Node.js module used for getting path of file
var logger = require('morgan'); //used to log in console window all request
var cookieParser = require('cookie-parser'); //Parse Cookie header and populate req.cookies
var bodyParser = require('body-parser'); //allows the use of req.body in POST request
var server = require('http').createServer(app); //creates an HTTP server instance
var http = require('http'); //Node.js module creates an instance of HTTP to make calls to Pi
//var io = require('./sockets').listen(server) //allows for sockets on the HTTP server instance

//add for Mongo support
var mongoose = require('mongoose');
var mongoURI = "mongodb://127.0.0.1:27017/PimpYoSite";
var MongoDB = mongoose.connect(mongoURI).connection;
MongoDB.on('error', function(err) { console.log(err.message); });
MongoDB.once('open', function() {
  console.log("mongodb connection open");
});

var api = require('./routes/api'); //gets api logic from path
var pimp_db = require('./routes/pimps/pimps.controller.js');
var pimp = require('./server_code/pimp.js');
var __globals = require('./server_code/globals.js');

//-------------------------Express JS configs-----------------------------//
//view engine setup
//app.set('views', './views'); //says where in root directory the find files (./views)
//app.set('view engine', 'ejs'); //says which engine being used (ejs)

app.use(logger('dev')); //debugs logs in terminal
app.use(bodyParser.json()); //parses json and sets to body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'front'))); //sets all static file calls to folder

//---------------API-------------------//
app.use('/api', api);


app.get('/', (req, res, next) => {
  res.sendFile('index.html');
});

app.post('/pimpScript', (req, res, next) => {

    // First validate values
    // do on server side to prevent glitch bypassing front
    // or that guy who reads the sources and post-man trolls me
    if (!validateSite(req.body.url)) {
	res.status(400).send("Invalid Website URL");
	return;
    }
    
    if (req.body.threshold == NaN  || req.body.threshold < 1) {
	res.status(400).send("threshold needs to be a positive value representing the percentage");
	return;
    }
	
    
    pimp({
	"url" : req.body.url,
	"id" : (new Date()).getTime(),
	"threshold": req.body.threshold
    }).then((data) => {
	pimp_db.create(data, (err, post) => {
	    if (err) {
		console.log("ERROROROR");
		res.status(401).send(err);
		return;
	    }
	    res.status(200).json(post);
	    return;	    
	})
    }).catch((error) => {
	console.log("ERRRRROR" + error);
	res.status(402).send(error);
	return;
    });
    
});

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err); 
});*/

// error handlers
/*app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
});*/


// ------------ Helper Functions -----------//

// checks and makes sure site is valid
// note: valid doesn't mean it will work, server_code checks that
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

// ------------ Server Setup --------------//


/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '6419');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

