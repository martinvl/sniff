var Datastore = require('nedb');
var fs = require('fs');
var path = require('path');
var http = require('http');
var Q = require('q');
var socketIO = require('socket.io');
var token = require('scoreboard-token');
var _ = require('underscore');

var express = require('express');
var compression = require('compression');
var serveStatic = require('serve-static');

var port = 5000;

// setup server
var app = express();

app.use(compression());
app.get('/', function(req, res, next) {
    var redirect = '../frontend/build/index.html';

    switch (req.hostname) {
        case 'sniff.no':
            res.redirect('/problemtext.pdf');
            return;
        case 'software.no':
            res.redirect('/software.tar.gz');
            return;
        default:
            break;
    }

    res.sendFile(path.resolve(__dirname + '/' + redirect));
});

app.get('/software.tar.gz', function(req, res, next) {
    var redirect = '../../software.tar.gz';
    res.sendFile(path.resolve(__dirname + '/' + redirect));
});

app.get('/problemtext.pdf', function(req, res, next) {
    var redirect = '../../problemtext.pdf';
    res.sendFile(path.resolve(__dirname + '/' + redirect));
});

app.use(serveStatic(__dirname + '/../frontend/build'));

var server = http.Server(app);
var io = socketIO(server);
server.listen(port);

// setup taskstore
var taskstore = new Datastore({filename: 'tasks.db', autoload: true});
taskstore.ensureIndex({fieldName: 'id', unique: true});

function bootstrapTasks() {
    var tasks = [
        {id: '1', claims: [], mode: 'key'},
        {id: '2a', claims: [], mode: 'key'},
        {id: '2b', claims: [], mode: 'key'},
        {id: '2c', claims: [], mode: 'key'},
        {id: '3a', claims: [], mode: 'push'},
        {id: '3b', claims: [], mode: 'push'}
    ];

    taskstore.insert(tasks);
    return tasks;
}

var tasks = (function () {
    var deferred = Q.defer();

    taskstore.count({}, function (err, count) {
        if (err) {
            deferred.reject(err);
            return;
        }

        if (count) {
            taskstore.find({}).sort({id: 1}).exec(function (err, tasks) {
                if (err) {
                    deferred.reject(err);
                    return;
                }

                deferred.resolve(tasks);
            });
        } else {
            deferred.resolve(bootstrapTasks());
        }
    });

    return deferred.promise;
})();
var keys = JSON.parse(fs.readFileSync('keys.json', {encoding: 'utf8'}));

function getPublicTasks() {
    return tasks.then(function (tasks) {
        return _.map(tasks, function (task) {
            if (!task) {
                return;
            }

            return _.pick(task, ['id', 'claims', 'mode']);
        });
    });
}

var publicTasks = getPublicTasks();

// task handling
function getTask(id) {
    return tasks.then(function (tasks) {
        for (var idx in tasks) {
            var task = tasks[idx];

            if (task.id === id) {
                return task;
            }
        }

        return;
    });
}

function updateTask(task) {
    if (!task || !task.id) {
        return;
    }

    taskstore.update({id: task.id}, task);
    publicTasks = getPublicTasks();
}

function addClaimToTask(name, taskId) {
    getTask(taskId).then(function (task) {
        if (!task) {
            return;
        }

        var claim = {
            id: task.claims.length,
            name: name,
            timestamp: new Date()
        };

        task.claims.push(claim);
        updateTask(task);
        sendAddedClaim(claim, taskId);
    });
}

// socket handling
function sendTasks(socket) {
    publicTasks.then(function (publicTasks) {
        socket.emit('tasks', publicTasks);
    });
}

function sendAddedClaim(claim, taskId) {
    io.emit('added_claim', {taskId: taskId, claim: claim});
}

io.on('connection', function (socket) {
    sendTasks(socket);

    socket.on('claim', function (payload, callback) {
        callback = callback || function () {};

        if (!payload || !payload.name) {
            callback(false);
            return;
        }

        if (!keys.hasOwnProperty(payload.taskId)) {
            callback(false);
            return;
        }

        if (!token.verify(payload.token, keys[payload.taskId], payload.name)) {
            callback(false);
            return;
        }

        addClaimToTask(payload.name, payload.taskId);
        callback(true);
    });
});
