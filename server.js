var config = require('./config.js');

console.log("config: ", config);

var pack = require('./lib/package.js');
var send = require('./lib/send.js');
var inbox = require('./lib/inbox.js');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var http = require('http');
var FormData = require('form-data');

var fs = require('fs');

var multer = require('multer');
var autoReap = require('multer-autoreap');
autoReap.options = {
    reapOnError: true
};


var async = require('async');

var app = express();

app.all('*', function(req, res, next) {
    console.log("all request");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
    next();
});

app.use(multer({
    dest: './uploads/'
}))
app.use(autoReap);

app.use(logger('dev'));

app.use('/docs', express.static('./swagger'));

app.get('/interop', function (req, res) {
    res.send("Direct Node Server is up and running!!!");
});

//send new message
app.post('/api/v1/send', function(req, res) {

    var filename = req.files.file.path;
    var data = fs.readFileSync(filename).toString();

    var to = req.body.to; 
    var from = req.body.from; //TODO: use patient's domain from config
    var subject = req.body.subject;
    var message = req.body.message;

    var memberId = "STAN01";

    //console.log(data);
    console.log("/api/v1/send");
    console.log("to: ", to);
    console.log("from: ", from);
    console.log("subject: ", subject);
    console.log("message: ", message);

    //package email
    var attachments = [{
        'filename': filename,
        'contents': data
    }];

    var email = {
        'from': from,
        'to': to,
        'subject': subject,
        'body': message
    };

    console.log("email: ", email);

    pack(email, attachments, function(err, mime) {
        if (err) {
            res.statusCode = 500;
            res.send(err);
        } else {
            //send email
            send(config.abelian, mime, function(err) {
                if (err) {
                    res.statusCode = 500;
                    res.send(err);

                } else {
                    console.log(mime.substring(0, 1000));
                    console.log("...skipping rest of mime envelope");
                    console.log("everything is ok");
                    res.send('OK');
                }
            });
        }
    });


});


//get list of messages
app.get('/api/v1/inbox', function(req, res) {
    //takes query param memberId /doctor e.g.  username/email address
    //var memberId = req.query.memberId || "STAN01";

    inbox(config.abelian, false, function(err, response) {
        if (err) {
            res.statusCode = 500;
            res.send(err);

        } else {
            console.log(response);
            console.log("everything is ok");
            res.send(response);
        }
    })

    //res.status(200).end();
});



var server = app.listen(3001, function() {

    var host = server.address().address
    var port = server.address().port

    console.log('Listening at http://%s:%s', host, port)

    var mailListener = require('./lib/mail-listener');

    function timerMail() {
        mailListener(function(err, results) {
            if (err) {
                console.error(err);
            } else {
                console.log("got mail  #", results.length);
                //TODO: process each email into DRE
                for (var j = 0; j < results.length; j++) {
                    console.log("processing email ", results[j]);
                    //console.log(results[j].attachments[0].content.toString());

                    //DRE Ingest call here
                    console.log("posting to ingest api: ", config['dre-ingest-api'] + '/api/v1/ingest');
                    var patKey = results[j].user;

                    if (results[j].attachments) {
                        var form = new FormData();
                        form.append('file', results[j].attachments[0].content, {filename: 'bluebutton.xml'});
                        form.append('patKey', patKey);
                        form.submit(config['dre-ingest-api'] + '/api/v1/ingest', function(err, res) {
                            //res.resume(); // for node-0.10.x
                        });
                    }
                }
            }
        });
    }

    //mail listener (every 30 seconds)
    console.log("listening for mail every 15 seconds");
    setInterval(timerMail, 15000);

})
