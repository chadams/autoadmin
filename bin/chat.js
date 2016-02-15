
/*

auto prints chat to console
 */

var _ = require('lodash')

var re = /GMSG: (.+)/;

var defaults = {

};

module.exports = function(options, logger){

	options = _.extend({}, defaults, options)

	return {

		test: function(line){
	 		return re.test(line)
		},

		exec: function(line, telnet){
	 		var res = re.exec(line)
	 		var message = res[1]

	 		console.log(message)

		}

	}

}