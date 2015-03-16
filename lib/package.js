var moment = require('moment');
var MailComposer = require("mailcomposer").MailComposer;
var uuid = require('node-uuid');

// gets email param with to/from/subject/message
// gets array of attachments like {'fileName':'blah', 'contents':'content goes here'}
function package(email, attachments, callback) {

    //timestamp with now
    var formatted_date = moment().format("ddd, DD MMM YYYY HH:mm:ss ZZ");

    var origin = email.from.split("@")[1];
    var message_id = uuid.v4() + "@" + origin;    

    var mailcomposer = new MailComposer();

    //process all attachments
    /*
        attachments=[
            {'fileName':'sample.xml', 'contents':'raw text content'}
        ]
    */
    if (attachments) {
        //console.log('attachments ', attachments);
        for (var i=0; i<attachments.length; i++) {
            console.log("processing attachemt ", attachments[i].fileName);
            mailcomposer.addAttachment(attachments[i]);
        }
    }

    //process envelope
    mailcomposer.setMessageOption({
        from: email.from,
        to: email.to,
        subject: email.subject,
        body: email.body
    });
    mailcomposer.addHeader("date", formatted_date);
    mailcomposer.addHeader("Message-ID", message_id);
    mailcomposer.buildMessage(function(err, packagedMessage) {
        if (err) {
            callback(err);
        } else {
            callback(null, packagedMessage);
        }
    });
}

module.exports = package;
