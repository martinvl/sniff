var common = require('./common');
var config = require('./config');
var dgram = require('dgram');
var fs = require('fs');
var SniffwebClient = require('sniffweb-client');
var Q = require('q');

var secret = JSON.parse(fs.readFileSync(__dirname + '/../keys.json', {encoding: 'utf8'}))[config.taskId];
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('3a: listening on ' +
        address.address + ':' + address.port);
});

var keyAttemptCount = 0;
server.on('message', function (message, info) {
    console.log('3a: received: "' + message + '" from ' +
        info.address + ':' + info.port);
    var parts = message.toString().split(':');

    if (parts.length < 2) {
        return;
    }

    var key = parts[0];
    var employee = parts[1];
    var buf = new Buffer('rejected');

    if (key == common.getKey()) {
        console.info('3a: key accepted');
        common.nextKey();

        if (employee !== config.employee) {
            postToScoreboard(employee).then(function (success) {
                if (success) {
                    console.info('3a: successfully added ' + employee + ' to scoreboard');
                } else {
                    console.info('3a: failed adding ' + employee + ' to scoreboard');
                }
            });
        }

        buf = new Buffer(key);
    } else {
        console.info('3a: key rejected');
        ++keyAttemptCount;

        if (keyAttemptCount >= config.maxKeyAttempts) {
            keyAttemptCount = 0;
            common.nextKey();
        }
    }

    server.send(buf, 0, buf.length, info.port, info.address);
});

server.bind(config.port);

var sniffwebClientPromise = (function () {
    var deferred = Q.defer();

    deferred.resolve({
        host: config.scoreboard,
        port: config.scoreboardPort
    });

    return deferred.promise;
})().then(function (address) {
    return new SniffwebClient(address.host, address.port);
});

function postToScoreboard(name) {
    return sniffwebClientPromise.then(function (client) {
        return client.claim(config.taskId, secret, name);
    });
}
