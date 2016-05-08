var _ = require("underscore"),
	async = require("async"),
	defaults = require('../config/options'),
	request = require('request');


var API = function( options ){
	// prerequisites
	options = options || {};
	options.callback = options.callback || function(){ return };

	return this;
}

API.prototype = {

	// mirror of passport's authentication method
	auth: function(){

	},

	// add as a middleware for every subsequent request...
	// initialize app middleware
	middleware: function( app ){

	},

	// Item methods
	data: {},

	get: function( key ){
		return this.data[key] || null;
	},

	set: function( data ){
		_.extend( this.data, data );
		// allow chainability
		return this;
	},

	// CRUD

	create: function( params ){
		// query
	},

	read: function( params, callback ){
		// query
		var self = this;
		var url = this.options.url +"/api/";
		var token = this._token; // use this.token()?
		//
		if(typeof params == "string"){
			// this is the complete api uri
			var path = params;
			// FIX: remove leading slash
			if( path.substring(0, 1) === "/" ) path = path.substring(1);
			url += path;
		} else if(typeof params == "object"){
			// assume it's an object
			// schema #1
			if( params.path ){
				// FIX: remove leading slash
				var path = params.path;
				if( path.substring(0, 1) === "/" ) path = path.substring(1);
				url += path;
			}
			// version 2
			if( params.name ) url += params.name;
			if( params.id ) url += "/"+ params.id;
			if( params.type ) url += "/"+ params.type;
			// use user token if passed
			if( params.token ) token = params.token; // or user.token ?
		} else {
			// exit now
			callback({ code: 400, message: "not a valid query" });
		}
		//var request = {};
		// save in memory
		//this.set( request );
		request.get( url, {
			'auth': {
				'bearer': token
			}
		}, function( error, response, result ){
			var data;
			if( self.options.format == "json"){
				data = result;
			} else {
				// assume obj
				try {
					data = JSON.parse( result );
				} catch(e) {
					// output error?
					data = {};
				}
			}
			callback( null, data );
		});
	},

	update: function( params ){
		// query
	},

	destroy: function( params ){
		// query
	},

	// alias for destroy (delete)...
	del: function( params ){
		return this.destroy( params );
	},

	// request application-level token
	token: function(){
		// return existing token, if available
		if( this._token ) return this._token;
		// variables
		var self = this;
		// application only authentication, executed on the server-side
		request.get( this.options.url +"/oauth/token?client_id="+ this.options.key +"&client_secret="+ this.options.secret +"&grant_type=client_credentials",
		function( error, response, result ){
			// output error
			if( error ) return console.log(error);
			if( !result ) return;
			// parse token
			var data = JSON.parse( result );
			if( data.error ) return console.log( data.message );
			// save for later
			self._token = data.access_token;
		});
	},

	// user login using username/password
	login: function( creds, callback ){

		var self = this;
		// filter data?
		//
		request.get( this.options.url +"/oauth/token?client_id="+ this.options.key +"&client_secret="+ this.options.secret +"&username="+ creds.username +"&password="+ creds.password +"&grant_type=password",
		function( error, response, result ){
			// output error
			if( error ) return callback(error);
			if( !result ) return callback("no_valid_creds");
			// parse token
			var data = JSON.parse( result );
			// save for later
			callback(null, data);
		});
	}

}

module.exports = function( options ){
	return new API( options );
}
