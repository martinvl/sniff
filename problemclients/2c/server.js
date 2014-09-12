var express = require('express');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
config.hosts.push(JSON.parse(fs.readFileSync(__dirname + '/../keys.json'))[config.taskId])
var app = express();

var resources = {};

for (var idx in config.hosts) {
    var host = config.hosts[idx];
    resources[host] = host.replace('.no', '');
}

app.get('/', function(req, res) {
    try {
        res.sendFile(__dirname + '/sites/' + resources[req.hostname] + '.html');
    } catch (e) {
        console.error('2c: ' + e);
    }
});

app.listen(config.port);
console.log('2c: server up');
