var config = require('./config');
var fs = require('fs');
var ftpd = require('ftpd');

var options = {
    pasvPortRangeStart: 4000,
    pasvPortRangeEnd: 5000,
    getInitialCwd: function(user, callback) {
        var userPath = __dirname + '/ftp_root';

        fs.exists(userPath, function(exists) {
            exists ? callback(null, userPath) : callback('path does not exist', userPath);
        });
    },
    getRoot: function(user) {
        return '/';
    }
};

var server = new ftpd.FtpServer(config.host, options);

server.on('client:connected', function(conn) {
    var username;
    console.log('2a: client connected from ' + conn.socket.remoteAddress);

    conn.on('command:user', function(user, success, failure) {
        username = user;
        (user == config.user) ? success() : failure();
    });

    conn.on('command:pass', function(pass, success, failure) {
        (pass == config.password) ? success(username) : failure();
    });
});

server.listen(config.port);
console.log('2a: ftp listening on port ' + config.port);
