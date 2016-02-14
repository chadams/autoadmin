
/*

 */

var _ = require('lodash')
var Emitter = require('emmett')
var util = require('util')


var defaults = {
	list: [],
	interval: 5, // in minutes
	color:''
};

function MainClass(options){
	if (! (this instanceof MainClass)) return new MainClass(options);
	this.options = _.extend({}, defaults, options)
	this.time = this.options.interval * 1000 * 60
	this.index = 0
	Emitter.call(this)
};

MainClass.prototype.start = function(){
	var self = this
	this.id = setInterval(function(){
		self._nextMessage()
	}, this.time)
}



MainClass.prototype._nextMessage = function(){
	var pos = this.index%this.options.list.length
	if(!_.isNaN(pos)){
		this.sendMessage(this.options.list[pos])
		this.index++;
	}
}

MainClass.prototype.sendMessage = function(msg){
	this.emit('say', this.options.color+msg)
}

MainClass.prototype.stop = function(){
		clearInterval(this.id)
		this.index = 0
}

util.inherits(MainClass, Emitter);


module.exports = MainClass;



