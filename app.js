var config = require('config')
var net = require('net')
var _ = require('lodash')
var logger = require('winston');
logger.add(logger.transports.File, { filename: './logs/current.log' });
logger.remove(logger.transports.Console);

var socket = net.createConnection(config.telnet.port, config.telnet.host);

var autokill = require('./bin/autokill')(config.autokill, logger)
var chat = require('./bin/chat')(config.chat, logger)

var messages = require('./bin/messages')(config.messages, logger)
var handlers = [chat, autokill];


function sendCommand(cmd){
	//console.log(cmd)
	socket.write(cmd+'\r\n');
}

function sayMessage(msg){
	sendCommand('say "'+msg+'"');
}

function handleLine(line){
	//console.log(line);
	_.forEach(handlers, function(handler, index){
		var result = handler.test(line)
		if(result){
			handler.exec(line, sendCommand, sayMessage)
		}
	})
}





messages.on('say', function(msg){
	sayMessage(msg.data);
})



socket.on('data', function(data) {
  var line = (data+'')
  if(line.charCodeAt(0) !== 13){ // carriage return CR
  	handleLine(line)
  }
  
});

socket.on('connect', function() {
  // Login
  sendCommand(config.telnet.password);
  messages.start()
});

socket.on('end', function() {
  console.log('DONE');
});

socket.on('error', function(err) {
  console.error('error', err);
});





