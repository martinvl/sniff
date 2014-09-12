var common = require('./common');
var config = require('./config');
var fs = require('fs');
var net = require('net');
var SniffwebClient = require('sniffweb-client');
var Q = require('q');

var secret = JSON.parse(fs.readFileSync(__dirname + '/../keys.json', {encoding: 'utf8'}))[config.taskId];
var server = net.createServer();

server.on('listening', function () {
    var address = server.address();
    console.log('3b: listening on ' +
        address.address + ':' + address.port);
});

var keyAttemptCount = 0;
server.once('connection', function (socket) {
    console.log('3b: ' + socket.remoteAddress + ':' + socket.remotePort + ' connected');

    socket.on('data', function (message) {
        console.log('3b: received: "' + message + '"');
        var parts = message.toString().split(':');

        if (parts.length < 2) {
            return;
        }

        var key = parts[0];
        var employee = parts[1];
        var buf = new Buffer('rejected');

        if (key == common.getKey()) {
            console.info('3b: key accepted');
            common.nextKey();

            if (employee !== config.employee) {
                postToScoreboard(employee).then(function (success) {
                    if (success) {
                        console.info('3b: successfully added ' + employee + ' to scoreboard');
                    } else {
                        console.info('3b: failed adding ' + employee + ' to scoreboard');
                    }
                });
            }

            buf = new Buffer(key);
        } else {
            console.info('3b: key rejected');
            ++keyAttemptCount;

            if (keyAttemptCount >= config.maxKeyAttempts) {
                keyAttemptCount = 0;
                common.nextKey();
            }
        }

        socket.write(buf);
    });
});

server.listen(config.port);

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
