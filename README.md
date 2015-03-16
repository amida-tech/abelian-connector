Abelian(Direct) Connector
=========

API for sending/receiving Direct messages using Abelian

Current version of API allows to receive and send Direct messages using Abelian Direct implementation.

Abelian should be installed separately and added to `config.js`.

Send API endpoint is `/api/v1/send` and takes `to, subject, message` parameters and  file attachment 'file' over HTTP POST.

Receiver (listener) is continiously check Abelian for incoming messages and submit them into DRE ingestion API


##Quick up and running quide

###Prerequisites

- Node.js (v0.10+) and NPM
- Grunt.js

```
# you need Node.js and Grunt.js installed

# Usage (install)
npm install
node server.js
```

##Test:

```
npm install mocha -g
mocha test/test-send.js -R spec
```


## Contributing

Contributors are welcome. See issues https://github.com/amida-tech/abelian-connector/issues

## Release Notes

See release notes [here] (./RELEASENOTES.md)

## License

Licensed under [Apache 2.0](./LICENSE)