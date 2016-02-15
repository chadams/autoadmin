/*
respawns regions
 */



var _ = require('lodash')
var Emitter = require('emmett')
var util = require('util')
var Promise = require('bluebird')
var ftp = require('ftp')
var CronJob = require('cron').CronJob;

// https://www.npmjs.com/package/ftp
var defaults = {
	files:[]
};

function MainClass(options, logger){
	if (! (this instanceof MainClass)) return new MainClass(options);
	this.options = _.extend({}, defaults, options)
	this.client = new ftp()
	this.client.on('greeting', this._greeting.bind(this))
	this.client.on('ready', this._ready.bind(this))
	this.client.on('close', this._close.bind(this))
	this.client.on('end', this._end.bind(this))
	this.client.on('error', this._error.bind(this))
	Emitter.call(this)
	//
	this.job = new CronJob(options.start, this.start, _.noop, true, options.timezone, this)
};

MainClass.prototype._greeting = function(msg){
	//console.log('ftp', 'greeting', msg)
};
MainClass.prototype._ready = function(){
	//console.log('ftp', 'ready')
	var self = this;
	var client = this.client
	var options = this.options
	var cwd = Promise.promisify(client.cwd, {context:client});
	var del = Promise.promisify(client.delete, {context:client});
	cwd(options.path)
	.then(function(loc){
		var files = options.files.map(function(file){
			return del(file)
		})
		return Promise.all(files)
	})
	.then(function(){
		console.log('respawn complete')
		self.end()
	})

};
MainClass.prototype._close = function(hadError){
	//console.log('ftp', 'close', hadError)
};
MainClass.prototype._end = function(){
	//console.log('ftp', 'end')
};
MainClass.prototype._error = function(err){
	console.error('ftp', 'error', err)
};

////////

MainClass.prototype.start = function(){
	this.client.connect(this.options.ftp)
};

MainClass.prototype.end = function(){
	this.client.end()
};

util.inherits(MainClass, Emitter);


module.exports = MainClass;



