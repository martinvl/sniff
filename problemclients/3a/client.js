var common = require('./common');
var config = require('./config');
var dgram = require('dgram');
var Q = require('q');

// discover server address
var serverPromise = (function () {
    var deferred = Q.defer();

    deferred.resolve({
        host: config.server,
        port: config.port
    });

    return deferred.promise;
})();

// socket handling
function sendEmployee(server, socket) {
    var deferred = Q.defer();
    var message = common.getKey() + ':' + config.employee;
    var buf = new Buffer(message);

    socket.send(buf, 0, buf.length, server.port, server.host, function (err, bytes) {
        if (err) {
            console.error(err);
            sendEmployee(server, socket).then(function () {
                deferred.resolve();
            });
            return;
        }

        deferred.resolve();
    });

    return deferred.promise;
}

function transmitEmployee(server, socket) {
    var deferred = Q.defer();
    var hasReceivedAck = false;

    var handleAck = function (message) {
        socket.removeListener('message', handleAck);
        hasReceivedAck = true;

        if (message.toString() == common.getKey()) {
            console.info('key accepted');
            common.nextKey();
            deferred.resolve();
        } else {
            console.info('key rejected');

            common.nextKey();
            transmitEmployee(server, socket).then(function () {
                deferred.resolve();
            });
        }
    };

    socket.on('message', handleAck);

    setTimeout(function () {
        if (hasReceivedAck) {
            return;
        }

        socket.removeListener('message', handleAck);
        console.info('timed out waiting for ack');
        deferred.resolve();
    }, 2*config.timeout);

    sendEmployee(server, socket);

    return deferred.promise;
}

var socket = dgram.createSocket('udp4');
socket.bind();

function transmit() {
    serverPromise
        .then(function (server) {
            return transmitEmployee(server, socket);
        })
        .then(function () {
            setTimeout(transmit, config.timeout);
        });
}

transmit();
