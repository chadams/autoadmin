/*
list = {
				"when":"00 00 12 * * 0",
				"action":"setgamepref LandClaimOnlineDurabilityModifier 2",
				"autostart":true
			}

 */

var _ = require('lodash')
var Emitter = require('emmett')
var util = require('util')
var Promise = require('bluebird')
var CronJob = require('cron').CronJob;

var re = /Player (.+) eliminated Player (.+)/;

var defaults = {
	list:[],
	"timezone": "America/New_York"
};

function MainClass(options, logger){
	if (! (this instanceof MainClass)) return new MainClass(options, logger);
	this.options = _.extend({}, defaults, options)
	this.logger = logger
	Emitter.call(this)




};

MainClass.prototype.start = function(line){

	var self = this
	this.crons = []

	this.options.list.forEach(function(action){
		var func = function(){
			console.log(action.action)
			self.emit('command', action.action)
		}
		var cron = new CronJob(action.when, self.start, func, true, self.options.timezone, self)
		self.crons.push(cron)
		if(action.autostart){
			func()
		}
	})

	
}

//////

util.inherits(MainClass, Emitter);


module.exports = MainClass;











