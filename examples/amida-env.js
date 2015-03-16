var fs = require('fs');
var pack = require('../lib/package.js');
var send = require('../lib/send.js');

var phr = "http://phr.amida-demo.com:8085";
var ehr = "http://ehr.amida-demo.com:8085";

var hl7 = fs.readFileSync('../test/artefacts/CCD-sample.xml', "utf8").toString();


//email from patient to doc with attachment (hl7)
pack({
    'from': 'john@direct.phr.amida-demo.com',
    'to': 'doctor@direct.ehr.amida-demo.com',
    'subject': 'My latest record',
    'body': 'See attached. -John'
}, [{
    'fileName': 'hl7.xml',
    'contents': hl7
}], function(err, mime) {
    console.log("error: ",err);
    console.log("envelope: ", mime.substring(0,750));

    send(phr, mime, function(err) {
        if (err) {
            console.log("error: ", err);
        } else {
            console.log("message sent");
        }
    })

});