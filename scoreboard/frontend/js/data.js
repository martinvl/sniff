var angular = require('angular');
var EventEmitter = require('events').EventEmitter;
var Q = require('q');
var socketIO = require('socket.io-client');
var _ = require('underscore');
var ScoreboardClient = require('scoreboard-client');

angular.module('Sniff.Data', [])
.factory('TaskService', function ($location) {
    return new ScoreboardClient($location.host(), 5000);
});
