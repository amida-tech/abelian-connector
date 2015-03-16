var request = require('request');
var async = require('async');
var MailParser = require("mailparser").MailParser;
var _ = require('underscore');

function parseMail(email, callback) {

    var mailparser = new MailParser({
        unescapeSMTP: true
    });
    mailparser.on("end", function(mail_object) {

        //Throw errors if required fields aren't in object.

        if (_.isUndefined(mail_object.from) || _.isUndefined(mail_object.to) || _.isUndefined(mail_object.date) || _.isUndefined(mail_object.messageId)) {
            callback('Malformed Mail Object is Unparseable.');
        } else {

            var parsed_object = {
                sender: mail_object.from[0].address,
                recipient: mail_object.to[0].address,
                date: mail_object.date,
                message_id: mail_object.messageId,
                user: mail_object.to[0].address.split("@")[0]
            };

            //Flag MDNs via content-type evaluation.
            var content_type_split = mail_object.headers['content-type'].split(";");
            for (var i in content_type_split) {
                content_type_split[i] = content_type_split[i].trim();
            }

            parsed_object.mdn_flag = false;

            if (_.contains(content_type_split, 'multipart/report') === true) {
                if (_.contains(content_type_split, 'report-type=disposition-notification') === true) {
                    parsed_object.mdn_flag = true;
                }
            }

            if (mail_object.subject) {
                parsed_object.subject = mail_object.subject;

                //flag Abelian MDNs
                if (mail_object.subject.indexOf("Processed") >= 0) {
                    parsed_object.mdn_flag = true;
                }
            }
            if (mail_object.text) {
                parsed_object.contents = mail_object.text;
            }

            if (mail_object.attachments) {
                parsed_object.attachments = mail_object.attachments;
            }

            //clean mdns (attachments)
            if (parsed_object.mdn_flag) {
                delete parsed_object.attachments;
            }

            callback(null, parsed_object);

        }

    });
    mailparser.write(email);
    mailparser.end();
};

//calls API for single message and un-mimes it
function message(entry, callback) {
    var endpoint = entry.id;
    console.log("getting message ", endpoint);

    var options = {
        url: endpoint,
        method: 'GET',
    };

    request(options, function(err, response) {
        if (err) {
            console.error("error ", err);
            callback(err);
        } else {
            //got message
            //TODO: unmime it
            console.log(response.body.substring(0, 100));
            var text = response.body;


            var m = parseMail(text, function(err, data) {
                if (entry.to_delete) {
                    console.log("deleting email ", endpoint);

                    delete_message(endpoint, function(err) {   
                        console.log('err', err);
                        callback(null, data);
                    });

                } else {
                    callback(null, data);
                }

            });
        }
    });
}

function delete_message(endpoint, callback) {
    //actual call here
    var options = {
        url: endpoint,
        method: 'DELETE',
    };

    request(options, function(err, response) {
        if (err) {
            console.error("error ", err);
            callback(err);
        } else {
            //got inbox index
            console.log("message ", endpoint, " deleted");
            callback(null, response);
        }
    });

}

function messages(endpoint, index, to_delete, callback) {
    var calls = [];

    console.log("index.entry ", index["entry"]);
    for (var i = 0; i < index["entry"].length; i++) {
        console.log("flag entry ", index["entry"][i].id, "for deletion");
        index["entry"][i].to_delete = to_delete;
    }

    async.map(index["entry"], message, function(err, results) {
        if (err) {
            callback(err);
        } else {
            console.log()
            callback(null, results);
        }
    });
}

function inbox(endpoint, to_delete, callback) {
    console.log("getting inbox and delete messages flag=", to_delete);

    //actual call here
    var options = {
        url: endpoint + "/Messages",
        method: 'GET',
    };

    request(options, function(err, response) {
        if (err) {
            console.error("error ", err);
            callback(err);
        } else {
            //got inbox index
            var index = JSON.parse(response.body);

            console.log("index ", index);

            messages(endpoint, index, to_delete, function(err, response) {
                if (err) {
                    console.error('error ', err);
                    callback(err);
                } else {
                    callback(null, response);
                }
            })

        }
    });

}

module.exports = inbox;
