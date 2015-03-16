var config = require('../config.js');

var request = require('request');
var moment = require('moment');
var async = require('async');
var _ = require('underscore');
var MailComposer = require("mailcomposer").MailComposer;
var MailParser = require("mailparser").MailParser;
var uuid = require('node-uuid');

var lock_array = [];


//Function called regularly by polling interval.
function getMail(callback) {
	var inbox = require('./inbox.js');

	//true/false - delete emails from server after processing
    inbox(config.abelian, config.delete_emails, function(err, data){
    	callback(err, data);
    });


};

module.exports = getMail;
