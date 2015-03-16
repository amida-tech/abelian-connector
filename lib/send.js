var request = require('request');

function send(endpoint, mime, callback) {
	//skip sending for now
	//callback(null);
	//return;

    //actual call here
    var options = {
        url: endpoint + "/Message",
        body: mime,
        method: 'POST',
        headers: {
            'content-type': 'text/plain'
        }
    };

    request(options, function(err, response) {
        if (err) {
            console.error("sending error ", err);
            callback(err);
        } else {
            //message sent successfully
            callback(null);
        }
    });

}

module.exports = send;
