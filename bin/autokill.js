/*

auto kills players who player kill
ban	<playername> <duration> <unit>	Bans user for period specified by duration and unit. Unit can be anything of: minutes, hours, days, weeks, months, years
 */

var _ = require('lodash')
var Emitter = require('emmett')
var util = require('util')
var Promise = require('bluebird')
var CronJob = require('cron').CronJob;

var re = /Player (.+) eliminated Player (.+)/;

var defaults = {
	start: "00 00 12 * * 0",
	stop : "00 59 23 * * 0",
	timezone: 'America/New_York',	
	duration: 5,
	unit: 'days',
	reason: "No player killing allowed"
};

function MainClass(options, logger){
	if (! (this instanceof MainClass)) return new MainClass(options, logger);
	this.options = _.extend({}, defaults, options)
	this.logger = logger
	Emitter.call(this)
	this.purge = false
	this.startPurgeJob = new CronJob(options.start, this.start, _.noop, true, options.timezone, this)
	this.stopPurgeJob = new CronJob(options.stop, this.stop, _.noop, true, options.timezone, this)
};

MainClass.prototype.start = function(line){
	console.log('START the purge')
	this.purge = true
}

MainClass.prototype.stop = function(line){
	console.log('STOP the purge')
	this.purge = false
}

//////

MainClass.prototype.test = function(line){
	return re.test(line)
}

MainClass.prototype.exec = function(line, sendCommand, sayMessage){
	if(this.purge){
		return; // killing is allowed
	}
	var options = this.options
	var res = re.exec(line)
	var killer = res[1]
	var victim = res[2]

	var cmd1 = ['kill', killer].join(' ')
	var cmd2 = ['ban add', killer, options.duration, options.unit, options.reason].join(' ')
	var log = [killer, 'killed player', victim].join(' ')
	var message1 = ['Player killing is not allowed', killer, 'you will be banned for', options.duration, options.unit].join(' ')
	var message2 = "Please contact support at thepurge.online to get unbanned"

	this.logger.log('info', log)

	sayMessage(message1)
	Promise.delay(3000)
	.then(function(){
		sayMessage(message2)
		return Promise.delay(5000)
	})
	.then(function(){
		sendCommand(cmd1)
		sendCommand(cmd2)
		return true
	})
}

util.inherits(MainClass, Emitter);


module.exports = MainClass;











