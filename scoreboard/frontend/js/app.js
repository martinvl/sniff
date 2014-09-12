var angular = require('angular');
require('angular-router-browserify')(angular);

require('./data');
require('./scoreboard');
require('./submit');
require('./result');

var Sniff = angular.module('Sniff', [
    'ngRoute',
    'Sniff.Scoreboard',
    'Sniff.Submit',
    'Sniff.Result'
]);

Sniff.config(function ($routeProvider) {
    $routeProvider
        .when('/scoreboard', {
            templateUrl: 'scoreboard.html',
            controller: 'ScoreboardController'
        })
        .when('/submit', {
            templateUrl: 'submit.html',
            controller: 'SubmitController'
        })
        .when('/result', {
            templateUrl: 'result.html',
            controller: 'ResultController'
        })
        .otherwise({
            redirectTo: '/scoreboard'
        });
});
