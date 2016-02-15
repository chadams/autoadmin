var config = require('config')
var _ = require('lodash')
var logger = require('winston');
logger.add(logger.transports.File, { filename: './logs/current.log' });
logger.remove(logger.transports.Console);

var telnet = require('./bin/telnet')(config.telnet)

var autokill = require('./bin/autokill')(config.autokill, logger)
var chat = require('./bin/chat')(config.chat, logger)

var messages = require('./bin/messages')(config.messages, logger)
var handlers = [chat, autokill];


messages.on('say', function(msg){
	telnet.sayMessage(msg.data);
})


function handleLine(line){
	//console.log('line', line);
	_.forEach(handlers, function(handler, index){
		var result = handler.test(line)
		if(result){
			handler.exec(line, telnet.sendCommand, telnet.sayMessage)
		}
	})
}


telnet.on('data', function(e) {
  var line = (e.data+'')
  if(line.charCodeAt(0) !== 13){ // carriage return CR
  	handleLine(line)
  }
});


telnet.connect()


