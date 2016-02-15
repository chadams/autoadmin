
/*

 */

var _ = require('lodash')
var Emitter = require('emmett')
var util = require('util')
var net = require('net')
var Promise = require('bluebird')

var defaults = {
	host: "www.bluefangsolutions.com",
	port: 1000,
	password: "<password>",
	restart: 5000
};

function MainClass(options){
	if (! (this instanceof MainClass)) return new MainClass(options);
	this.options = _.extend({}, defaults, options)
	this.running = false;
	this.plugins = [];
	Emitter.call(this)
};

MainClass.prototype._connect = function(){
  // Login
  this.running = true
  this.sendCommand(this.options.password);
	this.emit('connect')
}

MainClass.prototype._data = function(data){
  var line = (data+'')
  if(line.charCodeAt(0) !== 13){ // carriage return CR
  	this._handleLine(line)
  }
	this.emit('data', data)
}

MainClass.prototype._handleLine = function(line){
	//console.log('line', line);
	var self = this;
	_.forEach(this.plugins, function(handler, index){
		var result = handler.test(line)
		if(result){
			handler.exec(line, self)
		}
	})
}

MainClass.prototype._end = function(had_error){
	console.log('DONE');
	this.emit('end')
	this.reconnect();
}

MainClass.prototype._error = function(err){
	console.error('error', err);
	this.emit('error', err)
	this.reconnect();
}

MainClass.prototype._timeout = function(){
	console.error('timeout');
	this.emit('timeout')
	this.reconnect();
}

////////////////

MainClass.prototype.connect = function(){
	console.log('Connecting to', this.options.host, this.options.port);
	this.socket = net.createConnection(this.options.port, this.options.host);
	this.socket.on('connect', this._connect.bind(this));
	this.socket.on('end', this._end.bind(this));
	this.socket.on('error', this._error.bind(this));
	this.socket.on('data', this._data.bind(this));
	this.socket.on('timeout', this._timeout.bind(this));
}

MainClass.prototype.close = function(cmd){
	this.socket.destroy()
	this.running = false
}

MainClass.prototype.reconnect = function(cmd){
	this.close()
	var self = this;
	console.log('Reconnecting...');
	Promise.delay(self.options.restart)
	.then(function(){
		self.connect()
	})
}

MainClass.prototype.sendCommand = function(cmd){
	if(!this.running){
		return;
	}
	this.socket.write(cmd+'\r\n');
}

MainClass.prototype.sayMessage = function(msg){
	this.sendCommand('say "'+msg+'"');
}

MainClass.prototype.setPlugins = function(list){
	this.plugins = list
}


util.inherits(MainClass, Emitter);


module.exports = MainClass;



