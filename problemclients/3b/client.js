var common = require('./common');
var config = require('./config');
var net = require('net');
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
function sendEmployee(socket) {
    var deferred = Q.defer();
    var message = common.getKey() + ':' + config.employee;
    var buf = new Buffer(message);

    socket.write(buf, function (err, bytes) {
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

function transmitEmployee(socket) {
    var deferred = Q.defer();

    socket.once('data', function (message) {
        if (message.toString() == common.getKey()) {
            console.info('key accepted');
            common.nextKey();
            deferred.resolve();
        } else {
            console.info('key rejected');

            common.nextKey();
            transmitEmployee(socket).then(function () {
                deferred.resolve();
            });
        }
    });
    sendEmployee(socket);

    return deferred.promise;
}

var socketPromise = serverPromise.then(function (server) {
    return createSocket(server);;
});

function createSocket(server) {
    var deferred = Q.defer();
    var socket = net.connect({host: server.host, port: server.port});

    socket.on('connect', function () {
        console.log('connected to server');
        deferred.resolve(socket);
    });

    socket.on('error', function (err) {
        console.error(err);
        socketPromise = createSocket(server);
    });

    return deferred.promise;
}

function transmit() {
    socketPromise
        .then(function (socket) {
            return transmitEmployee(socket);
        })
    .then(function () {
        setTimeout(transmit, config.timeout);
    });
}

transmit();
