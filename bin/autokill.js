
/*

auto kills players who player kill
ban	<playername> <duration> <unit>	Bans user for period specified by duration and unit. Unit can be anything of: minutes, hours, days, weeks, months, years
 */

var _ = require('lodash')
var Promise = require('bluebird')

var re = /Player (.+) eliminated Player (.+)/;

var defaults = {
	duration: 5,
	unit: 'days' 
};

module.exports = function(options, logger){

	options = _.extend({}, defaults, options)

	return {

		test: function(line){
	 		return re.test(line)
		},

		exec: function(line, sendCommand, sayMessage){
	 		var res = re.exec(line)
	 		var killer = res[1]
	 		var victim = res[2]

	 		var cmd = ['ban', killer, options.duration, options.unit].join(' ')
	 		var log = [killer, 'killed player', victim].join(' ')
	 		var message1 = ['Player killing is not allowed', killer, 'you will be banned for', options.duration, options.unit].join(' ')
	 		var message2 = "Please contact support at thepurge.online to get unbanned"

	 		logger.log('info', log)

	 		sayMessage(message1)
	 		Promise.delay(3000)
	 		.then(function(){
	 			sayMessage(message2)
	 			return Promise.delay(5000)
	 		})
	 		.then(function(){
	 			console.log(cmd);
	 			//sendCommand(cmd)
	 			return true
	 		})


		}

	}

}