var config = require('config')
var _ = require('lodash')
var logger = require('winston');
logger.add(logger.transports.File, { filename: './logs/current.log' });
logger.remove(logger.transports.Console);

var telnet = require('./bin/telnet')(config.telnet, logger)

var MessagesController = require('./bin/messages')
var messages = MessagesController(config.messages, logger)
var alerts = MessagesController(config.alerts, logger)
var actions = require('./bin/actions')(config.actions, logger)
var respawn = require('./bin/respawn')(config.respawn, logger)

// init plugins
var autokill = require('./bin/autokill')(config.autokill, logger)
var chat = require('./bin/chat')(config.chat, logger)

// install plugins
telnet.setPlugins([chat, autokill])

// events
messages.on('say', function(msg){
	telnet.sayMessage(msg.data);
})
alerts.on('say', function(msg){
	telnet.sayMessage(msg.data);
})
actions.on('command', function(msg){
	telnet.sendCommand(msg.data);
})
telnet.on('connect', function(msg){
	messages.start()
	alerts.start()
	actions.start()
})

telnet.connect()



